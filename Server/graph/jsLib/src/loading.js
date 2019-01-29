import {createElement,argsParser} from './common.js';

const Loading = function(){
	var loading = createElement({
		tag: "div",
		attrs: {name: 'loading'},
		style: {
			position: 'absolute',
            width: "auto",
            height: "auto",
            top: "0px",
            left: "0px",
            right: "0px",
            bottom: "0px",
		}
	});

	var shadow = createElement({
		tag: "div",
		style: {
			position: "absolute",
            zIndex: "99999",
            backgroundColor: "black",
            width: "auto",
            height: "auto",
            top: "0px",
            left: "0px",
            right: "0px",
            bottom: "0px",
            opacity: "0.3",
            borderRadius: "2px",
            padding: "inherit",
		},
	})

	var loadingIcon = createElement({
		tag: "i",
		attrs: {
			'class': 'fas fa-spinner fa-spin'
		},
		style: {
			zIndex: "999999",
			fontSize: "35px",
			position: "absolute",
			display: 'block',
			opacity: "1",
			color: "#fff",

		}
	})
	loading.appendChild(shadow);
	loading.appendChild(loadingIcon);

	const build = function(graphInfo,DOMElement){
		if(argsParser(graphInfo,'ready',false) === true){
			loading.style.display = 'none';
			return;
		}
		var computedStyle = getComputedStyle(DOMElement);
		loading.style.top =  (parseFloat(computedStyle.paddingTop) - 5)  + "px";
		loading.style.left = (parseFloat(computedStyle.paddingLeft) - 5) + "px";
		loading.style.width = (parseFloat(computedStyle.width) + 10) + "px";
		loading.style.height = (parseFloat(computedStyle.height) + 10) + "px";
		loadingIcon.style.left = (parseInt(computedStyle.width) / 2 - 35/2) + "px";
		loadingIcon.style.top = (parseInt(computedStyle.height) / 2 - 35/2) + "px";
		loading.style.display = 'block';
	}
	this.update = function(graphInfo,DOMElement,status){
		build(graphInfo,DOMElement,status);
	}
	this.DOMElement = function(){
		return loading;
	}
}


export default Loading;


