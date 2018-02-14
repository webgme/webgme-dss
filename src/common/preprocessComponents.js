/*globals*/
/**
 * Reads in the components.json generated from py_modelica_exporters and
 * generates a format more suitable for webgme import.
 * @author pmeijer / https://github.com/pmeijer
 */
let fs = require('fs'),
    path = require('path'),
    SEED_INFO = require('../seeds/Modelica/metadata.json');


let PARAM_TYPES = {
    Real: 'float',
    Boolean: 'boolean',
    Integer: 'integer'
};

function parseReal(val) {
    let res = {
        isValid: false,
        value: parseFloat(val)
    };

    if (isNaN(res.value) === false && val.indexOf(' ') === -1) {
        res.isValid = true;
    }

    return res;
}

function parseInteger(val) {
    let res = {
        isValid: false,
        value: parseInt(val, 10)
    };

    if (isNaN(res.value) === false &&
        val.indexOf(' ') === -1 &&
        val.indexOf('abs') === -1 &&
        val.indexOf('Modelica') === -1 &&
        val.indexOf('{') === -1 &&
        val.indexOf('(') === -1) {
        res.isValid = true;
    }

    return res;
}

function prepComponents(filePath) {
    let components = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    let stats = {
        interfaces: {},
        parameters: {},
        extendsInfo: {}
    };

    let flatComponents = [];

    components.forEach(compInfo => {
        let ModelicaURI = compInfo.exportedComponentClass;
        let res = {
            ModelicaURI: ModelicaURI,
            ShortName: ModelicaURI.split('.').pop(),
            Domain: SEED_INFO.domains.filter(domain => {
                return ModelicaURI.indexOf(domain) === 0;
            })[0],
            ports: [],
            parameters: []
        };

        if (!res.Domain) {
            throw new Error('Domain does not exist for ' + ModelicaURI);
        }

        compInfo.components.forEach(partCompInfo => {
            // Connectors/Interfaces
            partCompInfo.connectors.forEach(connInfo => {
                let uri = connInfo.fullName;
                let resolvedPort = SEED_INFO.portMap[uri];
                if (!stats.interfaces[uri]) {
                    stats.interfaces[uri] = [];
                }

                if (!resolvedPort) {
                    throw new Error('Port type not in map ' + JSON.stringify(connInfo));
                }

                stats.interfaces[uri].push(ModelicaURI);

                res.ports.push({
                    type: SEED_INFO.portMap[uri],
                    name: connInfo.name
                });
            });

            partCompInfo.parameters
                .filter((paramInfo) => {
                    return paramInfo.isPublic;
                })
                .forEach(paramInfo => {
                    let uri = paramInfo.fullName;
                    let add = false;
                    let parameter = {
                        name: paramInfo.name,
                        value: null,
                        desc: {
                            type: 'string',
                            description: paramInfo.description,
                            unit: paramInfo.modifiers.unit
                        }
                    };

                    if (uri === 'Boolean') {
                        parameter.value = paramInfo.value === 'true';
                        parameter.desc.type = 'boolean';
                        add = true;
                    } else if (uri === 'Integer') {
                        if (paramInfo.dimension === 0) {
                            parameter.value = 1; // We'll use 1 as default value
                            parameter.desc.type = 'integer';
                            add = true;
                        } else if (paramInfo.dimension === 1) {
                            let vInfo = parseInteger(paramInfo.value);
                            add = vInfo.isValid;
                            parameter.desc.type = 'integer';
                            parameter.value = vInfo.value;
                        } else {
                            add = true;
                            parameter.desc.type = 'string';
                            parameter.value = paramInfo.value;
                        }
                    } else if (uri === 'Real') {
                        if (paramInfo.dimension === 0) {
                            parameter.value = 1; // We'll use 1 as default value
                            parameter.desc.type = 'float';
                            add = true;
                        } else if (paramInfo.dimension === 1) {
                            let vInfo = parseReal(paramInfo.value);
                            add = vInfo.isValid;
                            parameter.desc.type = 'float';
                            parameter.value = vInfo.value;
                        } else {
                            add = true;
                            parameter.desc.type = 'string';
                            parameter.value = paramInfo.value;
                        }
                    } else {
                        console.log('Skipping parameter for', ModelicaURI, paramInfo);
                    }

                    if (add) {
                        res.parameters.push(parameter);
                    }

                    if (uri === 'Real') {
                        uri = 'Real_' + paramInfo.dimension;
                    }

                    if (uri === 'Integer') {
                        uri = 'Integer_' + paramInfo.dimension;
                    }

                    if (!stats.parameters[uri]) {
                        stats.parameters[uri] = [];
                    }

                    stats.parameters[uri].push(paramInfo.value);
                });

            partCompInfo.extends.forEach(extendsInfo => {
                let uri = extendsInfo.fullName;

                if (Object.keys(extendsInfo.modifiers).length > 0 ||
                    extendsInfo.redeclare_parameters.length > 0 ||
                    extendsInfo.parameters.length > 0) {

                    if (!stats.extendsInfo[uri]) {
                        stats.extendsInfo[uri] = [];
                    }

                    stats.extendsInfo[uri].push({componentUri: ModelicaURI, extendsInfo: extendsInfo});
                }
            });
        });

        flatComponents.push(res);
    });

    fs.writeFileSync('comp_stats.json', JSON.stringify(stats));
    fs.writeFileSync('comp_flat.json', JSON.stringify(flatComponents));
}

if (typeof module !== 'undefined') {
    module.exports = {
        prepComponents: prepComponents,
    };

    if (require.main === module) {
        prepComponents(path.join(__dirname, '../../scripts/py_modelica_exporter/components.json'));
    }
} else if (typeof define === 'function') {
    define([], function () {
        return {
            prepComponents: prepComponents,
        };
    });
}




