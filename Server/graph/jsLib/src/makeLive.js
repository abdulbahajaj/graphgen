import APPManager from './APPManager.js';
import {setLabelDates,getLocalUTCOffset,argsParser} from './common.js';
import moment from 'moment';

const getDrawing = function(drawings,graphID){
	for(var cursor in drawings){
		var drawing = drawings[cursor];
		if(drawing.graphID == graphID){
			return drawing;
		}
	}
	return null;
}

const MakeLive = function(){
	setTimeout(function(){ 
		var graphs = APPManager.get('graph');
		var drawings = APPManager.get('drawing')
		var toUpdate = [];

		var stopAnimation = [];
		var resetAnimation = [];
		var timestamp = (+ new Date());

		for(var cursor in graphs){
			var graphInfo = graphs[cursor];
			if(!graphInfo.ready){continue;}
			var version = argsParser(graphInfo,'version',null);
			if(version === null){ continue; }
			version = parseFloat(version);
			if(timestamp - version < 8000){
				continue;
			}

			var selection = graphInfo.datasets.selection;
			var end = selection.end;
			var increment = selection.increment;
			end = moment(end).utcOffset(moment().utcOffset());
			var now = moment().clone().startOf(increment);
			var isNow = end.clone().startOf(increment).isSame(now);
			if(!isNow) continue;
			setLabelDates(graphInfo);
			var request = {};
			request.id = graphInfo.id;
			request.token
			request.utcOffset = getLocalUTCOffset();
			request.tokens = []
			var token = argsParser(graphInfo,'token',null);
			if(token !== null){
				request.tokens.push(token);
			}
			request.increment = increment;
			request.conditions = argsParser(graphInfo,'conditions',[]);;
			request.start = graphInfo.datasets.labels.length - 1;
			request.end = 'now';
			toUpdate.push(request);

			/* handle animation */
			var drawing = getDrawing(drawings,graphInfo.id);
			if(drawing === null){continue;}
			var animation = argsParser(drawing,'animation',{});
			var enableAnimation = argsParser(animation,'enable',true);
			if(enableAnimation === true){
				stopAnimation.push({animation: {enable: false}, id: drawing.id});
				resetAnimation.push({animation: {enable: true}, id: drawing.id});
			}
		}
		if(toUpdate.length > 0){
			if(stopAnimation.length > 0){
				APPManager.set('drawing', stopAnimation);
			}
			APPManager.load('graph','query',toUpdate,true).then(function(){
				if(resetAnimation.length > 0){
					APPManager.set('drawing', resetAnimation);
				}
			})
		}

		MakeLive();
	}, 8000);
}

export default MakeLive;




















