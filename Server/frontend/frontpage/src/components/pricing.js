import React, { Component } from 'react';
import {Button} from './baseElements.js'
// import StripeCheckout from 'react-stripe-checkout';

class Feature extends Component{
	render(){
		return (
			<div className = 'Feature'>{this.props.description}</div>
		)
	}
}

class Plan extends Component{
	constructor(props){
		super(props);
		this.onToken=this.onToken.bind(this);
	}
	getCost(){
		if(this.props.cost == 0){
			return "Free";
		}
		 return "$" + this.props.cost + " / month"
	}
	async onToken(token){
		var request = {}
		request.token = token;
		request.plan = this.props.planID;
		console.log("stripe token: ",token);
	}
	render(){
		return (
			<div className='Plan'>
				<div className='planTitle'>
					{this.props.title}
				</div>
				<div className='cost'>{this.getCost()}</div>
				<div className='features'>
					{this.props.children}
				</div>

			</div>

		)
	}
}

class Pricing extends Component{
	render(){
		return (
			<div className='Pricing'>
				{this.props.children}
			</div>
		)
	}
}


class Policy extends Component{
	render(){
		return (
			<div className='Policy'>{this.props.children}</div>
		)
	}
}
class PolicyList extends Component{
	render(){
		return (
			<div className='PolicyList'>
					{this.props.children}
			</div>
		)
	}
}




// import {Form,Tab,Field,Title,Input,Button,ListInput,Option,Section,ToolBar,Popup,ErrorList,ErrorWrapper,ListInputMap,Table
// ,Column
// ,Row} from './baseElements.js';
class PricingExport extends Component{
	render(){
		return (
			<div className="Pricing">
				<Pricing>
					<Plan title='Testing' cost = {0} planID="testing">
						<Feature description = "100 Renders"/>
						<Feature description = "500 Data points"/>
					</Plan>
					<Plan title='Starting' cost = {14.99} planID="starting">
						<Feature description = "10K Renders"/>
						<Feature description = "50K Data points"/>
					</Plan>
					<Plan title='Growing' cost = {24.99} planID="growing">
						<Feature description = "100K Renders"/>
						<Feature description = "500K Data points"/>
					</Plan>
					<Plan title='Large' cost = {44.99} planID="Large">
						<Feature description = "1M Renders"/>
						<Feature description = "5M Data points"/>
					</Plan>
					<PolicyList>
						<Policy>Email support is included in all plans</Policy>
						<Policy>A render event happens when a graph is loaded from your client side application(s)</Policy>
						<Policy>
							Data points are the sum of data points in your sources minus the dummy data source that we added to make testing easier
						</Policy>
						<Policy>
							Our limits are not hard limits. We will contact you when you exceed your usage and request that you upgrade to a higher plan
						</Policy>
					</PolicyList>

				</Pricing>
			</div>
		)
	}
}


export default PricingExport;
























