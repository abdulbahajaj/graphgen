# Create your models here.
import datetime
import uuid
import random
import time
from source.tasks import Add,remove,updateSchema
from mongoengine import *
from source.TimeSeriesQuery import TimeSeriesQuery
from source.SourceHandler import SourceHandler
from common import getDict

class SourceMeta(DynamicDocument):
	name = StringField()
	client = ReferenceField('Client')
	credentials = DictField(default = None)
	schemaChanges = DictField(default={})

	# weebhookRecieverID = StringField(default=None)
	@classmethod
	def create(cls,client,name,credentials={}):
		if len(cls.objects(client=client,name=name)) > 0: return None
		source = cls(
			client=client,
			name=name,
			credentials=credentials)
		source.save()
		return source

	# Get a new source
	@classmethod
	def get(cls,client,id=None,name=None):
		if id is None and name is None: return None
		query = {'client': client}
		if id is not None: query['id'] = id
		if name is not None: query['name'] = name
		results = cls.objects(client=client,id=id)
		if len(results) != 1: return None
		return results[0]

	@classmethod
	def getOrCreate(cls,client,name):
		results = cls.objects(client=client,name=name)
		if len(results) == 1:
			return results[0]
		return SourceMeta.create(name=name,client=client)

	# List sources
	@classmethod
	def list(cls,client):
		return cls.objects(client=client)

	def cacheSchema(self):
		SourceHandler.cacheSchema(clientID=str(self.client.id),sourceID=str(self.id))

	@classmethod
	def generateDummySource(cls,client):
		source = cls.create(client=client,name='Dummy data - API calls')
		source.fillWithDummyData()

	def overRideSchema(self,field,toType):
		currentSchema = SourceHandler.getSchema(
			clientID = str(self.client.id),
			sourceID = str(self.id))
		currentType = currentSchema.get(field,None)
		if self.schemaChanges.get(field,None) is None:
			self.schemaChanges[field] = {}
		if currentType is None: return
		self.schemaChanges[field] = {'from': currentType,'to': toType}
		updateSchema.delay(
			clientID=str(self.client.id),
			sourceID=str(self.id),
			fromType = currentType,
			key=field,
			toType=toType)
		self.save()

	# Add data to a source
	def add(self,data):
		Add.apiAdd.delay(
			clientID=str(self.client.id),
			sourceID=str(self.id),
			data=data,
			schemaOverRide=SourceHandler.getSchema(clientID=str(self.client.id),sourceID=str(self.id)))

	def fillWithDummyData(self):
		Add.dummy.delay(clientID=str(self.client.id),sourceID=str(self.id))

	# Delete source
	def remove(self):
		remove.delay(clientID=str(self.client.id),sourceID=str(self.id))
		self.schemaChanges = {}
		self.save()
		self.delete()
		return True

	# Integrate with a driver
	def integrate(self): pass

	# Query the data source
	def executeQuery(self,query,utcOffset="+00"):
		return TimeSeriesQuery(
			utcOffset=utcOffset,
			sourceID = str(self.id),
			clientID = str(self.client.id),
			query = query,
		).get()

	# Get date representation
	def dict(self):
		response = getDict(self)
		del response['client']
		del response['credentials']
		# del response['schemaOverRide']
		response['schema'] = SourceHandler.getSchema(
			clientID=str(self.client.id),
			sourceID=str(self.id))
		# response['schema'].update(self.schemaOverRide)
		return response





