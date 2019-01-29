import {createElement,getLocalUTCOffset,appendCSS,capitalizeFirstLetter,removeChildren,argsParser,getChild,getIncrementDateFormat} from './common.js';
import {companyName} from './settings.js';
import APPManager from './APPManager.js';
import moment from 'moment'
import daterangepicker from "daterangepicker"
import $ from "jquery";

function setUTCOffset(isoString){
	var date = moment(isoString);
	date = date.utcOffset(0);
	return date.toISOString();
}

const query = function(args){
	var start = argsParser(args,'start',null),
	end = argsParser(args,'end',null),
	increment = argsParser(args,'increment',null);
	if(start !== null){
		start = setUTCOffset(start);
	}
	if(end !== null){
		end = setUTCOffset(end);
	}
	var graphs = APPManager.get('graph');
	var toUpdate = [];
	
	var utcOffset = getLocalUTCOffset();

	for(var cursor in graphs){
		var graph = graphs[cursor];
		if(typeof graph.datasets == 'undefined'){continue;}
		if(start == null){
			start = graph.datasets.selection.start;
		}
		if(end == null){
			end = graph.datasets.selection.end;
		}
		if(increment == null){
			increment = graph.datasets.selection.increment;
		}
		var updateQuery = {id: graph.id,start: start,end: end,increment: increment};
		var graphConditions = argsParser(graph,'conditions',[]);
		updateQuery.conditions = graphConditions;
		updateQuery.tokens = [];
		var graphToken = argsParser(graph,'token',null);
		if(graphToken !== null){
			updateQuery.tokens.push(graphToken);
		}
		// if(globalToken !== null){
		// 	updateQuery.tokens.push(globalToken);
		// }
		updateQuery['utcOffset'] = utcOffset;
		toUpdate.push(updateQuery)
	}
	APPManager.load('graph','query',toUpdate);
}

const meta = {
	height: "30px",width: "100%",
	incrementButtonClassName: companyName + "-ToolBar-IncrementButton",
	borderColor: "#c7ced5",
	exporterClassName: companyName + '-ToolBar-Exporter'
}

appendCSS({style: `.${meta.exporterClassName}:hover,.${meta.incrementButtonClassName}[selected=false]:hover{text-decoration: underline;}#UsageGraph-dateSelectorWrapper .daterangepicker{position:absolute;color:inherit;background-color:#fff;border-radius:2px;width:278px;max-width:none;padding:0;margin-top:7px;top:100px;left:20px;z-index:3001;display:none;font-family:arial;font-size:15px;line-height:1em;border:1px solid #dedce0}#UsageGraph-dateSelectorWrapper .daterangepicker .table-condensed{color:#95a5a6}#UsageGraph-dateSelectorWrapper .daterangepicker:after,#UsageGraph-dateSelectorWrapper .daterangepicker:before{position:absolute;display:inline-block;content:''}#UsageGraph-dateSelectorWrapper .daterangepicker:before{top:-7px;border-right:7px solid transparent;border-left:7px solid transparent;border-bottom:7px solid #c5cacd}#UsageGraph-dateSelectorWrapper .daterangepicker:after{top:-6px;border-right:6px solid transparent;border-bottom:6px solid #c5cacd;border-left:6px solid transparent}#UsageGraph-dateSelectorWrapper .daterangepicker.opensleft:before{right:9px}#UsageGraph-dateSelectorWrapper .daterangepicker.opensleft:after{right:10px}#UsageGraph-dateSelectorWrapper .daterangepicker.openscenter:after,#UsageGraph-dateSelectorWrapper .daterangepicker.openscenter:before{left:0;right:0;width:0;margin-left:auto;margin-right:auto}#UsageGraph-dateSelectorWrapper .daterangepicker.opensright:before{left:9px}#UsageGraph-dateSelectorWrapper .daterangepicker.opensright:after{left:10px}#UsageGraph-dateSelectorWrapper .daterangepicker.drop-up{margin-top:-7px}#UsageGraph-dateSelectorWrapper .daterangepicker.drop-up:before{top:initial;bottom:-7px;border-bottom:initial;border-top:7px solid #ccc}#UsageGraph-dateSelectorWrapper .daterangepicker.drop-up:after{top:initial;bottom:-6px;border-bottom:initial;border-top:6px solid #fff}#UsageGraph-dateSelectorWrapper .daterangepicker.single #UsageGraph-dateSelectorWrapper .daterangepicker .ranges,#UsageGraph-dateSelectorWrapper .daterangepicker.single .drp-calendar{float:none}#UsageGraph-dateSelectorWrapper .daterangepicker.single .drp-selected{display:none}#UsageGraph-dateSelectorWrapper .daterangepicker.show-calendar .drp-buttons,#UsageGraph-dateSelectorWrapper .daterangepicker.show-calendar .drp-calendar{display:block}#UsageGraph-dateSelectorWrapper .daterangepicker.auto-apply .drp-buttons{display:none}#UsageGraph-dateSelectorWrapper .daterangepicker .drp-calendar{display:none;max-width:270px;border:0}#UsageGraph-dateSelectorWrapper .daterangepicker .drp-calendar.left{padding:8px 0 8px 8px}#UsageGraph-dateSelectorWrapper .daterangepicker .drp-calendar.right{padding:8px}#UsageGraph-dateSelectorWrapper .daterangepicker .drp-calendar.single .calendar-table{border:none}#UsageGraph-dateSelectorWrapper .daterangepicker .calendar-table .next span,#UsageGraph-dateSelectorWrapper .daterangepicker .calendar-table .prev span{color:#fff;border:solid #95a5a6;border-width:0 1px 1px 0;border-radius:0;display:inline-block;padding:3px}#UsageGraph-dateSelectorWrapper .daterangepicker .calendar-table .next:hover span,#UsageGraph-dateSelectorWrapper .daterangepicker .calendar-table .prev:hover span{color:#fff;border:solid #fff;border-width:0 1px 1px 0;border-radius:0;display:inline-block;padding:3px}#UsageGraph-dateSelectorWrapper .daterangepicker .calendar-table .next span{transform:rotate(-45deg);-webkit-transform:rotate(-45deg)}#UsageGraph-dateSelectorWrapper .daterangepicker .calendar-table .prev span{transform:rotate(135deg);-webkit-transform:rotate(135deg)}#UsageGraph-dateSelectorWrapper .daterangepicker .calendar-table td,#UsageGraph-dateSelectorWrapper .daterangepicker .calendar-table th{text-align:center;vertical-align:middle;min-width:32px;width:32px;height:24px;line-height:24px;font-size:12px;border-radius:4px;border:1px solid transparent;white-space:nowrap}#UsageGraph-dateSelectorWrapper .daterangepicker .calendar-table{border:0 solid #fff;border-radius:4px;background-color:transparent}#UsageGraph-dateSelectorWrapper .daterangepicker .calendar-table table{width:100%;margin:0;border-spacing:0;border-collapse:collapse}#UsageGraph-dateSelectorWrapper .daterangepicker td.available:hover,#UsageGraph-dateSelectorWrapper .daterangepicker th.available:hover{background-color:#3498db;border-color:transparent;color:#fff}#UsageGraph-dateSelectorWrapper .daterangepicker td.week,#UsageGraph-dateSelectorWrapper .daterangepicker th.week{font-size:80%;color:#ccc}#UsageGraph-dateSelectorWrapper .daterangepicker td.off,#UsageGraph-dateSelectorWrapper .daterangepicker td.off.end-date,#UsageGraph-dateSelectorWrapper .daterangepicker td.off.in-range,#UsageGraph-dateSelectorWrapper .daterangepicker td.off.start-date{background-color:transparent;border-color:transparent;color:#bdc3c7}#UsageGraph-dateSelectorWrapper .daterangepicker td.in-range{background-color:#3498db;border-color:transparent;color:#fff;border-radius:0}#UsageGraph-dateSelectorWrapper .daterangepicker td.start-date{border-radius:5px 0 0 5px}#UsageGraph-dateSelectorWrapper .daterangepicker td.end-date{border-radius:0 5px 5px 0}#UsageGraph-dateSelectorWrapper .daterangepicker td.start-date.end-date{border-radius:5px}#UsageGraph-dateSelectorWrapper .daterangepicker td.active,#UsageGraph-dateSelectorWrapper .daterangepicker td.active:hover{background-color:#2980b9;border-color:transparent;color:#fff}#UsageGraph-dateSelectorWrapper .daterangepicker th.month{width:auto}#UsageGraph-dateSelectorWrapper .daterangepicker option.disabled,#UsageGraph-dateSelectorWrapper .daterangepicker td.disabled{color:#999;cursor:not-allowed;text-decoration:line-through}#UsageGraph-dateSelectorWrapper .daterangepicker select{background-color:transparent;border:none;-webkit-appearance:none;-moz-appearance:none;appearance:none;-ms-appearance:none;outline:0;text-align:right;cursor:pointer;overflow:hidden;color:#95a5a6;width:auto;display:inline-block}#UsageGraph-dateSelectorWrapper .daterangepicker select.monthselect,#UsageGraph-dateSelectorWrapper .daterangepicker select.yearselect{font-size:12px;padding:1px;height:auto;margin:0}#UsageGraph-dateSelectorWrapper .daterangepicker select.monthselect{margin-right:2%;width:auto}#UsageGraph-dateSelectorWrapper .daterangepicker select.yearselect{width:auto}#UsageGraph-dateSelectorWrapper .daterangepicker select.ampmselect,#UsageGraph-dateSelectorWrapper .daterangepicker select.hourselect,#UsageGraph-dateSelectorWrapper .daterangepicker select.minuteselect,#UsageGraph-dateSelectorWrapper .daterangepicker select.secondselect{width:auto;margin:0 auto;background:#eee;border:1px solid #eee;padding:2px;outline:0;font-size:12px}#UsageGraph-dateSelectorWrapper .daterangepicker .calendar-time{text-align:center;margin:4px auto 0;line-height:30px;position:relative}#UsageGraph-dateSelectorWrapper .daterangepicker .calendar-time select.disabled{color:#ccc;cursor:not-allowed}#UsageGraph-dateSelectorWrapper .daterangepicker .drp-buttons{clear:both;text-align:right;padding:8px;border-top:1px solid #5bbe67;display:none;line-height:12px;vertical-align:middle}#UsageGraph-dateSelectorWrapper .daterangepicker .drp-selected{display:inline-block;font-size:12px;padding-right:8px;color:#eb8660}#UsageGraph-dateSelectorWrapper .daterangepicker .drp-buttons .btn{margin-left:8px;font-size:12px;font-weight:700;padding:4px 8px}#UsageGraph-dateSelectorWrapper .daterangepicker .ranges{float:none;text-align:left;margin:0}#UsageGraph-dateSelectorWrapper .daterangepicker.show-calendar .ranges{margin-top:0}#UsageGraph-dateSelectorWrapper .daterangepicker .ranges ul{list-style:none;margin:0 auto;padding:0;width:100%}#UsageGraph-dateSelectorWrapper .daterangepicker .ranges li{font-size:12px;padding:8px 12px;cursor:pointer;margin:5px;border-radius:3px;color:#95a5a6;font-weight:700}#UsageGraph-dateSelectorWrapper .daterangepicker .ranges li.active,#UsageGraph-dateSelectorWrapper .daterangepicker .ranges li:hover{background-color:#3498db;color:#fff}@media (min-width:564px){#UsageGraph-dateSelectorWrapper .daterangepicker{width:auto}#UsageGraph-dateSelectorWrapper .daterangepicker .ranges ul{width:140px}#UsageGraph-dateSelectorWrapper .daterangepicker.single .ranges ul{width:100%}#UsageGraph-dateSelectorWrapper .daterangepicker.single .drp-calendar.left{clear:none}#UsageGraph-dateSelectorWrapper .daterangepicker.single.ltr .drp-calendar,#UsageGraph-dateSelectorWrapper .daterangepicker.single.ltr .ranges{float:left}#UsageGraph-dateSelectorWrapper .daterangepicker.single.rtl .drp-calendar,#UsageGraph-dateSelectorWrapper .daterangepicker.single.rtl .ranges{float:right}#UsageGraph-dateSelectorWrapper .daterangepicker.ltr{direction:ltr;text-align:left}#UsageGraph-dateSelectorWrapper .daterangepicker.ltr .drp-calendar.left{clear:left;margin-right:0}#UsageGraph-dateSelectorWrapper .daterangepicker.ltr .drp-calendar.left .calendar-table{border-right:none;border-top-right-radius:0;border-bottom-right-radius:0;padding-right:8px}#UsageGraph-dateSelectorWrapper .daterangepicker.ltr .drp-calendar.right{margin-left:0}#UsageGraph-dateSelectorWrapper .daterangepicker.ltr .drp-calendar.right .calendar-table{border-left:none;border-top-left-radius:0;border-bottom-left-radius:0}#UsageGraph-dateSelectorWrapper .daterangepicker.ltr .drp-calendar,#UsageGraph-dateSelectorWrapper .daterangepicker.ltr .ranges{float:left}#UsageGraph-dateSelectorWrapper .daterangepicker.rtl{direction:rtl;text-align:right}#UsageGraph-dateSelectorWrapper .daterangepicker.rtl .drp-calendar.left{clear:right;margin-left:0}#UsageGraph-dateSelectorWrapper .daterangepicker.rtl .drp-calendar.left .calendar-table{border-left:none;border-top-left-radius:0;border-bottom-left-radius:0;padding-left:12px}#UsageGraph-dateSelectorWrapper .daterangepicker.rtl .drp-calendar.right{margin-right:0}#UsageGraph-dateSelectorWrapper .daterangepicker.rtl .drp-calendar.right .calendar-table{border-right:none;border-top-right-radius:0;border-bottom-right-radius:0}#UsageGraph-dateSelectorWrapper .daterangepicker.rtl .drp-calendar,#UsageGraph-dateSelectorWrapper .daterangepicker.rtl .ranges{text-align:right;float:right}}@media (min-width:730px){#UsageGraph-dateSelectorWrapper .daterangepicker .ranges{width:auto}#UsageGraph-dateSelectorWrapper .daterangepicker.ltr .ranges{float:left}#UsageGraph-dateSelectorWrapper .daterangepicker.rtl .ranges{float:right}#UsageGraph-dateSelectorWrapper .daterangepicker .drp-calendar.left{clear:none!important}}#UsageGraph-dateSelectorWrapper .daterangepicker .drp-calendar .calendar-table table{border-collapse:separate;border-spacing:0 1px}`});

const IncrementButton = function(increment,incrementSelectorSettings){
	var cursor = "pointer";
	var button = createElement({tag: "div", style: {
			color: incrementSelectorSettings.color,
			height: meta.height,
			lineHeight: meta.height,
			backgroundColor: incrementSelectorSettings.backgroundColor,
			float: "left",
			textAlign: "center",
			fontSize: "12.25px",
			fontWeight: "normal",
			borderRight: "1px solid " + incrementSelectorSettings.borderColor,
			cursor: cursor,
			width: "57px",
			textAlign: "center"
		},
		attrs: {
			"class": meta.incrementButtonClassName,
		},
	});
	const build = function(name,selected=false){
		if(selected === true){
			button.style.color = incrementSelectorSettings.selectedColor;
			button.style.backgroundColor = incrementSelectorSettings.selectedBackground;
			button.style.cursor = "default";
		}
		button.setAttribute('selected',selected);
		button.appendChild(document.createTextNode(capitalizeFirstLetter(name)));
	}
	this.update = function(name,selected=false){
		build(name,selected);
	}	
	this.DOMElement = function(){
		return button;
	}
	const onclick = function(){
		query({increment: increment})
	}
	this.setOnClick = function(){
		if(button.getAttribute('selected') == 'true'){return;}
		button.onclick = onclick;
	}
}

const IncrementSelector = function(){
	var buttons = [];
	const selector = createElement({tag: "div",style:{
		marginLeft: "10px",
		marginRight: "5px",
		float: 'right',
		width: "auto",
		marginBottom: "4px",
	},attrs: {
		name: "incrementSelector"
	}});
	const build = function(graphInfo){
		var incrementSelectorSettings = graphInfo.incrementSelector;
		selector.style.color = incrementSelectorSettings.color;
		selector.style.backgroundColor = incrementSelectorSettings.backgroundColor;
		selector.style.border = incrementSelectorSettings.borderWidth + "px solid " + incrementSelectorSettings.borderColor;
		selector.style.borderRadius = incrementSelectorSettings.borderRadius + "px";

		removeChildren(selector);
		var selection = graphInfo.datasets.selection;
		var availableIncrements = selection.availableIncrements;
		var increment = selection.increment;
		var buttons = [];

		if(availableIncrements.length > 1){
			selector.style.display = 'block';
			if(availableIncrements.indexOf("year") != -1){
				var button = new IncrementButton('year',incrementSelectorSettings);
				button.update("yearly",increment == 'year');
				selector.appendChild(button.DOMElement());
				button.setOnClick();
			}
			if(availableIncrements.indexOf("month") != -1){
				var button = new IncrementButton('month',incrementSelectorSettings);
				button.update("monthly",increment == 'month');
				selector.appendChild(button.DOMElement());
				button.setOnClick();
			}
			if(availableIncrements.indexOf("day") != -1){
				var button = new IncrementButton('day',incrementSelectorSettings);
				button.update("daily",increment == 'day');
				selector.appendChild(button.DOMElement());
				button.setOnClick();
			}
			if(availableIncrements.indexOf("hour") != -1){
				var button = new IncrementButton('hour',incrementSelectorSettings);
				button.update("hourly",increment == 'hour');
				selector.appendChild(button.DOMElement());
				button.setOnClick();
			}

			var lastChild = selector.lastChild;
			lastChild.style.borderRight = "0px";
			lastChild.style.borderTopRightRadius = (incrementSelectorSettings.borderRadius - 1) + "px";
			lastChild.style.borderBottomRightRadius = (incrementSelectorSettings.borderRadius - 1) + "px";

			var firstChild = selector.firstChild;
			firstChild.style.borderTopLeftRadius = (incrementSelectorSettings.borderRadius - 1) + "px";
			firstChild.style.borderBottomLeftRadius = (incrementSelectorSettings.borderRadius - 1) + "px";

		}else{
			selector.style.display = 'none';
		}
		return selector
	}
	this.DOMElement = function(){
		return selector;
	}
	this.update = function(graphInfo){
		build(graphInfo);
	}
}

const DateSelector = function(){
	var selector = null;
	var dateSelectorInput = null;
	const getContainer = function(){
			var identifier = companyName + '-dateSelectorWrapper';
			var dateSelectorWrapper = document.getElementById(identifier);
			if(dateSelectorWrapper !== null ){
				return dateSelectorWrapper;
			}
	        var dateSelectorWrapper = createElement({
	        	tag: 'div',
	        	attrs: {id: identifier},
	        	style: {
	        		position: 'relative',
	        	}
	    	});
	        var container = createElement({
	        	tag: 'div',
	        	attrs: {id: 'customize-dateSelector'},
	        	style: {
	        		position: 'relative',
	        	}
	    	});
	        container.appendChild(dateSelectorWrapper);
	    	document.body.appendChild(container);
	    	return dateSelectorWrapper;
	}
	this.render = function(graphInfo,container){
		var selection = graphInfo.datasets.selection;
		var start = moment(selection.start);
		var end = moment(selection.end);
		var rangeSelectorSettings = graphInfo.rangeSelector;
		selector = createElement({
			tag: 'div',
			style: {
				color: rangeSelectorSettings.color,
				backgroundColor: rangeSelectorSettings.backgroundColor,
				borderRadius: rangeSelectorSettings.borderRadius + "px",
				border: rangeSelectorSettings.borderWidth + "px solid " + rangeSelectorSettings.borderColor,
				width: "auto",
				paddingLeft: '0px',
				height: meta.height,
				float: "left"
			}
		});
		var dateIcon = createElement({
			tag: 'div',
			style: {
				color: rangeSelectorSettings.color,
				float: 'left',
				height: '100%',
				width: "auto",
				paddingLeft: '7px',
				paddingRight: '5px',
				// borderRight: "1px solid " + rangeSelectorSettings.borderColor,
				textAlign: "center",
			},
		});
		var dateIconFont = createElement({
			tag: "i",
			style: {marginTop: "7px", display: "inline-block"},
			attrs: {'class': "fas fa-calendar-alt"}
		});
		dateIcon.appendChild(dateIconFont);
		dateSelectorInput = createElement({
			tag: 'input',
			style: {
				backgroundColor: rangeSelectorSettings.backgroundColor,
				color: rangeSelectorSettings.color,
				borderRadius: rangeSelectorSettings.borderRadius + "px",
				height: "27px",
				width: "185px",
				textAlign: "left",
				border: "0px",
				float: 'left',
				fontSize: "10px",
				outline: "none",
			},
		});
		var ranges = rangeSelectorSettings.DateRanges;
		var guiRanges = {};
		ranges.map(function(range){
			var start = moment();
			var end = moment(); 
			if(range.includeThis === false){
				start = start.subtract(1,range.unit);
				end = end.subtract(1,range.unit);
			}
			range.display -=1;
			start.subtract(range.display,range.unit);
			start.startOf(range.unit);
			end.endOf(range.unit);

			guiRanges[range.name]=[start,end]
		});

		var options = {};

		if(ranges.length > 0){
			options.ranges = guiRanges;
		}

		options.opens = 'right';
		options.startDate = start;
		options.endDate = end;
		options.showDropdowns = true;
		options.autoApply = true;
		options.maxDate = moment();
		options.parentEl = getContainer();
		options.locale = {format: 'YYYY/M/D hA'};

		//   ranges: {
		// 'Today': [moment().startOf('day'), moment()],
		// 'Yesterday': [moment().subtract(1, 'days').startOf('day'), moment().subtract(1, 'days').endOf('day')],
		// 'This month': [moment().startOf('month'), moment()],
		// 'This year': [moment().startOf('year'), moment()],
		//   },

		$(dateSelectorInput).daterangepicker(options,function(start, end, label){
			start = start.toISOString();
			end = end.toISOString();
			query({start: start,end: end})
		});
		selector.appendChild(dateIcon);
		selector.appendChild(dateSelectorInput);
	}
	this.DOMElement = function(){
		return selector;
	}
	this.destroy = function(){
		$(dateSelectorInput).data('daterangepicker').remove();
	}
}

const Exporter = function(){
	var exporter = createElement({
		tag:'a',
		style: {
			display: 'block',
			width: "65px",
			height: meta.height,
			lineHeight: meta.height,
			textDecoration: 'none',
			float: 'right',
			cursor: "pointer",
			textAlign: 'center',
			fontSize: '12.25px',
			borderStyle: 'solid',
			outline: "1px",
		},
		attrs:{
			'class': meta.exporterClassName
		}
	});
	var downLoadIcon = createElement({
		tag: 'i',
		attrs: {
			'class': 'fas fa-arrow-down',
		},
		style: {
			position: 'relative',
			top: "1px",
			marginRight: '4px',
			fontWeight: 'bold',
		}
	});
	exporter.appendChild(downLoadIcon);
	exporter.appendChild(document.createTextNode('Export'));
	var downloadLink = null;
	function convertArrayOfObjectsToCSV(args) {
		// var result, ctr, keys, columnDelimiter, lineDelimiter, data;

		// data = args.data || null;
		// if (data == null || !data.length) {
		// 	return null;
		// }

		// columnDelimiter = args.columnDelimiter || ',';
		// lineDelimiter = args.lineDelimiter || '\n';

		// keys = Object.keys(data[0]);

		// result = '';
		// result += keys.join(columnDelimiter);
		// result += lineDelimiter;

		// data.forEach(function(item) {
		// 	ctr = 0;
		// 	keys.forEach(function(key) {
		// 		if (ctr > 0) result += columnDelimiter;
		// 		result += item[key];
		// 		ctr++;
		// 	});
		// 	result += lineDelimiter;
		// });
		return result;
	}

	function generateDownloadLink(graphInfo){
		var exporterSettings = graphInfo.exportData;
		var postfix = exporterSettings.postfix;
		var prefix = exporterSettings.prefix;
		var selection = graphInfo.datasets.selection;
		var increment = selection.increment;
		var format = getIncrementDateFormat(increment);
		var titles = ['Date( UTC offset: ' + getLocalUTCOffset() + " )"];
		var datasets = graphInfo.datasets.data;
		var dates = graphInfo.datasets.labels;

		for(var datasetCursor in datasets){
			var dataset = datasets[datasetCursor];
			var title = prefix;			
			title += dataset.group === null ? '' : dataset.group;
			title += postfix;
			title += '                                  ' 

			titles.push(title);
		}
		var CSVFormat = titles.join(',') + '\n';

		for(var cursor in dates){
			var momentDate = dates[cursor];
			var dateArray = [];
			dateArray.push(momentDate.format(format));
			for(var datasetCursor in datasets){
				var dataset = datasets[datasetCursor];
				dateArray.push(dataset.timeSeries[cursor]);
			}
			CSVFormat += dateArray.join(',') + '\n';
		}

		var filename = (exporterSettings.fileName || 'export') + '.csv';
		if (!CSVFormat.match(/^data:text\/csv/i)) {
			CSVFormat = 'data:text/csv;charset=utf-8,' + CSVFormat;
		}

		exporter.setAttribute('href', encodeURI(CSVFormat));
		exporter.setAttribute('download', filename);

	}

	this.update = function(graphInfo){
		var exporterSettings = graphInfo.exportData;
		exporter.style.backgroundColor = exporterSettings.backgroundColor;
		exporter.style.color = exporterSettings.color;
		exporter.style.borderColor = exporterSettings.borderColor;
		exporter.style.borderWidth = exporterSettings.borderWidth + 'px';
		exporter.style.borderRadius = exporterSettings.borderRadius + 'px';
		generateDownloadLink(graphInfo);
	}

	this.DOMElement = function(){
		return exporter;
	}

	this.render = function(graphInfo,container){
		this.update(graphInfo);
		container.appendChild(exporter);
	}
}

const ToolBar = function(){

	var incrementSelector = null;
	var dateSelector = null;
	var exporter = null;
	this.render = function(graphInfo,DOMElement){
		var wrapper = createElement({tag: "div",style:{
			width: "100%",
			height: "30px",
			margin: "5px",
			marginBottom: "10px",
		},attrs: {
			name: "toolBar",
		}});

		if(graphInfo.rangeSelector.enable === true || graphInfo.incrementSelector.enable === true || graphInfo.exportData.enable == true){
			DOMElement.appendChild(wrapper);

			dateSelector = new DateSelector()
			dateSelector.render(graphInfo,wrapper);
			if(graphInfo.rangeSelector.enable === true){
				wrapper.appendChild(dateSelector.DOMElement());
			}

			if(graphInfo.incrementSelector.enable === true){	
				incrementSelector = new IncrementSelector();
				incrementSelector.update(graphInfo);
				wrapper.appendChild(incrementSelector.DOMElement());
			}
			if(graphInfo.exportData.enable === true){
				exporter = new Exporter();
				exporter.update(graphInfo);
				wrapper.appendChild(exporter.DOMElement());
			}
		}
	}

	this.update = function(graphInfo){
		if(incrementSelector !== null){
			incrementSelector.update(graphInfo);
		}
		if(exporter !== null){
			exporter.update(graphInfo)
		}
	}
	this.destroy = function(DOMElement){
		if(dateSelector !== null){
			dateSelector.destroy();
		}
		removeChildren(DOMElement,{name: 'toolBar'});
	}

}

export default ToolBar;














































