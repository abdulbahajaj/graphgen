import { createStore } from 'redux';
import axios from 'axios';
import {argsParser} from './common.js'
import {domainName} from "./settings.js"

var Raven = require('./raven.js');
Raven.config('https://1a39471776094145bb08f4636984e5d9@sentry.io/1252791').install();

const InternalError = function(message){
	throw new Error(message);
}

const ServerCOM = new function(){
	this.send=(endpoint,data) => {
	    if(typeof data=='undefined'){data={}}
	    var request=axios({
	        method: 'post',
	        url: domainName + endpoint,
	        data: data,
	    });
	    return request;
	}
	this.waitForAll = function(requests){
		return axios.all(requests);
	}
};

const ACTIONS = {
	EDIT_DATA: 'editData',
	CREATE_TYPE: 'createType',
	INIT_DATA_TYPE: 'initDataType',
	SET_CREDENTIAL: 'setCredential',
	CREATE_ERROR_TYPE: 'createErrorType',
	REMOVE_ITEM: 'removeItem',
};

const dataReducer = function(state = {}, action){
	switch (action.type){
		case ACTIONS.EDIT_DATA:
			var data = action.data;
			if(typeof state[action.dataType] == 'undefined'){
				APPManager.logError("dataReducer.EDIT_DATA: Inserting an undefined data type: " + action.dataType);
				break;
			}
			for(var cursor in data){
				var item = data[cursor];
				state[action.dataType][item.id] = Object.assign({},state[action.dataType][item.id],item);
			}
			break;
		case ACTIONS.CREATE_TYPE:
			if(typeof state[action.dataType] != 'undefined'){
				APPManager.logError("dataReducer.CREATE_TYPE: Creating an existing data type");
				break;
			}
			state[action.dataType] = {};
			break;
		case ACTIONS.REMOVE_ITEM:
			if(state[action.dataType] == 'undefined'){
				APPManager.logError("dataReducer.REMOVE_ITEM: Data type is not defined - type:" + dataType)
				return;
			}
			delete state[action.dataType][action.id];
			break;
	}
	return state;
};

const DataStore = new createStore(dataReducer);

const metaReducer = function(state={dataTypes: {}, errors: {}},action){
	switch(action.type){
		case ACTIONS.INIT_DATA_TYPE:
			if(typeof state[action.dataType] != 'undefined'){
				APPManager.logError("metaReducer.INIT_DATA_TYPE: initializing data type that are already initialized. Data type: " + action.dataType);
				break;
			}
			state.dataTypes[action.dataType] = {};
			state.dataTypes[action.dataType].credentials = action.credentials;
			state.dataTypes[action.dataType].endpoints = action.endpoints;
			break;
		case ACTIONS.SET_CREDENTIAL:
			if(typeof state.dataTypes[action.dataType] == 'undefined'){
				APPManager.logError('metaReducer.SET_CREDENTIAL: data type is not defined - type: ' + action.dataType)
				break;
			}
			state.dataTypes[action.dataType].credentials[action.name] = action.value;
			break;
		case ACTIONS.CREATE_ERROR_TYPE:
			if(typeof state.errors[action.errorType] != 'undefined'){
				APPManager.logError("metaReducer.CREATE_ERROR_TYPE: Creating an existing error type: " + action.errorType);
				break;
			}
			state.errors[action.errorType] = action.message;
			break;
	}

	return state;
}
const MetaStore = new createStore(metaReducer)


const APPManager = new function(){
	this.logError = function(message){
		Raven.setTagsContext({
		    bodyState: DataStore.getState(),
		    metaState: MetaStore.getState(),
		});
		Raven.captureException(message)
	}
	this.dumpState = function(){
		var result = {}

		result['dataStore'] = DataStore.getState()
		result['meta'] = MetaStore.getState();
	}
	this.createDataType = function(args){
		var type = argsParser(args,'type',null),
		credentials=argsParser(args,'credentials',{}),
		endpoints=argsParser(args,'endpoints',{});
		if(typeof type !== 'string'){

			return;
		}
		var action = {};
		action.type = ACTIONS.CREATE_TYPE;
		action.dataType = type;
		DataStore.dispatch(action);

		action = {};
		action.type = ACTIONS.INIT_DATA_TYPE;
		action.dataType = type;
		action.credentials = credentials;
		action.endpoints = endpoints;
		MetaStore.dispatch(action);
	}
	this.setCredentials = function(type,name,value){
		var action = {};
		action.type = ACTIONS.SET_CREDENTIAL;
		action.name = name;
		action.value = value;
		action.dataType = type;
		MetaStore.dispatch(action);
	}
	this.set = function(type,data){
		var action = {};
		action.type = ACTIONS.EDIT_DATA;
		action.dataType = type;
		action.data = data;
		DataStore.dispatch(action);
	}
	this.get = function(type,id = null){
		var data = DataStore.getState();
		data = data[type];
		if(typeof data == 'undefined'){
			APPManager.logError("APPManager.get: requested an undefined data type: "+type);
			return null;
		}
		data = JSON.parse(JSON.stringify(data));
		if(id == null){return data;}
		var item = data[id];
		if(typeof item == 'undefined'){
			APPManager.logError("APPManager.get: the requested item doesn't exist: type: " + type + " - id: " + id);
			return null;
		}
		return item;
	}
	this.remove = function(type,id){
		var action = {};
		action.type = ACTIONS.REMOVE_ITEM;
		action.dataType = type;
		action.id = id;
		DataStore.dispatch(action);
	}
	this.load = function(type,endpointName,items = [],keepReady=false){
		var meta = MetaStore.getState();
		meta = meta.dataTypes[type];
		if(typeof meta == 'undefined'){
			APPManager.logError("APPManager.load: can't load an uninitialized - type:"+ type);
			return;
		}
		var data = meta.credentials;
		for(var credentialName in data){
			var credential = data[credentialName];
			if(credential === null){
				APPManager.logError('APPManager.load: '+ credentialName+ " is required")
				return;
			}
		}
		data.items = items;
		var endpoint = meta.endpoints[endpointName];
		if(typeof endpoint == 'undefined'){
			APPManager.logError('APPManager.error: endpoint is not defined - type: '+ type+ " - endpointName: ", endpointName);
			return;
		}
		var request = ServerCOM.send(endpoint,data);
		var notReadyStatus = [];
		for(var cursor in items){
			var item = items[cursor];
			if(typeof item.id != 'string'){
				APPManager.logError("APPManager.load: item has no id: "+item);
				return;
			}
			if(!keepReady){
				item.ready = false;
			}
			notReadyStatus.push(item)
		}
		APPManager.set(type,notReadyStatus);
		request.then(function(response){
			var items = response.data.data;
			for(var cursor in items){
				items[cursor].version = + new Date() + ""
				items[cursor].ready = true;
			}
			APPManager.set(type,items);
		}).catch(function(err){
			var description = argsParser(err.response.data,'description',null);
			var context = argsParser(err.response.data,'context','')
			if(description != null){
				console.log(description,context);
			}
		});
		return request;
	}
	this.createErrorType = function(type,message){
		var action = {};
		action.type = ACTIONS.CREATE_ERROR_TYPE;
		action.errorType = type;
		action.message = message
		MetaStore.dispatch(action);
	}
	this.reportError = function(type){
		var meta = MetaStore.getState();
		var errors = meta.errors;
		var message = errors[type];
		APPManager.logError(type+" : "+message);
	}
	this.subscribe = function(func,store='data'){
		if(store == 'data'){
			DataStore.subscribe(func);
		}else if(store == 'meta'){
			MetaStore.subscribe(func);
		}
	}
}

export default APPManager;


















