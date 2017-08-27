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
                             onSelectItem={(item) => props.onSelectItem(item)}
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

    const {items, itemPrefix, itemType, addVerb} = props;      
    const prefix = !!itemPrefix ? itemPrefix.toLowerCase() : '';

    const newVerb = itemType === 'verb'
                    && !!itemPrefix
                    && !items.length
                    &&  (prefix.endsWith('ar') 
                         || prefix.endsWith('er')
                         || prefix.endsWith('ir'));
        
    return ( 
        
            <div className='items-list'>
            {newVerb ?
                <div className='stub-list-view'
                     onClick={e => addVerb(itemPrefix)}>{`add new verb ${itemPrefix.toLowerCase()}?`}</div> 
            :            
                items.map(item => {
                    return <ItemListView key={item.id} 
                                        item={item}
                                        isSelected={item === props.selectedItem}                                     
                                        onClick={(item) => {props.onClick(item)}}></ItemListView>
                })
            }
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
        
    }

    getCurrentListItemType() {
        
        const itemsMap = this.state.itemsMap;

        if (!itemsMap)
            return ''

        const items = Object.values(itemsMap);
        return items[0].type;
    }

    selectItem(selectedItem) {
           
        const itemMapName = selectedItem.type + 's';
        const itemsMap = this.grammaticalData[itemMapName];
        const currListType = this.getCurrentListItemType();
        const itemPrefix = (selectedItem.type == currListType) ? this.state.itemPrefix : '';

        this.setState({selectedItem, itemsMap, itemPrefix});
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

    addVerb(spanishInf) {

        var verbAddPromise = fetcher.addVerb(spanishInf);

        this.setState({
            loading: true
        })

        verbAddPromise.then(verb => {
            
            const verbsPromise = fetcher.fetchGrammObjList('verbs');            

            verbsPromise.then(verbs => {
                this.grammaticalData.verbs = verbs;
                this.selectItem(verb);
                this.setState({
                    loading: false
                    ,itemsMap: verbs});
            })
            
            
        }) 
    }

    handlePageClick() {
        this.setState({
            selectedItem: null,
            itemPrefix: ''            
        })
    }

    render() {   
        
        const { 
            errors
            ,loading
            ,itemPrefix
            ,itemsMap
            ,selectedItem 
        } = this.state;

        const items = (!!itemsMap) ? Object.values(itemsMap)  : null;
        const matchingItems = (!!items) ? items.filter(i => this.isItemMatchingPrefix(i)) : null;        
        const currListType = this.getCurrentListItemType();

        const itemMenu = () => {
            return (
                <div className='items-menu'>
                                    <input id='itemsSearch'
                                        className={`items-search-${currListType}`}
                                        type='text'
                                        value={itemPrefix}
                                        onChange={(e) => this.setState({
                                                        itemPrefix: e.target.value
                                                    })}/>
                                    <ItemsList className='item-list'
                                        items={matchingItems}
                                        itemPrefix={itemPrefix}
                                        selectedItem = {selectedItem}
                                        itemType = {currListType}
                                        addVerb = {(spanishInf) => this.addVerb(spanishInf)}
                                        onClick={(item) => this.selectItem(item)}></ItemsList>
                                </div>        
            );
        }   
        
        const itemTypeTogglers = () => {
            
            const currListType = this.getCurrentListItemType();

            return (
                <span className='item-types-buttons-container'>
                    <h3 className='item-toggler-verb'
                        onClick={e => {                                
                            currListType !== 'verb' && 
                            
                            this.setState({
                                itemsMap: this.grammaticalData.verbs
                                ,itemPrefix: ''
                            });
                        }}>verbs
                    </h3>
                    <h3 className='item-toggler-tense'
                        onClick={e =>  {                                
                            currListType !== 'tense' &&

                            this.setState({
                                itemsMap: this.grammaticalData.tenses
                                ,itemPrefix: ''
                            })
                        }}>tenses
                    </h3>
                    <h3 className='item-toggler-person'
                        onClick={e =>  {                                
                            currListType !== 'person' &&

                            this.setState({
                                itemsMap: this.grammaticalData.persons
                                ,itemPrefix: ''
                            })
                        }}>persons
                    </h3>
                    <h3 className='item-toggler-conjugationRule'
                        onClick={e => 
                        {                                
                            currListType !== 'conjugationRule' &&
                            
                            this.setState({
                                itemsMap: this.grammaticalData.conjugationRules
                                ,itemPrefix: ''
                            });
                        }
                    }>conjugationRules
                    </h3>
                </span>
            );
        }

        return (
            <div className='windowContainer' onClick={e => this.handlePageClick()}>                                        
                { !!errors ? 
                    <div className='errors'>{`error: ${errors.message}`}</div>
                : !!loading ? 
                    <div className='loading'>loading...</div>                    
                : !!this.state.itemsMap &&                                             
                    <div className='explorer' onClick={e => e.stopPropagation()}>
                        {itemTypeTogglers()}
                        {itemMenu()}                                                
                    {!!this.state.selectedItem &&                         
                        <div className='item-details-container'>
                            <ItemDetailsView    item={selectedItem}
                                                grammaticalData={this.grammaticalData}
                                                itemPrefix={itemPrefix}
                                                onSelectItem={(item) => this.selectItem(item)}
                                                onUpdateItem={(item) => this.updateItem(item)}></ItemDetailsView>   
                        </div>
                    }                           
                    </div>                        
                }
            </div>
        );
    }
}

// ========================================

ReactDOM.render(
  <Explorer />,
  document.getElementById('root')
);