import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import PricingExport from './components/pricing.js'
import demonstration from './demonstration.svg'

class Auth extends Component{
    render(){
        return (
            <form className='Auth' action="auth" method="POST">
                <input className='textbox' type='text' name="email" placeholder="Email"/>        
                <input className='textbox' type='password' name="password" placeholder="Password"/>  
                <button type='submit' className='button green' name = "action" value="register">Register</button>      
                <button type='submit' className='button' name='action' value="login">Login</button>      
            </form>
        )
    }
}

class Section extends Component{
    render(){
        var additionalClasses = ""
        if(this.props.isDemo === true){
            additionalClasses += " animation ";
        }
        return (
            <div className={'Section' + additionalClasses} id={this.props.id} >
                <div className='title'>{this.props.title}</div>
                {this.props.children}
            </div>
        )
    }
}

class Feature extends Component{
    render(){
        return (
            <div className='ProductFeature'>
                <div className='featureTitle'>
                    {this.props.title}
                </div>
                <div className='featureDescription'>
                    {this.props.children}
                </div>
            </div>
        )
    }
}

class Text extends Component{
    render(){
        return (
            <div className='Text'>{this.props.children}</div>
        )
    }
}

class Header extends Component{
    render(){
        return(
            <div className="header">
                <div className="logo">UsageGraph</div>
                <a href="#features" className='navButton' >Features</a>
                <a href="#demo" className='navButton' >Live demo</a>
                <a href="#pricing" className='navButton' >Pricing</a>
                <Auth/>
            </div>
        )
    }
}
                        // <img id="demonstration" width="250px" height="250px" src={demonstration}/>

class App extends Component{
    componentDidMount(){
        window.UsageGraph.connect({
            publicKey: "5b112402a8a634c798cfc8d9ee26bcfc5a5e4d27ac883904604da9f0",
        });
        window.UsageGraph.load([{graphID: "graph_5b5262fda8a6343956a94c19"}]);
        window.UsageGraph.draw({
            graphID: "graph_5b5262fda8a6343956a94c19",
            containerID: "graphDemoWrapper"
        });

        function parseQuery(queryString) {
            var query = {};
            var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
            for (var i = 0; i < pairs.length; i++) {
                var pair = pairs[i].split('=');
                query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
            }
            return query;
        }


        var GETInputs = parseQuery(window.location.search);
        if(typeof GETInputs['error'] != 'undefined'){
            alert(GETInputs['error']);
        }



    }
    render() {
        return (
            <div>
                <div className="App">
                    <Header/>
                    <div className="body">
                        <Section title="About" id="about" >
                            <Text>
                                UsageGraph is a usage graph builder. It allows you to
                                build graphs to show your customers their usage.
                            </Text>
                        </Section>
                        <Section title="Features" id="features">
                            <div className='FeatureList'>
                                <Feature title='Import data'>
                                    You can push data through our REST API or 
                                    import data from Stripe, Segment.com, Zapier or any service 
                                    that can send us a webhook
                                </Feature>
                                <Feature title='Live graphs'>
                                    Your customers can view updates as new data is pushed to our servers
                                </Feature>
                                <Feature title='Timezone conversion'>
                                    Your customer will view their data in their own timezone.
                                </Feature>
                                <Feature title='Ranges'>
                                    Create ranges like "Today", "Yesterday", "Last year", etc... so that customers
                                    can easily view their desired date range
                                </Feature>
                                <Feature title='Date range selector'>
                                    Your customers can view their data between any arbitrary dates by simply selecting a
                                    "from" and "to" dates
                                </Feature>
                                <Feature title='Increment selector'>
                                    Your customers can choose the increment that their data is going to be 
                                    aggregated by( e.g. they can view the number of API calls they made per month, day, etc...)
                                </Feature>
                                <Feature title='Export'>
                                    With a click of a button your customers can export their data into CSV     
                                </Feature>
                                <Feature title='Limits'>
                                    Show your customers how much is left in their plan allowance. And let them know 
                                    when they are about to exceed it
                                </Feature>
                                <Feature title='Tooltip'>
                                    Tooltips allow your customers to dig deeper and understand
                                    what happened at a given date
                                </Feature>
                                <Feature title='Visual editor'>
                                    Customize everything and see how your customization looks like
                                    with our visual graph editor
                                </Feature>
                                <Feature title='No coding required'>
                                    Embed your code anywhere in your web APP by copying and pasting a code snippet
                                </Feature>
                                <Feature title='Compatible with your favourite framework'>
                                    Our JS library could easily be used with your favourite framework( e.g. react )    
                                </Feature>
                                <Feature title='Tested'>
                                    Our widget is tested with all the major browsers and mobile phones  
                                </Feature>
                                <Feature title='Free email support'>
                                    All of our plans will include free email support. We are happy to help you 
                                    set it up and answer any questions that you might have.
                                </Feature>
                            </div>
                        </Section>
                        <Section title="Live demo" id="demo">
                            <div id='graphDemoWrapper'/>
                        </Section>
                        <Section title="Pricing" id="pricing">
                            <PricingExport/>
                        </Section>
                    </div>
                </div>
            </div>
        );
  }
}

export default App;






























