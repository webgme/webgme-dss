/*eslint-env node*/
/**
 * @author pmeijer / https://github.com/pmeijer
 */
let config = require('./config.webgme'),
    path = require('path');

config.client.appDir = './build';
config.mongo.uri = 'mongodb://127.0.0.1:27017/multi';
config.seedProjects.defaultProject = 'Modelica';

// Listing:     /assets/decoratorSVGList.json
// Example:     /assets/DecoratorSVG/Modelica.Electrical.Analog.Basic.Ground.svg
config.visualization.svgDirs = [path.join(__dirname, '..', 'msl_icons')];

module.exports = config;