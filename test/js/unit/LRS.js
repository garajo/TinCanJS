/*!
    Copyright 2012-2013 Rustici Software

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
*/
(function () {
    var session = null,
        endpoint = "https://cloud.scorm.com/tc/public/";

    QUnit.module("LRS Instance");
    test(
        "LRS init failure: no endpoint",
        function () {
            throws(
                function () {
                    var obj = new TinCan.LRS ();
                },
                "exception"
            );
        }
    );

    test(
        "LRS init failure: invalid URL",
        function () {
            throws(
                function () {
                    var obj = new TinCan.LRS (
                        {
                            endpoint: ""
                        }
                    );
                },
                "exception"
            );
            throws(
                function () {
                    var obj = new TinCan.LRS (
                        {
                            endpoint: null
                        }
                    );
                },
                "exception"
            );
        }
    );

    test(
        "LRS init failure: invalid version",
        function () {
            throws(
                function () {
                    var obj = new TinCan.LRS (
                        {
                            endpoint: endpoint,
                            version: "test"
                        }
                    );
                },
                "exception"
            );
        }
    );

    test(
        "LRS variants",
        function () {
            var set = [
                    {
                        name: "basic",
                        instanceConfig: {
                            endpoint: endpoint
                        },
                        checkProps: {
                            endpoint: endpoint,
                            LOG_SRC: "LRS",
                            auth: null,
                            extended: null,
                            version: TinCan.versions()[0],
                            allowFail: true
                        }
                    },
                    {
                        name: "endpoint correction (trailing slash)",
                        instanceConfig: {
                            endpoint: "https://cloud.scorm.com/tc/public"
                        },
                        checkProps: {
                            endpoint: endpoint
                        }
                    },
                    {
                        name: "main properties",
                        instanceConfig: {
                            endpoint: endpoint,
                            auth: "Basic dGVzdDpwYXNzd29yZA==",
                            extended: {
                                test: "TEST"
                            },
                            allowFail: false
                        },
                        checkProps: {
                            auth: "Basic dGVzdDpwYXNzd29yZA==",
                            extended: {
                                test: "TEST"
                            },
                            allowFail: false
                        }
                    },
                    {
                        name: "username/password to basic auth",
                        instanceConfig: {
                            endpoint: endpoint,
                            username: "test",
                            password: "password"
                        },
                        checkProps: {
                            auth: "Basic dGVzdDpwYXNzd29yZA=="
                        }
                    },
                    {
                        name: "version: 1.0.0",
                        instanceConfig: {
                            endpoint: endpoint,
                            version: "1.0.0"
                        },
                        checkProps: {
                            version: "1.0.0"
                        }
                    },
                    {
                        name: "version: 0.95",
                        instanceConfig: {
                            endpoint: endpoint,
                            version: "0.95"
                        },
                        checkProps: {
                            version: "0.95"
                        }
                    },
                    {
                        name: "version: 0.9",
                        instanceConfig: {
                            endpoint: endpoint,
                            version: "0.9"
                        },
                        checkProps: {
                            version: "0.9"
                        }
                    }
                ],
                i,
                obj,
                result
            ;

            for (i = 0; i < set.length; i += 1) {
                row = set[i];
                try {
                    obj = new TinCan.LRS (row.instanceConfig);
                } catch (ex) {
                    // TODO: check environment for IE and detect exception
                    //       purposefully and then run proper assertions for it
                    expect(0);
                    break;
                }

                ok(obj instanceof TinCan.LRS, "object is TinCan.LRS (" + row.name + ")");
                if (typeof row.checkProps !== "undefined") {
                    for (key in row.checkProps) {
                        deepEqual(obj[key], row.checkProps[key], "object property initial value: " + key + " (" + row.name + ")");
                    }
                }
            }
        }
    );

    test(
        "Retrieve activity profile ids",
        function () {
            var raw = {
                    id: "http://tincanapi.com/TinCanJS/Test/LRS_RetrieveActivityProfileIds/0"
                },
                obj = new TinCan.LRS({
                    endpoint: endpoint
                }),
                dummy = {
                    d1: raw,
                    d2: {
                        id: "http://tincanapi.com/TinCanJS/Test/LRS_RetrieveActivityProfileIds/1"
                    },
                    d3: raw
                },
                results = {},
                key
            ;

            for (key in dummy) {
                obj.saveActivityProfile(key, dummy[key], { activity: dummy[key] });
            }

            results[activity] = obj.retrieveActivityProfileIds(new TinCan.Activity(raw));
            results[raw_JSON] = obj.retrieveActivityProfileIds(raw);
            results[not_found] = obj.retrieveActivityProfileIds({
                id: "http://tincanapi.com/TinCanJS/Test/LRS_RetrieveActivityProfileIds/not_found"
            });

            for (key in results) {
                ok(results[key] instanceof Array, "result is Array, given " + key);

                if (key !== "not_found") {
                    ok(results[key].length === 2, "correct number of results");
                    ok(((results[key][0] === "d1" && results[key][1] === "d3") || (results[key][0] === "d3" && results[key][1] === "d1")), "correct results");
                }
                else {
                    ok(results[key].length === 0, "correct number of results");
                }
            }
        }
    );

    test(
        "Retrieve agent profile ids",
        function () {
            var raw = {
                    mbox: "mailto:RetrieveAgentProfileIds@test.com"
                },
                obj = new TinCan.LRS({
                    endpoint: endpoint
                }),
                dummy = {
                    d1: { mbox: "mailto:test@test.com" },
                    d2: raw,
                    d3: raw
                },
                results = {},
                key
            ;

            for (key in dummy) {
                obj.saveAgentProfile(key, dummy[key], { agent: new TinCan.Agent(dummy[key]) });
            }

            results[agent] = obj.retrieveAgentProfileIds(new TinCan.Agent(raw));
            results[raw_JSON] = obj.retrieveAgentProfileIds(raw);
            results[not_found] = obj.retrieveAgentProfileIds({
                mbox: "mailto:RetrieveAgentProfileIds@notFound.com"
            });

            for (key in results) {
                ok(results[key] instanceof Array, "result is Array, given " + key);

                if (key !== "not_found") {
                    ok(results[key].length === 2, "correct number of results");
                    ok(((results[key][0] === "d2" && results[key][1] === "d3") || (results[key][0] === "d3" && results[key][1] === "d2")), "correct results");
                }
                else {
                    ok(results[key].length === 0, "correct number of results");
                }
            }
        }
    );

    test(
        "Retrieve state ids",
        function () {
            var raw_agent = {
                    mbox: "RetrieveStateIds@test.com"
                },
                raw_activity = {
                    id: "http://tincanapi.com/TinCanJS/Test/LRS_RetrieveStateIds/0"
                },
                obj = new TinCan.LRS({
                    endpoint: endpoint
                }),
                dummy = {
                    d1: {
                        activity: raw_activity,
                        agent: new TinCan.Agent(raw_agent)
                    },
                    d2: {
                        activity: raw_activity,
                        agent: new TinCan.Agent({ mbox: "mailto:test@test.com" })
                    },
                    d3: {
                        activity: raw_activity,
                        agent: new TinCan.Agent(raw_agent)
                    },
                    d4: {
                        activity: { id: "http://tincanapi.com/TinCanJS/Test/LRS_RetrieveStateIds/1"},
                        agent: new TinCan.Agent(raw_agent)
                    },
                    d5: {
                        activity: { id: "http://tincanapi.com/TinCanJS/Test/LRS_RetrieveStateIds/1"},
                        agent: new TinCan.Agent({ mbox: "mailto:test@test.com" })
                    }
                },
                results = {},
                key
            ;

            for (key in dummy) {
                obj.saveState(key, dummy[key],
                    {
                        activity: dummy[key].activity,
                        agent: new TinCan.Agent(dummy[key].agent)
                    }
                );
            }

            results[state] = obj.retrieveStateIds(new TinCan.Activity(raw_activity), new TinCan.Agent(raw_agent));
            results[raw_JSON] = obj.retrieveStateIds(raw_activity, raw_agent);
            results[not_found] = obj.retrieveStateIds(
                {
                    id: "http://LRS_RetrieveStateIds/not_found"
                },
                {
                    mbox: "mailto:RetrieveStateIds@notFound.com"
                }
            );

            for (key in results) {
                ok(results[key] instanceof Array, "result is Array, given " + key);

                if (key !== "not_found") {
                    ok(results[key].length === 2, "correct number of results");
                    ok(((results[key][0] === "d1" && results[key][1] === "d3") || (results[key][0] === "d3" && results[key][1] === "d1")), "correct results");
                }
                else {
                    ok(results[key].length === 0, "correct number of results");
                }
            }
        }
    );

    (function () {
        var versions = [
                "1.0.1",
                "1.0.0",
                "0.95",
                "0.9"
            ],
            doAllowFailFalseAboutAsyncTest,
            doAllowFailTrueAboutAsyncTest,
            doAllowFailFalseAboutSyncTest,
            doAllowFailTrueAboutSyncTest,
            i,
            lrs_true,
            lrs_false;

        /* .about */
        doAllowFailFalseAboutAsyncTest = function (lrs) {
            lrs.allowFail = false;

            asyncTest(
                "LRS about async exception: allowFail false (" + lrs.version + ")",
                function () {
                    var result = lrs.about(
                        {
                            callback: function (err, xhr) {
                                var i;
                                start();
                                ok(typeof err !== "undefined", "callback: has err argument");
                                ok(typeof xhr !== "undefined", "callback: has xhr argument");

                                // Do not allow the call to fail
                                ok(err === null, "callback err: is null");
                                ok(xhr instanceof TinCan.About, "callback: xhr is TinCan.About");
                                ok(xhr.hasOwnProperty("version"), "callback: xhr has field 'version'");

                                //
                                // IE8 didn't support .indexOf, so we are just skipping this test in that browser
                                // or any that doesn't have .indexOf
                                //
                                if (typeof Array.prototype.indexOf !== "undefined") {
                                    // Will break if suite is ran against a version not
                                    // supported by this library
                                    for (i = 0; i < xhr.version.length; i += 1) {
                                        ok(TinCan.versions().indexOf(xhr.version[i]) !== -1,
                                            "callback: xhr.version has valid version (" + xhr.version[i] + ")");
                                    }
                                }
                            }
                        }
                    );
                    ok(typeof result === "undefined", "async result is not undefined");
                }
            );
        };

        doAllowFailTrueAboutAsyncTest = function (lrs) {
            asyncTest(
                "LRS about async exception: allowFail true (" + lrs.version + ")",
                function () {
                    var result = lrs.about(
                        {
                            callback: function (err, xhr) {
                                start();
                                ok(typeof err !== "undefined", "callback: err argument exists");
                                ok(typeof xhr !== "undefined", "callback: xhr argument exists");
                            }
                        }
                    );
                    ok(typeof result === "undefined", "async result is not undefined");
                }
            );
        };

        doAllowFailFalseAboutSyncTest = function (lrs) {
            lrs.allowFail = false;

            var result = lrs.about(),
                xhrversion,
                i;

            ok(result instanceof Object, "about allowFail false result: is an object (" + lrs.version + ")");
            ok(typeof result.err !== "undefined", "about allowFail false result: has err property (" + lrs.version + ")");
            ok(typeof result.xhr !== "undefined", "about allowFail false result: has xhr property (" + lrs.version + ")");

            ok(result.err === null, "about allowFail false: result.err: is null (" + lrs.version + ")");
            ok(result.xhr instanceof TinCan.About, "about allowFail false: result.xhr is TinCan.About (" + lrs.version + ")");
            ok(result.xhr.hasOwnProperty("version"), "about allowFail false: result.xhr has 'version' (" + lrs.version + ")");

            xhrversion = result.xhr.version;

            //
            // IE8 didn't support .indexOf, so we are just skipping this test in that browser
            // or any that doesn't have .indexOf
            //
            if (typeof Array.prototype.indexOf !== "undefined") {
                // Will break if suite is ran against a version not
                // supported by this library
                for (i = 0; i < xhrversion.length; i += 1) {
                    ok(TinCan.versions().indexOf(xhrversion[i]) !== -1,
                        "about allowFail false: result.xhr.version has valid version [" + xhrversion[i] + "]");
                }
            }
        };

        doAllowFailTrueAboutSyncTest = function (lrs) {
            var result = lrs.about();
            ok(typeof result.err !== "undefined", "about allowFail true result: has err property (" + lrs.version + ")");
            ok(typeof result.xhr !== "undefined", "about allowFail true result: has xhr property (" + lrs.version + ")");
        };

        if(TinCan.LRS.syncEnabled) {
            test(
                "LRS about sync exception",
                function () {
                    var i,
                        lrs_true,
                        lrs_false;

                    for (i = 0; i < versions.length; i += 1) {
                        if (TinCanTestCfg.recordStores[versions[i]]) {
                            lrs_true = new TinCan.LRS(TinCanTestCfg.recordStores[versions[i]]);
                            doAllowFailTrueAboutSyncTest(lrs_true);

                            lrs_false = new TinCan.LRS(TinCanTestCfg.recordStores[versions[i]]);
                            doAllowFailFalseAboutSyncTest(lrs_false);
                        }
                    }
                }
            );
        }

        for (i = 0; i < versions.length; i += 1) {
            if (TinCanTestCfg.recordStores[versions[i]]) {
                lrs_true = new TinCan.LRS(TinCanTestCfg.recordStores[versions[i]]);
                doAllowFailTrueAboutAsyncTest(lrs_true);

                lrs_false = new TinCan.LRS(TinCanTestCfg.recordStores[versions[i]]);
                doAllowFailFalseAboutAsyncTest(lrs_false);
            }
        }
    }());

    //
    // this block specifically tests that the 'contextActivities.category' property
    // causes statement asVersion to throw an exception and therefore fail under
    // the two versions specified, the assertions in these tests will fail under
    // 1.x LRS versions because 'category' is an acceptable property so the asVersion
    // method won't throw an exception
    //
    (function () {
        var versions = [
                "0.95",
                "0.9"
            ],
            stCfg = {
                actor: {
                    mbox: "mailto:tincanjs-test-tincan+" + Date.now() + "@tincanapi.com"
                },
                verb: {
                    id: "http://adlnet.gov/expapi/verbs/experienced"
                },
                target: {
                    id: "http://tincanapi.com/TinCanJS/Test/TinCan.LRS_saveStatement/exception-sync"
                },
                context: {
                    contextActivities: {
                        category: [
                            {
                                id: "http://tincanapi.com/TinCanJS/Test/TinCan.LRS_saveStatement/exception-sync/cat"
                            }
                        ]
                    }
                }
            },
            doAllowFailFalseSaveStatementExceptionAsyncTest,
            doAllowFailTrueSaveStatementExceptionAsyncTest,
            doAllowFailFalseSaveStatementExceptionSyncTest,
            doAllowFailTrueSaveStatementExceptionSyncTest,
            doAllowFailFalseSaveStatementsExceptionAsyncTest,
            doAllowFailTrueSaveStatementsExceptionAsyncTest,
            doAllowFailFalseSaveStatementsExceptionSyncTest,
            doAllowFailTrueSaveStatementsExceptionSyncTest,
            i,
            lrs_true,
            lrs_false;

        /* .saveStatement */
        doAllowFailFalseSaveStatementExceptionAsyncTest = function (lrs, st) {
            lrs.allowFail = false;

            asyncTest(
                "LRS saveStatement async exception: allowFail false (" + lrs.version + ")",
                function () {
                    var result = lrs.saveStatement(
                        st,
                        {
                            callback: function (err, xhr) {
                                start();
                                ok(typeof err !== "undefined", "callback: has err argument");
                                ok(typeof xhr !== "undefined", "callback: has xhr argument");

                                if (typeof err !== "undefined") {
                                    ok(err instanceof Error, "callback err: is Error");
                                }
                                if (typeof err !== "undefined") {
                                    ok(xhr === null, "callback xhr is null");
                                }
                            }
                        }
                    );
                    ok(typeof result === "undefined", "result is undefined");
                }
            );
        };

        doAllowFailTrueSaveStatementExceptionAsyncTest = function (lrs, st) {
            asyncTest(
                "LRS saveStatement async exception: allowFail true (" + lrs.version + ")",
                function () {
                    var result = lrs.saveStatement(
                        st,
                        {
                            callback: function (err, xhr) {
                                start();
                                ok(err === null, "callback err argument is null");
                                ok(xhr === null, "callback xhr argument is null");
                            }
                        }
                    );
                    ok(typeof result === "undefined", "result is undefined");
                }
            );
        };

        doAllowFailFalseSaveStatementExceptionSyncTest = function (lrs, st) {
            lrs.allowFail = false;

            var result = lrs.saveStatement(st);

            ok(result instanceof Object, "allowFail false result: is an object (" + lrs.version + ")");
            ok(typeof result.err !== "undefined", "allowFail false result: has err property (" + lrs.version + ")");
            ok(typeof result.xhr !== "undefined", "allowFail false result: has xhr property (" + lrs.version + ")");

            if (typeof result.err !== "undefined") {
                ok(result.err instanceof Error, "allowFail false result.err: is Error (" + lrs.version + ")");
            }
            if (typeof result.err !== "undefined") {
                ok(result.xhr === null, "allowFail false result.xhr is null (" + lrs.version + ")");
            }
        };

        doAllowFailTrueSaveStatementExceptionSyncTest = function (lrs, st) {
            var result = lrs.saveStatement(st);
            deepEqual(result, { err: null, xhr: null }, "allowFail true result: matches deeply (" + lrs.version + ")");
        };

        /* .saveStatements */
        doAllowFailFalseSaveStatementsExceptionAsyncTest = function (lrs, sts) {
            lrs.allowFail = false;

            asyncTest(
                "LRS saveStatements async exception: allowFail false (" + lrs.version + ")",
                function () {
                    var result = lrs.saveStatements(
                        sts,
                        {
                            callback: function (err, xhr) {
                                start();
                                ok(typeof err !== "undefined", "callback: has err argument");
                                ok(typeof xhr !== "undefined", "callback: has xhr argument");

                                if (typeof err !== "undefined") {
                                    ok(err instanceof Error, "callback err: is Error");
                                }
                                if (typeof err !== "undefined") {
                                    ok(xhr === null, "callback xhr is null");
                                }
                            }
                        }
                    );
                    ok(typeof result === "undefined", "result is undefined");
                }
            );
        };

        doAllowFailTrueSaveStatementsExceptionAsyncTest = function (lrs, sts) {
            asyncTest(
                "LRS saveStatements async exception: allowFail true (" + lrs.version + ")",
                function () {
                    var result = lrs.saveStatements(
                        sts,
                        {
                            callback: function (err, xhr) {
                                start();
                                ok(err === null, "callback err argument is null");
                                ok(xhr === null, "callback xhr argument is null");
                            }
                        }
                    );
                    ok(typeof result === "undefined", "result is undefined");
                }
            );
        };

        doAllowFailFalseSaveStatementsExceptionSyncTest = function (lrs, sts) {
            lrs.allowFail = false;

            var result = lrs.saveStatements(sts);

            ok(result instanceof Object, "allowFail false result: is an object (" + lrs.version + ")");
            ok(typeof result.err !== "undefined", "allowFail false result: has err property (" + lrs.version + ")");
            ok(typeof result.xhr !== "undefined", "allowFail false result: has xhr property (" + lrs.version + ")");

            if (typeof result.err !== "undefined") {
                ok(result.err instanceof Error, "allowFail false result.err: is Error (" + lrs.version + ")");
            }
            if (typeof result.err !== "undefined") {
                ok(result.xhr === null, "allowFail false result.xhr is null (" + lrs.version + ")");
            }
        };

        doAllowFailTrueSaveStatementsExceptionSyncTest = function (lrs, sts) {
            var result = lrs.saveStatements(sts);
            deepEqual(result, { err: null, xhr: null }, "allowFail true result: matches deeply (" + lrs.version + ")");
        };

        test(
            "LRS saveStatement/saveStatements sync exception",
            function () {
                var i,
                    lrs_true,
                    lrs_false;

                for (i = 0; i < versions.length; i += 1) {
                    if (TinCanTestCfg.recordStores[versions[i]]) {
                        lrs_true = new TinCan.LRS(TinCanTestCfg.recordStores[versions[i]]);
                        doAllowFailTrueSaveStatementExceptionSyncTest(lrs_true, new TinCan.Statement(stCfg));
                        doAllowFailTrueSaveStatementsExceptionSyncTest(lrs_true, [ new TinCan.Statement(stCfg) ]);

                        lrs_false = new TinCan.LRS(TinCanTestCfg.recordStores[versions[i]]);
                        doAllowFailFalseSaveStatementExceptionSyncTest(lrs_false, new TinCan.Statement(stCfg));
                        doAllowFailFalseSaveStatementsExceptionSyncTest(lrs_false, [ new TinCan.Statement(stCfg) ]);
                    }
                }
            }
        );

        for (i = 0; i < versions.length; i += 1) {
            if (TinCanTestCfg.recordStores[versions[i]]) {
                lrs_false = new TinCan.LRS(TinCanTestCfg.recordStores[versions[i]]);
                doAllowFailFalseSaveStatementExceptionAsyncTest(lrs_false, new TinCan.Statement(stCfg));
                doAllowFailFalseSaveStatementsExceptionAsyncTest(lrs_false, [ new TinCan.Statement(stCfg) ]);

                lrs_true = new TinCan.LRS(TinCanTestCfg.recordStores[versions[i]]);
                doAllowFailTrueSaveStatementExceptionAsyncTest(lrs_true, new TinCan.Statement(stCfg));
                doAllowFailTrueSaveStatementsExceptionAsyncTest(lrs_true, [ new TinCan.Statement(stCfg) ]);
            }
        }
    }());
}());
