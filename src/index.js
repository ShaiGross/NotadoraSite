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
            errors: null,
            loading: true,
            searchSuffix: ''
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
        .catch(msg => {
            console.log(typeof(msg));
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
                
                const grammObjMap = json.reduce((map, val, i) => {                    
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

        this.fetchGrammObj('verbs').then(v => {
            this.grammaticalData.verbs = v;
            this.setState({                
                loading: false
            })
        })

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
        this.setState({searchSuffix: text});
    }

    handleVerbClick(verb) {
        
        this.setState({
            selectedVerbId: verb.id
        });    
    }   

    getMatchingVerbs() {
        
        const suffix = this.state.searchSuffix;
        const allVerbsMap = this.grammaticalData.verbs;        
        const allVerbs = Object.values(allVerbsMap);
        console.log(suffix);

        if (!suffix)
            return allVerbs;

        return  allVerbs.filter(v => v.spanishInfinative.toLowerCase().startsWith(suffix) || 
                                     v.englishInfinative.toLowerCase().startsWith(suffix) || 
                                     v.englishInfinative.toLowerCase().startsWith('to ' + suffix));        
    }

    render() {                 
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
            const selectedVerbId = this.state.selectedVerbId;
            const verbs = Object.values(this.grammaticalData.verbs);
            const selectedVerb = (selectedVerbId) ? verbs.filter(v => v.id === selectedVerbId)[0] : null;            
            const matchingVerbs = this.getMatchingVerbs();

            return (
                <div className='AppContainer' onClick={this.handlePageClick}>                
                    <div className='verbs-explorer'
                        tabIndex='0'
                        onClick={this.handleAppOnClick}>
                        <div className='verbs-menu'>
                            <input className='verbs-search-text'
                                type="text"
                                onChange={(e) => this.handleSearchSuffixChanged(e)}/>
                            <VerbList verbs={matchingVerbs}
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