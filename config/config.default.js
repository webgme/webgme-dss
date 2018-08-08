/* eslint-env node */
/**
 * @author pmeijer / https://github.com/pmeijer
 */
const config = require('./config.webgme');
const path = require('path');

config.client.appDir = './public';
config.mongo.uri = 'mongodb://127.0.0.1:27017/multi';
config.seedProjects.defaultProject = 'Modelica';
config.plugin.allowServerExecution = true;
config.plugin.SystemSimulator = {
    simulationTool: 'Only Code Generation',
};

config.plugin.ModiaCodeGenerator = {
    enable: false,
};

// Listing:     /assets/decoratorSVGList.json
// Example:     /assets/DecoratorSVG/Modelica.Electrical.Analog.Basic.Ground.svg
config.visualization.svgDirs = [path.join(__dirname, '../assets/DecoratorSVG')];

config.authentication.enable = true;
config.authentication.allowGuests = true;

config.authentication.userManagementPage = require.resolve('webgme-user-management-page');

module.exports = config;
