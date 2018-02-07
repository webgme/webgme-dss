'use strict';

describe('ModelicaCodeGenerator', function () {
    let testFixture = require('../../globals'),
        gmeConfig = testFixture.getGmeConfig(),
        expect = testFixture.expect,
        Q = testFixture.Q,
        logger = testFixture.logger.fork('ModelicaCodeGenerator'),
        PluginCliManager = testFixture.WebGME.PluginCliManager,
        projectName = 'MCC_testProject',
        pluginName = 'ModelicaCodeGenerator',
        project,
        gmeAuth,
        storage,
        commitHash;

    before(function (done) {
        testFixture.clearDBAndGetGMEAuth(gmeConfig, projectName)
            .then(function (gmeAuth_) {
                gmeAuth = gmeAuth_;
                // This uses in memory storage. Use testFixture.getMongoStorage to persist test to database.
                storage = testFixture.getMemoryStorage(logger, gmeConfig, gmeAuth);
                return storage.openDatabase();
            })
            .then(function () {
                let importParam = {
                    projectSeed: './src/seeds/Modelica/Modelica.webgmex',
                    projectName: projectName,
                    branchName: 'master',
                    logger: logger,
                    gmeConfig: gmeConfig
                };

                return testFixture.importProject(storage, importParam);
            })
            .then(function (importResult) {
                project = importResult.project;
                commitHash = importResult.commitHash;
                return project.createBranch('test', commitHash);
            })
            .nodeify(done);
    });

    after(function (done) {
        storage.closeDatabase()
            .then(function () {
                return gmeAuth.unload();
            })
            .nodeify(done);
    });

    it('should run plugin on seed and generate same modelica code for the example', function (done) {
        let manager = new PluginCliManager(null, logger, gmeConfig),
            pluginConfig = {
            },
            context = {
                project: project,
                commitHash: commitHash,
                branchName: 'test',
                activeNode: '/Z',
            },
            plugin;

        manager.initializePlugin(pluginName)
            .then((plugin_) => {
                plugin = plugin_;
                return manager.configurePlugin(plugin, pluginConfig, context);
            })
            .then(() => {
                return Q.ninvoke(manager, 'runPluginMain', plugin);
            })
            .then((res) => {
                expect(res.success).to.equal(true);
                expect(typeof plugin.moFile).to.equal('string');
                // This hash check might not work cross platform..
                expect(res.artifacts[0]).to.equal('aa3ea944bccafda3d1515271077086e9251c9c0d');
            })
            .nodeify(done);
    });
});
