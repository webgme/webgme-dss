/*globals*/
/**
 * @author pmeijer / https://github.com/pmeijer
 */

let gmeConfig = require('./config'),
    webgme = require('webgme-engine'),
    myServer;

webgme.addToRequireJsPaths(gmeConfig);

myServer = new webgme.standaloneServer(gmeConfig);
myServer.start(function () {
    //console.log('server up');
});