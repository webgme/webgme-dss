/* eslint-disable */

/**
 * Generated by PluginGenerator 2.16.0 from webgme on Thu Nov 09 2017 10:13:08 GMT-0600 (Central Standard Time).
 * A plugin that inherits from the PluginBase. To see source code documentation about available
 * properties and methods visit %host%/docs/source/PluginBase.html.
 */

define([
    'plugin/PluginConfig',
    'text!./metadata.json',
    'plugin/PluginBase',
    'q',
    'ejs',
    'webgme-ot',
    'common/storage/constants', // These will be needed to check that the commit did update the branch..
    'webgme-dss/parseSimulationData',
    'text!./simulate.mos.ejs',
    'text!./simulate.py.ejs',
    'text!./readme.txt.ejs',
], function (PluginConfig,
             pluginMetadata,
             PluginBase,
             Q,
             ejs,
             ot,
             STORAGE_CONSTANTS,
             simDataHelpers,
             SIMULATE_MOS_TEMPLATE,
             SIMULATE_PY_TEMPLATE,
             README_TEMPLATE,
             ) {
    'use strict';

    let fs = require('fs-extra'),
        path = require('path'),
        cp = require('child_process'),
        os = require('os'),
        generateInfoFile = simDataHelpers.generateInfoFile;

    pluginMetadata = JSON.parse(pluginMetadata);

    /**
     * Initializes a new instance of SimulateModelica.
     * @class
     * @augments {PluginBase}
     * @classdesc This class represents the plugin SimulateModelica.
     * @constructor
     */
    function SystemSimulator() {
        // Call base class' constructor.
        PluginBase.call(this);
        this.pluginMetadata = pluginMetadata;
    }

    /**
     * Metadata associated with the plugin. Contains id, name, version, description, icon, configStructue etc.
     * This is also available at the instance at this.pluginMetadata.
     * @type {object}
     */
    SystemSimulator.metadata = pluginMetadata;

    // Prototypical inheritance from PluginBase.
    SystemSimulator.prototype = Object.create(PluginBase.prototype);
    SystemSimulator.prototype.constructor = SystemSimulator;

    /**
     * Main function for the plugin to execute. This will perform the execution.
     * Notes:
     * - Always log with the provided logger.[error,warning,info,debug].
     * - Do NOT put any user interaction logic UI, etc. inside this method.
     * - callback always has to be called even if error happened.
     *
     * @param {function(Error|null, plugin.PluginResult)} callback - the result callback
     */
    SystemSimulator.prototype.main = function (callback) {
        // Use self to access core, project, result, logger etc from PluginBase.
        // These are all instantiated at this point.
        let self = this,
            logger = this.logger,
            blobClient = this.blobClient,
            config = this.getCurrentConfig(),
            modelNode = self.activeNode,
            simPackageArtie = this.blobClient.createArtifact('SimPackage');

        config.simulationTool = this.gmeConfig.plugin.SystemSimulator.simulationTool;

        const initialGuid = self.core.getGuid(modelNode);
        let modelName = self.core.getAttribute(modelNode, 'name');
        let resultNodeId = self.core.getPath(self.core.getParent(modelNode));
        let simOutputDir;

        function generateDirectory(modelName) {
            let MAX_DIR_TRIES = 100,
                result;

            //Ensure top directory exists
            try {
                fs.mkdirSync('outputs');
            } catch (e) {
                if (e.code !== 'EEXIST') {
                    // We do expect the directory to exists
                    throw e;
                }
            }

            let dirname = modelName + '_' + Date.now();

            for (let i = 0; i < MAX_DIR_TRIES; i += 1) {
                result = path.join('outputs', dirname + '__' + i);
                try {
                    fs.mkdirSync(result);
                    break; // The directory was created!
                } catch (e) {
                    if (e.code !== 'EEXIST') {
                        throw e;
                    } else if (i === MAX_DIR_TRIES - 1) {
                        throw new Error('Failed to generate unique output directory after ' + MAX_DIR_TRIES + 'attempts!');
                    }
                }
            }

            logger.debug('Generated directory', result);

            return result;
        }

        function generateFiles(moFileContent) {
            const scriptData = {
                modelName: modelName,
                stopTime: config.stopTime,
            };

            const mosScript = ejs.render(SIMULATE_MOS_TEMPLATE, scriptData);
            const pyScript = ejs.render(SIMULATE_PY_TEMPLATE, scriptData);

            if (config.simulationTool !== 'Only Code Generation') {
                simOutputDir = generateDirectory(modelName);
                fs.writeFileSync(path.join(simOutputDir, modelName + '.mo'), moFileContent);
                fs.writeFileSync(path.join(simOutputDir, 'simulate.mos'), mosScript);
                fs.writeFileSync(path.join(simOutputDir, 'simulate.py'), pyScript);
            }

            return Q.all([
                blobClient.putFile('README.txt', ejs.render(README_TEMPLATE)),
                blobClient.putFile('simulate.mos', mosScript),
                blobClient.putFile('simulate.py', pyScript),
            ])
                .then((hashes) => {
                    return Q.all([
                        simPackageArtie.addMetadataHash('README.txt', hashes[0]),
                        simPackageArtie.addMetadataHash('simulate.mos', hashes[1]),
                        simPackageArtie.addMetadataHash('simulate.py', hashes[2]),
                    ]);
                })
                .then(() => {
                    return simPackageArtie.save();
                })
        }

        function callSimulationScript(modelName, atOutput) {
            let deferred = Q.defer(),
                options = {cwd: simOutputDir, shell: true},
                command = 'omc',
                args = [
                    'simulate.mos'
                ];

            // file:///E:/OpenModelica1.11.0/share/doc/omc/OpenModelicaUsersGuide/simulationflags.html

            if (os.platform().indexOf('win') === 0) {
                command = '%OPENMODELICAHOME%\\bin\\omc.exe';
            }

            if (config.simulationTool === 'JModelica.org') {
                command = '/usr/local/JModelica/bin/jm_python.sh';
                args = [
                    'simulate.py'
                ];
            }

            logger.debug('Calling simulation script', command, args, options);

            let sim = cp.spawn(command, args, options);

            sim.stdout.on('data', data => {
                atOutput({
                    err: false,
                    output: data.toString()
                });
            });

            sim.stderr.on('data', data => {
                atOutput({
                    err: true,
                    output: data.toString()
                });
            });

            sim.on('close', (code) => {
                if (code > 0) {
                    deferred.resolve({
                        err: new Error(`Simulate child process exited with code ${code}`)
                    });
                } else {
                    try {
                        if (config.simulationTool === 'JModelica.org') {
                            deferred.resolve({
                                resultFileName: path.join(simOutputDir, `${modelName}_res.json`),
                                csvFileName: path.join(simOutputDir, `${modelName}_res.csv`)
                            });
                        } else {
                            deferred.resolve({
                                resultFileName: generateInfoFile(path.join(simOutputDir, modelName)),
                                csvFileName: path.join(simOutputDir, `${modelName}_res.csv`)
                            });
                        }
                    } catch (err) {
                        if (err.code === 'ENOENT') {
                            err = new Error('No simulation results were generated');
                        }

                        deferred.resolve({err: err});
                    }
                }
            });

            sim.on('error', (err) => {
                deferred.resolve({err: err});
            });

            return deferred.promise;
        }

        function simulateAndSaveResults() {
            let outputDoc = '',
                success = false;

            function atOperation(operation) {
                // Someone else is sending operations to the document,
                // these must be applied to our copy.
                outputDoc = operation.apply(outputDoc);
            }

            return self.project.watchDocument({
                branchName: self.branchName,
                nodeId: resultNodeId,
                attrName: 'stdout',
                attrValue: outputDoc
            }, atOperation, () => {
            })
                .then(function (docData) {

                    outputDoc = docData.document;
                    logger.debug('Watching document', docData);

                    function appendToDocument(toAddStr) {
                        let newOperation = new ot.TextOperation()
                            .retain(outputDoc.length)
                            .insert(toAddStr);

                        outputDoc += toAddStr;

                        self.project.sendDocumentOperation({
                            docId: docData.docId,
                            watcherId: docData.watcherId,
                            operation: newOperation,
                            selection: new ot.Selection({
                                anchor: outputDoc.length - 1,
                                head: outputDoc.length - 1
                            })
                        });
                    }

                    appendToDocument('Simulation files generated!\nAbout to run simulation...\n');
                    return callSimulationScript(modelName, oInfo => {
                        if (oInfo.err) {
                            logger.error(oInfo.output);
                            appendToDocument('ERROR: ' + oInfo.output);
                        } else {
                            appendToDocument(oInfo.output);
                        }
                    })
                        .finally(() => {
                            logger.debug('unwatching document', docData.docId);
                            return self.project.unwatchDocument({docId: docData.docId, watcherId: docData.watcherId});
                        });
                })
                .then(function (res) {
                    logger.debug('simulation res', res);
                    let resJson;
                    if (res.err instanceof Error) {
                        success = false;
                        self.result.setError(res.err);
                    } else {
                        success = true;
                        resJson = fs.readFileSync(res.resultFileName, 'utf-8');
                    }

                    return self.gatherSimulationFiles(simOutputDir, modelName)
                        .then((files) => {
                            files.resJson = resJson;
                            return files;
                        });
                })
                .then(function (res) {
                    return self.fastForward()
                        .then(function () {
                            if (!self.activeNode || self.core.getGuid(self.activeNode) !== initialGuid) {
                                self.createMessage(self.rootNode, 'Result node was deleted - simulation was aborted');
                                success = false;
                                return null;
                            }

                            const resultNode = self.core.getParent(self.activeNode);

                            if (success) {
                                self.core.setAttribute(resultNode, 'simRes', res.resJson);
                            }

                            Object.keys(res).forEach((blobName) => {
                                if (blobName !== 'resJson' && res[blobName]) {
                                    self.core.setAttribute(resultNode, blobName, res[blobName]);
                                }
                            });


                            self.core.setAttribute(resultNode, 'stdout', outputDoc);

                            logger.debug('Will save results to model..');

                            return self.save('Attached simulation results at ' + resultNodeId);
                        })

                })
                .then(function (commitResult) {
                    if (commitResult && commitResult.status !== STORAGE_CONSTANTS.SYNCED) {
                        self.createMessage(self.activeNode, 'Commit did not update branch.' +
                            'status: ' + commitResult.status);
                        throw new Error('Did not update branch.');
                    }

                    return success;
                });
        }

        // Identified by the plugin id
        self.invokePlugin('ModelicaCodeGenerator')
            .then(function (result) {
                if (result.getSuccess() !== true) {
                    throw new Error('ModelicaCodeGenerator did not return with success!');
                }

                if (typeof result.pluginInstance.moFile !== 'string') {
                    throw new Error('No string from ModelicaCodeGenerator at result.pluginInstance.moFile!');
                }

                simPackageArtie.addMetadataHash(modelName + '.mo', result.artifacts[0]);

                let moFile = result.pluginInstance.moFile;
                // Write out the files..
                return generateFiles(moFile);
            })
            .then(function (artifactHash) {
                self.result.addArtifact(artifactHash);
                if (config.simulationTool !== 'Only Code Generation') {
                    return simulateAndSaveResults();
                } else {
                    return true;
                }
            })
            .then(function (success) {
                if (success) {
                    self.result.setSuccess(true);
                }

                callback(null, self.result);
            })
            .catch(function (err) {
                // Result success is false at invocation.
                logger.error(err.stack);
                callback(err, self.result);
            });

    };

    SystemSimulator.prototype.addFileToBlob = function (fName, dir) {
        return fs.readFile(path.join(dir, fName), 'utf-8')
            .then((fileContent) => {
                return this.blobClient.putFile(fName, fileContent);
            })
            .then((hash) => {
                return {hash, fName};
            });
    };

    SystemSimulator.prototype.gatherSimulationFiles = function (simOutputDir, modelName) {
        const result = {
            csvFile: null,
            simResInfo: null,
            simPackage: null,
        }

        const simPackageFiles = [
            `${modelName}_res.csv`,
            `${modelName}.mo`,
            `simulate.mos`,
            `simulate.py`,
        ]

        return fs.readdir(simOutputDir)
            .then((files) => {
                const promises = [];

                if (files.includes(`${modelName}_res.csv`)) {
                    promises.push(
                        this.addFileToBlob(`${modelName}_res.csv`, simOutputDir)
                            .then((res) => {
                                result.csvFile = res.hash
                            })
                    )
                }

                if (files.includes(`${modelName}_info.json`)) {
                    promises.push(
                        this.addFileToBlob(`${modelName}_info.json`, simOutputDir)
                            .then((res) => {
                                result.simResInfo = res.hash;
                            })
                    )
                }

                const artifact = this.blobClient.createArtifact('simPackage');

                promises.push(Q.all(
                    files.filter(fName => simPackageFiles.includes(fName))
                        .map((fName) => {
                            return this.addFileToBlob(fName, simOutputDir)
                        }))
                    .then((addedBlobs) => {
                        return Q.all(
                            addedBlobs.map((bInfo) => {
                                return artifact.addMetadataHash(bInfo.fName, bInfo.hash);
                            })
                        );
                    })
                    .then(() => artifact.save())
                    .then((artifactHash) => result.simPackage = artifactHash)
                );

                return Q.all(promises);
            })
            .then(() => result);
    };

    return SystemSimulator;
});
