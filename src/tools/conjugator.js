import {Fetcher}               from './fetcher.js'
import {Conjugation}           from '../components/conjugation.js'

const Conjugator = {
    getVerbType: verb => {
        
        const spanishInf = verb.spanishInfinative;

        if (spanishInf == 'ar') {
            return 0;
        } else if (spanishInf == 'er') {
            return 1;
        } else if (spanishInf == 'ir') {
            return 2;
        } else {
            return null;
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
        const {conjugationRule, isntruction, conjugationMatch} = props;                        

        if (conjugationRule == null)
        {

        }

        return <Conjugaiton instruction={instruction} 
                            conjugaitonMatch={conjugaitonMatch}
                            conjugaitonRuleType={conjugationRule.conjugaitonRuleType}></Conjugaiton>
    }
}

export {Conjugator}