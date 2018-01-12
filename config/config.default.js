/*eslint-env node*/
/**
 * @author pmeijer / https://github.com/pmeijer
 */
let config = require('./config.webgme');

config.client.appDir = './build';
config.mongo.uri = 'mongodb://127.0.0.1:27017/multi';

module.exports = config;