/* eslint-env node */
/**
 * @author pmeijer / https://github.com/pmeijer
 */
const config = require('./config.dockerworker');


config.plugin.SystemSimulator.simulationTool = 'OpenModelica';
module.exports = config;
