from django.urls import re_path as DJ_RE_PATH,path as DJ_PATH

class Expose(object):
	__urls = []

	@classmethod
	def __add(cls,path,func,isRe):
		if isRe is True:
			# if not matchAll:
			path =  r'^' + path + r'/?$'
			# else:
				# path = "."
			pathObj = DJ_RE_PATH(path,func)
		else:
			pathObj = DJ_PATH(path,func)


		cls.__urls.append( pathObj )

	@classmethod
	def this(cls,path,isRe=True):
		def dec(func):
			cls.__add(path=path,func=func,isRe=isRe)
			return func
		return dec
	@classmethod
	def list(cls):
		return cls.__urls