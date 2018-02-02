/*globals define*/
/*jshint node:true*/

/**
 * This router handles creation of new projects and additions/removals of domains in
 * existing ones.
 */

'use strict';

// http://expressjs.com/en/guide/routing.html
const express = require('express'),
    Q = require('q'),
    router = express.Router(),
    CONSTANTS = requireJS('common/Constants'),
    SEED_INFO = require('../../seeds/Modelica/metadata.json');

function getDomainTagName(previousVersion) {
    return 'Domain_' + SEED_INFO.version + '_' + (previousVersion + 1);
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

    function getNewJWToken(userId) {
        if (middlewareOpts.gmeConfig.authentication.enable === true) {
            return middlewareOpts.gmeAuth.generateJWTokenForAuthenticatedUser(userId);
        } else {
            return Q();
        }
    }

    logger.debug('initializing ...');

    // Ensure authenticated can be used only after this rule.
    router.use('*', function (req, res, next) {
        // TODO: set all headers, check rate limit, etc.

        // This header ensures that any failures with authentication won't redirect.
        res.setHeader('X-WebGME-Media-Type', 'webgme.v1');
        next();
    });

    // Use ensureAuthenticated if the routes require authentication. (Can be set explicitly for each route.)
    router.use('*', ensureAuthenticated);

    router.get('/seedInfo', function (req, res/*, next*/) {
        res.json(SEED_INFO);
    });


    router.post('/createProject', function (req, res, next) {
        const userId = getUserId(req);
        let webgmeToken = null,
            returnData = {
                projectId: null
            };

        /*
        * body  {
        *  projectName: 'MyProject',
        *  domains: ['Modelica.Electrical.Analog']
        * }
        */
        logger.info('createProject', req.body);

        getNewJWToken(userId)
            .then(token => {
                req.body.domains.forEach((domain) => {
                    if (!SEED_INFO.domains.includes(domain)) {
                        throw new Error('Selected domain [' + domain + '] not available in seed!');
                    }
                });

                let seedProjectParameters = {
                    command: CONSTANTS.SERVER_WORKER_REQUESTS.SEED_PROJECT,
                    webgmeToken: token,
                    type: 'file',
                    seedName: 'Modelica',
                    projectName: req.body.projectName,
                    branchName: 'master',
                    kind: 'DSS:' + req.body.domains.join(':')
                };

                webgmeToken = token;
                logger.info('Seeding', seedProjectParameters);
                return Q.ninvoke(swm, 'request', seedProjectParameters);
            })
            .then(result => {
                let pluginParameters = {
                    command: CONSTANTS.SERVER_WORKER_REQUESTS.EXECUTE_PLUGIN,
                    webgmeToken: webgmeToken,
                    name: 'DomainSelector',
                    context: {
                        managerConfig: {
                            project: result.projectId,
                            activeNode: '',
                            commitHash: result.commitHash,
                            branchName: 'master'
                        },
                        pluginConfig: {
                            domains: req.body.domains.join(':'),
                            tagName: getDomainTagName(0),
                            baseHash: result.commitHash
                        }
                    }
                };

                returnData.projectId = result.projectId;
                logger.info('seed result', result);
                logger.info('Selecting domains', pluginParameters);
                return Q.ninvoke(swm, 'request', pluginParameters);
            })
            .then(result => {
                logger.info('plugin result', result);

                res.json(returnData);
            })
            .catch(err => {
                logger.error(err);
                next(err);
            });
    });

    router.post('/updateProject', function (req, res, next) {
        const userId = getUserId(req);
        let webgmeToken = null,
            latestVersion = 0,
            baseHash,
            returnData;

        /*
        * body  {
        *  projectId: 'guest+MyProject',
        *  domains: ['Modelica.Electrical.Analog'],
        *  branchName: 'master'
        * }
        */
        logger.info('updateProject', req.body);

        getNewJWToken(userId)
            .then(token => {
                req.body.domains.forEach((domain) => {
                    if (!SEED_INFO.domains.includes(domain)) {
                        throw new Error('Selected domain [' + domain + '] not available in seed!');
                    }
                });

                webgmeToken = token;

                return safeStorage.getTags({
                    projectId: req.body.projectId,
                    username: userId
                });
            })
            .then(tags => {
                for (let tag in tags) {
                    // tag = "Domain_1_2"
                    if (tag.startsWith('Domain_') === false) {
                        continue;
                    }

                    let version = parseInt(tag.split('_')[2], 10);

                    if (version > latestVersion) {
                        latestVersion = version;
                        // TODO: With multiple branches the baseHash should be a tag in its history.
                        baseHash = tags[tag];
                    }
                }

                if (latestVersion === 0) {
                    throw new Error('No Domain tags existed! Cannot update domains for this project.');
                }

                let updateProjectParameters = {
                    command: CONSTANTS.SERVER_WORKER_REQUESTS.UPDATE_PROJECT_FROM_FILE,
                    webgmeToken: webgmeToken,
                    seedName: 'Modelica',
                    projectId: req.body.projectId,
                    commitHash: baseHash
                };

                return Q.ninvoke(swm, 'request', updateProjectParameters);
            })
            .then(result => {
                let pluginParameters = {
                    command: CONSTANTS.SERVER_WORKER_REQUESTS.EXECUTE_PLUGIN,
                    webgmeToken: webgmeToken,
                    name: 'DomainSelector',
                    context: {
                        managerConfig: {
                            project:  req.body.projectId,
                            activeNode: '',
                            commitHash: result.hash,
                            branchName: 'master'
                        },
                        pluginConfig: {
                            domains: req.body.domains.join(':'),
                            tagName: getDomainTagName(latestVersion),
                            baseHash: baseHash
                        }
                    }
                };

                returnData = result;
                logger.info('update result', result);
                return Q.ninvoke(swm, 'request', pluginParameters);
            })
            .then(result => {
                logger.info('plugin result', result);
                return gmeAuth.metadataStorage.updateProjectInfo(req.body.projectId, {
                    kind: 'DSS:' + req.body.domains.join(':')
                });
            })
            .then(() => {
                res.json(returnData);
            })
            .catch(err => {
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
    initialize: initialize,
    router: router,
    start: start,
    stop: stop
};
