import React from 'react'
import ReactDOM from 'react-dom'
import '../styles/index.css';

class PersonDetails extends React.Component {
    constructor(props) {
        super(props);

        const {person, grammaticalData} = props;
        const conjugationRules = Object.values(grammaticalData.conjugationRules);
        const personConjugationRules = conjugationRules.filter(cr => cr.personsIds.includes(person.id));

        this.state = {person, personConjugationRules};
    }

    componentWillReceiveProps(nextProps) {
    if (this.props === nextProps) {
        return; 
    }
    
    this.props = nextProps;
    const {person, grammaticalData} = nextProps;
    this.setState({person, grammaticalData});
}

    render() {

        const {person, personConjugationRules} = this.state;
        const plurality = pluralityVal => {return pluralityVal === 0 ? 'singular' : 'plural'};
        const formality = formalityVal => {return formalityVal === 0 ? 'unformal' : 'formal'};
        const gender = genderVal =>  {
            
            switch (genderVal) {
                case 0:                    
                    return 'non-gendered'
                case 1:                    
                    return 'Masculine'
                case 2:                    
                    return 'Feminine'
                default:
                    break;
            }
        };
        
        

        return (
            <div className='person-details'>
                <p className='person-title'>{person.spanishExpression}</p>
                <h2 className='person-info-label'>Person Info</h2>
                <p className='person-plurality'>Plurality: {plurality(person.plurality)}</p>
                <p className='person-formality'>formality: {formality(person.formality)}</p>
                <p className='person-gender'>gender: {gender(person.gender)}</p>
            </div>
        );
    }
}

export {
    PersonDetails
}