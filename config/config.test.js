/*eslint-env node*/
/**
 * @author pmeijer / https://github.com/pmeijer
 */
let config = require('./config.default');

config.mongo.uri = 'mongodb://127.0.0.1:27017/dss-test';

module.exports = config;