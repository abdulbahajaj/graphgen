import {argsParser,removeChildren,getIncrementDateFormat,numberWithCommas,capitalizeFirstLetter} from './common.js';
import {companyName} from './settings.js'
import moment from 'moment';
import { extendMoment } from 'moment-range';
import Chart from '../node_modules/chart.js/dist/Chart.bundle.min.js';

const GraphExtension_Draw = function(ease,thisHolder){
	var ctx = thisHolder.chart.ctx;
	for(var cursor in thisHolder.chart.data.datasets){
		var dataset = thisHolder.chart.data.datasets[cursor];
		if( dataset.limitSet == true ){
			if(typeof dataset.name == 'undefined'){continue;}
			var points = thisHolder.chart.getDatasetMeta(cursor).data;
			var positionY = points[points.length - 1]._model.y;
			var positionX = thisHolder.chart.chartArea.left;
			var color = dataset.nameColor;
			var fontSize = dataset.nameFontSize;
			ctx.font= fontSize + "px Arial";
			ctx.fillStyle = color;
			ctx.fillText(dataset.name, positionX + 25, positionY + dataset.nameFontSize + dataset.borderWidth);
		}
	}
	if(thisHolder.chart.tooltip._active && thisHolder.chart.tooltip._active.length){

		var activePoint = thisHolder.chart.tooltip._active[0],
		x = activePoint.tooltipPosition().x,
		topY = thisHolder.chart.scales['y-axis-0'].top,
		bottomY = thisHolder.chart.scales['y-axis-0'].bottom;

		var crossHairSettings = thisHolder.chart.config.options.crossHair;

		if(typeof crossHairSettings.display != 'undefined'){				
			if(crossHairSettings.display===true){
				var color = crossHairSettings.color;
				if(typeof color == 'undefined'){color = '#439a9a'}
				ctx.save();
				ctx.lineCap="round";
				ctx.beginPath();
				ctx.moveTo(x + 0.5, topY);
				ctx.lineTo(x + 0.5, bottomY);
				ctx.lineWidth = crossHairSettings.width;
				ctx.strokeStyle = color;
				ctx.stroke();
				ctx.restore();
			}
		}
	}
}

Chart.defaults[companyName + '_lineChart'] = Chart.defaults.line;
Chart.controllers[companyName + '_lineChart'] = Chart.controllers.line.extend({
	draw: function(ease){
		Chart.controllers.line.prototype.draw.call(this, ease);
		GraphExtension_Draw(ease,this);
	}
});

Chart.defaults[companyName + '_barChart'] = Chart.defaults.bar;
Chart.controllers[companyName + '_barChart'] = Chart.controllers.bar.extend({
	draw: function(ease){
		Chart.controllers.bar.prototype.draw.call(this, ease);
		GraphExtension_Draw(ease,this);
	}
});

const buildDatasets = function(drawing,graphInfo){
	var resultDatasets = [];
	var dataSettings = JSON.stringify(graphInfo.data)
	for(var cursor in graphInfo.datasets.data){
		var graphSet = graphInfo.datasets.data[cursor];
		var resultSet = JSON.parse(dataSettings);
		resultSet.borderDash = [resultSet.borderDash, resultSet.borderDash];
		resultSet.label = graphSet.group
		resultSet.data = graphSet.timeSeries
		resultSet.borderColor = graphSet.color;
		resultSet.backgroundColor = graphSet.color;

		if(graphInfo.data.pointStyle == 'hollowCircle'){
			resultSet.pointBackgroundColor = graphInfo.data.pointBackgroundColor;
		}else{
			resultSet.pointBackgroundColor = graphSet.color;
		}

		resultSet.pointHoverBorderWidth = graphInfo.data.pointHoverBorderWidth;
		resultSet.hoverBackgroundColor = graphSet.color;
		resultSet.hoverBorderColor = graphSet.color;
		resultSet.date = graphInfo.datasets.labels[cursor];
		resultDatasets.push(resultSet);
	}
	var increment = graphInfo.datasets.selection.increment;
	var allowedLimits = argsParser(drawing,'limits',[]);
	if(resultDatasets.length > 0){
		for(var cursor2 in graphInfo.limits){
			var limit = graphInfo.limits[cursor2];
			if(limit.increment != increment){continue;}
			if(allowedLimits.length > 0 && allowedLimits.indexOf(limit.limitID) == -1){
				continue;
			}

			var limitSet = {};
			limitSet.name = limit.name;
			limitSet.fill = false;
			limitSet.data = [];
			limitSet.pointBorderWidth = 0;
			limitSet.borderColor = limit.lineColor
			limitSet.borderWidth = limit.lineHeight;
			limitSet.pointRadius = 0;
			limitSet.pointHitRadius = 0;
			limitSet.pointHoverRadius = 0;
			limitSet.limitSet = true;
			limitSet.nameColor = limit.nameColor;
			limitSet.nameFontSize = limit.fontSize;
			limitSet.type='line';

			var diff = limit.limit * 0.1;

			var marginLines = [{},{}];
			for(var cursor in marginLines){
				marginLines[cursor].type = 'line';
				marginLines[cursor].label = '$empty$Line$';
				marginLines[cursor].data = [];
				marginLines[cursor].borderColor = 'transparent';
				marginLines[cursor].borderWidth = 0;
				marginLines[cursor].pointRadius = 0;
				marginLines[cursor].pointHitRadius = 0;
				marginLines[cursor].pointHoverRadius = 0;
				marginLines[cursor].fill = false;
			}
			for(var cursor=0; cursor < resultDatasets[0].data.length; cursor++){
				limitSet.data.push(limit.limit);
				marginLines[0].data.push(limit.limit + diff);
				marginLines[1].data.push(limit.limit - diff);
			}

			resultDatasets.push(limitSet);
			resultDatasets.push(marginLines[0]);
			resultDatasets.push(marginLines[1]);
		}
	}
	return resultDatasets
}

const buildData = function(drawing,graphInfo){
	var response = {};
	var selection = graphInfo.datasets.selection;
	var increment = selection.increment;
	var format = null;
	switch(increment){
		case 'year':
			format = "YYYY";
			break;
		case 'month':
			format = "YYYY MMM"
			break;
		case 'day':
			format = "MMM D";
			break;
		case 'hour':
			format = "ddd ha"
			break;
	}
	response.labels =  [];//IncrementDate.getLabels(graphInfo);
	for(var cursor in graphInfo.datasets.labels){
		var label = graphInfo.datasets.labels[cursor];
		var relativeLabel = null;

		/* is now for hours match */
		if(moment().startOf('hour').clone().isSame(label.clone().startOf('hour'))){
			relativeLabel = 'Now';
		}
		/* Is today */
		else if(moment().startOf('day').clone().isSame(label.clone().startOf('day'))){
			relativeLabel = 'Today';
		}
		/* Is yesterday */
		else if(moment().subtract(1,'day').clone().startOf('day').isSame(label.clone().startOf('day'))){
			relativeLabel = 'Yesterday';
		}

		if(relativeLabel != null){
			if(increment == 'hour'){
				if(relativeLabel == 'Now'){
					response.labels.push(relativeLabel)
					continue;
				}
				response.labels.push(relativeLabel + " " + label.format("ha"));
				continue;
			}
			else if(increment == 'day'){
				response.labels.push(relativeLabel);
				continue;
			}
		}


		response.labels.push(label.format(format));
	}
	response.datasets = buildDatasets(drawing,graphInfo); //[{data: [1,2,3,4,5,6,7,7,8,9,0]}]//buildDatasets(graphInfo)
	return response;
}

const buildToolipWrapper = function(prefix,postfix,graphInfo){
	var tooltipsSettings = graphInfo.tooltips;
	var datasets = graphInfo.datasets.data;
	var selection = graphInfo.datasets.selection;
	var increment = selection.increment;
	var format = getIncrementDateFormat(increment)
	const buildToolip = function(tooltipModel) {
		function getToolipEl(canvas){
			var parent = canvas.parentNode;
			for(var cursor in parent.children){
				var child = parent.children[cursor];
				try{
					if(child.getAttribute('name') == 'tooltip'){
						return child;
					}
				}catch(err){}
			}

	        var tooltipEl = document.createElement('div');
	        tooltipEl.setAttribute('name','tooltip');
	        parent.appendChild(tooltipEl);	    

	    	tooltipEl.style.whiteSpace = "nowrap";
			tooltipEl.style.width = "auto";
		    tooltipEl.style.top =  0 + "px";
		    tooltipEl.style.opacity = 1;
		    tooltipEl.style.pointerEvents = 'none'
		    tooltipEl.style.position = 'absolute';
		    tooltipEl.style.zIndex = 2147483647;
		    tooltipEl.style.padding = tooltipsSettings.yPadding + 'px ' + tooltipsSettings.xPadding + 'px';
	        tooltipEl.style.backgroundColor = tooltipsSettings.backgroundColor;
	        tooltipEl.style.borderRadius = tooltipsSettings.radius + "px";
	        tooltipEl.style.borderRadius = tooltipsSettings.radius + "px";
	        tooltipEl.style.fontFamily = 'Arial, Helvetica, sans-serif';
	        if(tooltipsSettings.shadowBoxEnabled){
		        tooltipEl.style.boxShadow = "0px 0px 2px " + tooltipsSettings.boxShadowColor;
	        }
		    tooltipEl.style.fontSize = tooltipsSettings.bodyFontSize + "px";
		    tooltipEl.style.border = tooltipsSettings.borderWidth+"px solid" + tooltipsSettings.borderColor;
		    return tooltipEl;
		}
	    function getDatasetRepresentation(bodyItem,index) {
	    	if(index >= datasets.length){return document.createElement("span")}

	    	var wrapper = document.createElement('div');

	    	var colorBox = null;

	    	if(tooltipsSettings.displayColors){
			    var color = tooltipModel.labelColors[index].borderColor;
		    	colorBox = document.createElement('div');
		    	colorBox.style.backgroundColor = color;
	            colorBox.style.width=tooltipsSettings.groupColorSize + "px";
	            colorBox.style.height= tooltipsSettings.groupColorSize + "px";
	            colorBox.style.display="inline-block";
	            colorBox.style.borderRadius = tooltipsSettings.groupColorRadius + "px";
	            colorBox.style.marginRight = "5px";
	            colorBox.style.borderStyle = "solid";
	            colorBox.style.borderWidth = tooltipsSettings.groupColorBorderWidth + "px";
	            colorBox.style.borderColor = tooltipsSettings.groupColorBorderColor;
	            colorBox.style.float='left';
	            colorBox.style.position = 'relative';
		    	wrapper.appendChild(colorBox);	    	
				var height = tooltipsSettings.groupColorSize + tooltipsSettings.groupColorBorderWidth;
	    	}
	    	var value = tooltipModel.dataPoints[index].yLabel;
	    	value = numberWithCommas(value);
	    	if(typeof prefix != undefined && prefix != null){
	    		value = prefix + value;
	    	}
	    	if(typeof postfix != undefined && postfix != null){
	    		value = value + postfix;
	    	}

	    	var text = datasets[index].group;
	    	var textWrapper = null;
	    	if(text != null && typeof text != 'undefined'){
	    		text = capitalizeFirstLetter(text);
	    		textWrapper = document.createElement('div');
	    		textWrapper.appendChild(document.createTextNode(text + " :"));
	    		textWrapper.style.color = tooltipsSettings.textColor;
	    		textWrapper.style.float="left";
	    		wrapper.appendChild(textWrapper);
	            textWrapper.style.position = 'relative';
	            textWrapper.style.top='1px';
	            textWrapper.style.display = 'inline-block';
	            textWrapper.style.marginRight = "5px";
	    	}

			var valueWrapper = document.createElement('div');
			valueWrapper.appendChild(document.createTextNode(value));
			valueWrapper.style.color = tooltipsSettings.valueColor;
			valueWrapper.style.float="left";
			valueWrapper.style.fontWeight = 'bold';
			valueWrapper.style.position = 'relative';
			valueWrapper.style.top='1px';
			valueWrapper.style.display = 'inline-block';			
    		wrapper.appendChild(valueWrapper);

	    	wrapper.style.overflow="auto";
	    	wrapper.style.paddingTop = "1px";	    	
	    	wrapper.style.paddingBottom = "1px";
	    	wrapper.style.height = "auto";
			wrapper.style.fontFamily = "Arial, Helvetica, sans-serif";

			if( colorBox !== null){
    			var valueWrapperStyle = getComputedStyle(valueWrapper);
	    		var colorBoxStyle = getComputedStyle(colorBox);
	    		var textHeight = parseFloat(tooltipsSettings.bodyFontSize);
	    		var colorBoxHeight = parseFloat(tooltipsSettings.groupColorBorderWidth);
	    		colorBoxHeight += parseFloat(tooltipsSettings.groupColorSize);

	    		if(textHeight > colorBoxHeight){
	    			colorBox.style.top = ((textHeight - colorBoxHeight) / 2)  + "px";
	    		}else{
	    			valueWrapper.style.top = ((colorBoxHeight - textHeight)/ 2) + "px";
	    		}
			}
	    	return wrapper;
	    }
	    var chartCanvas = this._chart.canvas
		var tooltipEl = getToolipEl(chartCanvas);
	    if (tooltipModel.opacity === 0) {
	    	tooltipEl.style.display = "none";
	        return;
	    }else{
			tooltipEl.style.display = 'inline-block'
	    }
	    if (tooltipModel.body) {
			while (tooltipEl.hasChildNodes()) {
			    tooltipEl.removeChild(tooltipEl.lastChild);
			}
			var titleText = null
			var dataPoints = tooltipModel.dataPoints;
			if(dataPoints.length > 0){
				var index = dataPoints[0].index;
				var date = graphInfo.datasets.labels[index];
				if(typeof date != 'undefined'){
					titleText = graphInfo.datasets.labels[index].format(format);
				}
			}
			if(titleText == null){
		        var titleLines = tooltipModel.title || [];
		        titleLines.forEach(function(item) {
		            titleText += item;
		        });
			}

		    var title = document.createElement('div');
		    title.appendChild(document.createTextNode(titleText));
            title.style.fontWeight='bold';
            title.style.marginBottom='5px';
            title.style.fontSize = tooltipsSettings.titleFontSize + "px";
            title.style.color = tooltipsSettings.titleColor
		   	tooltipEl.appendChild(title);
		   	tooltipModel.body.map(getDatasetRepresentation).forEach(function(el){
   		    	el.style.whiteSpace = "nowrap";
   		    	el.style.clear = "both";
				el.style.overflow = "none"
			   	tooltipEl.appendChild(el);
			   	var elWidth = 0;
			   	for(var cursor in el.children){
			   		try{ 
			   			var child = el.children[cursor];
			   			var width = child.offsetWidth;
			   			if(typeof width == 'number'){
				   			elWidth += width;
				   		}
			   		}catch(err){}
			   	}
			   	el.style.width = elWidth + 20 + "px";
		   	});
	    }
	    
	    var positionX = tooltipModel.caretX;
		var canvasComputedStyle = getComputedStyle(chartCanvas);
		var containerWidth = parseFloat(canvasComputedStyle.width);
		containerWidth += parseFloat(canvasComputedStyle.paddingRight);
		containerWidth += parseFloat(canvasComputedStyle.paddingLeft);
		containerWidth += parseFloat(canvasComputedStyle.borderLeftWidth);
		containerWidth += parseFloat(canvasComputedStyle.borderRightWidth);

		var toolTipComputedStyle = getComputedStyle(tooltipEl);    // works
		var tooltipWidth = parseFloat(toolTipComputedStyle.width); // works
		tooltipWidth += parseFloat(toolTipComputedStyle.paddingRight);
		tooltipWidth += parseFloat(toolTipComputedStyle.paddingLeft);
		tooltipWidth += parseFloat(toolTipComputedStyle.borderLeftWidth);
		tooltipWidth += parseFloat(toolTipComputedStyle.borderRightWidth);
		var rightCornerPosition = tooltipWidth + positionX;
		var diff = containerWidth - rightCornerPosition;

		if(diff < 5){
	        tooltipEl.style.setProperty('-webkit-transform','translate(-100%,0)');
	        tooltipEl.style.setProperty('-ms-transform','translate(-100%,0)');
			tooltipEl.style.transform = "translate(-100%,0)";
		    positionX -= 10;
		} else {
		    positionX += 10;
	        tooltipEl.style.setProperty('-webkit-transform','translate(0,0)');
	        tooltipEl.style.setProperty('-ms-transform','translate(0,0)');
			tooltipEl.style.transform = "translate(0,0)";
		}
	    tooltipEl.style.left =  positionX + 'px';
	}
	return buildToolip;
}

const buildOptions = function(drawing,graphInfo){

	var selection = graphInfo.datasets.selection;
	var increment = selection.increment;
	var start = increment.start;
	var end = increment.end;
	var options = {};

	var animation = argsParser(drawing,'animation',{});
	var enableAnimation = argsParser(animation,'enable',true);
	if(enableAnimation === false){
		options.animation = false;
	}

	options.crossHair = graphInfo.crossHair;
	options.legend = {display: false};
	options.maintainAspectRatio = false;
	options.responsive = true;

    options.tooltips = {};
    options.tooltips.enabled = false;
    if(graphInfo.tooltips.enabled){
		options.tooltips.custom = buildToolipWrapper(
			graphInfo.grid.prefix,
			graphInfo.grid.postfix,
			graphInfo);
    }
	options.tooltips.mode = 'index';
	options.tooltips.intersect = false;

	options.hover = {};
	options.hover.mode = 'index';
	options.hover.intersect = false;

	options.grid = graphInfo.grid
	options.grid.color="red"
	options.grid.zeroLineWidth=0;
	options.showTooltips = true;
	options.limits = graphInfo.limits;


	var layout = {};
	layout.padding = {
		left: 0,
		right: 0,
		top: 10,
		bottom: 0,
	};
	options.layout = layout;

	options.scales = {};

	options.scales.xAxes = [{
        stacked: false,
		id: 'x-axis',
		gridLines: {
			display: graphInfo.grid.xDisplay,
			color: graphInfo.grid.xColor,
			lineWidth: graphInfo.grid.xLineWidth,
			offsetGridLines: false,
			drawBorder: false,
			drawOnChartArea: true,
		}, 
		ticks: {
			display: graphInfo.grid.displayXLabels,
			beginAtZero: true,
			maxTicksLimit: graphInfo.data.xMaxTicksLimit-1, // Number of ticks
			fontSize: graphInfo.data.labelFontSize,
			fontColor: graphInfo.data.labelColor,
			maxRotation: graphInfo.data.xLabelRotation,
			minRotation: graphInfo.data.xLabelRotation,
		}, 
	}];
	options.scales.yAxes = [{
        stacked: false,
        scaleShowGridLines: true,
		gridLines: {
			beginAtZero: true,
			color: graphInfo.grid.yColor,
			lineWidth: graphInfo.grid.yLineWidth,
			display: graphInfo.grid.yDisplay,
			drawBorder: false,
			zeroLineWidth: graphInfo.grid.yLineWidth,
			zeroLineColor: graphInfo.grid.yColor,//graphInfo.grid.yColor,
		}, 
		ticks: {
			display: graphInfo.grid.displayYLabels,
			autoSkip: true,
			fontSize: graphInfo.data.labelFontSize,
			autoSkipPadding: 10,
			maxTicksLimit: 6,
			fontColor: graphInfo.data.labelColor,
            callback: function(value, index, values){
            	if(value > 1 || value < -1){
	            	var checks = [{factor: 1, unit: ""},{factor: 1000, unit: 'K'},{factor:1000000,unit: 'M'}];
	            	var unit = ""
	            	var unitValue = 0;
	            	for(var cursor in checks){
	            		var check = checks[cursor];
	            		var checkVal = value / check.factor; 
	            		if(parseInt(checkVal) > 0){
	            			unitValue = checkVal;
	            			unit = check.unit;
	            		}
	            	}
	            	unitValue = parseInt(unitValue * 100 ) / 100;
	            	value = unitValue + unit;
	            }
		    	if(typeof graphInfo.grid.prefix != undefined && graphInfo.grid.prefix != null){
		    		value = graphInfo.grid.prefix + value;
		    	}
		    	if(typeof graphInfo.grid.postfix != undefined && graphInfo.grid.postfix != null){
		    		value = value + graphInfo.grid.postfix;
		    	}
				return value;
			}
		},
	}];

	return options;
}

const ChartJSWrapper = function(){
	var chartJSObject = null;
	this.render = function(drawing,graphInfo,DOMElement){
		var graph = document.createElement('div');
		graph.style.position = "relative";
		var canvas = document.createElement('canvas');
		var computedStyle = getComputedStyle(DOMElement);
		var height = parseFloat(computedStyle.height);
		if(graphInfo.rangeSelector.enable === true || graphInfo.incrementSelector.enable === true || graphInfo.exportData.enable == true){
			height -= 40;
		}
		graph.style.height = height + "px";//height + "px";
		graph.appendChild(canvas);
		graph.setAttribute('name','graphWrapper');
		DOMElement.appendChild(graph);
		var graphType = graphInfo.type;
		if( graphInfo.type == 'line' ){
			graphType = companyName + '_lineChart';
		}else if( graphInfo.type == 'bar'){
			graphType = companyName + '_barChart';
		}
		var data = buildData(drawing,graphInfo);
		var options = buildOptions(drawing,graphInfo);
		chartJSObject = new Chart(canvas, {
			type: graphType,
			data: data,
			options: options,
		});
	}
	this.update = function(drawing,graphInfo){
		chartJSObject.config.data = buildData(drawing,graphInfo);
		chartJSObject.options = buildOptions(drawing,graphInfo);
		chartJSObject.update();
	}
	this.destroy = function(DOMElement){
		chartJSObject.destroy();
		removeChildren(DOMElement,{name: 'graphWrapper'});
	}
}

export default ChartJSWrapper;















































