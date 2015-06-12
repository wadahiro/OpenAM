/**
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

/*global define*/
define("org/forgerock/openam/ui/editor/models/ScriptModel", [
    "backbone",
    "org/forgerock/openam/ui/common/util/URLHelper",
    "org/forgerock/commons/ui/common/components/Messages",
    "org/forgerock/commons/ui/common/util/Base64"
], function (Backbone, URLHelper, Messages, Base64) {
    return Backbone.Model.extend({
        idAttribute: '_id',
        urlRoot: URLHelper.substitute("__api__/scripts"),
        defaults: function () {
            return {
                _id: null,
                name: '',
                script: '',
                language: '',
                context: ''
            };
        },

        validate: function (attrs, options) {
            if (attrs.name.trim() === '') {
                return 'scriptErrorNoName';
            }
        },

        parse: function (resp, options) {
            if (resp && resp.script) {
                resp.script = Base64.decodeUTF8(resp.script);
            }
            return resp;
        },

        sync: function (method, model, options) {
            options.beforeSend = function (xhr) {
                xhr.setRequestHeader("Accept-API-Version", "protocol=1.0,resource=1.0");
            };

            options.error = function (response) {
                Messages.messages.addMessage({
                    type: 'error',
                    message: response.responseJSON.message
                });
            };

            method = method.toLowerCase();
            if (method === 'create') {
                options = options || {};
                options.url = this.urlRoot() + '/?_action=create';
            }

            if (method === 'create' || method === 'update') {
                model.set('script', Base64.encodeUTF8(model.get('script')));
            }

            return Backbone.Model.prototype.sync.call(this, method, model, options);
        }
    });
});