import React from 'react';
import ReactDOM from 'react-dom';
import './index.css'

function Verb(props) {

    var verbClassName = 'verb' + (props.isSelected ? '_selected' : '');
    return (
        <div className={verbClassName} onClick={props.onClick}>
            <h1>{props.verb.spanishInf + ' - ' + props.verb.englishInf}</h1>
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
                    isSelected = {verb.id == this.props.selectedVerbId}
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

function VerbDetails(props) {
    
    // if (!props.selectedVerb) {
    //     return null;
    // }
    
    return (
        <div className='verb-details'>
            <h1 className='verb-details-spanishInf'>{props.selectedVerb.spanishInf}</h1>
            <h2 className='verb-details-englishInf'>{props.selectedVerb.englishInf}</h2>
        </div>
    );
}

class VerbsExplorer extends React.Component {
    constructor() {
        super();

        const mockVerbs = [{
            id: 1,
            spanishInf: 'Comer',
            englishInf: 'To Eat'
        },{
            id: 2,
            spanishInf: 'Vivir',
            englishInf: 'To Live'
        },{
            id: 3,
            spanishInf: 'Ir',
            englishInf: 'To Go'
        },{
            id: 4,
            spanishInf: 'Soñar',
            englishInf: 'To Dream'
        },{
            id: 5,
            spanishInf: 'Desarrollar',
            englishInf: 'To Develop'
        },{
            id: 6,
            spanishInf: 'Mezclar',
            englishInf: 'To Mix'
        },{
            id: 7,
            spanishInf: 'Mejorar',
            englishInf: 'To Improve'
        },{
            id: 8,
            spanishInf: 'Compartir',
            englishInf: 'To Share'
        },{
            id: 9,
            spanishInf: 'Hablar',
            englishInf: 'To Speak'
        }];

        this.state = {
            verbs: mockVerbs,
            matchingVerbs: mockVerbs,
            selectedVerbId: null,
        };

        this.handlePageClick = this.handlePageClick.bind(this);
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
        const matchingVerbs = verbs.filter(v => v.spanishInf.toLowerCase().startsWith(text) || 
                                                v.englishInf.toLowerCase().startsWith(text) || 
                                                v.englishInf.toLowerCase().startsWith('to ' + text));

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
        let selectedVerb = (selectedVerbId) ? verbs.filter(v => v.id == selectedVerbId)[0] : null;

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

// ========================================

document.body.addEventListener('click', this.handleBodyClick); 

ReactDOM.render(
  <VerbsExplorer />,
  document.getElementById('root')
);