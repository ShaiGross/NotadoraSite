import React from 'react';
import ReactDOM from 'react-dom';
import './index.css'

function Verb(props) {

    var verbClassName = 'verb' + (props.isSelected ? '_selected' : '');
    return (
        <div className={verbClassName} onClick={props.onClick}>
            <h1>{props.verb.spanishInfinative + ' - ' + props.verb.englishInfinative}</h1>
        </div>
    );
}

function VerbDetails(props) {
    
    return (
        <div className='verb-details'>
            <h1 className='verb-details-spanishInfinative'>{props.selectedVerb.spanishInfinative}</h1>
            <h2 className='verb-details-englishInfinative'>{props.selectedVerb.englishInfinative}</h2>
        </div>
    );
}

class VerbList extends React.Component {
        
    render() {
        
        const verbs = this.props.verbs.slice();

        const verbComponents = verbs.map((verb) => {
            return (
                <Verb key = {verb.id}
                    verb={verb}
                    isSelected = {verb.id === this.props.selectedVerbId}
                    onClick={() => this.props.onClick(verb)}>
                </Verb>
            );
        })

        return (
            <div className='verbs-list'>
                {verbComponents}
            </div>
        );
    }
}


class VerbsExplorer extends React.Component {
     
    constructor() {
        super();                

        this.state = {        
            matchingVerbs: [],
            selectedVerbId: null,
            erros: null,
            loading: true,
        };   

        this.grammaticalData = {
            tenses: [],
            persons: [],
            conjugationRules: []
        };
        
        this.handlePageClick = this.handlePageClick.bind(this);
        this.statusMsg = '';
        this.getStartupInfo();        
    }

    getStartupInfo() {

        const tensesPromise = this.fetchGrammObj('tenses');
        const personsPromise = this.fetchGrammObj('persons');
        const conjugationRulesPromise = this.fetchGrammObj('conjugationRules');
        const allGrammPromises = [tensesPromise,
                                  personsPromise,
                                  conjugationRulesPromise];

        Promise.all(allGrammPromises)
        .then(() => {
            tensesPromise.then(v => {                
                this.grammaticalData.tenses = v;                
            });
            personsPromise.then(v => {                
                this.grammaticalData.persons = v;                
            });
            conjugationRulesPromise.then(v => {                
                this.grammaticalData.conjugationRules = v;                
            });

            this.getVerbs();
        })
        .then(() => {
            this.setState({
                loading: false
            });            
        })
        .catch(msg => {
            this.setState({                
                errors: msg
            });
        });                        
    }

    fetchGrammObj(grammObj) {
                
        return new Promise((resolve, reject) => {
            fetch(`http://localhost:60665/${grammObj}`)
            .then(res => {
                if (res.ok)
                    return res.json();
                else
                    throw Error(`Couldn't retieve ${grammObj}`);
            })
            .then(json => {
                const grammObjMap = json.reduce((map, val) => {
                    map[val.id] = val;
                    return map;
                }, {});
                console.log(`${grammObj}:`);
                console.log(grammObjMap);
                resolve(grammObjMap);
            })
            .catch(msg => {                
                this.setState({
                    errors: msg
                });
                reject(msg);
            });
        });
    }

    getVerbs() {                

        fetch('http://localhost:60665/verbs').then(response => {            
            return response.json();
        }).then(jsonVerbs => {                          
            
            this.setState({                
                verbs: jsonVerbs,
                matchingVerbs: jsonVerbs
            });
        });        
    }

    handleAppOnClick(e) {
        e.stopPropagation();
    }

    handlePageClick(e) {

        this.setState({
            selectedVerbId: null,
        });
    }

    handleSearchSuffixChanged(e) {

        const text = e.target.value.toLowerCase();
        const verbs = this.state.verbs.slice();
        const matchingVerbs = verbs.filter(v => v.spanishInfinative.toLowerCase().startsWith(text) || 
                                                v.englishInfinative.toLowerCase().startsWith(text) || 
                                                v.englishInfinative.toLowerCase().startsWith('to ' + text));

        this.setState({
            matchingVerbs: matchingVerbs,
        });        
    }

    handleVerbClick(verb) {
        
        this.setState({
            selectedVerbId: verb.id
        });    
    }   

    render() { 
        
        const selectedVerbId = this.state.selectedVerbId;
        const verbs = this.state.verbs;
        let selectedVerb = (selectedVerbId) ? verbs.filter(v => v.id === selectedVerbId)[0] : null;

        if (this.state.errors) {
            return (
                <div className='status-div'>{this.state.errors}</div>
            );
        }
        else if (this.state.loading) {

                        
            return (
                <div className='loading-div'>fetching data</div>
            );
        }
        else {
            return (
                <div className='AppContainer' onClick={this.handlePageClick}>                
                    <div className='verbs-explorer'
                        tabIndex='0'
                        onClick={this.handleAppOnClick}>
                        <div className='verbs-menu'>
                            <input className='verbs-search-text'
                                type="text"
                                onChange={(e) => this.handleSearchSuffixChanged(e)}/>
                            <VerbList verbs={this.state.matchingVerbs}
                                    selectedVerbId={this.state.selectedVerbId}
                                    onClick={(verb) => this.handleVerbClick(verb)}></VerbList>
                        </div>
                        {selectedVerb && <VerbDetails selectedVerb={selectedVerb}></VerbDetails>}
                    </div>                            
                </div>
            );        
        }
    }
}

// ========================================

document.body.addEventListener('click', this.handleBodyClick); 

ReactDOM.render(
  <VerbsExplorer />,
  document.getElementById('root')
);