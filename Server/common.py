import bson
from mongoengine import *
import json
def getDict(self):
	response={}
	def isConvertable(val):
		if isinstance(val,DynamicDocument) or isinstance(val,DynamicEmbeddedDocument):
			return True
		return False
	for attr in self:
		val = getattr(self,attr)
		if isConvertable(val=val):
			val = getDict(val)
		elif isinstance(val,list) :
			for cur in range(len(val)):
				if isConvertable(val=val[cur]):
					val[cur] = getDict(val[cur])
		elif isinstance(val,dict):
			for cur in val:
				if isConvertable(val=val[cur]):
					val[cur] = getDict(val[cur])
		elif isinstance(val,bson.objectid.ObjectId):
			val = str(val)

		response[attr] = val
	return response

def ExceptionFactory(name,description,status = 200):
	class NewException(Exception):
		name = None
		status = 200
		description = None
		def __init__(self, context = {}):
			super().__init__(name + " " + description)
			self.name = name
			self.description = description
			self.context = context
			self.status = status
		def toDict(self):
			response = {}
			response['name'] = self.name
			response['description'] = self.description
			response['context'] = self.context
			return response
		def __repr__(self):
			return json.dumps(self.toDict())
	NewException.__name__ = name
	return NewException


