/*globals define*/

/**
 * This router takes care of serving the React app index.html when a different path than root is
 * requesting the page.
 * Note that - the mounting point is tied to the routing paths in the react app.
 */

'use strict';

// http://expressjs.com/en/guide/routing.html
var fs = require('fs'),
    path = require('path'),
    express = require('express'),
    router = express.Router(),
    DIST_DIR = path.join(__dirname, '..', '..', '..', 'build');

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
    var logger = middlewareOpts.logger.fork('AppRouter'),
        ensureAuthenticated = middlewareOpts.ensureAuthenticated,
        getUserId = middlewareOpts.getUserId;

    logger.debug('initializing ...');

    // Ensure authenticated can be used only after this rule.
    router.use('*', function (req, res, next) {
        // This header ensures that any failures with authentication won't redirect.
        res.setHeader('X-WebGME-Media-Type', 'webgme.v1');
        next();
    });

    // Use ensureAuthenticated if the routes require authentication. (Can be set explicitly for each route.)
    router.use('*', ensureAuthenticated);

    router.get('/:owner/:name', (req, res) => {
        fs.readFile(path.join(DIST_DIR, 'index.html'), 'utf8', function(err, indexTemplate) {
            if (err) {
                logger.error(err);
                res.sendStatus(404);
            } else {
                res.contentType('text/html');
                res.send(indexTemplate);
            }
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
