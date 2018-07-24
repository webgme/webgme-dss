/*eslint-env node*/
/**
 * @author pmeijer / https://github.com/pmeijer
 * See Dockerfile of how to build the image.
 * To launch container:
 *  docker run -d -p 80:80 -v ~/dockershare:/dockershare -e NODE_ENV='devdep' -e MONGO_IP='172.17.0.1' webgme-server
 *
 * To get hold of the MONGO_IP use (granted the default bridge is used)
 *  docker network inspect bridge
 *
 * Make sure mongo is exposed at host port 27017 and look for the ip at IPAM.Config[0].Gateway (e.g. 172.17.0.1)
 *
 * 1) This run authentication with unsafe keys
 * 2) The webgme-server runs inside a docker container
 * 3) JModelica.org is a docker-worker
 */
let config = require('./config.default'),
    path = require('path');

config.blob.fsDir = '/dockershare/blob-local-storage';

config.mongo.uri = 'mongodb://' + process.env.MONGO_IP + ':27017/multi';

config.server.port = 80;

config.plugin.ModiaCodeGenerator.enable = true;

module.exports = config;
