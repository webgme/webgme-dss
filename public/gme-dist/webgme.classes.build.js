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
            'FCO',
            'LogicGatesMetaLanguage',
            'Resistor',
            'ElectricalCircuit',
            'Capacitor',
            'SinusSource'
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
            getAttribute: (attrName) => {
                cnt += 1;
                return names[cnt % names.length];
            },
            getValidChildrenTypesDetailed: () => {
                return {
                    '/1': true,
                    '/2': true,
                    '/2/1': true,
                    '/2/2': true,
                    '/3': true
                };
            }
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
                    callback(null, [
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
                    ].map(genProject));
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