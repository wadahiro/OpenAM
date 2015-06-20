/**
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 *
 * Copyright 2015 ForgeRock AS.
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

/*global window, define, $, _ */

define("org/forgerock/openam/ui/policy/policies/conditions/ConditionAttrStringView", [
    "org/forgerock/openam/ui/policy/policies/conditions/ConditionAttrBaseView" ,
    "org/forgerock/commons/ui/common/util/Constants"
], function (ConditionAttrBaseView, Constants) {
    var ConditionAttrStringView = ConditionAttrBaseView.extend({
        template: 'templates/policy/policies/conditions/ConditionAttrString.html',

        render: function (data, element, callback) {
            var cssClass = '';

            if (data.title === 'startIp' || data.title === 'endIp') {
                if (data.schema.title === 'IPv4') {
                    data.pattern = Constants.IPV4_PATTERN;
                } else if (data.schema.title === 'IPv6') {
                    data.pattern = Constants.IPV6_PATTERN;
                }
                cssClass = 'auto-fill-group';
            } else if (data.value && data.value.type === 'number') {
                data.pattern = Constants.NUMBER_PATTERN;
            } else if (data.value && data.value.type === 'integer') {
                data.pattern = Constants.INTEGER_PATTERN;
            } else {
                data.pattern = null;
            }

            this.initBasic(data, element, 'field-float-pattern data-obj ' + cssClass);

            this.parentRender(function () {
                if (callback) {
                    callback();
                }
            });
        },

        attrSpecificChangeInput: function (e) {
            if (this.data.title === 'authenticateToRealm') {
                var itemData = this.data.itemData;
                if (itemData.authenticateToRealm.indexOf('/') !== 0) {
                    itemData.authenticateToRealm = '/' + itemData.authenticateToRealm;
                }
            }
        }
    });

    return ConditionAttrStringView;
});