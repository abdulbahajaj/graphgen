from pymongo import MongoClient,InsertOne, DeleteMany, ReplaceOne, UpdateOne
from source.Cache import Cache
import ProcessData
mongoClient = MongoClient('localhost', 27017)

class SourceHandler:
	@classmethod
	def getDB(cls,clientID):
		return mongoClient[str(clientID)]
	@classmethod
	def getSource(cls,clientID,sourceID):
		return cls.getDB(clientID=clientID)[sourceID]
	@classmethod
	def add(cls,clientID,sourceID,data):
		source = cls.getSource(clientID=clientID,sourceID=sourceID)
		source.insert_many(data)
		cls.cacheSchema(clientID=clientID,sourceID=sourceID)
	@classmethod
	def sources(cls,clientID):
		return cls.getDB(clientID).collection_names
	@classmethod
	def delete(cls,clientID,sourceID):
		source = cls.getSource(clientID=clientID,sourceID=sourceID)
		source.remove({})
		Cache.set(clientID=clientID,name=sourceID,data={})
	@classmethod
	def cacheSchema(cls,clientID,sourceID,result=None):
		if result is None:
			source = cls.getSource(clientID=clientID,sourceID=sourceID)
			pipeline = [
			    {"$project": {
		    		"keysAndValues": {"$objectToArray": "$data"}
				}},
			    {"$unwind": "$keysAndValues"},
			    {"$project": { "k": "$keysAndValues.k" ,"v": {"$type": "$keysAndValues.v" } } },
			    {"$group": {
			        "_id": None,
			        "schema": { "$addToSet": { "key": "$k", "type": "$v" } }
			    }},
		    ]
			result=list(source.aggregate(pipeline=pipeline,allowDiskUse=True))[0]
			result = result.get('schema')
			dictResult = {}
		else:
			dictResult = cls.getSchema(clientID=clientID,sourceID=sourceID)
		for keyValuePair in result:
			dictResult[keyValuePair['key']] = keyValuePair['type']
		Cache.set(clientID=clientID,name=sourceID,data=dictResult)
		return dictResult
	@classmethod
	def getSchema(cls,clientID,sourceID):
		return Cache.get(clientID=clientID,name=sourceID)
	@classmethod
	def editConvertTypes(cls,clientID,sourceID,key,fromType,toType):
		source = cls.getSource(clientID=clientID,sourceID=sourceID)
		changes = []
		for doc in source.find({"data."+key: {"$type": fromType}}):
			value = doc.get('data',{}).get(key,None)
			if value is None: continue
			value = ProcessData.convertType(value=value,toType=toType)
			if value is None: continue
			doc['data'][key] = value
			changes.append(ReplaceOne({'_id': doc['_id']},doc))
		if len(changes) > 0:
			source.bulk_write(changes, ordered=False)
		cls.cacheSchema(clientID=clientID,sourceID=sourceID,result=[{'key': key, 'type': toType}])













		













		

















		

















		

















		

















		

















		

















		

















		

















		

















		

















		

















		

















		

















		

















		

















		

