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
    'q',
    'common/util/guid'
], function (PluginConfig,
             pluginMetadata,
             PluginBase,
             Q,
             GUID) {
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
            domainSheetIds = {},
            domainNodes = {};

        let getChildPos = elemCount => {
            return {
                x: 100 + (elemCount % 2 === 0 ? 500 : 0),
                y: 100 * elemCount
            };
        };

        let createComponentNode = cData => {
            let domain = cData.Domain;

            let sheetId = domainSheetIds[domain];
            let domainNode = domainNodes[domain];

            if (!sheetId) {
                logger.info('Domain sheet did not exist - adding it', domain);
                sheetId = 'MetaAspectSet_' + GUID();
                let sheetsRegistry = core.getRegistry(this.rootNode, 'MetaSheets');

                sheetsRegistry.push({
                    SetID: sheetId,
                    order: sheetsRegistry.length,
                    title: domain
                });

                core.setRegistry(this.rootNode, 'MetaSheets', sheetsRegistry);
                core.createSet(this.rootNode, sheetId);

                domainSheetIds[domain] = sheetId;
            }

            if (!domainNode) {
                logger.info('Domain node did not exist - adding it', domain);
                domainNode = core.createNode({
                    parent: this.rootNode,
                    base: this.META.Domain
                });

                core.setAttribute(domainNode, 'name', domain);
                core.setRegistry(domainNode, 'position', {
                    x: 600,
                    y: 100 + (Object.keys(domainNodes).length * 60)
                });

                domainNodes[domain] = domainNode;
            }

            let cNode = core.createNode({
                parent: domainNode,
                base: this.META.ComponentBase
            });

            core.setRegistry(cNode, 'isAbstract', false);

            // Set a good position inside the domain node.
            core.setRegistry(cNode, 'position', getChildPos(core.getChildrenRelids(domainNode).length));

            // Add it to the META nodes.
            core.addMember(this.rootNode, 'MetaAspectSet', cNode);

            // Add it to the META sheet (with a good position)
            core.addMember(this.rootNode, sheetId, cNode);
            core.setMemberRegistry(this.rootNode, sheetId, core.getPath(cNode),
                'position', getChildPos(core.getMemberPaths(this.rootNode, sheetId).length));

            return cNode;
        };

        let addComponent = cData => {
            let uri = cData.ModelicaURI;
            let cNode;

            logger.debug(JSON.stringify(cData, null, 2));
            logger.info('### Adding', uri, '###');

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

                core.setRegistry(pNode, 'isAbstract', false);
                core.setRegistry(pNode, 'position', getChildPos(core.getChildrenRelids(cNode).length));

                core.setAttribute(pNode, 'name', portInfo.name);
            });

        };

        core.getRegistry(this.rootNode, 'MetaSheets')
            .forEach(sheet => {
                domainSheetIds[sheet.title] = sheet.SetID;
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
            .then((res) => {
                return this.project.createBranch('meta_' + Date.now(), res.hash);
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
