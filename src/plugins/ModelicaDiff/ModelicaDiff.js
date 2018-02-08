/*globals define*/
/*eslint-env node, browser*/

/**
 * Generated by PluginGenerator 2.16.0 from webgme on Wed Feb 07 2018 14:29:28 GMT-0600 (Central Standard Time).
 * A plugin that inherits from the PluginBase. To see source code documentation about available
 * properties and methods visit %host%/docs/source/PluginBase.html.
 */

define([
    'plugin/PluginConfig',
    'text!./metadata.json',
    'plugin/PluginBase',
    'common/util/random',
    'q'
], function (PluginConfig,
             pluginMetadata,
             PluginBase,
             RANDOM,
             Q) {
    'use strict';

    pluginMetadata = JSON.parse(pluginMetadata);

    /**
     * Initializes a new instance of ModelicaDiff.
     * @class
     * @augments {PluginBase}
     * @classdesc This class represents the plugin ModelicaDiff.
     * @constructor
     */
    var ModelicaDiff = function () {
        // Call base class' constructor.
        PluginBase.call(this);
        this.pluginMetadata = pluginMetadata;
    };

    /**
     * Metadata associated with the plugin. Contains id, name, version, description, icon, configStructue etc.
     * This is also available at the instance at this.pluginMetadata.
     * @type {object}
     */
    ModelicaDiff.metadata = pluginMetadata;

    // Prototypical inheritance from PluginBase.
    ModelicaDiff.prototype = Object.create(PluginBase.prototype);
    ModelicaDiff.prototype.constructor = ModelicaDiff;

    ModelicaDiff.prototype._getPortMap = function (core, node) {
        var metaNodes = core.getAllMetaNodes(node, true),
            metaNode = core.getMetaType(node),
            portPaths = core.getChildrenPaths(metaNode),
            paths2names = {};

        portPaths.forEach(function (path) {
            paths2names[path] = core.getAttribute(metaNodes[path], 'name');
        });

        return paths2names;
    };

    ModelicaDiff.prototype.gatherModelChanges = function (core, oldRoot, newRoot, diff) {
        var self = this,
            deferred = Q.defer(),
            oldRelids, newRelids, changes = {};

        Q.all([core.loadByPath(oldRoot, '/Z'), core.loadByPath(newRoot, '/Z')])
            .then(function (models) {
                var i, promises = [];

                oldRelids = core.getChildrenRelids(models[0]);
                newRelids = core.getChildrenRelids(models[1]);

                i = oldRelids.length;
                while (i--) {
                    if (diff[oldRelids[i]] === undefined) {
                        oldRelids.splice(i, 1);
                    }
                }

                i = newRelids.length;
                while (i--) {
                    if (diff[newRelids[i]] === undefined) {
                        newRelids.splice(i, 1);
                    }
                }

                for (i = 0; i < oldRelids.length; i += 1) {
                    promises.push(core.loadByPath(models[0], '/' + oldRelids[i]));
                }

                for (i = 0; i < newRelids.length; i += 1) {
                    promises.push(core.loadByPath(models[1], '/' + newRelids[i]));
                }

                return Q.all(promises);
            })
            .then(function (children) {
                var i, childDiff, names, key,
                    oldName2id = {},
                    newName2id = {},
                    oldNodes = {},
                    newNodes = {},
                    oldConnections = {},
                    newConnections = {};

                for (i = 0; i < oldRelids.length; i += 1) {
                    if (core.isConnection[children[i]]) {
                        key = oldConnections[core.getPointerPath(children[i], 'src')];
                        oldConnections[key] = oldConnections[key] || [];
                        oldConnections[key].push(core.getPointerPath(children[i], 'dst'));
                    } else {
                        key = core.getAttribute(children[i], 'name');
                        oldName2id[key] = core.getPath(children[i]);
                        oldNodes[key] = children[i];
                    }
                }
                for (i; i < children.length; i += 1) {
                    if (core.isConnection[children[i]]) {
                        key = newConnections[core.getPointerPath(children[i], 'src')];
                        newConnections[key] = newConnections[key] || [];
                        newConnections[key].push(core.getPointerPath(children[i], 'dst'));
                    } else {
                        key = core.getAttribute(children[i], 'name');
                        newName2id[key] = core.getPath(children[i]);
                        newNodes[key] = children[i];
                    }
                }

                // new elements and updates
                for (i in newNodes) {
                    changes[i] = [];
                    if (oldNodes.hasOwnProperty(i) === false) {
                        changes[i] = ['Component have been introduced to the model.'];
                    } else {
                        // we need to check the diff for guidance
                        childDiff = diff[core.getRelid(oldNodes[i])];
                        if (childDiff.removed === undefined &&
                            (childDiff.attr === undefined || !childDiff.attr.hasOwnProperty('name'))) {
                            // only attribute and registry changes
                            for (names in childDiff.attr || {}) {
                                changes[i].push('Attribute [' + names + '] changed {' +
                                    core.getAttribute(oldNodes[i], names) + ' -> ' +
                                    core.getAttribute(newNodes[i], names) + '}.');
                            }
                            // only the position can change if there is registry change
                            if (childDiff.reg && childDiff.reg.position) {
                                names = core.getRegistry(oldNodes[i], 'position');
                                key = core.getRegistry(newNodes[i], 'position');
                                changes[i].push('Onscreen position changed {x: ' +
                                    names.x + ' -> ' + key.x + ' , y: ' + names.y + ' -> ' + key.y + '}.');
                            }
                        } else {
                            console.log(JSON.stringify(childDiff));
                            // same name exists in both versions under different nodes, so we assume the are the same
                            changes[i].push(' Component have been re-created.');
                            names = core.getValidAttributeNames(oldNodes[i]);
                            for (key = 0; key < names.length; key += 1) {
                                if (core.getAttribute(oldNodes[i], names[key]) !==
                                    core.getAttribute(oldNodes[i], names[key])) {
                                    changes[i].push('Attribute [' + names[key] + '] changed {' +
                                        core.getAttribute(oldNodes[i], names[key]) + ' -> ' +
                                        core.getAttribute(newNodes[i], names[key]) + '}.');
                                }
                            }
                            names = core.getRegistry(oldNodes[i], 'position');
                            key = core.getRegistry(newNodes[i], 'position');
                            if (names.x !== key.x || names.y !== key.y) {
                                changes[i].push('Onscreen position changed {x: ' +
                                    names.x + ' -> ' + key.x + ' , y: ' + names.y + ' -> ' + key.y + '.');
                            }
                        }
                    }

                    // now we need to check the connection changes
                    // TODO - how to do it???
                    /*var portInfo = self._getPortMap(core, newNodes[i]),
                        j, portPath, oldDsts, newDsts;

                    for (portPath in portInfo) {
                        if (oldConnections[portPath]) {
                            oldDsts = {};
                            newDsts = {};
                            for(j=0;j<oldConnections[portPath].length;j+=1){
                                oldDsts[portPath] = true; //TODO should be the name of the port...

                            }
                        }
                    }*/
                }

                // removals
                for (i in oldNodes) {
                    if (newNodes.hasOwnProperty(i) === false) {
                        changes[i] = ['Component have been removed from the model.'];
                    }
                }

                if (Object.keys(changes).length === 0) {
                    changes = null;
                }

                deferred.resolve(changes);
            })
            .catch(deferred.reject);

        return deferred.promise;
    };

    /**
     * Main function for the plugin to execute. This will perform the execution.
     * Notes:
     * - Always log with the provided logger.[error,warning,info,debug].
     * - Do NOT put any user interaction logic UI, etc. inside this method.
     * - callback always has to be called even if error happened.
     *
     * @param {function(string, plugin.PluginResult)} callback - the result callback
     */
    ModelicaDiff.prototype.main = function (callback) {
        // Use self to access core, project, result, logger etc from PluginBase.
        // These are all instantiated at this point.
        var self = this,
            config = self.getCurrentConfig(),
            core = self.core,
            currentRoot = self.activeNode,
            oldRoot,
            diff;

        core.loadRoot(config.oldRootHash)
            .then(function (oldRoot_) {
                oldRoot = oldRoot_;
                return core.generateTreeDiff(oldRoot, currentRoot);
            })
            .then(function (diff_) {
                diff = diff_;

                return self.gatherModelChanges(core, oldRoot, currentRoot, diff.Z || {});
            })
            .then(function (modelChanges) {
                // console.log(modelChanges);
                self.result.setSuccess(true);
                self.createMessage(currentRoot, JSON.stringify(modelChanges), 'info');
                callback(null, self.result);
            })
            .catch(function (err) {
                self.result.setSuccess(false);
                callback(err, self.result);
            });
    };

    return ModelicaDiff;
});
