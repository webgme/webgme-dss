/*globals*/
/**
 * @author pmeijer / https://github.com/pmeijer
 */

let gmeConfig = require('./config'),
    webgme = require('webgme-engine'),
    mongodb = require('mongodb');

const CONNECTION_ATTEMPT_TIMEOUT = 2000;
let CONNECTION_ATTEMPTS = 10;

const ensureMongdbRunning = () => {
    mongodb.MongoClient.connect(gmeConfig.mongo.uri, (err, client) => {
        if (err) {
            console.log(`${gmeConfig.mongo.uri} not available, will try ${CONNECTION_ATTEMPTS} more times...`);
            CONNECTION_ATTEMPTS -= 1;
            if (CONNECTION_ATTEMPTS <= 0) {
                console.error(`Failed to connect to ${gmeConfig.mongo.uri}`);
                process.exit(42);
            } else {
                setTimeout(ensureMongdbRunning, CONNECTION_ATTEMPT_TIMEOUT);
            }
        } else {
            client.close(() => {
                webgme.addToRequireJsPaths(gmeConfig);
                const myServer = new webgme.standaloneServer(gmeConfig);
                myServer.start(function () {
                    //console.log('server up');
                });
            });
        }
    });
};

ensureMongdbRunning();
