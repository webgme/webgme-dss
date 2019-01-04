/*eslint-env node*/
let config = require('./config.jmod'),
    path = require('path');

config.server.port = 8888;

config.mongo.uri = 'mongodb://mongo:27017/multi';

config.plugin.ModiaCodeGenerator.enable = true;

config.server.workerManager.options = {
    webgmeUrl: 'http://webgme:' + config.server.port,
    image: 'dss-worker',
    maxRunningContainers: 10,
    createParams: {
        HostConfig: {
            Memory: 536870912,
            NetworkMode: 'webgme-dss_workers'
        }
    }
};

module.exports = config;
