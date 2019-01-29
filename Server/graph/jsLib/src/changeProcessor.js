import APPManager from './APPManager.js';
import ChartJSWrapper from './ChartJSWrapper.js';
import {companyName} from './settings.js';
import ToolBar from './toolBar.js';
import Loading from './loading.js';
import {argsParser,removeChildren,setLabelDates} from './common.js';
import moment from 'moment';

var initializedGraphs = {};

const Graph = function(){
	var toolBar = null;
	var loading = null;
	var chartJSWrapper = null;
	var graphID = null;
	var version = null;
	const render = function(drawing,graphInfo,DOMElement){
		toolBar = new ToolBar();
		toolBar.render(graphInfo,DOMElement);
		chartJSWrapper = new ChartJSWrapper();
		chartJSWrapper.render(drawing,graphInfo,DOMElement);
		graphID = graphInfo.id;
		version = graphInfo.version;
	}
	this.update = function(drawing,graphInfo,DOMElement){
		DOMElement.style.position = 'relative';
		if( argsParser(graphInfo,'ready',false) === true){
			setLabelDates(graphInfo);
			if(graphID != graphInfo.id){
				this.destroy(DOMElement);
				render(drawing,graphInfo,DOMElement);
			}
			else if(version != graphInfo.version ){
				toolBar.update(graphInfo,DOMElement);
				chartJSWrapper.update(drawing,graphInfo,DOMElement);
				version = graphInfo.version;
			}
		}
		if(loading === null){
			loading = new Loading();
			DOMElement.appendChild(loading.DOMElement());
		}
		loading.update(graphInfo,DOMElement);
	}
	this.destroy = function(DOMElement){
		if(toolBar !== null){toolBar.destroy(DOMElement);}
		if(chartJSWrapper !== null){chartJSWrapper.destroy(DOMElement);}
		removeChildren(DOMElement);
		DOMElement.style.position = '';
		toolBar = null;
		loading = null;
		chartJSWrapper = null;
		graphID = null;
		version = null;
	}
}

function processChanges(){
	var graphs = APPManager.get('graph'); //.... get graphs
	var drawings = APPManager.get('drawing');; //... get drawings

	//Render/update elements that exist
	for(var DOMElementID in drawings){
		var drawing = drawings[DOMElementID];
		var graphInfo = graphs[drawing.graphID];

		/* Check if the DOM element exists. Delete the graph object if it not */
		var DOMElement = document.getElementById(DOMElementID);
		if(DOMElement === null){
			delete initializedGraphs[DOMElementID];
			continue;
		}

		/* initialize the Graph if it is not initialized */
		if(typeof initializedGraphs[DOMElementID] == 'undefined'){
			initializedGraphs[DOMElementID] = new Graph();
		}

		/* Apply changes */
		initializedGraphs[DOMElementID].update(drawing,graphInfo,DOMElement)
	}

	/* Distroy elements that are initialized but their DOM elements are missing  */
	for(var DOMElementID in initializedGraphs){
		if(typeof drawings[DOMElementID] == 'undefined'){
			var DOMElement = document.getElementById(DOMElementID);
			if(DOMElement !== null){
				var graph = initializedGraphs[DOMElementID];
				graph.destroy(DOMElement);
			}
			delete initializedGraphs[DOMElementID];
		}
	}
}

export default processChanges;




































































