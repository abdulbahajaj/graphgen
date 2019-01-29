from django.db import models
from mongoengine import *
from mongoengine import connect
import uuid
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login
from common import getDict
from mongoengine.queryset.visitor import Q
import bcrypt
# Create your models here.
connect(host='mongodb://localhost:27017/test')

class UserNotFound(Exception): pass
class DuplicateUser(Exception): pass

class Client(DynamicDocument):
	email = StringField(default=None)
	stripeToken = StringField(default=None)
	privateKey = StringField(default=None)
	publicKey = StringField(default=None)
	endpointID = StringField(default=None)
	password = BinaryField(default=None)
	salt = BinaryField(default=None)
	session = StringField(default=None)
	@classmethod
	def create(cls,email,password): 
		client = Client()
		if len(cls.objects(email=email)) != 0: 
			raise DuplicateUser
		client.email = email
		salt = bcrypt.gensalt()

		password = password.encode('utf8')
		client.password =  bcrypt.hashpw(password, salt)
		client.salt = salt

		client.save()
		strID = str(client.id)
		client.privateKey = strID + uuid.uuid4().hex
		client.publicKey = strID + uuid.uuid4().hex
		client.setEndpointID()
		client.save()
		return client

	def authenticate(self,password):
		password = password.encode('utf8')
		# hashedPassword = self.password.encode('utf8')
		if bcrypt.checkpw(password, self.password):
			return True
		raise Exception()
		return False

	def setEndpointID(self):
		self.endpointID = str(self.id) + '-' + str(uuid.uuid4().hex)

	@classmethod
	def unsafeGet(cls,email):
		result = cls.objects(email=email)
		if len(result) != 1:
			return None
		return result[0]

	@classmethod
	def getAuthenticatedUser(cls,request):
		sessionID = request.session.get('sessionID',None)
		userID = request.session.get('userID',None)
		if None in [sessionID,userID]: return None
		result = cls.objects(id=userID, session=sessionID)
		if len(result) != 1:
			return None
		return result[0]

	def login(self,request):
		self.session = str(uuid.uuid4().hex)
		self.save()
		request.session['sessionID'] = self.session
		request.session['userID'] = str(self.id)

	def logout(self,request):
		self.session = None
		self.save()
		del request.session['sessionID']
		del request.session['userID']

	@classmethod
	def get(cls,publicKey=None,privateKey=None,email=None,password=None,endpointID=None):
		if privateKey is not None:
			client = cls.objects(privateKey = privateKey)
			if len(client) != 1: return None
			return client[0]
		elif publicKey is not None:
			client = cls.objects(publicKey = publicKey)
			if len(client) != 1: return None
			return client[0]
		elif endpointID is not None:
			client = cls.objects(endpointID=endpointID)
			if len(client) != 1:
				raise UserNotFound()
			return client[0]
		elif email is not None and password is not None:
			client = cls.unsafeGet(email = email)
			if client is None:
				raise UserNotFound()
			if client.authenticate(password=password) is True:
				return client
			raise UserNotFound()
		else:
			return UserNotFound()
		return None

	def dict(self): 
		response = getDict(self)
		del response['stripeToken']
		del response['privateKey']
		del response['password']
		del response['salt']
		return response





































