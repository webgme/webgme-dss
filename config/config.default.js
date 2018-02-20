/* eslint-env node */
/**
 * @author pmeijer / https://github.com/pmeijer
 */
const config = require('./config.webgme');
const path = require('path');

config.client.appDir = './build';
config.mongo.uri = 'mongodb://127.0.0.1:27017/multi';
config.seedProjects.defaultProject = 'Modelica';
config.plugin.allowServerExecution = true;

// Listing:     /assets/decoratorSVGList.json
// Example:     /assets/DecoratorSVG/Modelica.Electrical.Analog.Basic.Ground.svg
config.visualization.svgDirs = [path.join(__dirname, '../public/assets/DecoratorSVG')];

config.authentication.enable = true;
config.authentication.allowGuests = true;

config.authentication.userManagementPage = require.resolve('webgme-user-management-page');

module.exports = config;
