/*
 * The contents of this file are subject to the terms of the Common Development and
 * Distribution License (the License). You may not use this file except in compliance with the
 * License.
 *
 * You can obtain a copy of the License at legal/CDDLv1.0.txt. See the License for the
 * specific language governing permission and limitations under the License.
 *
 * When distributing Covered Software, include this CDDL Header Notice in each file and include
 * the License file at legal/CDDLv1.0.txt. If applicable, add the following below the CDDL
 * Header, with the fields enclosed by brackets [] replaced by your own identifying
 * information: "Portions copyright [year] [name of copyright owner]".
 *
 * Copyright 2015 ForgeRock AS.
 */

/*global _, define*/
define("org/forgerock/openam/ui/uma/delegates/UMADelegate", [
    "org/forgerock/commons/ui/common/main/AbstractDelegate",
    "org/forgerock/commons/ui/common/main/Configuration",
    "org/forgerock/commons/ui/common/util/Constants",
    "org/forgerock/openam/ui/common/util/RealmHelper"
], function (AbstractDelegate, Configuration, Constants, RealmHelper) {
    var obj = new AbstractDelegate(Constants.host + "/" + Constants.context + "/json/");

    obj.ERROR_HANDLERS = {
        "Bad Request":              { status: "400" },
        "Not found":                { status: "404" },
        "Gone":                     { status: "410" },
        "Conflict":                 { status: "409" },
        "Internal Server Error":    { status: "500" },
        "Service Unavailable":      { status: "503" }
    };

    obj.getPoliciesByQuery = function (query) {
        return obj.serviceCall({
            url: RealmHelper.decorateURIWithRealm("__subrealm__/policies?_queryFilter=" + query),
            headers: {"Accept-API-Version": "protocol=1.0,resource=1.0"}
        });
    };

    obj.getResourceSetFromId = function (uid) {
        return obj.serviceCall({
            url: RealmHelper.decorateURIWithRealm("__subrealm__/users/" + encodeURIComponent(Configuration.loggedUser.username) + "/oauth2/resourcesets/" + uid),
            headers: {"Accept-API-Version": "protocol=1.0,resource=1.0"}
        });
    };

    obj.getPoliciesById = function (uid) {
        return obj.serviceCall({
            url: RealmHelper.decorateURIWithRealm("__subrealm__/users/" + encodeURIComponent(Configuration.loggedUser.username) + "/uma/policies/" + uid),
            headers: {"Accept-API-Version": "protocol=1.0,resource=1.0"}
        });
    };

    obj.createPolicy = function(username, policyId, permissions) {
      return obj.serviceCall({
          url: RealmHelper.decorateURIWithRealm("__subrealm__/users/" + encodeURIComponent(Configuration.loggedUser.username) + "/uma/policies?_action=create"),
          type: "POST",
          data: JSON.stringify({
              policyId: policyId,
              permissions: permissions
          }),
          errorsHandlers: obj.ERROR_HANDLERS
      });
    };

    obj.getUser = function(username) {
        return obj.serviceCall({
            url: RealmHelper.decorateURIWithRealm("__subrealm__/users/" + encodeURIComponent(username)),
            headers: { "Cache-Control": "no-cache", "Accept-API-Version": "protocol=1.0,resource=2.0" }
        });
    };

    obj.searchUsers = function(query) {
        return obj.serviceCall({
            url: RealmHelper.decorateURIWithRealm("__subrealm__/users?_queryId=" + query + "*"),
            headers: {"Accept-API-Version": "protocol=1.0,resource=1.0"}
        });
    };

    obj.revokeAllResources = function(){
        return obj.serviceCall({
            url: RealmHelper.decorateURIWithRealm("__subrealm__/users/" + encodeURIComponent(Configuration.loggedUser.username) + "/oauth2/resourcesets?_action=revokeAll"),
            headers: {"Accept-API-Version": "protocol=1.0,resource=1.0"},
            errorsHandlers: obj.ERROR_HANDLERS,
            type:'POST'
        });
    };

    return obj;
});
