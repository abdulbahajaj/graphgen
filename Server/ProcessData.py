import json
import collections
import dateutil
from datetime import datetime, tzinfo, timedelta
import re
class simple_utc(tzinfo):
    def tzname(self,**kwargs):
        return "UTC"
    def utcoffset(self, dt):
        return timedelta(0)



rePatterns = {}
rePatterns['email'] = r'''(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])'''
rePatterns['email'] = re.compile(rePatterns['email'])	

def typeCheck(typeName,value):
	pattern = rePatterns.get(typeName,None)
	if pattern is None: return None
	return False if re.match(pattern,value) is None else True

#Flatten a dictionary object
def flatten(data, parentKey='', seperator='__'):
    items = []
    for key, value in data.items():
        newKey = parentKey + seperator + key if parentKey else key
        if isinstance(value, collections.MutableMapping):
            items.extend(flatten(value, newKey, seperator=seperator).items())
        else:
            items.append((newKey, value))
    return dict(items)

def getNow():
	return datetime.utcnow().replace(tzinfo=simple_utc())

def getDate(value,key=None,schemaOverRide=None,tryForce=False):
	if None not in [key,schemaOverRide]:
		if isinstance(value,str):
			try:
				int(str)
				return None
			except:
				pass
		schema = schemaOverRide.get(key,None)
		if schema is not None:
			if schema == 'date':
				if isinstance(value,int) or isinstance(value,float):
					return datetime.utcfromtimestamp(value)
	if tryForce is True:
		if isinstance(value,int) or isinstance(value,float):
			return datetime.utcfromtimestamp(value)

	try:
		return dateutil.parser.parse(value).replace(tzinfo=simple_utc())
	except:
		return None

def convertType(value,toType):
	if toType == 'date':
		return getDate(value,tryForce=True)
	return None

#Add date attributes
def enrich(data,schemaOverRide):
	for key,value in data.items():
		date = getDate(key=key,value=value,schemaOverRide=schemaOverRide)
		data[key] = date if date is not None else value
	return data

class DataIsNotJSON(Exception): pass

#Checks if a string input is json
def getJSON(data):
	try:
		return json.parse(data)
	except:
		raise DataIsNotJSON()
