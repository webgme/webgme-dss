/* eslint-disable */

describe.only('SystemSimulator', function () {
    let testFixture = require('../../globals'),
        gmeConfig = testFixture.getGmeConfig(),
        expect = testFixture.expect,
        logger = testFixture.logger.fork('SystemSimulator'),
        PluginCliManager = testFixture.WebGME.PluginCliManager,
        Q = testFixture.Q,
        projectName = 'SS_testProject',
        pluginName = 'SystemSimulator',
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

    it('should run plugin on seed and generate execution package', function (done) {
        let manager = new PluginCliManager(null, logger, gmeConfig),
            pluginConfig = {
                runSimulation: false
            },
            context = {
                project: project,
                commitHash: commitHash,
                branchName: 'test',
                activeNode: '/Z',
            },
            plugin;

        manager.initializePlugin(pluginName)
            .then(plugin_ => {
                plugin = plugin_;
                return manager.configurePlugin(plugin, pluginConfig, context);
            })
            .then(() => {
                return Q.ninvoke(manager, 'runPluginMain', plugin);
            })
            .then((res) => {
                console.log(res);
                expect(res.success).to.equal(true);
                // This hash check might not work cross platform..
                expect(res.artifacts[0]).to.equal('fabf8d8fce3bdf5d87602a683e3674a5fcacffed');
                return manager.blobClient.getMetadata(res.artifacts[0]);
            })
            .then(metadata => {
                expect(metadata.name).to.equal('SimPackage.zip');
                expect(Object.keys(metadata.content)).to.include.members(['README.text', 'Canvas.mo', 'simulate.mos']);
            })
            .nodeify(done);
    });

    it.skip('should gather output files', function (done) {
        let manager = new PluginCliManager(null, logger, gmeConfig),
            pluginConfig = {
                runSimulation: false
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
                return plugin.gatherSimulationFiles('C:\\GIT\\webgme-dss\\outputs\\Canvas_1518470314419__0', 'Canvas');
            })
            .then((res) => {
                console.log(res);
            })
            .nodeify(done);
    });
});
