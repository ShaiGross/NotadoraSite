import {settings} from '../config/dev.js'

const srv = settings.grammServer;
const fetcher = {
    fetchGrammObjList: function (grammObjName) {
                
        return new Promise((resolve, reject) => {
            fetch(`${srv}${grammObjName}`)
            .then(res => {
                console.log(res);
                if (res.ok) 
                    return res.json();
                else
                    throw Error(`Couldn't retieve ${grammObjName}`);
            })
            .then(obj => {         
                
                const grammObjMap = obj.reduce((map, val, i) => {
                    val.type = grammObjName.substring(0, grammObjName.length - 1);
                    map[val.id] = val;
                    return map;
                }, {});
                console.log(`${grammObjName}:`);
                console.log(grammObjMap);
                resolve(grammObjMap);
            })
            .catch(msg => {
                reject(msg);                
            });
        });
    }
    ,fetchGrammObjById: function (grammObjName, id) {        
        return new Promise((resolve, reject) => {
            fetch(`${srv}${grammObjName}/${id}`)
            .then(res => {
                if (res.ok) {
                    return res.json();
                }
                else {
                    throw Error(`couldn't fetch obj ${id} from ${grammObjName}`);
                }
            })
            .then(obj => {
                console.log(`fetched obj ${id} from ${grammObjName}`);
                console.log(obj);
                obj.type = grammObjName.substring(0, grammObjName.length - 1);
                resolve(obj);
            })
            .catch(msg => reject(msg));
        });
    }
    ,updateGrammObj: function (grammObj) {

        const grammObjName = grammObj.type + 's';
        const headers = new Headers();        
        const item = JSON.parse(JSON.stringify(grammObj));
        delete item.type;
        const body = JSON.stringify(item);
        headers.append('Content-Type', ' Application/Json');
        headers.append('Content-Length', body.length);
        return new Promise((resolve, reject) => {
            fetch(`${srv}${grammObjName}`, {
                headers: headers,
                body: body,
                method: 'POST'
            }).then(res => {
                if (res.ok) {
                    return res.json()
                }
                else {
                    throw Error(`couldn't update obj ${grammObj.id} in ${grammObjName}`);
                }
            }).catch(msg => reject(msg));
        });
    }
}

export { 
    fetcher 
};