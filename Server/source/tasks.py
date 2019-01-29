#brew services start rabbitmq
from __future__ import absolute_import, unicode_literals
from celery import shared_task
import datetime
import uuid
import random
import time
from source.SourceHandler import SourceHandler 
import pandas as pd
import ProcessData
# from graph.models import Graph
''' 
Prefixes:
	SPECIAL_ : the source is predefined
'''
# def timeSeriesIndex(clientID,sourceName):
# 	graphs = Graph.objects(
# 		client=clientID,
# 		data__operation__source=sourceName
# 	)
# 	for graph in graphs:
# 		graph.timeSeriesIndex()

class Add:
	@staticmethod
	@shared_task
	def apiAdd(clientID,sourceID,data,schemaOverRide):
		if isinstance(data,dict):
			dataList = [data]
		else: dataList = data
		toInsert = []
		for item in dataList:
			item = ProcessData.flatten(data=item)
			item = ProcessData.enrich(data=item,schemaOverRide=schemaOverRide)
			date = ProcessData.getNow()
			toInsert.append({'created': date, 'data': item})
		SourceHandler.add(clientID=clientID,sourceID=sourceID,data=toInsert)
		# timeSeriesIndex(clientID=clientID,sourceID=sourceID)
	@staticmethod
	@shared_task
	def dummy(clientID,sourceID):
		userIDs = [uuid.uuid4().hex for x in range(100) ]
		types = ['Successful','Failed']
		eventTypes = ['purchase','refund']
		dates =  pd.date_range(start=datetime.datetime(2014,1,1), end=datetime.datetime.utcnow(),freq='H',tz='UTC')
		data = [{
			'amount': random.randint(10,10000),
			"timestamp": (ProcessData.getDate(value=random.choice(dates).isoformat())),
			'userID': random.choice(userIDs),
			'event': random.choice(eventTypes),
			"status": random.choice(types),
		} for x in range(10000)]
		Add.apiAdd(clientID=clientID,sourceID=sourceID,data=data,schemaOverRide={})

#ADD DATA
@shared_task
def remove(clientID,sourceID):
	SourceHandler.delete(clientID,sourceID)


@shared_task
def updateSchema(clientID,sourceID,key,fromType,toType):
	SourceHandler.editConvertTypes(
		clientID=clientID,
		sourceID=sourceID,
		key=key,
		fromType = fromType,
		toType=toType)
	# SourceHandler.cacheSchema(
	# 	clientID=clientID,
	# 	sourceID=sourceID)







# r=COM.TimeSeriesQuery(
# 	clientID='5b112402a8a634c798cfc8d9', #ID of the client that is doing the query
# 	query=dict(
# 		increment='month',
# 		start=10,
# 		end='now',
# 		conditions=[],# a mongodb match operation e.g. {"operation": "$eg", "field": "data.purchase", "constant": "product name"}
# 		groupBy='purchase', #An optional group by operation. None is the default
# 		source='INTEGRATION__dummy', #The database that contains the data to be queried
# 		type='count', #Add a field or count a field...
# 		field=None #Which field do you want to add(case type is add)
# 	),
# 	context={} #{'purchase':'audio technica - m20x'},
# )








