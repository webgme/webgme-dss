/*jshint node:true, mocha:true*/
describe('DomainManager', function () {
    let testFixture = require('../../globals'),
        Q = testFixture.Q,
        superagent = testFixture.superagent,
        expect = testFixture.expect,
        gmeConfig = testFixture.getGmeConfig(),
        server = testFixture.WebGME.standaloneServer(gmeConfig),
        mntPt = gmeConfig.rest.components['DomainManager'].mount,
        logger = testFixture.logger.fork('DomainManager'),
        SEED_INFO = require('../../../src/seeds/Modelica/metadata.json'),
        gmeAuth,
        storage,
        urlFor = function (action) {
            return [
                server.getUrl(),
                mntPt,
                action
            ].join('/');
        };

    before(function (done) {
        this.timeout(5000);
        testFixture.clearDBAndGetGMEAuth(gmeConfig)
            .then(function (gmeAuth_) {
                let deferred = Q.defer();
                server.start(deferred.makeNodeResolver());
                gmeAuth = gmeAuth_;

                storage = testFixture.getMongoStorage(logger, gmeConfig, gmeAuth);

                return Q.allDone([
                    storage.openDatabase(),
                    deferred.promise
                ]);
            })
            .then(function () {
                // FIXME: The server worker manager does not start as it should..
                setTimeout(()=>{
                    done();
                }, 500);
            })
            .catch(done);
    });

    after(function (done) {
        let deferred = Q.defer();
        server.start(deferred.makeNodeResolver());
        Q.allDone([
            gmeAuth.unload(),
            storage.closeDatabase(),
            server.stop(deferred.promise)
        ])
            .nodeify(done);
    });

    it('should get seedInfo', function (done) {
        let deferred = Q.defer();
        superagent.get(urlFor('seedInfo'))
            .end(deferred.makeNodeResolver());

        deferred.promise
            .then((res) => {
                expect(res.body).to.deep.equal(SEED_INFO);
            })
            .nodeify(done);
    });

    it('should create project with one domain and set the kind accordingly', function (done) {
        let deferred = Q.defer();

        superagent.post(urlFor('createProject'))
            .send({
                projectName: 'testProject1',
                domains: ['Modelica.Electrical.Analog']
            })
            .end(deferred.makeNodeResolver());

        deferred.promise
            .then((res) => {
                expect(res.body).to.deep.equal({
                    projectId: 'guest+testProject1'
                });

                return storage.getProjects({
                    projectId: 'guest+testProject1',
                    info: true
                });
            })
            .then((res) => {
                expect(res[0].info.kind).to.equal('DSS:Modelica.Electrical.Analog');
                return storage.getTags({
                    projectId: 'guest+testProject1'
                });
            })
            .then((res) => {
                let tagNames = Object.keys(res);
                expect(tagNames.length).to.equal(1);
                expect(tagNames[0]).to.equal('Domain_1_1');
            })
            .nodeify(done);
    });

    it('should update project with new domain and set the kind accordingly', function (done) {
        let deferred = Q.defer();

        superagent.post(urlFor('updateProject'))
            .send({
                projectId: 'guest+testProject1',
                domains: ['Modelica.Mechanics.Rotational']
            })
            .end(deferred.makeNodeResolver());

        deferred.promise
            .then((res) => {
                // expect(res.body).to.deep.equal({
                //     projectId: 'guest+testProject1'
                // });

                return storage.getProjects({
                    projectId: 'guest+testProject1',
                    info: true
                })
            })
            .then((res) => {
                //expect(res[0].info.kind).to.equal('DSS:Modelica.Mechanics.Rotational');
                return storage.getTags({
                    projectId: 'guest+testProject1'
                });
            })
            .then((res) => {
                let tagNames = Object.keys(res);
                expect(tagNames.length).to.equal(2);
                expect(tagNames.sort()).to.deep.equal(['Domain_1_1', 'Domain_1_2']);
            })
            .nodeify(done);
    });
});
