import React                   from 'react';
import {Fetcher}               from './fetcher.js'
import {Conjugation}           from '../components/conjugation.js'

const Conjugator = {
    getVerbType: verb => {
        
        const spanishInf = verb.spanishInfinative;

        if (spanishInf.endsWith('ar')) {
            return 0;
        } else if (spanishInf.endsWith('er')) {
            return 1;
        } else if (spanishInf.endsWith('ir')) {
            return 2;
        } else {
            throw Error('Unknown verb type at getVerbType');
        }
    }
    ,conjugateVerb: (grammaticalData, verb) => {

    }
    ,getVerbConjugationMatches: verbId => {        
        return Fetcher.getMatches(verbId);
    }
    ,getVerbStem: verb => {
        const spanishInf = verb.spanishInfinative;
        return spanishInf.substring(0, spanishInf.length - 2);
    }
    ,render: (props) => {
        const {conjugationRule, instruction, conjugationMatch} = props;

        return (<Conjugation instruction={instruction} 
                            conjugationMatch={conjugationMatch}
                            conjugaitonRuleType={conjugationRule.conjugaitonRuleType}></Conjugation>);
    }
}

export {Conjugator}