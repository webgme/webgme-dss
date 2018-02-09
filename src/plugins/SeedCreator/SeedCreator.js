/*globals define*/
/*eslint-env node, browser*/

/**
 * This plugin reads the output from py_modelica exporter and imports the
 * components and adds them to the meta-model.
 */

define([
    'plugin/PluginConfig',
    'text!./metadata.json',
    'plugin/PluginBase'
], function (
    PluginConfig,
    pluginMetadata,
    PluginBase) {
    'use strict';

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
     * @param {function(string, plugin.PluginResult)} callback - the result callback
     */
    SeedCreator.prototype.main = function (callback) {
        this.save('SeedCreator updated model.')
            .then(() => {
                self.result.setSuccess(true);
                callback(null, self.result);
            })
            .catch(err => {
                // Result success is false at invocation.
                callback(err, self.result);
            });
    };

    return SeedCreator;
});
