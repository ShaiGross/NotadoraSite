import React from 'react'
import ReactDOM from 'react-dom'
import '../styles/index.css';

class TenseDetails extends React.Component {
    constructor(props) {
        super(props);

        const {tense, grammaticalData} = props;
        
        this.state = {tense, grammaticalData};
    }

    componentWillReceiveProps(nextProps) {
    if (this.props === nextProps) {
        return; 
    }
    
    this.props = nextProps;
    const {tense, grammaticalData} = nextProps;
    this.setState({tense, grammaticalData});
}

    render() {

        const {tense, grammaticalData} = this.state;
        const regularConjugationRule = grammaticalData.conjugationRules[tense.rugularConjugationRuleId];                        
        const irregularConjugationRules =  [];

        tense.irregularConjugationRulesIds.map(irregConjRuleId => {
            const irregularConjugationRule = grammaticalData.conjugationRules[irregConjRuleId];
            irregularConjugationRules.push(irregularConjugationRule);
        });

        return (
            <div className='tense-details'>
                <p className='tense-title'>{tense.name}</p>
                <h2 className='tense-regular-conjugaiton-Label'>Regular Conjugation</h2>
                <p className='tense-rule'
                   onClick={(e) => this.props.onSelectItem(regularConjugationRule)}>{regularConjugationRule.name}</p>
                <h2 className='tense-irregular-conjugaitons-Label'>Irregular Conjugations</h2>
                {irregularConjugationRules.map(irregConjRule => {
                    return (<p  key={irregConjRule.id} 
                                className='tense-irreg-rule'
                                onClick={(e) => this.props.onSelectItem(irregConjRule)}>{irregConjRule.name}</p>);
                })}
            </div>
        );
    }
}

export {
    TenseDetails
}