/*globals define*/
/*jshint node:true*/

/**
 * This router handles creation of new projects and additions/removals of domains in existing ones.
 */

'use strict';

// http://expressjs.com/en/guide/routing.html
const express = require('express'),
    Q = require('q'),
    router = express.Router(),
    CONSTANTS = requireJS('common/Constants'),
    DOMAIN_INFO = require('../../seeds/Modelica/metadata.json');

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
        getUserId = middlewareOpts.getUserId;

    function getNewJWToken(userId, callback) {
        let deferred = Q.defer();

        if (middlewareOpts.gmeConfig.authentication.enable === true) {
            middlewareOpts.gmeAuth.generateJWTokenForAuthenticatedUser(userId)
                .then(deferred.resolve)
                .catch(deferred.reject);
        } else {
            deferred.resolve();
        }

        return deferred.promise.nodeify(callback);
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
        res.json(DOMAIN_INFO);
    });

    router.post('/createProject/:name', function (req, res, next) {
        const userId = getUserId(req);
        let webgmeToken = null;

        logger.info('createProject', req.params.name, req.body);

        getNewJWToken(userId)
            .then(token => {
                let seedProjectParameters = {
                    command: CONSTANTS.SERVER_WORKER_REQUESTS.SEED_PROJECT,
                    webgmeToken: token,
                    type: 'file',
                    seedName: req.body.seed,
                    projectName: req.params.name,
                    kind: 'DSS:' + req.body.domains.join(':')
                };

                webgmeToken = token;

                return Q.ninvoke(swm, 'request', seedProjectParameters);
            })
            .then(result => {
                logger.info(result);
                // TODO: Invoke plugin that filters out domains..
                res.json(result);
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
