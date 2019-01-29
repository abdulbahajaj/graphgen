// open -a Google\ Chrome --args --disable-web-security --user-data-dir
// celery -A billingSys worker -l info
import React, { Component} from 'react';



class Button extends Component{
	render(){
		var additionalClasses = '';
		additionalClasses += this.props.color + " ";
		var text = this.props.text;
		text=text.toUpperCase()

		var icon = ""
		if(typeof this.props.icon != 'undefined'){
			icon = <i className={"icon fas " + this.props.icon}></i>
		}

		if(typeof this.props.className !='undefined' && this.props.className !== null){
			additionalClasses += " " + this.props.className;
		}

		var onClick = this.props.onClick;
		if(typeof onClick == 'undefined'){
			onClick = function(){ console.log("doing nothing")}
		}

		return (
			<div onClick={onClick} className={'Button ' + additionalClasses}>
				{icon}	
				{text}
			</div>
		);
	}
}

export {Button};























