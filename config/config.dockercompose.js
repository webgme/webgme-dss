/*eslint-env node*/
let config = require('./config.jmod'),
    path = require('path');

config.server.port = 8888;

config.mongo.uri = `mongodb://${process.env.MONGO_IP}:27017/multi`;

config.plugin.ModiaCodeGenerator.enable = true;

config.server.workerManager.options.webgmeUrl = `http://${process.env.WEBGME_IP}:${config.server.port}`;
config.server.workerManager.options.image = 'webgme-dss_webgme-dss-worker';

module.exports = config;
