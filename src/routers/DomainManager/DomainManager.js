/* globals requireJS */

/**
 * This router handles creation of new projects and additions/removals of domains in
 * existing ones.
 */

// http://expressjs.com/en/guide/routing.html
const express = require('express');
const Q = require('q');

const router = express.Router();
const CONSTANTS = requireJS('common/Constants');
const SEED_INFO = require('../../seeds/Modelica/metadata.json');

function getDomainTagName(previousVersion) {
    return `Domain_${SEED_INFO.version}_${previousVersion + 1}`;
}

/**
 * Called when the server is created but before it starts to listening to incoming requests.
 * N.B. gmeAuth, safeStorage and workerManager are not ready to use until the start function is called.
 * (However inside an incoming request they are all ensured to have been initialized.)
 *
 * @param {object} middlewareOpts - Passed by the webgme server.
 * @param {GmeConfig} middlewareOpts.gmeConfig - GME config parameters.
 * @param {GmeLogger} middlewareOpts.logger - logger
 * @param {function} middlewareOpts.ensureAuthenticated - Ensures the user is authenticated.
 * @param {function} middlewareOpts.getUserId - If authenticated retrieves the userId from the request.
 * @param {object} middlewareOpts.gmeAuth - Authorization module.
 * @param {object} middlewareOpts.safeStorage - Accesses the storage and emits events (PROJECT_CREATED, COMMIT..).
 * @param {object} middlewareOpts.workerManager - Spawns and keeps track of "worker" sub-processes.
 */
function initialize(middlewareOpts) {
    let logger = middlewareOpts.logger.fork('DomainManager'),
        ensureAuthenticated = middlewareOpts.ensureAuthenticated,
        swm = middlewareOpts.workerManager,
        safeStorage = middlewareOpts.safeStorage,
        gmeAuth = middlewareOpts.gmeAuth,
        getUserId = middlewareOpts.getUserId;

    let ongoingUpdates = {

    };

    function getNewJWToken(userId) {
        if (middlewareOpts.gmeConfig.authentication.enable === true) {
            return middlewareOpts.gmeAuth.generateJWTokenForAuthenticatedUser(userId);
        }

        return Q();
    }

    logger.debug('initializing ...');

    // Ensure authenticated can be used only after this rule.
    router.use('*', (req, res, next) => {
        // TODO: set all headers, check rate limit, etc.

        // This header ensures that any failures with authentication won't redirect.
        res.setHeader('X-WebGME-Media-Type', 'webgme.v1');
        next();
    });

    // Use ensureAuthenticated if the routes require authentication. (Can be set explicitly for each route.)
    router.use('*', ensureAuthenticated);

    router.get('/seedInfo', (req, res) => {
        res.json(SEED_INFO);
    });


    router.post('/createProject', (req, res, next) => {
        const userId = getUserId(req);
        let webgmeToken = null;
        const returnData = {
            projectId: null,
        };

        /*
        * body  {
        *  projectName: 'MyProject',
        *  domains: ['Modelica.Electrical.Analog']
        * }
        */
        logger.debug('createProject', req.body);

        getNewJWToken(userId)
            .then((token) => {
                req.body.domains.forEach((domain) => {
                    if (!SEED_INFO.domains.includes(domain)) {
                        throw new Error(`Selected domain [${domain}] not available in seed!`);
                    }
                });

                const seedProjectParameters = {
                    command: CONSTANTS.SERVER_WORKER_REQUESTS.SEED_PROJECT,
                    webgmeToken: token,
                    type: 'file',
                    seedName: 'Modelica',
                    projectName: req.body.projectName,
                    branchName: 'master',
                    kind: `DSS:${req.body.domains.join(':')}`,
                };

                webgmeToken = token;
                logger.debug('Seeding', seedProjectParameters);
                return Q.ninvoke(swm, 'request', seedProjectParameters);
            })
            .then((result) => {
                const pluginParameters = {
                    command: CONSTANTS.SERVER_WORKER_REQUESTS.EXECUTE_PLUGIN,
                    webgmeToken,
                    name: 'DomainSelector',
                    context: {
                        managerConfig: {
                            project: result.projectId,
                            activeNode: '',
                            commitHash: result.commitHash,
                            branchName: 'master',
                        },
                        pluginConfig: {
                            domains: req.body.domains.join(':'),
                            tagName: getDomainTagName(0),
                            baseHash: result.commitHash,
                        },
                    },
                };

                returnData.projectId = result.projectId;
                logger.debug('seed result', result);
                logger.debug('Selecting domains', pluginParameters);
                return Q.ninvoke(swm, 'request', pluginParameters);
            })
            .then((result) => {
                logger.debug('plugin result', result);

                res.json(returnData);
            })
            .catch((err) => {
                logger.error(err);
                next(err);
            });
    });

    router.post('/updateProject', (req, res, next) => {
        const userId = getUserId(req);
        let webgmeToken = null;
        let latestVersion = 0;
        let baseHash;
        let returnData;

        /*
        * body  {
        *  projectId: 'guest+MyProject',
        *  domains: ['Modelica.Electrical.Analog'],
        *  branchName: 'master'
        * }
        */
        logger.debug('updateProject', req.body);

        getNewJWToken(userId)
            .then((token) => {
                if (typeof req.body.projectId !== 'string' && !(req.body.domains instanceof Array)) {
                    throw new Error(`Invalid body in post request: ${JSON.stringify(req.body)}`);
                }

                if (ongoingUpdates[req.body.projectId]) {
                    throw new Error('Already updating domains for project');
                }

                ongoingUpdates[req.body.projectId] = true;

                req.body.domains.forEach((domain) => {
                    if (!SEED_INFO.domains.includes(domain)) {
                        throw new Error(`Selected domain [${domain}] not available in seed!`);
                    }
                });

                webgmeToken = token;

                return safeStorage.getTags({
                    projectId: req.body.projectId,
                    username: userId,
                });
            })
            .then((tags) => {
                Object.keys(tags)
                    .forEach((tag) => {
                        // tag = "Domain_1_2"
                        if (tag.startsWith('Domain_')) {
                            const version = parseInt(tag.split('_')[2], 10);

                            if (version > latestVersion) {
                                latestVersion = version;
                                baseHash = tags[tag];
                            }
                        }
                    });

                if (latestVersion === 0) {
                    throw new Error('No Domain tags existed! Cannot update domains for this project.');
                }

                const updateProjectParameters = {
                    command: CONSTANTS.SERVER_WORKER_REQUESTS.UPDATE_PROJECT_FROM_FILE,
                    webgmeToken,
                    seedName: 'Modelica',
                    projectId: req.body.projectId,
                    commitHash: baseHash,
                };

                return Q.ninvoke(swm, 'request', updateProjectParameters);
            })
            .then((result) => {
                const pluginParameters = {
                    command: CONSTANTS.SERVER_WORKER_REQUESTS.EXECUTE_PLUGIN,
                    webgmeToken,
                    name: 'DomainSelector',
                    context: {
                        managerConfig: {
                            project: req.body.projectId,
                            activeNode: '',
                            commitHash: result.hash,
                            branchName: 'master',
                        },
                        pluginConfig: {
                            domains: req.body.domains.join(':'),
                            tagName: getDomainTagName(latestVersion),
                            baseHash,
                        },
                    },
                };

                returnData = result;
                logger.debug('update result', result);
                return Q.ninvoke(swm, 'request', pluginParameters);
            })
            .then((result) => {
                logger.debug('plugin result', result);
                return gmeAuth.metadataStorage.updateProjectInfo(req.body.projectId, {
                    kind: `DSS:${req.body.domains.join(':')}`,
                });
            })
            .then(() => {
                delete ongoingUpdates[req.body.projectId];
                res.json(returnData);
            })
            .catch((err) => {
                delete ongoingUpdates[req.body.projectId];
                logger.error(err);
                next(err);
            });
    });
}

/**
 * Called before the server starts listening.
 * @param {function} callback
 */
function start(callback) {
    callback();
}

/**
 * Called after the server stopped listening.
 * @param {function} callback
 */
function stop(callback) {
    callback();
}


module.exports = {
    initialize,
    router,
    start,
    stop,
};
