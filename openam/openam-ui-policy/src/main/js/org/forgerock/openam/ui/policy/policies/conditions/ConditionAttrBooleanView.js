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

define("org/forgerock/openam/ui/policy/policies/conditions/ConditionAttrBooleanView", [
    "org/forgerock/openam/ui/policy/policies/conditions/ConditionAttrBaseView"
], function (ConditionAttrBaseView) {
    var ConditionAttrBooleanView = ConditionAttrBaseView.extend({
        template: 'templates/policy/policies/conditions/ConditionAttrBoolean.html',

        render: function (data, element, callback) {
            this.initBasic(data, element, 'field-float-pattern data-obj button-field');

            this.events['click .btn'] = _.bind(this.buttonControlClick, this);
            this.events['keyup .btn'] = _.bind(this.buttonControlClick, this);

            this.parentRender(function () {
                if (callback) {
                    callback();
                }
            });
        },

        buttonControlClick: function (e) {
            if (e.type === 'keyup' && e.keyCode !== 13) {
                return;
            }

            var target = $(e.currentTarget),
                buttonControl = target.closest('.btn-group'),
                label = buttonControl.prev('label').data().title,
                secondButton = buttonControl.find('.btn.btn-primary');

            if (target.hasClass('btn-primary')) {
                return;
            }

            this.data.itemData[label] = target.data('val');

            secondButton.removeClass('btn-primary');
            secondButton.addClass('btn-default');

            target.addClass('btn-primary');
            target.removeClass('btn-default');
        }
    });

    return ConditionAttrBooleanView;
});