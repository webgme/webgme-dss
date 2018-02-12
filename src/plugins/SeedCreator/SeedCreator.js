/*globals define*/
/*eslint-env node, browser*/

/**
 * This plugin reads the output from py_modelica exporter and imports the
 * components and adds them to the meta-model.
 */

define([
    'plugin/PluginConfig',
    'text!./metadata.json',
    'plugin/PluginBase',
    'q'
], function (PluginConfig,
             pluginMetadata,
             PluginBase,
             Q) {
    'use strict';

    let path = require('path'),
        fs = require('fs');

    pluginMetadata = JSON.parse(pluginMetadata);

    /**
     * Initializes a new instance of SeedCreator.
     * @class
     * @augments {PluginBase}
     * @classdesc This class represents the plugin SeedCreator.
     * @constructor
     */
    function SeedCreator() {
        // Call base class' constructor.
        PluginBase.call(this);
        this.pluginMetadata = pluginMetadata;
    }

    /**
     * Metadata associated with the plugin. Contains id, name, version, description, icon, configStructue etc.
     * This is also available at the instance at this.pluginMetadata.
     * @type {object}
     */
    SeedCreator.metadata = pluginMetadata;

    // Prototypical inheritance from PluginBase.
    SeedCreator.prototype = Object.create(PluginBase.prototype);
    SeedCreator.prototype.constructor = SeedCreator;

    /**
     * Main function for the plugin to execute. This will perform the execution.
     * Notes:
     * - Always log with the provided logger.[error,warning,info,debug].
     * - Do NOT put any user interaction logic UI, etc. inside this method.
     * - callback always has to be called even if error happened.
     *
     * @param {function(Error|null, plugin.PluginResult)} callback - the result callback
     */
    SeedCreator.prototype.main = function (callback) {
        let config = this.getCurrentConfig(),
            logger = this.logger,
            core = this.core,
            domainSheetMap = {},
            domainNodes = {};

        let createComponentNode = cData => {
            let domain = cData.Domain;
            if (!domainSheetMap[domain]) {
                logger.info('TODO: Domain sheet did not exist - adding it', domain);
            }

            if (!domainNodes[domain]) {
                logger.info('TODO: Domain node did not exist - adding it', domain);
            }

            let cNode = core.createNode({
                parent: domainNodes[domain],
                base: this.META.ComponentBase
            });
            // Set a good position in domain node.

            // Add it to the META nodes.

            // Add it to the META sheet (with a good position).


            return cNode;
        };

        let addComponent = cData => {
            let uri = cData.ModelicaURI;
            let cNode;

            if (this.META.hasOwnProperty(uri)) {
                logger.info('Component existed', uri);
                cNode = this.META[uri];
                if (!config.update) {
                    logger.info('Update false so will recreate it!');
                    core.deleteNode(cNode);
                    cNode = createComponentNode(cData);
                }
            } else {
                logger.info('Component did not exist, will create it', uri);
                cNode = createComponentNode(cData);
            }

            // Set the inherited attributes.
            core.setAttribute(cNode, 'name', uri);
            core.setAttribute(cNode, 'ModelicaURI', uri);
            core.setAttribute(cNode, 'ShortName', cData.ShortName);

            // Add the parameters as attributes.
            cData.parameters.forEach(paramInfo => {
                core.setAttributeMeta(cNode, paramInfo.name, paramInfo.desc);
                core.setAttribute(cNode, paramInfo.name, paramInfo.value);
            });

            // Add the ports.
            cData.ports.forEach((portInfo, idx) => {
                if (this.META.hasOwnProperty(portInfo.type) === false) {
                    throw new Error('Port type does not exist ' + portInfo.type + ' at component ' + uri);
                }

                // TODO: How to handle existing nodes here?
                // Load the nodes and then setBase?
                let pNode = core.createNode({
                    base: this.META[portInfo.type],
                    parent: cNode
                });

                let pos = {
                    x: 100 + (idx % 2 === 1 ? 500 : 0),
                    y: 100 + (idx * 100)
                };

                logger.info('Generated position port in ', uri, JSON.stringify(pos));
                core.setRegistry(pNode, 'position', pos);

                core.setAttribute(pNode, 'name', portInfo.name);
            });

            logger.info(JSON.stringify(cData, null, 2));

        };

        core.getRegistry(this.rootNode, 'MetaSheets')
            .forEach(sheet => {
                domainSheetMap[sheet.title] = sheet.SetID;
            });

        Q.all([
            this.core.loadInstances(this.META.Domain),
            this.loadJsonFile(config.file)
        ])
            .then((res) => {
                res[0].forEach(domainNode => {
                    domainNodes[core.getAttribute(domainNode, 'name')] = domainNode;
                });

                res[1].forEach(addComponent);
            })
            .then(() => {
                this.branchName = null;
                return this.save('Updating model');
            })
            .then(() => {
                logger.info('Done!');
                this.result.setSuccess(true);
                callback(null, this.result);
            })
            .catch(err => {
                // Result success is false at invocation.
                logger.error(err.stack);
                callback(err, this.result);
            });
    };

    SeedCreator.prototype.loadJsonFile = function (hashOrPath, callback) {
        if (hashOrPath.endsWith('.json')) {
            let deferred = Q.defer();

            try {
                deferred.resolve(JSON.parse(fs.readFileSync(hashOrPath, 'utf8')));
            } catch (e) {
                deferred.reject(e);
            }

            return deferred.promise.nodeify(callback);
        } else {
            return this.blobClient.getObjectAsJSON(hashOrPath).nodeify(callback);
        }
    };

    return SeedCreator;
});
