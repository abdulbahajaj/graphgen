from django.shortcuts import render
from source.models import SourceMeta
from RequestDec import RequestDec
import time
from Expose import Expose
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from graph.models import Graph

@Expose.this(path='resource/source')
@RequestDec(authenticated=True)
def resource(client):
	response={}
	response['object']='resource'
	response['type']='source'
	response['data'] = [source.dict() for source in SourceMeta.list(client=client)]
	return response

@Expose.this(path='remove/source')
@RequestDec(authenticated=True)
def remove(client,sourceName):
	source = SourceMeta.getOrCreate(client=client,name=sourceName)
	for graph in Graph.list(client=client,source=source):
		graph.removeSource()
	source.remove()
	response={}
	response['object'] = 'confirmation'
	response['status'] = 'success'
	return response

@Expose.this(path='edit/source')
@RequestDec(authenticated=True)
def overRideSchema(client,sourceName,field,toType):
	source = SourceMeta.getOrCreate(client=client,name=sourceName)
	source.overRideSchema(field=field,toType=toType)
	response={}
	response['object'] = 'confirmation'
	response['status'] = 'success'
	return response

@Expose.this(path='api/append/<endpointID>/<sourceName>',isRe=False)
@csrf_exempt
@RequestDec(authenticated=False,endpointAuth=True)
def append(client,_body,sourceName):
	source = SourceMeta.getOrCreate(client=client,name=sourceName)
	source.add(data=_body)
	response={}
	response['object'] = 'confirmation'
	response['status'] = 'success'
	return response

@Expose.this(path='api/webhook/<endpointID>/<sourceName>',isRe=False)
@csrf_exempt
@RequestDec(authenticated=False,APILogin=False,endpointAuth=True)
def appendWebhook(client,endpointID,sourceName,_body):
	source = SourceMeta.getOrCreate(client=client,name=sourceName)
	source.add(data=_rowBody,enrich=True)
	response={}
	response['object'] = 'confirmation'
	response['status'] = 'success'
	return response