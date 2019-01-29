import json,inspect
from django.http import HttpResponse
from django.core.handlers.wsgi import WSGIRequest
from sysUser.models import Client
import datetime
from django.middleware import csrf
from common import ExceptionFactory
import logging

log = logging.getLogger("MYAPP")

def getExpectedInputsNames(func):
	return inspect.getargspec(func).args

def parseArgs(args):
	result={}
	firstElement=args[0]
	if isinstance(firstElement,WSGIRequest):
		result['request']=firstElement
	else:
		if isinstance(firstElement,type):
			result['cls']=firstElement
		else:
			result['self']=firstElement
		for element in args:
			if isinstance(element,WSGIRequest):
				result['request']=element
	return result

def getClient(request): 
	user = request.user
	email = user.username
	return Client.unsafeGet(email = email)

def getRequestArgs(request):
	response = {}
	try:
		response.update(json.loads(request.body))
	except: pass

	try:
		response.update(request.GET)
	except: pass

	try:
		response.update(request.POST)
	except: pass

	return response

def getInputs(args,kwargs,func,isAuthenticated,client=None):
	inputs = {}
	request = args['request']
	body = getRequestArgs(request = request)
	bodyCache = json.loads(json.dumps(body))
	if isinstance(body,list):
		body = {}
	body.update(kwargs)
	for name in getExpectedInputsNames(func=func):
		if name == 'request':
			value = args['request']
		elif name == 'cls':
			value = args['cls']
		elif name == 'self':
			value = args['self']
		elif name == 'client':
			value = getClient(request=request) if client is None else client
		elif name == 'isAuthenticated':
			value = isAuthenticated
		elif name == '_body':
			value = bodyCache
		else:
			value = body.get(name,None)
		if value is None: continue
		inputs[ name ] = value
	return inputs

def authenticationRequired():
	response = {}
	response['status'] = 'error'
	response['description'] = 'User is not authenticated or authentication has failed'
	response = json.dumps(response)
	response = HttpResponse(response,status=401)
	return response

def getAPIClient(request,isPrivate):
	try:
		body = json.loads(request.body)
	except: return None
	publicKey = None
	privateKey = None
	if isPrivate is True:
		privateKey = body.get('privateKey',None)
	else:
		publicKey = body.get('publicKey',None)

	return Client.get(privateKey=privateKey,publicKey=publicKey)

def getEndPointClient(kwargs):
	endpointID = kwargs['endpointID']
	return Client.get(endpointID=endpointID)

def RequestDec(authenticated=True,APILogin=False,private=False,endpointAuth=False,jsonResponse=True,httpfy=True):
	def dec(func):
		def wrapper(*args,**kwargs):
			log.debug("RequestDec(authenticated={authenticated},APILogin={APILogin},private={private},endpointAuth={endpointAuth},jsonResponse={jsonResponse},httpfy={httpfy})")
			status = 200
			try:
				args = parseArgs(args=args)
				request = args.get('request',None)
				client = None
				isAuthenticated = False
				if authenticated is not False:
					if request is None: 
						return authenticationRequired()
					client = Client.getAuthenticatedUser(request=request)
					if client is None:
						return authenticationRequired()
					isAuthenticated = True
				elif APILogin is not False:
					client = getAPIClient(request=request,isPrivate=private)
					if not isinstance(client,Client):
						return authenticationRequired()
					isAuthenticated = True
				elif endpointAuth is True:
					client = getEndPointClient(kwargs)
					if not isinstance(client,Client):
						return authenticationRequired()
					isAuthenticated = True
				inputs = getInputs(args=args,kwargs=kwargs,func=func,client=client,isAuthenticated=isAuthenticated)
				response = func(**inputs)
			except Exception as err:
				try:
					response = err.toDict()
					status = err.status
				except:
					response = {'name': 'UnexpectedError', 'description': "An UnexpectedError has occured. Our team will investigate it"}
					response = json.dumps(response)
					response = HttpResponse(response)
					status = 500

				log.debug("An error has occured: {status} - {response}")
			if jsonResponse is True and isinstance(response,dict):
				response = json.dumps(response)
				log.debug("RequestDec.response: {response}")#.format({'response': response}))
			if httpfy is True and not isinstance(response,HttpResponse):
				response = HttpResponse(response,status=status)
				csrfToken = request.COOKIES.get('csrftoken',None)
				response.set_cookie('csrftoken',csrf.get_token(request))
			return response
		return wrapper
	return dec

	
	

	
	
	

	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
