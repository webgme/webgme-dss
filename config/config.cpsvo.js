/**
 * @author pmeijer / https://github.com/pmeijer
 */

const config = require('./config.jmod');
const validateConfig = require('webgme-engine/config/validator').validateConfig;

config.authentication.inferredUsersCanCreate = true;
config.authentication.jwt.privateKey = __dirname + '/../../token_keys/private_key';
config.authentication.jwt.publicKey = __dirname + '/../../token_keys/public_key';
config.authentication.allowUserRegistration = false;

validateConfig(config);
module.exports = config;
