import React from 'react';
import ReactDOM from 'react-dom';
import {Conjugator} from '../tools/conjugator'
import {Conjugation} from './conjugation';
import '../styles/index.css';

class VerbDetails extends React.Component {
constructor(props) {
    super(props);
    
    this.state = {
        verb: props.verb
    };

    this.setVerb(props.verb, false);
}

setVerb(verb, setState = true) {        
    
    const grammaticalData = this.props.grammaticalData;
    
    const conjugationRules = verb.conjugationRulesIds.reduce((rules, ruleId) => {
        const rule = this.props.grammaticalData.conjugationRules[ruleId];
        rules.push(rule);
        return rules;
    }, []);

    this.irregularConjugationRules = conjugationRules.filter(cr => !cr.isRegular);
    this.isRegular = !this.irregularConjugationRules.length;
    
    const participleTenses = Object.values(grammaticalData.tenses).filter(t => t.name.includes('Participle'));
    const presentParticipleTense = participleTenses.find(t => t.name.startsWith('Present'));
    const pastParticipleTense = participleTenses.find(t => t.name.startsWith('Past'));
    this.presentParticipleId = presentParticipleTense.id;
    this.pastParticipleId = pastParticipleTense.id;   
    
    if (!this.isRegular) {
        var matchesPromise = Conjugator.getVerbConjugationMatches(verb.id);

        matchesPromise.then(conjugationMatches => {
            verb.conjugationMatches = conjugationMatches;

            if (setState) {
                this.setState({
                    verb: verb
                });
            } 
        });
    }
    else if (setState) {
        this.setState({
            verb: verb
        });
    }
}    

componentWillReceiveProps(nextProps) {
    if (this.props === nextProps) {
        return; 
    }
    
    this.props = nextProps;    
    this.setVerb(nextProps.verb);
}

render() {   
    
    let regularVerbsConjugations = (props) => {
        
        const {verb, grammaticalData}  = props;
        const stem = Conjugator.getVerbStem(verb);
        const conjugationRuleId = verb.conjugationMatch.conjugationRuleId;


    };

    const conjBtn = () => {
        return (<Conjugation></Conjugation>);
    };

    return (
        <div className='verb-details'>
            <p className='verb-title'>{this.state.verb.spanishInfinative}</p>
            <h2 className='translation'>translation: {this.state.verb.englishInfinative}</h2>
            <h2 className='participles-label'>Participles</h2>
            <div className='verb-participles'>                      
                <p className='present-participle'>present participle: Viviendo</p>
                <p className='present-participle'>past participle: Vivido</p>
            </div>
            <h2 className='conjugations-label'>conjugations</h2>
            <div className='verb-rules'>                    
                {this.isRegular && <p>verb is regular</p>}                    
                {regularVerbsConjugations(this.props)}
                {!this.isRegular &&                         
                    <div className='verb-irregular-rules'>
                    <h3 className='verb-irregular-rules-title'>special conjugation rules</h3>
                        {
                            this.irregularConjugationRules.map((rule) => 
                            {
                                return <p key={rule.id}
                                            className='verb-rule'
                                            onClick={e => this.props.onSelectItem(rule)}>{rule.name}</p>
                            })
                        }                            
                    </div>
                }
            </div>
            {conjBtn()}
        </div>
    );
}
}

export {
    VerbDetails
}