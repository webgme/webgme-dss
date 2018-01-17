/**
 * This is a mock of the webgme.classes.js and used when running
 *  - npm run mock
 *
 * Add new classes/methods as needed. (They do not have to maintain a consistent state)
 */

// Pure JavaScript equivalent to jQuery's $.ready() from https://github.com/jfriend00/docReady
(function () {

    GME = {};
    GME.classes = {};

    window.GME = GME;

    let cnt = 0,
        names = [
            'Inertia',
            'Damper',
            'Spring',
            'Mass',
            'Resistor',
            'Inductor',
            'Capacitor',
            'SinusSource'
        ],
        attrNames = [
            'name',
            'stringAttr',
            'intAttr',
            'boolAttr',
            'assetAttr',
            'enumAttr'
        ],
        modelicaUris = [
            'Modelica.Electrical.Analog.Basic.Resistor',
            'Modelica.Electrical.Analog.Basic.Capacitor',
            'Modelica.Electrical.Analog.Basic.Inductor',
            'Modelica.Electrical.Analog.Sources.VoltageSource',
            'Modelica.Mechanics.Rotational.Components.Inertia',
            'Modelica.Mechanics.Rotational.Components.Damper',
            'Modelica.Mechanics.Rotational.Components.Spring',
            'Modelica.Mechanics.Rotational.Sources.Accelerate',
            'Modelica.Mechanics.Translational.Components.Damper',
            'Modelica.Mechanics.Translational.Components.Spring',
            'Modelica.Mechanics.Translational.Components.Mass'
        ],
        childrenIds = ['/2/1', '/2/2', '/2/3', '/2/4', '/2/5'],
        validChildrenIds = {
            '/1': true,
            '/2': true,
            '/2/1': true,
            '/2/2': true,
            '/3': true,
            '/3/1': true,
            '/3/2': true,
            '/3/3': true,
            '/3/4': true,
            '/3/5': true,
            '/3/6': true
        },
        projects = [
            {
                owner: 'guest',
                name: 'ElectricalCircuit'
            },
            {
                owner: 'guest',
                name: 'RotatingMotor'
            },
            {
                owner: 'olle',
                name: 'Robot'
            },
            {
                owner: 'hans',
                name: 'SignalFlow'
            }
        ];

    function genProject(d) {
        return {
            owner: d.owner,
            name: d.name,
            _id: d.owner + '+' + d.name,
            info: {
                "createdAt": "2017-05-09T00:13:06.277Z",
                "viewedAt": "2017-12-30T13:47:22.389Z",
                "modifiedAt": "2017-10-13T17:36:31.964Z",
                "creator": d.owner,
                "viewer": "olle",
                "modifier": "hans",
                "kind": "DSS"
            }
        }
    }

    function GMENode(id) {

        return {
            getId: () => id,
            getGuid: () => 'a5008758-e9e8-7eb1-e995-e1793ef92a37',
            getValidAttributeNames: () => attrNames,
            getAttribute: (attrName) => {
                cnt += 1;
                if (attrName.indexOf('int') !== -1) {
                    return cnt;
                } else if (attrName.indexOf('bool') !== -1) {
                    return cnt % 2 === 0;
                } else if (attrName === 'ModelicaURI') {
                    return modelicaUris[cnt % modelicaUris.length];
                } else {
                    return names[cnt % names.length];
                }
            },
            getRegistry: (regName) => {
                switch (regName) {
                    case 'position':
                        return {x: cnt, y: cnt};
                    default:
                        return cnt;
                }
            },
            getAttributeMeta: (attrName) => {
                if (attrName.indexOf('int') !== -1) {
                    return {type: 'integer'};
                } else if (attrName.indexOf('bool') !== -1) {
                    return {type: 'bool'};
                } else if (attrName.indexOf('enum') !== -1) {
                    return {type: 'string', enum: names};
                } else {
                    return {type: 'string'};
                }
            },
            getValidChildrenTypesDetailed: () => validChildrenIds,
            getChildrenIds: () => childrenIds
        }
    }

    GME.classes.Client = function () {
        let users = {};
        return {
            connectToDatabase: (callback) => {
                setTimeout(callback, 400);
            },
            getProjects: (opts, callback) => {
                setTimeout(() => {
                    callback(null, projects.map(genProject));
                }, 100);
            },
            selectProject: (projectId, branchName, callback) => {
                setTimeout(callback, 100);
            },
            getActiveProjectId: () => 'guest+ElectricalCircuit',
            getActiveBranchName: () => 'master',
            addUI: (uiId, eventHandler) => {
                cnt += 1;
                uiId = uiId ? uiId : 'user_' + cnt;
                users[uiId] = eventHandler;

                return uiId;
            },
            removeUI: (uiId) => {
                delete users[uiId];
            },
            updateTerritory: (uiId, territory) => {
                let terrDescs = Object.keys(territory),
                    events = [];

                terrDescs.forEach((id) => {
                    events.push({eid: id, etype: 'load'});
                    if (territory[id].children) {
                        events.push({eid: id + '/1', etype: 'load'});
                        events.push({eid: id + '/2', etype: 'load'});
                        events.push({eid: id + '/3', etype: 'load'});
                        events.push({eid: id + '/4', etype: 'load'});
                        events.push({eid: id + '/5', etype: 'load'});
                    }
                });

                events.push({etype: 'technical'});

                setTimeout(users[uiId], 10, events);
            },
            getNode: (id) => {
                return new GMENode(id);
            },
            setAttribute: (nodeId/*, attributeName, attributeValue*/) => {
                let events = [{etype: 'technical'}, {eid: nodeId, etype: 'update'}];
                Object.keys(users).forEach((user) => {
                    setTimeout(users[user], 10, events);
                });
            },
            setRegistry: (nodeId/*, registryName, registryValue*/) => {
                let events = [{etype: 'technical'}, {eid: nodeId, etype: 'update'}];
                Object.keys(users).forEach((user) => {
                    setTimeout(users[user], 10, events);
                });
            },
            createNode: (parameters, desc, msg) => {
                console.log('createNode msg:', msg);
                let events = [{etype: 'technical'}, {eid: parameters.parentId, etype: 'update'}];
                childrenIds.push('/2/' + cnt);
                Object.keys(users).forEach((user) => {
                    users[user](events);
                });
            }
        };
    };

    (function (funcName, baseObj) {
        // The public function name defaults to window.docReady
        // but you can pass in your own object and own function name and those will be used
        // if you want to put them in a different namespace
        funcName = funcName || 'docReady';
        baseObj = baseObj || window;
        var readyList = [];
        var readyFired = false;
        var readyEventHandlersInstalled = false;

        // call this when the document is ready
        // this function protects itself against being called more than once
        function ready() {
            if (!readyFired) {
                // this must be set to true before we start calling callbacks
                readyFired = true;
                for (var i = 0; i < readyList.length; i++) {
                    // if a callback here happens to add new ready handlers,
                    // the docReady() function will see that it already fired
                    // and will schedule the callback to run right after
                    // this event loop finishes so all handlers will still execute
                    // in order and no new ones will be added to the readyList
                    // while we are processing the list
                    readyList[i].fn.call(window, readyList[i].ctx);
                }
                // allow any closures held by these functions to free
                readyList = [];
            }
        }

        function readyStateChange() {
            if (document.readyState === 'complete') {
                ready();
            }
        }

        // This is the one public interface
        // docReady(fn, context);
        // the context argument is optional - if present, it will be passed
        // as an argument to the callback
        baseObj[funcName] = function (callback, context) {
            // if ready has already fired, then just schedule the callback
            // to fire asynchronously, but right away
            if (readyFired) {
                setTimeout(function () {
                    callback(context);
                }, 1);
                return;
            } else {
                // add the function and context to the list
                readyList.push({fn: callback, ctx: context});
            }
            // if document already ready to go, schedule the ready function to run
            if (document.readyState === 'complete') {
                setTimeout(ready, 1);
            } else if (!readyEventHandlersInstalled) {
                // otherwise if we don't have event handlers installed, install them
                if (document.addEventListener) {
                    // first choice is DOMContentLoaded event
                    document.addEventListener('DOMContentLoaded', ready, false);
                    // backup is window load event
                    window.addEventListener('load', ready, false);
                } else {
                    // must be IE
                    document.attachEvent('onreadystatechange', readyStateChange);
                    window.attachEvent('onload', ready);
                }
                readyEventHandlersInstalled = true;
            }
        };
    })('docReady', window);

// See if there is handler attached to body tag when ready

    var evalOnGmeInit = function () {
        if (document.body.getAttribute('on-gme-init')) {
            eval(document.body.getAttribute('on-gme-init'));
        } else {
            console.warn('To use GME, define a javascript function and set the body ' +
                'element\'s on-gme-init property.');
        }
    };

// wait for document.readyState !== 'loading'
    var stillLoading = 1;
    var somethingFinishedLoading = function () {
        if (--stillLoading === 0) {
            evalOnGmeInit();
        }
    };

    if (document.readyState === 'loading') {
        // eslint-disable-next-line
        docReady(function () {
            somethingFinishedLoading();
        });
    } else {
        somethingFinishedLoading();
    }

}());