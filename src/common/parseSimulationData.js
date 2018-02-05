/*globals*/
/**
 * Takes the output from OpenModelica simulation and massages and puts into json.
 * FIXME: All variables do not have metadata in _info.json
 * FIXME: and all (due to alias) variables do not have time-series in the csv
 * We'll probably have to parse the xml as well..
 * @author pmeijer / https://github.com/pmeijer
 */
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

function getTimeSeriesFromFile(filePath, data) {
    let csvLines = parse(fs.readFileSync(filePath, 'utf8'), {delimiter:','});
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

    return timeSeries;
}

/**
 * Generates a json file with variable data and time-series from an OpenModelica Simulation
 * @param {string} fileBasePath - Base name of simulation <directory>/<modelName>
 * @param {string} [outputFile=<fileBasePath>_res.json]
 * @returns {string}
 */
function generateInfoFile(fileBasePath, outputFile) {
    let data = JSON.parse(fs.readFileSync(`${fileBasePath}_info.json`, 'utf8'));

    reduceMetadata(data);
    data.timeSeries = getTimeSeriesFromFile(`${fileBasePath}_res.csv`, data);

    outputFile = outputFile || `${fileBasePath}_res.json`;
    fs.writeFileSync(`${fileBasePath}_res.json`, JSON.stringify(data));

    return outputFile;
}

if (typeof module !== 'undefined') {
    module.exports = {
        generateInfoFile: generateInfoFile,
        reduceMetadata: reduceMetadata,
        getTimeSeriesFromFile: getTimeSeriesFromFile,
    };

    if (require.main === module) {
        let PREFIX = 'Tes';
        generateInfoFile(`../scripts/${PREFIX}`);
    }
} else if (typeof define === 'function') {
    define([], function () {
        return {
            generateInfoFile: generateInfoFile,
            reduceMetadata: reduceMetadata,
            getTimeSeriesFromFile: getTimeSeriesFromFile,
        };
    });
}




