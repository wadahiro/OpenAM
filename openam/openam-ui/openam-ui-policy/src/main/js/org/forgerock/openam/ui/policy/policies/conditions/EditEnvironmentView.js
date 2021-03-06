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

/*global window, define, $, _, console, Handlebars */

define("org/forgerock/openam/ui/policy/policies/conditions/EditEnvironmentView", [
    "org/forgerock/commons/ui/common/main/AbstractView",
    "org/forgerock/commons/ui/common/util/UIUtils",
    "org/forgerock/openam/ui/policy/common/HelpLinkView",
    "org/forgerock/openam/ui/policy/policies/conditions/ConditionAttrBooleanView",
    "org/forgerock/openam/ui/policy/policies/conditions/ConditionAttrArrayView",
    "org/forgerock/openam/ui/policy/policies/conditions/ConditionAttrStringView",
    "org/forgerock/openam/ui/policy/policies/conditions/ConditionAttrObjectView",
    "org/forgerock/openam/ui/policy/policies/conditions/ConditionAttrEnumView",
    "org/forgerock/openam/ui/policy/policies/conditions/ConditionAttrTimeView",
    "org/forgerock/openam/ui/policy/policies/conditions/ConditionAttrDayView",
    "org/forgerock/openam/ui/policy/policies/conditions/ConditionAttrDateView",
    "org/forgerock/openam/ui/policy/policies/conditions/ConditionAttrTimeZoneView",
    "org/forgerock/openam/ui/policy/delegates/PolicyDelegate"
], function (AbstractView, uiUtils, HelpLink, BooleanAttr, ArrayAttr, StringAttr, ObjectAttr, EnumAttr, TimeAttr, DayAttr, DateAttr, TimeZoneAttr, PolicyDelegate) {
    var EditEnvironmentView = AbstractView.extend({
        events: {
            'change select#selection': 'changeType'
        },
        data: {},
        i18n: {
            'condition': { 'key': 'policy.conditionTypes.', 'title': '.title', 'props': '.props.' }
        },
        SCRIPT_RESOURCE: 'Script',

        render: function (schema, callback, element, itemID, itemData) {
            var self = this,
                hiddenData = {};

            this.setElement(element);

            this.data = $.extend(true, [], schema);
            this.data.itemID = itemID;

            _.each(this.data.conditions, function (condition) {
                condition.i18nKey = $.t(self.i18n.condition.key + condition.title + self.i18n.condition.title);
            });

            this.data.conditions = _.sortBy(this.data.conditions, "i18nKey");

            this.$el.append(uiUtils.fillTemplateWithData("templates/policy/policies/conditions/EditEnvironmentTemplate.html", this.data));

            this.setElement('#environment_' + itemID);

            if (itemData) {
                // Temporary fix, the name attribute is being added by the server after the policy is created.
                // TODO: Serverside solution required
                delete itemData.name;

                if (itemData.type === self.SCRIPT_RESOURCE) {
                    hiddenData[itemData.type] = itemData.scriptId;
                    this.$el.data('hiddenData', hiddenData);
                }

                this.$el.data('itemData', itemData);
                this.$el.find('select#selection').val(itemData.type).trigger('change');
            }

            this.$el.find('select#selection').focus();

            this.$el.find('.fa[data-toggle="popover"]').popover();

            if (callback) {
                callback();
            }
        },

        createListItem: function (allEnvironments, item) {
            var self = this,
                itemToDisplay = null,
                itemData = item.data().itemData,
                hiddenData = item.data().hiddenData,
                mergedData = _.merge({}, itemData, hiddenData),
                type;

            item.focus(); //  Required to trigger changeInput.
            this.data.conditions = allEnvironments;

            if (mergedData && mergedData.type) {
                type = mergedData.type;
                itemToDisplay = {};
                if (type === self.SCRIPT_RESOURCE) {
                    itemToDisplay['policy.common.type'] = $.t(self.i18n.condition.key + type + self.i18n.condition.title);
                    PolicyDelegate.getScriptById(mergedData.scriptId).done(function (script) {
                        itemToDisplay[self.i18n.condition.key + type + self.i18n.condition.props + 'scriptId'] = script.name;
                        self.setListItemHtml(item, itemToDisplay);
                    });
                } else {
                    _.each(mergedData, function (val, key) {
                        if (key === 'type') {
                            itemToDisplay['policy.common.type'] = $.t(self.i18n.condition.key + type + self.i18n.condition.title);
                        } else {
                            itemToDisplay[self.i18n.condition.key + type + self.i18n.condition.props + key] = val;
                        }
                    });
                    this.setListItemHtml(item, itemToDisplay);
                }
            } else {
                this.setListItemHtml(item, itemToDisplay);
            }

        },

        setListItemHtml: function(item, itemToDisplay) {
            var html = uiUtils.fillTemplateWithData('templates/policy/policies/conditions/ListItem.html', {data: itemToDisplay});
            item.find('.item-data').html(html);
            this.setElement('#' + item.attr('id'));
        },

        changeType: function (e) {
            e.stopPropagation();
            var self = this,
                itemData = {},
                hiddenData = {},
                selectedType = e.target.value,
                schema = _.findWhere(this.data.conditions, {title: selectedType}) || {},
                delay = self.$el.find('.field-float-pattern').length > 0 ? 500 : 0,
                helperText;

            if (this.$el.data().itemData && this.$el.data().itemData.type === selectedType) {
                itemData = this.$el.data().itemData;
                hiddenData = this.$el.data().hiddenData;
            } else {
                itemData = self.setDefaultJsonValues(schema);
                self.$el.data('itemData', itemData);
                self.$el.data('hiddenData', hiddenData);
            }

            if (itemData) {
                self.animateOut();
                helperText = this.getHelperText(schema);

                // setTimeout needed to delay transitions.
                setTimeout(function () {
                    self.$el.find('.no-float').remove();
                    self.$el.find('.clear-left').remove();

                    if (helperText) {
                        new HelpLink().render(self.$el.find('.help-link'), helperText);
                    } else {
                        self.$el.find('.help-link').empty();
                    }

                    if (!self.$el.parents('#dropbox').length || self.$el.hasClass('editing')) {
                        self.buildHTML(itemData, hiddenData, schema);
                    }

                    self.animateIn();
                }, delay);
            }
        },

        getHelperText: function (schema) {
            var helperText;
            switch (schema.title) {
                case 'IPv4': // fall through
                case 'IPv6':
                    helperText = Handlebars.helpers.t('policy.conditionTypes.ipHelper');
                    break;
                case 'SimpleTime':
                    helperText = Handlebars.helpers.t('policy.conditionTypes.SimpleTime.helper');
                    break;
                default:
                    helperText = '';
                    break;
            }
            return helperText;
        },

        buildHTML: function (itemData, hiddenData, schema) {
            var self = this,
                itemDataEl = this.$el.find('.item-data'),
                schemaProps = schema.config.properties,
                i18nKey,
                attributesWrapper,
                attributesSelector = '.condition-attr';

            if (itemData.type === "SimpleTime") {
                attributesWrapper = '<div class="clearfix clear-left" id="conditionAttrTimeDate"></div>';
                new TimeAttr().render({itemData: itemData}, itemDataEl);
                new DayAttr().render({itemData: itemData}, itemDataEl);
                new DateAttr().render({itemData: itemData}, itemDataEl);
                new TimeZoneAttr().render({itemData: itemData}, itemDataEl);
            } else if (schema.title === self.SCRIPT_RESOURCE) {
                attributesWrapper = '<div class="no-float"></div>';
                if (itemData && itemData.scriptId) {
                    PolicyDelegate.getScriptById(itemData.scriptId).done(function (script) {
                        hiddenData[itemData.type] = script.name;
                        new ArrayAttr().render({itemData: itemData, hiddenData: hiddenData, data: [hiddenData[itemData.type]], title: 'scriptId', i18nKey: self.i18n.condition.key + schema.title + self.i18n.condition.props + 'scriptId', dataSource: 'scripts'}, itemDataEl);
                        self.animateIn();
                    });
                } else {
                    new ArrayAttr().render({itemData: itemData, hiddenData: hiddenData, data: [hiddenData[itemData.type]], title: 'scriptId', i18nKey: self.i18n.condition.key + schema.title + self.i18n.condition.props + 'scriptId', dataSource: 'scripts'}, itemDataEl);
                }
            } else {
                attributesWrapper = '<div class="no-float"></div>';

                _.map(schemaProps, function (value, key) {
                    i18nKey = self.i18n.condition.key + schema.title + self.i18n.condition.props + key;

                    switch (value.type) {
                        case 'string': // fall through
                        case 'number': // fall through
                        case 'integer':
                            new StringAttr().render({itemData: itemData, data: itemData[key], title: key, i18nKey: i18nKey, schema: schema, value: value}, itemDataEl);
                            break;
                        case 'boolean':
                            new BooleanAttr().render({itemData: itemData, data: value, title: key, i18nKey: i18nKey, selected: itemData[key]}, itemDataEl);
                            break;
                        case 'array':
                            new ArrayAttr().render({itemData: itemData, data: itemData[key], title: key, i18nKey: i18nKey}, itemDataEl);
                            break;
                        case 'object':
                            new ObjectAttr().render({itemData: itemData, data: itemData[key], title: key, i18nKey: i18nKey}, itemDataEl);
                            break;
                        default:
                            break;
                    }
                });
            }
            this.$el.find(attributesSelector).wrapAll(attributesWrapper);
        },

        setDefaultJsonValues: function (schema) {
            var itemData = {type: schema.title};
            _.map(schema.config.properties, function (value, key) {
                switch (value.type) {
                    case 'string':
                        if (key === 'authenticateToRealm') {
                            itemData[key] = '/';
                        } else if (key !== 'startIp' && key !== 'endIp') {
                            // OPENAM-5182: we should not submit empty string if IP is missing
                            itemData[key] = '';
                        }
                        break;
                    case 'number': // fall through
                    case 'integer':
                        itemData[key] = 0;
                        break;
                    case 'boolean':
                        itemData[key] = false;
                        break;
                    case 'array':
                        itemData[key] = [];
                        break;
                    case 'object':
                        itemData[key] = {};
                        break;
                    default:
                        console.error('Unexpected data type:', key, value);
                        break;
                }
            });

            return itemData;
        },

        animateOut: function () {
            // hide all items except the title selector
            this.$el.find('.no-float').fadeOut(500);
            this.$el.find('.clear-left').fadeOut(500);
            this.$el.find('.field-float-pattern, .field-float-selectize, .timezone-field')
                .find('label').removeClass('showLabel')
                .next('input').addClass('placeholderText');

            this.$el.find('.field-float-select select:not(#selection)').addClass('placeholderText')
                .prev('label').removeClass('showLabel');

            this.$el.removeClass('invalid-rule');
        },

        animateIn: function () {
            var self = this;
            setTimeout(function () {
                self.$el.find('.field-float-pattern, .field-float-selectize, .timezone-field')
                    .find('label').addClass('showLabel')
                    .next('input, div input').removeClass('placeholderText').prop('readonly', false);

                self.$el.find('.field-float-select select:not(#selection)').removeClass('placeholderText').prop('readonly', false)
                    .prev('label').addClass('showLabel');
            }, 10);
        }
    });

    return EditEnvironmentView;
});