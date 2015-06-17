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

/*global window, define, $ _ */

define("org/forgerock/openam/ui/policy/common/StripedListView", [
    "org/forgerock/commons/ui/common/main/AbstractView",
    "org/forgerock/commons/ui/common/util/UIUtils"
], function (AbstractView, UIUtils) {
    return AbstractView.extend({
        noBaseTemplate: true,
        template: 'templates/policy/common/StripedListWrapperTemplate.html',
        events: {
            'click .list-group-item': 'clickItem',
            'keyup .list-group-item': 'clickItem',
            'click .striped-list-filter': 'filterItems',
            'keyup .striped-list-filter': 'filterItems'
        },

        render: function (data, el, callback) {
            this.data = data;
            this.element = el;
            this.items = data.items ? _.cloneDeep(data.items).sort() : [];

            if (!this.data.itemTpl) {
                this.data.itemTpl = "templates/policy/common/StripedListItemTemplate.html";
            }

            this.parentRender(function () {
                this.renderItems();

                if (callback) {
                    callback();
                }
            });
        },

        renderItems: function () {
            this.data.items = this.filter ? this.getFilteredItems() : this.getAllItems();
            this.$el.find('.list-group').html(UIUtils.fillTemplateWithData(this.data.itemTpl, this.data));
        },

        clickItem: function (e) {
            if (e.type === 'keyup') {
                switch (e.keyCode) {
                    case 38: // arrow down
                        $(e.target).prev('li').focus();
                        return;
                    case 40: // arrow up
                        $(e.target).next('li').focus();
                        return;
                    case 13:
                        break;
                    default:
                        return;
                }
            }

            if ((this.data.created && !$(e.target).is('.fa-close')) ||
                $(e.target).is('.radio-inline') ||
                $(e.target).parents('.radio-inline').length) {
                return;
            }

            var target = $(e.currentTarget),
                li = target.is('li') ? target : target.parents('li'),
                item = li.data('listItem');

            if (!item) {
                return;
            }

            if (this.data.clickItem) {
                this.data.clickItem(item);
            }
        },

        filterItems: function (e) {
            if (e.type === 'keyup' && e.keyCode === 40) {
                $(e.target).parent().next().find('li:first-child').focus();
                return;
            }

            this.setFilter(e.currentTarget.value);
            this.renderItems();
        },

        emptyFilter: function () {
            this.setFilter('');

            this.$el.find('.striped-list-filter').val('');
        },

        setFilter: function (filter) {
            this.filter = filter.toString().toLowerCase();
        },

        getAllItems: function () {
            return this.items;
        },

        getFilteredItems: function () {
            var filter = this.filter;

            return _.filter(this.items, function (item) {
                return item.toString().toLowerCase().indexOf(filter) !== -1;
            });
        },

        removeItem: function (item) {
            this.items = _.without(this.items, item);
        },

        addItem: function (item) {
            this.items.push(item);
            this.items.sort();
        }
    });
});
