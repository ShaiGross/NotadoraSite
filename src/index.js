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

class VerbDetails extends React.Component {
    constructor(props) {
        super(props);
        
        this.fetchGrammObj = (grammObjName, id) => this.props.fetchObjFu(grammObjName, id);                
        this.updateGrammObj = this.props.updateObjFu; // Ask frontend about this
        this.updateGrammObj.bind(this.props.parentContext);

        this.state = {
            verb: this.props.verb
        };

        if (!this.props.verb.conjugations)
            this.getConjugations();
    }

    getConjugations() {
        
        if (!this.state.verb.conjugations) {
            const verb = this.state.verb;   
            this.fetchGrammObj('verbs', verb.id)            
            .then(v => {                                
                this.setState({
                    verb: v
                });                
            })  
        }
    }

    render() {        
        const conjugations = this.state.verb.conjugations;
        const verb = this.state.verb;
        return (
            
            <div className='verb-details'>
                <h1 className='verb-details-spanishInfinative'>{verb.spanishInfinative}</h1>
                <h2 className='verb-details-englishInfinative'>{verb.englishInfinative}</h2>
                {!conjugations && <div className='verb-details-loading'>Loading conjugations</div>}
                {conjugations && <div className='verb-details-conjugations'>{JSON.stringify(conjugations)}</div>}
            </div>
        );
    }
}

class VerbList extends React.Component {
        
    render() {
        
        const verbs = this.props.verbs.slice();

        const verbComponents = verbs.map((verb) => {
            return (
                <Verb key = {verb.id}
                      verb={verb}
                      isSelected = {this.props.selectedVerb && verb.id === this.props.selectedVerb.Id}                      onClick={() => this.props.onClick(verb)}>
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
     
    // constructor
    constructor() {
        super();                

        this.state = {        
            matchingVerbs: [],
            selectedVerb: null,
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

    // methods
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

    fetchGrammObj(grammObjName) {
                
        return new Promise((resolve, reject) => {
            fetch(`http://localhost:60665/${grammObjName}`)
            .then(res => {
                if (res.ok)
                    return res.json();
                else
                    throw Error(`Couldn't retieve ${grammObjName}`);
            })
            .then(obj => {         
                
                const grammObjMap = obj.reduce((map, val, i) => {                    
                    map[val.id] = val;
                    return map;
                }, {});
                console.log(`${grammObjName}:`);
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
    
    setSelectedVerb(verbId) {
        
        const verbsMap = this.grammaticalData.verbs;

        if (!verbId || !verbsMap[verbId])
            return null;

        const selectedVerb = verbsMap[verbId];

        this.setState({
            selectedVerb: selectedVerb
        });        
    }

    fetchGrammObjById(grammObjName, id) {
        
        return new Promise((resolve, reject) => {
            fetch(`http://localhost:60665/${grammObjName}/${id}`)
            .then(res => {
                if (res.ok) {
                    return res.json();
                }
                else
                    throw Error(`couldn't fetch obj ${id} from ${grammObjName}`);
            })
            .then(obj => {
                console.log(`fetched obj ${id} from ${grammObjName}`);
                console.log(obj);
                resolve(obj);
            })
            .catch(msg => {
               this.setState({
                    errors: msg
                });
                reject(msg);
            })
        })
    }

    updateGrammObj(grammObjName, obj) {
        alert(JSON.stringify(this.grammaticalData));
        const objMap = this.grammaticalData[grammObjName];
        objMap[obj.id] = obj;
    }
    // events 
    handleAppOnClick(e) {
        e.stopPropagation();
    }

    handlePageClick(e) {

        this.setState({
            selectedVerb: null,
        });
    }

    handleSearchSuffixChanged(e) {

        const text = e.target.value.toLowerCase();        
        this.setState({searchSuffix: text});
    }

    handleVerbClick(verb) {
                
        this.setSelectedVerb(verb.id);
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
                                      selectedVerb={this.state.selectedVerb}
                                      onClick={(verb) => this.handleVerbClick(verb)}></VerbList>
                        </div>
                        {this.state.selectedVerb && 
                         <VerbDetails verb={this.state.selectedVerb}
                                      fetchObjFu={this.fetchGrammObjById}
                                      updateObjFu={this.updateGrammObj}
                                      parentContext={this.context}></VerbDetails>}
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