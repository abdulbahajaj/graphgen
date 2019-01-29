import {createElement} from './common.js';

const createScript = function(src){
	return createElement({
		tag: "script",
		attrs: {type: "text/javascript",src: src}
	});
}

const createSheet = function(src){
	return createElement({
		tag: "link",
		attrs: {type: "text/css",rel: "stylesheet",href: src}
	});
}

const install_Fontawesome = function(DOMElement){
	var sheet = createSheet("https://use.fontawesome.com/releases/v5.1.0/css/all.css");
	sheet.setAttribute("integrity","sha384-lKuwvrZot6UHsBSfcMvOkWwlCMgc0TaWr+30HWe3a4ltaBwTZhyTEggF5tJv8tbt");
	sheet.setAttribute("crossorigin","anonymous");
	DOMElement.appendChild(sheet)
}

const install_Daterangepicker = function(DOMElement){
	// var script = createScript("https://cdn.jsdelivr.net/npm/daterangepicker/daterangepicker.min.js");
	var sheet = createSheet("https://cdn.jsdelivr.net/npm/daterangepicker/daterangepicker.css");
	// DOMElement.appendChild(script)
	DOMElement.appendChild(sheet)
}

const install_Moment = function(DOMElement){
	var script = createScript("https://cdn.jsdelivr.net/momentjs/latest/moment.min.js");
	DOMElement.appendChild(script)
}

const install_Jquery = function(DOMElement){
	var script = createScript("https://cdn.jsdelivr.net/jquery/latest/jquery.min.js");
	DOMElement.appendChild(script)
}

const Isnstall = function(){
	var DOMElement = document.head;
	install_Fontawesome(DOMElement);
	// install_Daterangepicker(DOMElement);
	// install_Moment(DOMElement);
	// install_Jquery(DOMElement);
}


export default Isnstall;