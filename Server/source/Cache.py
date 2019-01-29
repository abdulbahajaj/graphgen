from pymongo import MongoClient

mongoClient = MongoClient('localhost', 27017)

class Cache:
	@classmethod
	def set(cls,clientID,name,data):
		collection = mongoClient[clientID]['__CACHE__']
		collection.remove({'name': name})
		collection.insert_one({'name': name, 'data': data})
	@classmethod
	def get(cls,clientID,name):
		collection = mongoClient[clientID]['__CACHE__']
		result = list(collection.find({'name': name}))
		if len(result) != 1: return None
		result = result[0]
		return result.get('data',None)
