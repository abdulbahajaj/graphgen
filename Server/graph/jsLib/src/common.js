import {companyName} from './settings.js';
import moment from 'moment';
var momentDurationFormatSetup = require("moment-duration-format");
momentDurationFormatSetup(moment);

function getLocalUTCOffset(){
	var minutes = moment().utcOffset();
	var duration = moment.duration(minutes, 'minute');
	var formatted = duration.format("hhmm");
	return formatted;
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

const argsParser = function(args,name,fallBack=null){
	try{
		var result = args[name];
	}catch(err){return fallBack;}
	if(typeof result == 'undefined'){
		return fallBack;
	}
	return result;
}

const createElement = function(args){
	var tag = argsParser(args,'tag','div'),
		style = argsParser(args,'style',{}),
		attrs = argsParser(args,'attrs',{});

	var tagElement = document.createElement(tag);

	for(var key in style){
		tagElement.style[key] = style[key];
	}

	for( var key in attrs){
		tagElement.setAttribute(key,attrs[key]);
	}

	return tagElement;
}

const appendCSS = function(args){
	var style = argsParser(args,'style',null);
	const getStyleElement = function(){
		for(var cursor = 0; true; cursor++){
			var tagID = companyName + "-style";
			if(cursor > 0 ){tagID += "_" + cursor;}
			var styleTag = document.getElementById(tagID);
			if(Array.isArray(styleTag)){
				if(styleTag.length == 0) continue;
				styleTag = styleTag[0];
			}
			if(styleTag == null){
				styleTag = document.createElement('style');
				styleTag.id = tagID;
				styleTag.type='text/css';
				var head = document.getElementsByTagName('head')[0];
				head.appendChild(styleTag);
				return styleTag
			}
			if(styleTag.tagName == 'STYLE'){
				return styleTag;
			}
		}
	}

	var styleElement = getStyleElement();
	styleElement.appendChild(document.createTextNode(style));
}

const getChild = function(node,attrs){
	if(node === null){return null;}
	for(var cursor in node.children){
		var child = node.children[cursor];
		var found = true;
		try{
			for(var key in attrs){
				if(child.getAttribute(key) != attrs[key]){
					found = false;
					break;
				}else{break;}
			}
			if(found === true){
				return child;
			}
		}catch(err){}
	}
	return null;
}

const removeChildren = function(node,attrs = null){
	if(attrs == null){
		while (node.firstChild) {
			node.removeChild(node.firstChild);
		}
	}else{
		var child = null;
		while((child = getChild(node,attrs)) !== null){
			node.removeChild(child);
		}
	}
	return true;
}

const getIncrementDateFormat = function(increment){
	var format = "YYYY"
	switch(increment){
		case "month":
			format = "YYYY MMMM"
			break;
		case "day":
			format = "YYYY MMMM D"
			break;
		case "hour":
			format = "YYYY MMMM D - ha"
			break;
	}
	return format;
}


const numberWithCommas = (x) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const setLabelDates = function(graphInfo){
	var selection = graphInfo.datasets.selection;
	var increment = selection.increment;
	var localOffset = moment().utcOffset();
	var start = moment(selection.start).utcOffset(localOffset);
	var end = moment(selection.end).utcOffset(localOffset);

	var data = graphInfo.datasets.data;
	graphInfo.datasets.labels = [];
	if(data.length == 0) return;
	var dataset = data[0].timeSeries;
	for(var cursor = 0; cursor < dataset.length; cursor++){
		graphInfo.datasets.labels.push(start.clone().add(cursor,increment));
	}
	// for(var cursor = 0; cursor < graphInfo.datasets.labels.length; cursor++){
	// 	console.log(graphInfo.datasets.labels[cursor].format("YYYY MM DD"))
	// }
}



export {
	setLabelDates,
	getLocalUTCOffset,
	argsParser,
	createElement,
	appendCSS,
	capitalizeFirstLetter,
	removeChildren,
	getChild,
	getIncrementDateFormat,
	numberWithCommas
};




























