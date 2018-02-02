/*globals*/
/**
 * Takes the output from OpenModelica simulation and massages and puts into json.
 * FIXME: All variables do not have metadata in _info.json
 * FIXME: and all (due to alias) variables do not have time-series in the csv
 * We'll probably have to parse the xml as well..
 * @author pmeijer / https://github.com/pmeijer
 */
let PREFIX = 'Canvas';
let data = require(`./${PREFIX}_info.json`);
let parse = require('csv-parse/lib/sync');
let fs = require('fs');

function reduceMetadata(inputData) {
    let kindsToKep = {
        variable: true,
        'dummy state': true,
        'dummy derivative': true
    };
    delete inputData.format;
    delete inputData.version;
    delete inputData.equations;
    delete inputData.functions;

    let vars = inputData.variables;

    Object.keys(vars)
        .sort()
        .forEach(varName => {
            let kind = vars[varName].kind;
            //console.log(varName, kind);
            if (kindsToKep[kind]) {
                delete vars[varName].source;
            } else {
                delete vars[varName];
            }
        });
}

reduceMetadata(data);

//console.log(data);
//console.log('Number of variables', Object.keys(data.variables).length);

let csvLines = parse(fs.readFileSync(`./${PREFIX}_res.csv`, 'utf8'), {delimiter:','});
let timeSeries = {};
let buckets = [];
let idxMap = {};

csvLines.shift().forEach((variable, idx) => {
    if (variable === 'time' || data.variables[variable]) {
        idxMap[idx] = buckets.length;
        timeSeries[variable] = [];
        buckets.push(timeSeries[variable]);
    }
});

csvLines.forEach(timeStamp => {
    timeStamp.forEach((value, idx) => {
        if (typeof idxMap[idx] === 'number') {
            buckets[idxMap[idx]].push(parseFloat(value));
        }
    });
});

data.timeSeries = timeSeries;

fs.writeFileSync(`./${PREFIX}_res.json`, JSON.stringify(data));




