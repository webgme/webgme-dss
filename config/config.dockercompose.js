/*eslint-env node*/
let config = require('./config.jmod'),
    path = require('path');

config.server.port = 8888;

config.mongo.uri = 'mongodb://mongo:27017/multi';

config.server.workerManager.options = {
    webgmeUrl: 'http://webgme:' + config.server.port,
    image: 'dss-worker',
    maxRunningContainers: 10,
    createParams: {
        HostConfig: {
            Memory: 536870912,
            NetworkMode: 'webgme-dss_workers',
        },
    },
};

config.authentication.jwt.privateKey = '/token_keys/private_key';
config.authentication.jwt.publicKey = '/token_keys/public_key';

config.authentication.inferredUsersCanCreate = true;

config.authentication.publicOrganizations.push('demo');

module.exports = config;
