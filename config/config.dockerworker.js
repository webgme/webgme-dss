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
    image: 'webgme-dss-worker',
    maxRunningContainers: 4,
    keepContainersAtFailure: true,
    pluginToImage: {
        DomainSelector: null,
        ModelCheck: null,
        ModelicaCodeGenerator: null,
        ModelicaDiff: null,
        SeedCreator: null
    },
};

validateConfig(config);
module.exports = config;
