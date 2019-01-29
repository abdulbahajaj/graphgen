from pymongo import MongoClient
from dateutil.relativedelta import relativedelta
import datetime,json
from source.SourceHandler import SourceHandler
import pandas as pd
import ProcessData
mongoClient = MongoClient('localhost', 27017)

INCREMENTS = {'YEAR':'year','MONTH':'month','DAY':'day','HOUR':'hour'}
pointsLimit = 500

IncrementPlural = {}
IncrementPlural[INCREMENTS['YEAR']]='years'
IncrementPlural[INCREMENTS['MONTH']]='months'
IncrementPlural[INCREMENTS['DAY']]='days'
IncrementPlural[INCREMENTS['HOUR']]='hours'

# def pretty(d, indent=0):
#    for key, value in d.items():
#       print('\t' * indent + str(key))
#       if isinstance(value, dict):
#          pretty(value, indent+1)
#       else:
#          print('\t' * (indent+1) + str(value))

def dateIncrement(date,increment,by):
	assert type(date) is datetime.datetime
	assert type(by) is int
	return date + relativedelta(**({IncrementPlural[increment]: by}))

#Gets the number of points that have to be displayed
def getPointNumber(start,end,increment):
	if increment == INCREMENTS['YEAR']:
		return len(pd.date_range(start = start,end=end,freq="Y")) 
	if increment == INCREMENTS['MONTH']:
		return len(pd.date_range(start = start,end=end,freq="M"))  # BUG. CASE end.year == start.year
	if increment == INCREMENTS['DAY']:
		return len(pd.date_range(start = start,end=end,freq="D")) 
	if increment == INCREMENTS['HOUR']:
		return len(pd.date_range(start = start,end=end,freq="H")) 

#Reduce the resolution
def reduceRes(start,end,increment):
	if increment == INCREMENTS['YEAR']:
		pointsNum = getPointNumber(start=start,end=end,increment=increment)
		start = dateIncrement(date=start,increment=INCREMENTS['YEAR'],by= pointsLimit - pointsNum )
	else:
		incrementTrans = {}
		incrementTrans[INCREMENTS['HOUR']] = INCREMENTS['DAY']
		incrementTrans[INCREMENTS['DAY']] = INCREMENTS['MONTH']
		incrementTrans[INCREMENTS['MONTH']] = INCREMENTS['YEAR']
		increment = incrementTrans.get(increment,increment)
	return start,end,increment

def getResolution(start,end,increment):
	minimumIncrement = 'hour'
	while getPointNumber(start=start,end=end,increment=minimumIncrement) > pointsLimit:
		start,end,minimumIncrement = reduceRes(start=start,end=end,increment=minimumIncrement)
	

	availableIncrements = list(INCREMENTS.values())
	availableIncrements = availableIncrements[:availableIncrements.index(minimumIncrement) + 1]

	remove = []
	for availableIncrement in availableIncrements:
		pointsNum = getPointNumber(start=start,end=end,increment=availableIncrement)
		if pointsNum < 2:
			remove.append(availableIncrement)

	for item in remove:
		del availableIncrements[availableIncrements.index(item)]
	try:
		availableIncrements.index(increment)
	except:
		increment = availableIncrements[len(availableIncrements)-1]

	return start,end,increment,availableIncrements

ALLOWED_OPERATIONS = ['lte', 'gte','lt','gt',"eq","ne"]

# def isBigger(start,end,increment):
# 	increments = list(INCREMENTS.values())
# 	increments = increments[:increments.index(increment)+1]
# 	result = False

def emptySeries(start,end,increment):
	result = {}
	increments = list(INCREMENTS.values())
	increments = increments[:increments.index(increment)+1]
	while True:
		if start > end:
			break
		cursor = result
		for incrementName in increments:
			key = getattr(start,incrementName)
			if cursor.get(key,None) is None:
				cursor[key] = {}
			cursor = cursor[key]
		cursor['value'] = 0
		start = dateIncrement(date=start,increment=increment,by=1)
	return result

def setSeriesValue(value,path,series):
	cursor = series
	for key in path:
		if cursor.get(key,None) is None:
			cursor[key] = {}
		cursor = cursor[key]
	cursor['value'] = value

def getSeriesValues(series):
	lastLayer = [series]
	currentLayer = []
	leave = False
	while True:
		for node in lastLayer:
			if isinstance(node,int):
				currentLayer.append(node)
				leave=True
				continue
			for key in node:
				currentLayer.append(node[key])
		if leave == True: break
		lastLayer = currentLayer
		currentLayer = []

	return currentLayer

def getInt(value):
	try:
		value = float(value)
		return value
	except: return value

class TimeSeriesQuery:
	__pipline = None
	__result = None
	__end = None
	__start = None
	__increment = None
	__availableIncrements = None

	def __init__(self,clientID,query,sourceID,utcOffset="+00"):
		start = query.get('start')
		end = query.get('end')
		conditions = query.get('conditions')
		increment = query.get('increment')
		groupBy = query.get('groupBy')
		operation = {'source': sourceID,'field': query['field'],'type': query['type']}

		assert type(clientID) is str
		assert increment in list(INCREMENTS.values())
		assert end == 'now' or type(end) is datetime.datetime
		assert type(start) is int or type(end) is datetime.datetime
		assert operation.get('type',None) in ['sum','count']
		assert type(operation.get('source',None)) is str
		assert type(operation.get('field',None)) is str or operation.get('type',None) == 'count'
		assert type(groupBy) is str or type(groupBy) is not None
		for item in conditions:
			assert type(item['field']) is str
			assert item['operation'] in ALLOWED_OPERATIONS
			assert type(item['constant']) is str

		for condition in conditions:
			condition['operation'] = "$" + condition.get('operation','')
		datePath = query.get('yAxis')
		if datePath == '$created$':
			datePath = "created"
		else:
			datePath = "data." + datePath

		groupsColors = query.get('groupColors',[])

		dates = self.__getDates(start=start,end=end,increment=increment)
		start = dates['start']
		end = dates['end']

		start,end,increment,availableIncrements=getResolution(start=start,end=end,increment=increment)

		self.__pipline = []
		self.__setConditions(conditions=conditions)
		self.__setTimeInteval(start=start,end=end,datePath=datePath)
		self.__setOperation(operation=operation,groupBy=groupBy,increment=increment,datePath=datePath,utcOffset=utcOffset)

		source = SourceHandler.getSource(clientID=clientID,sourceID=operation['source'])
		self.__query(source=source)
		self.__normalize(start=start,end=end,increment=increment,groupsColors=groupsColors,utcOffset=utcOffset)
		self.__end = str(end)
		self.__start = str(start)
		self.__increment = str(increment)
		self.__availableIncrements = availableIncrements

	def __getDateSelection(self,increment,datePath,utcOffset):
		selection={}
		if increment == INCREMENTS['HOUR']:
			selection['hour']={'$hour': {'date': '$' + datePath, "timezone": utcOffset}}
			increment = INCREMENTS['DAY']
		if increment == INCREMENTS['DAY']:
			selection['day']={'$dayOfMonth': {'date': '$' + datePath, "timezone": utcOffset}}
			increment = INCREMENTS['MONTH']
		if increment == INCREMENTS['MONTH']:
			selection['month']={'$month': {'date': '$' + datePath, "timezone": utcOffset}}
			increment = INCREMENTS['YEAR']
		if increment == INCREMENTS['YEAR']:
			selection['year']={'$year': {'date': '$' + datePath, "timezone": utcOffset}}
		return selection

	def __getDates(self,start,end,increment):
		if end == 'now':
			end = ProcessData.getNow()
			start = dateIncrement(date=end,increment=increment,by=start * -1)
		return {"start": start,"end": end}

	def __setTimeInteval(self,start,end,datePath):
		# start = datetime.datetime.utcnow() - relativedelta(**({relativeConverter[increment]: start}))	
		selection = {datePath: {"$gte": start,"$lte": end}}
		match = {"$match": selection}
		self.__pipline.append(match)

	def __setOperation(self,operation,groupBy,increment,datePath,utcOffset):
		_id = self.__getDateSelection(increment=increment,datePath=datePath,utcOffset=utcOffset)
		groupByField = "$ignore"
		if groupBy is not None:
			groupByField =  "$data." + groupBy
		_id['groupBy'] = groupByField

		operationQuery = {"$sum": 1}
		if operation['type'] == 'sum':
			operationQuery = {"$sum": "$data."+operation['field']}

		aggregation = {"$group": {"_id": _id,'result': operationQuery}}
		self.__pipline.append(aggregation)
		self.__pipline.append({ "$sort": {"_id.year": 1, "_id.month": 1, "_id.day": 1,"_id.hour": 1}})
		self.__setGroupBy(groupBy)

	def __setGroupBy(self,groupBy):
		push = {}
		push['result'] = "$result"
		push['year'] = "$_id.year"
		push['month'] = "$_id.month"
		push['day'] = "$_id.day"
		push['hour'] = "$_id.hour"
		items = {"$push": push}
		aggregation = {"$group": {"_id": "$_id.groupBy", 'items': items } }
		self.__pipline.append(aggregation)

	def __setConditions(self,conditions):
		if len(conditions) == 0: return
		match = {}
		for cond in conditions:
			operation = cond['operation']
			# if operation not in ALLOWED_OPERATIONS: continue
			if match.get( cond['field'] , None ) is None:
				match[ "data." + cond['field'] ] = {}
			if operation == '$eq':
				match[ "data." + cond['field'] ] = getInt(cond['constant'])
			else: 
				match[ "data." + cond['field'] ][ operation ] = getInt(cond['constant'])
		aggregation = { "$match": match }
		self.__pipline.append(aggregation)

	def __query(self,source):
		self.__result = list(source.aggregate(pipeline=self.__pipline,allowDiskUse=True))
		if len(self.__result) == 0:
			self.__result = [{'_id': None, 'items': []}]

	def __timeSeries(self,start,end,increment):
		series = {}
		while start <= end:
			if series.get(start.year,None) is None: 
				series[start.year] = {}
			if series[start.year].get(start.month,None) is None: 
				series[start.year][start.month] = {}
			if series[start.year][start.month].get(start.day,None) is None: 
				series[start.year][start.month][start.day] = {}
			if series[start.year][start.month][start.day].get(start.hour,None) is None:
				series[start.year][start.month][start.day][start.hour] = 0
			start = dateIncrement(date=start,increment=increment,by=1)
		return series
	def __normalize(self,start,end,increment,groupsColors,utcOffset):
		offset = {
			"sign": utcOffset[0:1],
			"hours": utcOffset[1:3],
			"minutes": utcOffset[3:5]
		}
		offset['hours'] = int(offset['sign'] + offset['hours'])
		offset['minutes'] = int(offset['sign'] + offset['minutes'])
		offset['delta'] = datetime.timedelta(hours=offset['hours'],minutes=offset['minutes'])
		start = start + offset['delta']
		end = end + offset['delta']
		normalizedResult = []
		cur = 0
		colorsLength = len(groupsColors)
		timeSeriesClone = emptySeries(start=start,end=end,increment=increment)
		for group in self.__result:
			timeSeries = emptySeries(start=start,end=end,increment=increment)
			for item in group['items']:
				year = item.get('year')
				month = item.get('month',None)
				day = item.get('day',None)
				hour = item.get('hour',None)
				path = [key for key in [year,month,day,hour] if key is not None]
				value = item.get('result',0)
				setSeriesValue(value=value,path=path,series=timeSeries)
			groupName = str(group['_id']) if group['_id'] is not None else None
			normalizedResult.append({'group': groupName,'color': groupsColors[cur],'timeSeries': getSeriesValues(series=timeSeries)})
			if cur < colorsLength - 1: cur+=1
		self.__result=normalizedResult

	def get(self):
		response = {}
		response['data'] = self.__result
		response['selection'] = {}
		response['selection']["availableIncrements"] = self.__availableIncrements
		response['selection']['start'] = self.__start
		response['selection']['end'] = self.__end
		response['selection']['increment'] = self.__increment
		return response

































