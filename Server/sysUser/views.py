from django.shortcuts import render
from django.http import HttpResponse
import json
from sysUser.models import Client,UserNotFound,DuplicateUser
from RequestDec import RequestDec
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import logout as AuthLogout
from django.shortcuts import redirect
from Expose import Expose
import ProcessData
from django.shortcuts import render


@Expose.this(path='resource/client')
@RequestDec(authenticated=True)
def resource(client):
	response = {}
	response['object']='resource'
	response['type']='client'
	response['data'] = client.dict()
	return response

@Expose.this(path='logout')
@RequestDec(authenticated=True)
def logout(request,client):
	client.logout(request=request)
	AuthLogout(request)
	return {}

def login(request,email,password):
	response = {}
	try:
		Client.get(email=email,password=password,request=request)
		response['status'] = 'success'
	except UserNotFound:
		response['status']='error'
	return response

@Expose.this(path='auth')
@csrf_exempt
@RequestDec(authenticated=False,jsonResponse=False,httpfy=False)
def auth(request,email,password,action):
	action = action[0]
	password = password[0]
	email = email[0]
	redirectURL = '/?'
	validityCheck = action in ['login','register'] and ProcessData.typeCheck(typeName='email',value=email) is True
	if validityCheck is True:
		if action == 'login':
			client = Client.get(email=email,password=password)
			client.login(request=request)
			try:
				pass
			except:
				redirectURL += 'error=The entered email and password do not match'
		elif action == 'register':
			try:
				client = Client.create(email=email,password=password)
				client.login(request=request)
			except DuplicateUser:
				redirectURL +='error=This email address already exist in our records'
	else:
		redirectURL += 'error=Enter a valid email address'
	# return HttpResponse("WORKED")
	return redirect(redirectURL)

# def http500Err(request):
#     return render(request, 'sys/templates/errorPage.html', {
#         'foo': 'bar',
#     }, content_type='html')




























