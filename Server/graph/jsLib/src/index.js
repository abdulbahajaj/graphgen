import {argsParser,getLocalUTCOffset} from './common.js';
import APPManager from './APPManager';
import {companyName} from './settings.js';
import Install from './install.js';
import processChanges from './changeProcessor.js';
import MakeLive from './makeLive.js'
// import nothing2 from './fontawesome.js'

// import Raven from 'raven'

// import * as Raven from 'raven-js';
// Raven.config('https://1a39471776094145bb08f4636984e5d9@sentry.io/1252791').install();

Install();
MakeLive();

APPManager.createDataType({type: 'graph', credentials: {publicKey: null}, endpoints: {
	build: "build/graph",
	query: "query/graph",
}});

APPManager.createDataType({type: 'drawing'});
APPManager.subscribe(processChanges);

/**
	Feedback errors:
		Didn't connect
		Wrong graph ID
		Wrong token
		Token required
		Unloaded graph
**/


const Draw = function(id,containerID){
	this.destroy = function(){
		externalInterface.destroy({
			containerID: containerID
		});
	}
}

const externalInterface = new function(){

	/**
		Sets the credentials ( APIKey, Token, context )
		Works only once per instance.
	**/
	this.connect = function(args){
		var publicKey = argsParser(args,'publicKey',null);
		if(publicKey === null){
			console.error(companyName,".connect: argument publicKey key is required");
			return;
		}
		APPManager.setCredentials('graph','publicKey',publicKey);
	}

	/**
		Always loads graph meta data + datasets into memory
		Renders the graph if a DOM element is provided - If the graph is already rendered it will remove it and rerender it
	**/
	this.load = function(graphs){
		if(!Array.isArray(graphs)){
			graphs = [graphs]
		}
		for(var cursor in graphs){
			var graph = graphs[cursor];
			graph.id = graph.graphID;
			delete graph.graphID;
			var token = argsParser(graph,'token',null);
			graph.tokens = [];
			graph.utcOffset = getLocalUTCOffset();
			if(token !== null){
				graph.tokens.push(token);
				delete graph.token
			}
		}
		APPManager.load('graph','build',graphs);
	}

	this.set = function(graphs){
		APPManager.set('graph',graphs);
	}

	/* is loaded */
	this.isLoaded = function(args){
		var id = argsParser(args,'graphID',null);
		var item = APPManager.get('graph',id);
		if(item === null){return false;}
		return true;
	}

	/** draw graphs **/
	this.draw = function(args){
		var graphID = argsParser(args,'graphID',null),
		containerID = argsParser(args,'containerID',null),
		limits = argsParser(args,'limits',[]),
		animation = argsParser(args,'animation',{});

		var drawing = {};
		drawing.id = containerID;
		drawing.graphID = graphID;
		drawing.limits = limits;
		drawing.animation = animation;

		APPManager.remove('drawing',drawing.id)

		APPManager.set('drawing',[drawing]);
		return new Draw(graphID,containerID);
	}

	/* Remove graph */
	this.destroy = function(args){
		var containerID = argsParser(args,'containerID',null);
		APPManager.remove('drawing',containerID);
	}

	/** Gets the data associated with a graph along with meta data **/
	this.get = function(graphID = null){
		if(graphID == null){return null;}
		var graph = APPManager.data.get('graph',graphID);
		if(graph == null){return null};
		return argsParser(graph,'datasets',[])
	}


	/** Query dataset **/
	this.query = function(){
		var dates = {};
		var conditions = {};
		var token = {};
	}

}

window[companyName] = externalInterface;

































