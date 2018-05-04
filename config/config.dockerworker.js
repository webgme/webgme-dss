/* eslint-env node */
/**
 * @author pmeijer / https://github.com/pmeijer
 */
const config = require('./config.default');
const validateConfig = require('webgme-engine/config/validator').validateConfig;

config.server.workerManager.path = 'webgme-docker-worker-manager';

// These are the default options - this section can be left out..
config.server.workerManager.options = {
    //dockerode: null, // https://github.com/apocas/dockerode#getting-started
    network: 'bridge',
    image: 'webgme-om-worker',
    maxRunningContainers: 4,
    keepContainersAtFailure: true,
    // TODO: This option does not exist yet..
    plugins: ['SystemSimulator'],
};
config.server.port = 80;
validateConfig(config);
module.exports = config;
