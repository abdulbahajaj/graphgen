from mongoengine import *
from sysUser.models import Client
import uuid
import time
from dateutil.relativedelta import relativedelta
import bson,datetime
from source.models import SourceMeta
from source.TimeSeriesQuery import dateIncrement
# from source.models import Source
from common import getDict,ExceptionFactory
import random
from mongoengine.queryset.visitor import Q

defaultGroupColors = []
defaultGroupColors.append('#16a085')

GraphNotFoundException = ExceptionFactory(
	name='GraphNotFound',
	description = "You don't have a graph with the given ID",
	status=404
)

class Condition(DynamicEmbeddedDocument):
	operation = StringField(choices=tuple(['lte', 'gte','lt','gt',"eq","ne"]))
	field = StringField()
	constant = StringField(default = None)
	def dict(self):
		return getDict(self)
	@classmethod
	def create(cls,info):
		info['field'] = str(info['field'])
		info['constant'] = str(info['constant'])
		condition = cls(**info)
		return condition
	def toDict(self):
		return getDict(self)

class Query(DynamicEmbeddedDocument):
	source = ReferenceField('SourceMeta') #REMOVE DEFAULT
	type = StringField(choices = ('sum','count'),default='sum')
	field = StringField()
	increment = StringField(choices=('hour','day','month','year'),default='month')
	start = StringField(default=12)
	end = StringField(default='now')
	conditions = EmbeddedDocumentListField(Condition)
	groupBy = StringField(default=None)
	groupColors = ListField(StringField(),default=tuple(defaultGroupColors))
	requireToken = BooleanField(default=False)
	yAxis = StringField(default="$created$")
	@classmethod
	def create(cls,info,client):
		info['conditions'] = [Condition.create(info=cond) for cond in info['conditions']]
		if type(info['start']) is int: info['start'] = str(info['start'])
		source = info.get('source',None)
		del info['source']
		if isinstance(source,str):
			source = SourceMeta.get(client=client,id=source)
		return cls(source=source,**info)	
	def toDict(self):
		response = getDict(self)
		try:
			response['start'] = int(self.start)
		except:
			pass #hANDLE DATE TYPE
		response['source'] = str(self.source.id)
		return response

class Data(DynamicEmbeddedDocument):
	fill = BooleanField(default=False)
	borderWidth = IntField(default=1)
	xLabelRotation = IntField(default=0)
	borderDash = IntField(default=0)
	borderCapStyle = StringField(default='round')
	lineTension = FloatField(default=0.4)
	pointRadius = IntField(default=0)
	pointStyle = StringField(default='circle')
	showLine = BooleanField(default=True)
	spanGaps = BooleanField(default=False)
	pointHoverBorderWidth = IntField(default=5)
	steppedLine = BooleanField(default=False)
	labelColor = StringField(default='#009faa')
	labelFormat = StringField(default="textual",choices=("textual","numerical"))
	labelFontSize = IntField(default=8)
	xMaxTicksLimit = IntField(default=8)
	pointBackgroundColor = StringField(default="#fff")
	@classmethod
	def create(cls,info):
		return cls(**info)

class Tooltips(DynamicEmbeddedDocument):
	enabled = BooleanField(default=True)
	backgroundColor = StringField(default='#fff')
	xPadding = IntField(default=11)
	yPadding = IntField(default=8)
	radius = IntField(default=3)
	borderColor = StringField(default="#fff")
	borderWidth = IntField(default=1)
	displayColors = BooleanField(default=True)
	boxShadowColor = StringField(default="#bdc3c7")
	shadowBoxEnabled = BooleanField(default=True)
	fontFamily = StringField(default='italic')
	titleFontSize = IntField(default=12)
	bodyFontSize = IntField(default=12)
	textColor = StringField(default="#7f8c8d")
	valueColor = StringField(default="#7f8c8d")
	titleColor = StringField(default="#000")
	groupColorBorderColor = StringField(default="#bdc3c7")
	groupColorBorderWidth = IntField(default=0)
	groupColorRadius = IntField(default=100)
	groupColorSize = IntField(default=10)
	@classmethod
	def create(cls,info): 
		return cls(**info)

class Legend(DynamicEmbeddedDocument):
	display = BooleanField(default=False)
	position = StringField(choices=('left','right','top','bottom')) #Double check the keywords
	padding = IntField(default=15)
	boxWidth = IntField(default=15)
	fontSize = IntField(default=10)
	usePointStyle = BooleanField(default=False)
	fontColor = StringField(default="28cd2d")
	@classmethod
	def create(cls,info):
		return cls(**info)

class CrossHair(DynamicEmbeddedDocument):
	color = StringField(default="#2980b9")
	display = BooleanField(default=True)
	width = IntField(default=1)
	@classmethod
	def create(cls,info):
		return cls(**info)

class Grid(DynamicEmbeddedDocument):
	prefix = StringField(default='')
	postfix = StringField(default='')
	displayXLabels = BooleanField(default=True)
	displayYLabels = BooleanField(default=True)
	yColor = StringField(default='#bdc3c7')
	yLineWidth = IntField(default=1)
	yDisplay = BooleanField(default=False)
	xColor = StringField(default='#bdc3c7')
	xLineWidth = IntField(default=1)
	xDisplay = BooleanField(default=True)
	@classmethod
	def create(cls,info): 
		return cls(**info)

class IncrementSelector(DynamicEmbeddedDocument):
	enable = BooleanField(default=False)
	backgroundColor = StringField(default="#ecf0f1")
	color = StringField(default="#7f8c8d")
	borderWidth = IntField(default=1)
	borderColor = StringField(default="#ecf0f1")
	borderRadius = IntField(default=3)
	selectedColor = StringField(default="#ecf0f1")
	selectedBackground = StringField(default="#3498db")
	@classmethod
	def create(cls,info={}):
		return cls(**info)

class DateRange(DynamicEmbeddedDocument):
	name = StringField(default='')
	unit = StringField(default='day',choices=('hour','day','month','year'))
	includeThis = BooleanField(default=True)
	display = IntField(default=10)
	@classmethod
	def create(cls,info):
		return cls(**info)

class RangeSelector(DynamicEmbeddedDocument):
	enable = BooleanField(default=True)
	backgroundColor = StringField(default="#ecf0f1")
	color = StringField(default="#7f8c8d")
	borderColor = StringField(default="#ecf0f1")
	borderRadius = IntField(default=3)
	borderWidth = IntField(default=1)
	DateRanges = EmbeddedDocumentListField('DateRange')
	@classmethod
	def create(cls,info={}):
		info['DateRanges'] = [ DateRange.create(dateRange) for dateRange in info.get('DateRanges',[])]
		return cls(**info)

class ExportData(DynamicEmbeddedDocument):
	enable = BooleanField(default=True)
	backgroundColor = StringField(default='#ecf0f1')
	color = StringField(default='#7f8c8d')
	borderColor = StringField(default='#ecf0f1')
	borderWidth = IntField(default=1)
	borderRadius = IntField(default=1)
	postfix = StringField(default='')
	prefix = StringField(default='')
	fileName = StringField(default='export')
	@classmethod
	def create(cls,info):
		return cls(**info)

class Limit(DynamicEmbeddedDocument):
	limitID = StringField()
	name = StringField()
	nameColor = StringField()
	fontSize = IntField()
	lineColor = StringField()
	limit = IntField()
	lineHeight = IntField()
	increment = StringField(choices=('hour','day','month','year'))
	@classmethod
	def create(cls,info={}):
		return cls(**info)

defaultGraphNames = ['Sanderling', 'Goldcrest', 'Greenshank', 'Sparrowhawk', 'Rook', 'Dowitcher', 'Firecrest', 'Quail ', 'Wheatear', 'Goldeneye', 'Sandpiper', 'Jay ', 'Redpoll', 'Coot', 'Puffin  ', 'Ruff ', 'Garganey', 'Pheasant', 'Pigeon', 'Skylark', 'Stonechat', 'Wagtail', 'Guillemot ', 'Cuckoo', 'Kestrel', 'Egret', 'Shearwater', 'Stint', 'Chaffinch', 'Blackbird', 'Scaup', 'Cormorant ', 'Oystercatcher ', 'Mallard', 'Shag', 'Gadwall', 'Pipit', 'Curlew', 'Thrush', 'Whimbrel', 'Chough', 'Yellow-byello warbler', 'Razorbill', 'Pintail', 'Goosander', 'Merganser', 'Teal', 'Magpie', 'Redstart', 'Warbler', 'Whitethroat', 'Dunnock ', 'Whinchat', 'Yellowhammer', 'Dunlin', 'Greenfinch', 'Dipper', 'Moorhen', 'Kittiwake', 'Duck', 'Grebe', 'Swift ', 'Lapwing', 'Tern', 'Eider', 'Pochard', 'Chiffchaff', 'Goldfinch', 'Swan', 'Siskin', 'Smew', 'Twite ', 'Goshawk', 'Goose', 'Redshank', 'Treecreeper', 'Tit ', 'Linnet', 'Scoter', 'Peregrine', 'Turnstone', 'Corncrake', 'Petrel', 'Plover', 'Swan ', 'Redwing', 'Grouse', 'Crossbill', 'Raven', 'Gannet ', 'Bullfinch', 'Flycatcher ', 'Great tit', 'Partridge', 'Robin', 'Jackdaw', 'Brambling', 'Buzzard', 'Nightjar ', 'Sandpiper ', 'Swallow', 'Snipe', 'Bunting', 'Flycatcher', 'Merlin', 'Starling', 'Kingfisher', 'Owl', 'Fulmar ', 'Shelduck', 'Wigeon', 'Blackcap', 'Gull', 'Ouzel', 'Shoveler', 'Fieldfare', 'Harrier']
class Graph(DynamicDocument):
	name = StringField()
	client = ReferenceField('Client')
	type = StringField()
	data = EmbeddedDocumentField('Data')
	grid = EmbeddedDocumentField('Grid')
	crossHair = EmbeddedDocumentField('CrossHair')
	legend = EmbeddedDocumentField('Legend')
	tooltips = EmbeddedDocumentField('Tooltips')
	query = EmbeddedDocumentField('Query')
	incrementSelector = EmbeddedDocumentField('IncrementSelector')
	rangeSelector = EmbeddedDocumentField('RangeSelector')
	limits = EmbeddedDocumentListField('Limit')
	exportData = EmbeddedDocumentField('ExportData')
	@classmethod
	def create(cls,client):
		return cls(client=client)
	@classmethod
	def list(cls,client,source=None):
		query = {}
		query['client'] = client
		if source is not None:
			query['query__source'] = source.id
		return cls.objects(**query)
	def update(self,type=None,name=None,incrementSelector=None,rangeSelector=None,limits=None,data=None,grid=None,crossHair=None,legend=None,tooltips=None,query=None,exportData=None):
		self.name = name if name is not None else self.name
		self.type = type if type is not None else self.type
		self.incrementSelector = IncrementSelector.create(info=incrementSelector) if incrementSelector is not None else self.incrementSelector
		self.rangeSelector = RangeSelector.create(info=rangeSelector) if rangeSelector is not None else self.rangeSelector
		self.data = Data.create(info=data) if data is not None else self.data
		self.grid = Grid.create(info=grid) if grid is not None else self.grid
		self.crossHair = CrossHair.create(info=crossHair) if crossHair is not None else self.crossHair
		self.legend    = Legend.create(info=legend) if legend is not None else self.legend
		self.tooltips  = Tooltips.create(info=tooltips) if tooltips is not None else self.tooltips
		self.query = Query.create(client=self.client,info=query) if query is not None else self.query
		self.exportData = ExportData.create(info=exportData) if exportData is not None else self.exportData
		self.limits = [ Limit.create(info=limit) for limit in limits] if limits is not None else self.limits
		self.save()
	def dict(self): 
		response = getDict(self)
		try:
			response['query']['source'] = response['query']['source']['id']
		except: pass

		del response['client']
		response['id'] = "graph_" + str(self.id)

		return response
	def runQuery(self,isAuthenticated,tokens=[],conditions=[],start = None,end = None,increment = None,utcOffset="+00"):
		query = self.query.toDict()
		query['conditions'] += conditions
		tokensObj = Token.get(client=self.client,tokens=tokens)
		if self.query.requireToken:
			if isAuthenticated is not True:
				if len(tokens) == 0: raise Exception
				if len(tokensObj) == 0: raise Exception
		for token in tokensObj:
			query['conditions'] += [condition.toDict() for condition in token.conditions]
		if end is not None:
			query['end'] = end
		if start is not None:
			query['start'] = start
		if increment is not None:
			query['increment'] = increment
		return self.query.source.executeQuery(query = query,utcOffset=utcOffset)
	def build(self,tokens,conditions,isAuthenticated,utcOffset):
		response = self.dict()
		response['id'] = "graph_" + str(self.id)
		response['datasets'] = self.runQuery(
			utcOffset=utcOffset,
			tokens=tokens,
			conditions=conditions,
			isAuthenticated=isAuthenticated)
		del response['query']['source']
		if response['query']['end'] == 'now':
			response['query']['end'] = datetime.datetime.utcnow()
			response['query']['start'] = dateIncrement(
				date=response['query']['end'],
				increment=response['query']['increment'],
				by = int(response['query']['start']) * -1
			)
			response['query']['end'] = response['query']['end'].isoformat()
			response['query']['start'] = response['query']['start'].isoformat()
		return response
	@classmethod
	def get(cls,client,id=None,source=None):
		query = {}
		query['client'] = client
		if id is not None:
			prefix = id[:6]
			if prefix == 'graph_':
				id = id[6:]
			query = {'client': client, 'id': id}
		elif source is not None:
			query["query__source"] = source
		else:
			return None

		graphs = cls.objects(**query)
		if len(graphs) == 1:
			return graphs[0]
		return None
	@classmethod
	def getTemplate(cls):
		empty = cls(id='create',
			type='line',
			name=random.choice(defaultGraphNames),
			data=Data(),
			grid=Grid(),
			crossHair=CrossHair(),
			legend=Legend(),
			tooltips=Tooltips(),
			query=Query(),
			incrementSelector=IncrementSelector(),
			rangeSelector=RangeSelector(),
			limits=[],
			exportData = ExportData(),
		)
		empty = getDict(empty)
		del empty['client']
		return empty
	def removeSource(self):
		self.query.source = None
		self.query.field = None
		self.save()

class Token(DynamicDocument):
	tokenHash = StringField()
	client = ReferenceField('Client')
	created = IntField()
	conditions = EmbeddedDocumentListField(Condition)
	@classmethod
	def create(cls,client,conditions=[]):
		token = cls(client=client,created=int(time.time()),tokenHash=str(uuid.uuid4().hex))
		token.conditions = [Condition.create(info=cond) for cond in conditions]
		token.save()
		return "token_" + str(token.id) + "-" + token.tokenHash

	@classmethod
	def parseToken(cls,token):
		idType = token[:6]
		if idType != 'token_':
			raise Exception
		token = token[6:]
		token = token.split("-")
		tokenID = token[0]
		tokenHash = token[1]
		return tokenID, tokenHash

	@classmethod
	def get(cls,client,tokens):
		if len(tokens) == 0: return []
		query = None
		for token in tokens:
			tokenID,tokenHash = cls.parseToken(token = token)
			component = (Q(tokenHash = tokenHash) & Q(id = tokenID))
			if query is None:
				query = component
				continue
			query = query | component
		query = (query) & Q(client = client)
		return cls.objects(query)










































