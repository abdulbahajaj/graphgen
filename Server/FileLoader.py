import os
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/Server/'
loadedFiles = {}
def load(name,path):
	file = open(BASE_DIR + path, "r")
	fileContent = file.read()
	loadedFiles[name] = fileContent
	file.close()
def get(name):
	return loadedFiles.get(name,None)