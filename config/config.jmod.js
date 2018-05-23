/*eslint-env node*/
/**
 * @author pmeijer / https://github.com/pmeijer
 */
let config = require('./config.dockerworker'),
    path = require('path');


config.plugin.SystemSimulator.simulationTool = 'JModelica.org';
module.exports = config;
