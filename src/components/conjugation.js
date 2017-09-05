import React from 'react'
import ReactDOM from 'react-dom'
import '../styles/conjugation.css';

function Conjugation(props) {

    const conjugationRuleTypes = {
        independent: 0
        ,newPattern: 1
        ,special: 2        
    }

    const {conjugaitonRuleType,
           conjugationMatch, 
           instruction} = props;

    const buildConjugaiton = (conjRuleType, conjugationMatch, instruction) => {
        switch (conjugaitonRuleType) {
            case conjugaitonRuleType.independent:
                return conjugaitonMatch.pattern + instruction.suffix;            
            case conjugaitonRuleType.newPattern:
                return conjugationMatch.conjugationString + instruction.suffix;         
            case conjugaitonRuleType.special:
                return conjugationMatch.conjugationString;            
            default:
                throw Error('Bad conjugaiton rule type');                
        }
    }

    return <div className='conjugation'>{buildConjugaiton()}</div>;
    
}   

export {Conjugation}