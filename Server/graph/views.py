from django.http import HttpResponse
from django.shortcuts import render
from dateutil.relativedelta import relativedelta
from graph.models import Graph,Token,GraphNotFoundException
from bson.json_util import dumps
from sysUser.models import Client
from source.models import SourceMeta
from RequestDec import RequestDec
from common import getDict
from django.views.decorators.csrf import csrf_exempt
from Expose import Expose
import json,random,time,datetime,dateutil.parser,os,ProcessData

@Expose.this(path='resource/graph')
@RequestDec(authenticated=True)
def resource(client):
	response={}	
	response['object']='resource'
	response['type']='graph'
	response['data'] = [Graph.getTemplate()]
	response['data'] += [graph.dict() for graph in Graph.list(client=client)][::-1]
	return response

@Expose.this(path='edit/graph')
@RequestDec(authenticated=True)
def edit(client,graph):
	graphID = graph.get('id',None)
	del graph['id']

	if graphID in ['create','clone']:
		graphObj = Graph.create(client=client)
	else:
		graphObj = Graph.get(id=graphID,client=client)

	if graphID == 'clone':
		graph['name'] = graph['name'] + ' clone'

	graphObj.update(
		type=graph.get('type',None),
		name=graph.get('name',None),
		incrementSelector=graph.get('incrementSelector',None),
		rangeSelector=graph.get('rangeSelector',None),
		limits=graph.get('limits',None),
		data=graph.get('data',None),
		grid=graph.get('grid',None),
		crossHair=graph.get('crossHair',None),
		legend=graph.get('legend',None),
		tooltips=graph.get('tooltips',None),
		query=graph.get('query',None),
		exportData=graph.get('exportData',None)
	)
	return {'status': 'edited','id': "graph_"  + str(graphObj.id) }

@Expose.this(path='remove/graph')
@RequestDec(authenticated=True)
def remove(client,id):
	graph = Graph.get(client=client,id=id)
	graph.delete()
	return {'status': 'deleted'}

@Expose.this(path='query/graph')
@csrf_exempt
@RequestDec(authenticated=False,APILogin=True)
def query(client,items,isAuthenticated):
	response = {}
	response['object'] = 'resource'
	response['type'] = 'query'
	response['data'] = []
	for item in items:
		id = item.get('id',None)
		start = item.get('start',None)
		end = item.get('end',None)
		increment = item.get('increment',None)
		if None in [id,increment,start,end]: continue
		tokens = item.get('tokens',[])
		conditions = item.get('conditions',[])
		utcOffset = item.get('utcOffset','+00')

		if end != 'now':
			start = dateutil.parser.parse(start)
			end = dateutil.parser.parse(end)
		else:
			start = int(start)

		graph = Graph.get(id=id,client=client)
		if graph is None:
			raise GraphNotFoundException(context={"id": id})

		result = {}
		result['id'] = id
		result['datasets'] = graph.runQuery(
			utcOffset = utcOffset,
			tokens=tokens,
			conditions=conditions,
			start=start,
			end=end,
			isAuthenticated = isAuthenticated,
			increment=increment)
		response['data'].append(result)
	return response

@Expose.this(path='build/graph')
@csrf_exempt
@RequestDec(authenticated=False,APILogin=True)
def build(client,items,isAuthenticated):
	response={}	
	response['object'] = 'resource'
	response['type'] = 'graph'
	response['data'] = []
	for item in items:
		id = item.get('id',None)
		graph = Graph.get(id=id,client=client)
		if graph is None:
			raise GraphNotFoundException(context={"id": id})
		tokens = item.get('tokens',[])
		conditions = item.get('conditions',[])
		utcOffset = item.get("utcOffset","+00")
		response['data'].append(graph.build(
			utcOffset=utcOffset,
			tokens=tokens,
			conditions=conditions,
			isAuthenticated=isAuthenticated))

	# [graph.build(tokensIDs-tokensIDs,conditions=conditions) for graph in Graph.list(client=client)][::-1]
	return response

@Expose.this(path='js')
@csrf_exempt
def jsLib(request):
	filename = "/graph/jsLib/dist/main.js"
	BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
	file = open(BASE_DIR + filename, "r")
	file = file.read()
	return HttpResponse(file)

def dummy(clientID,sourceName):
	dataList = []
	products = [
		{'name':'audio technica - m50x','price': 100},
		{'name':'audio technica - m40x','price': 400},
		{'name':'audio technica - m30x','price': 600},
		{'name':'audio technica - m20x','price': 1900}
	]
	users = [uuid.uuid4().hex for x in range(300)]
	for cur in range(1000000):
		product = random.choice(products)
		date = datetime.datetime.utcfromtimestamp(time.time() - random.randint(10**7,10**9))
		data = dict(
			id = uuid.uuid4().hex,
			purchase = product['name'],
			user = random.choice( users ),
			revenue = product['price']
		)
		dataList.append(dict(date=date,data=data))
	COM.SourceHandler.add(clientID=clientID,sourceName=sourceName,data=dataList)

@Expose.this(path='create/token')
@csrf_exempt
@RequestDec(authenticated=False,APILogin=True,private=True)
def createToken(client,conditions=[]):
	token = Token.create(client=client,conditions=conditions)
	return {"token": token}























