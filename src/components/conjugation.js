import React from 'react'
import ReactDOM from 'react-dom'
import '../styles/conjugation.css';

function Conjugation(props) {

    debugger;
    const conjugationRuleTypes = {
        independent: 0
        ,newPattern: 1
        ,special: 2        
    }

    const {conjugationMatch, 
           instruction} = props;

    const conjRuleType = conjugationMatch.conjugationRule.conjugationRuleType;
    
    const buildConjugaiton = (conjRuleType, conjugationMatch, instruction) => {
        switch (conjRuleType) {
            case conjugationRuleTypes.independent:
                return conjugationMatch.pattern + instruction.suffix;            
            case conjugationRuleTypes.newPattern:
                return conjugationMatch.conjugationString + instruction.suffix;         
            case conjugationRuleTypes.special:
                return conjugationMatch.conjugationString;            
            default:
                throw Error('Bad conjugaiton rule type');                
        }
    }

    return <div className='conjugation'>{buildConjugaiton(conjRuleType, conjugationMatch, instruction)}</div>;
    
}   

export {Conjugation}