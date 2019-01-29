from django.shortcuts import render
from RequestDec import RequestDec
from Expose import Expose
from django.views.decorators.csrf import csrf_exempt
import FileLoader
from sysUser.models import Client
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import HttpResponse
from django.middleware.csrf import get_token
@Expose.this(path=".*")
@ensure_csrf_cookie
@RequestDec(authenticated=False,jsonResponse=False)
def frontend(request):
	# return get_token(request)sss

	client = Client.getAuthenticatedUser(request=request)
	if client is None:
		return FileLoader.get(name='frontpage')
	return FileLoader.get(name='app')



def errorPage(request):
	return HttpResponse( FileLoader.get(name='errorPage') )