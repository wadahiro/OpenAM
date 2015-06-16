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

/*global $ _ define*/
define("org/forgerock/openam/ui/admin/delegates/SMSDelegate", [
    "org/forgerock/commons/ui/common/main/AbstractDelegate",
    "org/forgerock/commons/ui/common/util/Constants"
], function (AbstractDelegate, Constants) {
    var obj = new AbstractDelegate(Constants.host + "/" + Constants.context + "/json/");

    obj.RealmAuthentication = {
        get: function () {
            var url = "realm-config/authentication",
                schemaPromise = obj.serviceCall({
                    url: url + "?_action=schema",
                    type: "POST"
                }).done(obj.sanitize),
                valuesPromise = obj.serviceCall({
                    url: url
                });

            return $.when(schemaPromise, valuesPromise).then(function (schemaData, valuesData) {
                return {
                    schema: obj.sanitizeSchema(schemaData[0]),
                    values: valuesData[0]
                };
            });
        },
        save: function (data) {
            return obj.serviceCall({
                url: "realm-config/authentication",
                type: "PUT",
                data: JSON.stringify(data)
            });
        }
    };

    obj.RealmAuthenticationChains = {
        get: function () {
            var promise = obj.serviceCall({
                    url: "realm-config/authentication/chains?_queryFilter=true"
                });

            return $.when(promise).then(function (valuesData) {
                return {
                    values: valuesData
                };
            });
        },

        getChain: function (name) {
            var promise = obj.serviceCall({
                    url: "realm-config/authentication/chains/" + name
                });

            return $.when(promise).then(function (valuesData) {
                return {
                    values: valuesData
                };
            });
        },

        getWithDefaults: function () {
            var url = "realm-config/authentication",
                chainsPromise = obj.serviceCall({
                    url: url + "/chains?_queryFilter=true"
                }),
                valuesPromise = obj.serviceCall({
                    url: url
                });

            return $.when(chainsPromise, valuesPromise).then(function(chainsData, valuesData) {

                _.each(chainsData[0].result, function(obj) {

                    if (obj._id === valuesData[0].adminAuthModule) {
                        obj.active = obj.active || {};
                        obj.active.adminAuthModule = true;
                    }

                    if (obj._id === valuesData[0].orgConfig ) {
                        obj.active = obj.active || {};
                        obj.active.orgConfig = true;
                    }

                });

                return {
                    values: chainsData[0]
                };
            });
        }
    };

    obj.RealmAuthenticationModules = {
        getModules: function () {
            var promise = obj.serviceCall({
                    url: "realm-config/authentication/modules?_queryFilter=true"
                });

            return $.when(promise).then(function(valuesData) {
                return {
                    values: valuesData
                };
            });
        },
        getModuleTypes: function() {
            var promise = obj.serviceCall({
                    url: "realm-config/authentication/modules/types?_queryFilter=true"
                });

            return $.when(promise).then(function(data) {
                return _.sortBy(data.result,'name');
            });
        },
        getModule: function (name) {
            return obj.serviceCall({
                url: 'realm-config/authentication/modules/' + name,
                errorsHandlers: {
                  "Not Found": { status: "404"}
                }
            });
        },
        removeModule: function (name) {
            return obj.serviceCall({
                url: 'realm-config/authentication/modules/' + name,
                type: 'DELETE'
            });
        },
        hasModuleName: function(name) {
            var
                promise = $.Deferred(),
                request = this.getModule(name);

            request
            .done(function() {
                promise.resolve(false);
            })
            .fail(function() {
                promise.resolve(true);
            });
            return promise;
        },
        saveModule: function (data) {
            return obj.serviceCall({
                url: 'realm-config/authentication/modules/',
                type: "PUT",
                data: JSON.stringify(data)
            });
        }
    };

    obj.RealmAuthenticationChain = {
        remove: function (name) {
            return obj.serviceCall({
                url: 'realm-config/authentication/chains/' + name,
                type: 'DELETE'
            });
        }
    };

    obj.sanitizeSchema = function (schema) {
        // Recursively transforms propertyOrder attribute to int
        _.forEach(schema.properties, obj.propertyOrderTransform);

        // Recursively add checkbox format to boolean FIXME: To fix server side? Visual only?
        _.forEach(schema.properties, obj.addCheckboxFormatToBoolean);

        // Recursively add string type to enum FIXME: To fix server side
        _.forEach(schema.properties, obj.addStringTypeToEnum);

        // Create ordered array
        schema.orderedProperties = _.sortBy(_.map(schema.properties, function (value, key) {
            value._id = key;
            return value;
        }), 'propertyOrder');

        return schema;
    };

    obj.addCheckboxFormatToBoolean = function (property) {
        if (property.hasOwnProperty('type') && property.type === 'boolean') {
            property.format = 'checkbox';
        }

        if (property.type === "object") {
            _.forEach(property.properties, obj.addCheckboxFormatToBoolean);
        }
    };

    obj.addStringTypeToEnum = function (property) {
        if (property.hasOwnProperty('enum')) {
            property.type = 'string';
        }

        if (property.type === "object") {
            _.forEach(property.properties, obj.addStringTypeToEnum);
        }
    };

    obj.propertyOrderTransform = function (property) {
        if (property.hasOwnProperty('propertyOrder')) {
            property.propertyOrder = parseInt(property.propertyOrder.slice(1), 10);
        }

        if (property.type === "object") {
            _.forEach(property.properties, obj.propertyOrderTransform);
        }
    };

    return obj;
});
