import React from 'react';
import ReactDOM from 'react-dom';
import '../styles/index.css';
import {fetcher} from '../tools/fetcher'

class ConjugationRuleDetails extends React.Component {
    constructor(props) {
        super(props);
        
        this.newDesc = props.conjugationRule.description;

        this.state = {
            conjugationRule: props.conjugationRule
            ,loading: true
            ,errors: ''
            ,editingField: null
        };                
    }

    componentDidMount() {
        this.fetchRule(this.state.conjugationRule);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props === nextProps) {
            return; 
        }

        this.fetchRule(nextProps.conjugationRule);
    }

    fetchRule(conjugationRule) {
        
        const conjugationRulePromise = fetcher.fetchGrammObjById('conjugationRules', conjugationRule.id);

        conjugationRulePromise.then(conjugationRule => {
            this.setRule(conjugationRule);
        }).catch(msg => {
            this.setState({
                errors: msg
            });
        });
    }

    setRule(conjugationRule, setState = true) {        
        
        this.setState({
            conjugationRule: conjugationRule
            ,loading: false
        })
    }

    editDescription(e) {
        this.setState({
            editingField: 'desc'});

        e.target.focus();
        e.stopPropagation();
    }

    enterDescEdit() {
        
    }

    saveDescription(e) {
        
        const conjugationRule = this.state.conjugationRule;
        const newDesc = this.newDesc;
        const updateDesc = conjugationRule.description !== newDesc;

        if (this.state.editingField === 'desc') {
                        
            if (updateDesc)
                conjugationRule.description = newDesc;

            this.setState({
                editingField: null
                ,conjugationRule
            });

            if (updateDesc)
                this.props.onUpdateItem(conjugationRule);
        }
    }

    handleDetailsClick() {

        this.saveDescription();
    }    
    
    render() {
        
        return (
            <div className='conjugation-rule-details-container'
                 onClick={e => this.handleDetailsClick()}>
                {!!this.state.errors &&
                    <p>{this.state.errors}</p>
                }
                {!this.state.errors && !!this.state.loading &&
                    <p>loading</p>
                }
                {!this.state.errors && !this.state.loading &&
                    <div className='conjugation-rule-details'>
                        <p className='conjugation-rule-title'>{this.state.conjugationRule.name}</p>
                        <div className='conjugation-rule-desc-container'>
                            <h2 className='conjugation-rule-desc-label'>description:</h2>
                            { !this.state.editingField && 
                                <p className='conjugation-rule-desc'
                                   onClick={e => this.editDescription(e)}>{this.state.conjugationRule.description}</p>
                            }
                            { this.state.editingField === 'desc' &&
                                <textarea className='conjugation-rule-desc-edit' 
                                          defaultValue={this.state.conjugationRule.description}
                                          onClick={e => e.stopPropagation()}
                                          onChange={(e) => this.newDesc = e.target.value}>                                    
                                </textarea>

                            }
                        </div>                    
                    </div>
                }
            </div>
        );
    }
}

export {
    ConjugationRuleDetails
}