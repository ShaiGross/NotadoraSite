import React from 'react'
import ReactDOM from 'react-dom'
import {Conjugator} from '../tools/conjugator'
import '../styles/conjugation.css';

function Conjugation(props) {

    const conjugationRuleTypes = {
        independent: 0
        ,newPattern: 1
        ,special: 2        
    }

    const {conjugationMatch, 
           instruction,
           verb} = props;

    const conjRuleType = conjugationMatch.conjugationRule.conjugationRuleType;    
    const verbStem = Conjugator.getVerbStem(verb);

    const buildConjugaiton = (conjRuleType, conjugationMatch, instruction, verbStem) => {
        switch (conjRuleType) {
            case conjugationRuleTypes.independent:
                return verbStem + instruction.suffix;            
            case conjugationRuleTypes.newPattern:
                return conjugationMatch.conjugationString + instruction.suffix;         
            case conjugationRuleTypes.special:
                return conjugationMatch.conjugationString;            
            default:
                throw Error('Bad conjugaiton rule type');                
        }
    }

    return <div className='conjugation'>{buildConjugaiton(conjRuleType, conjugationMatch, instruction, verbStem)}</div>;
    
}   

export {Conjugation}