/**
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 *
 * Copyright 2014-2015 ForgeRock AS.
 *
 * The contents of this file are subject to the terms
 * of the Common Development and Distribution License
 * (the License). You may not use this file except in
 * compliance with the License.
 *
 * You can obtain a copy of the License at
 * http://forgerock.org/license/CDDLv1.0.html
 * See the License for the specific language governing
 * permission and limitations under the License.
 *
 * When distributing Covered Code, include this CDDL
 * Header Notice in each file and include the License file
 * at http://forgerock.org/license/CDDLv1.0.html
 * If applicable, add the following below the CDDL Header,
 * with the fields enclosed by brackets [] replaced by
 * your own identifying information:
 * "Portions Copyrighted [year] [name of copyright owner]"
 */

/*global _, define*/
define("org/forgerock/openam/ui/policy/delegates/PolicyDelegate", [
    "org/forgerock/commons/ui/common/main/Configuration",
    "org/forgerock/commons/ui/common/util/Constants",
    "org/forgerock/commons/ui/common/main/AbstractDelegate",
    "org/forgerock/openam/ui/common/util/RealmHelper"
], function (conf, constants, AbstractDelegate, RealmHelper) {
    var obj = new AbstractDelegate(constants.host + "/" + constants.context + "/json");

    obj.ERROR_HANDLERS = {
        "Bad Request":              { status: "400" },
        "Not found":                { status: "404" },
        "Gone":                     { status: "410" },
        "Conflict":                 { status: "409" },
        "Internal Server Error":    { status: "500" },
        "Service Unavailable":      { status: "503" }
    };

    obj.getApplicationType = function (type) {
        return obj.serviceCall({
            url: RealmHelper.decorateURLWithOverrideRealm("/applicationtypes/" + type),
            headers: {"Accept-API-Version": "protocol=1.0,resource=1.0"}
        });
    };

    obj.getApplicationByName = function (name) {
        return obj.serviceCall({
            url: RealmHelper.decorateURLWithOverrideRealm("/applications/" + encodeURIComponent(name)),
            headers: {"Accept-API-Version": "protocol=1.0,resource=2.0"}
        });
    };

    obj.updateApplication = function (name, data) {
        return obj.serviceCall({
            url: RealmHelper.decorateURLWithOverrideRealm("/applications/" + encodeURIComponent(name)),
            headers: {"Accept-API-Version": "protocol=1.0,resource=2.0"},
            type: "PUT",
            data: JSON.stringify(data),
            errorsHandlers: obj.ERROR_HANDLERS
        });
    };

    obj.createApplication = function (data) {
        return obj.serviceCall({
            url: RealmHelper.decorateURLWithOverrideRealm("/applications/?_action=create"),
            headers: {"Accept-API-Version": "protocol=1.0,resource=2.0"},
            type: "POST",
            data: JSON.stringify(data),
            errorsHandlers: obj.ERROR_HANDLERS
        });
    };

    obj.getDecisionCombiners = function () {
        return obj.serviceCall({
            url: RealmHelper.decorateURLWithOverrideRealm("/decisioncombiners/?_queryId=&_fields=title"),
            headers: {"Accept-API-Version": "protocol=1.0,resource=1.0"}
        });
    };

    obj.getEnvironmentConditions = function () {
        return obj.serviceCall({
            url: RealmHelper.decorateURLWithOverrideRealm("/conditiontypes?_queryId=&_fields=title,logical,config"),
            headers: {"Accept-API-Version": "protocol=1.0,resource=1.0"}
        });
    };

    obj.getSubjectConditions = function () {
        return obj.serviceCall({
            url: RealmHelper.decorateURLWithOverrideRealm("/subjecttypes?_queryId=&_fields=title,logical,config"),
            headers: {"Accept-API-Version": "protocol=1.0,resource=1.0"}
        });
    };

    obj.getPolicyByName = function (name) {
        return obj.serviceCall({
            url: RealmHelper.decorateURLWithOverrideRealm("/policies/" + encodeURIComponent(name)),
            headers: {"Accept-API-Version": "protocol=1.0,resource=2.0"}
        });
    };

    obj.updatePolicy = function (name, data) {
        return obj.serviceCall({
            url: RealmHelper.decorateURLWithOverrideRealm("/policies/" + encodeURIComponent(name)),
            headers: {"Accept-API-Version": "protocol=1.0,resource=2.0"},
            type: "PUT",
            data: JSON.stringify(data),
            errorsHandlers: obj.ERROR_HANDLERS
        });
    };

    obj.createPolicy = function (data) {
        return obj.serviceCall({
            url: RealmHelper.decorateURLWithOverrideRealm("/policies/" + encodeURIComponent(data.name)),
            headers: { "If-None-Match": "*", "Accept-API-Version": "protocol=1.0,resource=2.0" },
            type: "PUT",
            data: JSON.stringify(data),
            errorsHandlers: obj.ERROR_HANDLERS
        });
    };

    obj.getAllUserAttributes = function () {
        return obj.serviceCall({
            url: RealmHelper.decorateURLWithOverrideRealm("/subjectattributes?_queryFilter=true"),
            headers: {"Accept-API-Version": "protocol=1.0,resource=1.0"}
        });
    };

    obj.queryIdentities = function (name, query) {
        return obj.serviceCall({
            url: RealmHelper.decorateURLWithOverrideRealm("/" + name + "?_queryId=" + query + "*"),
            headers: {"Accept-API-Version": "protocol=1.0,resource=1.0"}
        });
    };

    obj.getUniversalId = function (name, type) {
        return obj.serviceCall({
            url: RealmHelper.decorateURLWithOverrideRealm("/" + type + "/" + name + "?_fields=universalid"),
            headers: {"Cache-Control": "no-cache", "Accept-API-Version": "protocol=1.0,resource=2.0"}
        });
    };

    obj.getDataByType = function (type) {
        return obj.serviceCall({
            url: RealmHelper.decorateURLWithOverrideRealm("/" + type + "?_queryFilter=true"),
            headers: {"Accept-API-Version": "protocol=1.0,resource=1.0"}
        });
    };

    obj.getScriptById = function (id) {
        return obj.serviceCall({
            url: RealmHelper.decorateURLWithOverrideRealm("/scripts/" + id),
            headers: {"Accept-API-Version": "protocol=1.0,resource=1.0"}
        });
    };

    obj.getAllRealms = function () {
        return obj.serviceCall({
            url: RealmHelper.decorateURLWithOverrideRealm("/realms?_queryFilter=true"),
            headers: {"Accept-API-Version": "protocol=1.0,resource=1.0"}
        });
    };

    obj.importPolicies = function (data) {
        return obj.serviceCall({
            serviceUrl: constants.host + "/" + constants.context,
            url: RealmHelper.decorateURLWithOverrideRealm("/xacml/policies"),
            type: "POST",
            data: data,
            errorsHandlers: obj.ERROR_HANDLERS
        });
    };

    obj.getResourceType = function (uuid) {
        return obj.serviceCall({
            url: RealmHelper.decorateURLWithOverrideRealm("/resourcetypes/" + uuid),
            headers: {"Accept-API-Version": "protocol=1.0,resource=1.0"}
        });
    };

    obj.createResourceType = function (data) {
        return obj.serviceCall({
            url: RealmHelper.decorateURLWithOverrideRealm("/resourcetypes?_action=create"),
            headers: {"Accept-API-Version": "protocol=1.0,resource=1.0"},
            type: "POST",
            data: JSON.stringify(data),
            errorsHandlers: obj.ERROR_HANDLERS
        });
    };

    obj.updateResourceType = function (data) {
        return obj.serviceCall({
            url: RealmHelper.decorateURLWithOverrideRealm("/resourcetypes/" + data.uuid),
            headers: {"Accept-API-Version": "protocol=1.0,resource=1.0"},
            type: "PUT",
            data: JSON.stringify(data),
            errorsHandlers: obj.ERROR_HANDLERS
        });
    };

    obj.listResourceTypes = function () {
        return obj.serviceCall({
            url: RealmHelper.decorateURLWithOverrideRealm("/resourcetypes?_queryFilter=true"),
            headers: {"Accept-API-Version": "protocol=1.0,resource=1.0"}
        });
    };
    
    return obj;
});
