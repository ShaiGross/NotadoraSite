import React from 'react';
import ReactDOM from 'react-dom';
import './styles/index.css';
import {fetcher} from './tools/fetcher.js';
import {VerbDetails} from './components/VerbDetails.js'
import {ConjugationRuleDetails} from './components/ConjugationRuleDetails.js'

function ItemDetailsView(props) {
    const item = props.item;
    const itemType = item.type;

switch (itemType) {
    case 'verb':
        return (<VerbDetails verb={item}
                             grammaticalData={props.grammaticalData}
                             onSelectItem={(item) => props.onSelectItem(item)}></VerbDetails>);
    case 'conjugationRule':
        return (<ConjugationRuleDetails conjugationRule={item}
                             grammaticalData={props.grammaticalData}
                             onSelectItem={(item) => props.onSetItem(item)}
                             onUpdateItem={(item) => props.onUpdateItem(item)}></ConjugationRuleDetails>);
    default:
        break;
}
}

function ItemListView(props) {
    const item = props.item;
    const itemType = item.type;
    const classSuffix = '-list-view'
    const selectedSuffix = '-selected';
    const elementClass = !props.isSelected ? `${itemType}${classSuffix}`  : `${itemType}${classSuffix}${selectedSuffix}`

    switch (itemType) {
    case 'tense':
        return <div className={elementClass}
                    onClick={e => props.onClick(item)}>{item.name}</div>            
    case 'person':
        return <div className={elementClass}
                    onClick={e => props.onClick(item)}>{`${item.spanishExpression} - ${item.description}`}</div>            
    case 'conjugationRule':
        return <div className={elementClass}
                    onClick={e => props.onClick(item)}>{`${item.name}`}</div>        
    case 'verb':
        return <div className={elementClass}
                    onClick={e => props.onClick(item)}>{`${item.englishInfinative} - ${item.spanishInfinative}`}</div>
    default: {
        return null;
        console.log(`Factory failed for type "${itemType}"`);
    }   
}
                }
    

function ItemsList(props) {

    const items = props.items;    
    
    return (
        <div className='items-list'>
            {items.map(item => {
                return <ItemListView key={item.id} 
                                     item={item}
                                     isSelected={item === props.selectedItem}                                     
                                     onClick={(item) => {props.onClick(item)}}></ItemListView>
            })}
        </div>
    );
}

class Explorer extends React.Component {
     
    // constructor
    constructor() {
        super();                

        this.state = {                        
            errors: null
            ,loading: true
            ,itemsMap: null
            ,itemPrefix: ''
            ,selectedItem: null
        };   

        this.grammaticalData = {
            tenses: []
            ,persons: []
            ,conjugationRules: []
            ,verbs: []
        };

        this.loadStartupInfo();        
    }

    // methods
    loadStartupInfo() {
        
        const tensesPromise = fetcher.fetchGrammObjList('tenses');
        const personsPromise = fetcher.fetchGrammObjList('persons');
        const conjugationRulesPromise = fetcher.fetchGrammObjList('conjugationRules');
        const verbsPromise = fetcher.fetchGrammObjList('verbs');

        const allGrammPromises = [tensesPromise ,personsPromise ,conjugationRulesPromise, verbsPromise];                                 
        
        Promise.all(allGrammPromises)
        .then(() => {
            
            tensesPromise.then(tenses => {
                this.grammaticalData.tenses = tenses;
            });
            personsPromise.then(persons => {                
                this.grammaticalData.persons = persons;
            });
            conjugationRulesPromise.then(conjugationRules => {                
                this.grammaticalData.conjugationRules = conjugationRules;
            });
            verbsPromise.then(verbs => {                
                this.grammaticalData.verbs = verbs;
                this.setState({
                    itemsMap: this.grammaticalData.verbs
                });                
            });                    

            this.setState({
                loading: false                
            });
        })        
        .catch(msg => {            
            this.setState({
                loading: false
                ,errors: msg
            });
        });
    }

    isItemMatchingPrefix(item) {
        
        const itemType = item.type;
        const prefix = this.state.itemPrefix.toLowerCase();

        if (!prefix) {
            return true;
        }

        switch (itemType) {
        case 'tense':
            
            const tenseName = item.name.toLowerCase();
            return tenseName.startsWith(prefix);

        case 'person':
            
            const spanishExpression = (!!item.spanishExpression) ? item.spanishExpression.toLowerCase() : '';
            const desc = item.description.toLowerCase();
            return spanishExpression.startsWith(prefix) || 
                   desc.includes(`${prefix}`);

        case 'conjugationRule':
            
            const seperationIndex = item.name.indexOf(':');
            const conjRuleName = item.name.substring(0, seperationIndex)
                                          .toLowerCase();
            const ruleTenseName = item.name.substring(seperationIndex + 1).toLowerCase();

            return conjRuleName.startsWith(prefix) || 
                   ruleTenseName.startsWith(prefix);

        case 'verb':
            const spanishInf = item.spanishInfinative.toLowerCase();
            const englishInf = item.englishInfinative.toLowerCase();
            return spanishInf.startsWith(prefix) || 
                   englishInf.startsWith(prefix) ||
                   englishInf.startsWith(`to ${prefix}`);

        }
    }

    getItemTypeTogglers() {
        return (<span className='item-types-buttons-container'>
                        <h3  className='item-toggler-verb'
                            onClick={e => 
                            {                                
                                this.setState({
                                    itemsMap: this.grammaticalData.verbs
                            })}
                        }>verbs</h3>
                        <h3 className='item-toggler-tense'
                            onClick={e => 
                            {                                
                                this.setState({
                                    itemsMap: this.grammaticalData.tenses
                            })}
                        }>tenses</h3>
                        <h3 className='item-toggler-person'
                            onClick={e => 
                            {                                
                                this.setState({
                                    itemsMap: this.grammaticalData.persons
                            })}
                        }>persons</h3>
                        <h3 className='item-toggler-conjugationRule'
                            onClick={e => 
                            {                                
                                this.setState({
                                    itemsMap: this.grammaticalData.conjugationRules
                            })}
                        }>conjugationRules</h3>
                    </span>);
    }

    getCurrentListItemType() {
        
        const itemsMap = this.state.itemsMap;

        if (!itemsMap)
            return ''

        const items = Object.values(itemsMap);
        return items[0].type;
    }

    selectItem(item) {
           
        const itemMapName = item.type + 's';
        const itemsMap = this.grammaticalData[itemMapName];

        this.setState({
            selectedItem: item
            ,itemsMap: itemsMap
            ,itemPrefix: ''
        });
    }

    updateItem(item) {
        const itemMapName = item.type + 's';
        const itemId = item.id;
        this.grammaticalData[itemMapName][itemId] = item;

        const updatePromise = fetcher.updateGrammObj(item);

        updatePromise.then(updateReturnItem => {
            console.log(`suffesfully updated ${JSON.stringify(updateReturnItem)}`);
        }).catch(msg => {
            console.log(`failed to update ${JSON.stringify(item)}`);
            this.setState({errors: msg});
        });
    }

    render() {   
        
        const items = (!!this.state.itemsMap) ? Object.values(this.state.itemsMap)  : null;
        const matchingItems = (!!items) ? items.filter(i => this.isItemMatchingPrefix(i)) : null;        
        
        return (
                <div className='windowContainer'>                                        
                    {!!this.state.errors && 
                        <div className='errors'>{`error: ${this.state.errors.message}`}</div>
                    }
                    {!this.state.errors && 
                     !this.loading &&
                     !!this.state.itemsMap && 
                     !!matchingItems &&                        
                        <div className='explorer'>
                            {this.getItemTypeTogglers()}
                            <div className='items-menu'>
                                <input id='itemsSearch'
                                    className={`items-search-${this.getCurrentListItemType()}`}
                                    type='text'
                                    onChange={(e) => this.setState({
                                                    itemPrefix: e.target.value
                                                })}/>
                                <ItemsList className='item-list'
                                    items={matchingItems}
                                    selectedItem = {this.state.selectedItem}
                                    onClick={(item) => this.selectItem(item)}></ItemsList>
                            </div>                                            
                        {!!this.state.selectedItem &&                         
                            <div className='item-details-container'>
                                <ItemDetailsView item={this.state.selectedItem}
                                                 grammaticalData={this.grammaticalData}
                                                 onSelectItem={(item) => this.selectItem(item)}
                                                 onUpdateItem={(item) => this.updateItem(item)}></ItemDetailsView>   
                            </div>
                        }                           
                    </div>
                    }
                </div>);
    }
}

// ========================================

ReactDOM.render(
  <Explorer />,
  document.getElementById('root')
);