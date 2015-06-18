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

/*global define Backbone, _, $*/

define("org/forgerock/openam/ui/policy/util/BackgridUtils", [
    "backgrid",
    "org/forgerock/commons/ui/common/util/UIUtils"
], function (Backgrid, UIUtils) {
    var obj = {};

    /**
     * Handlebars Template Cell Renderer
     * <p>
     * You must extend this renderer and specify a "template" attribute e.g.
     * <p>
     * MyCell = backgridUtils.TemplateCell.extend({
     *     template: "templates/MyTemplate.html"
     * });
     */
    // TODO: difference from UMA: using fillTemplateWithData() instead of render() to pass data to the template
    obj.TemplateCell = Backgrid.Cell.extend({
        className: 'template-cell',

        events: {
            'click': '_onClick'
        },

        render: function () {
            this.$el.html(UIUtils.fillTemplateWithData(this.template, this.model.attributes));

            if (this.additionalClassName) {
                this.$el.addClass(this.additionalClassName);
            }

            if (this.callback) {
                this.callback();
            }

            this.delegateEvents();

            return this;
        },

        _onClick: function (e) {
            if (this.onClick) {
                this.onClick(e, this.model.id);
            }
        }
    });

    // TODO: candidate for commons
    obj.ObjectCell = Backgrid.Cell.extend({
        className: 'object-formatter-cell',

        render: function () {
            this.$el.empty();

            var object = this.model.get(this.column.attributes.name),
                result = '<dl class="dl-horizontal">',
                prop;

            for (prop in object) {
                if (_.isString(object[prop])) {
                    result += '<dt>' + prop + '</dt><dd>' + object[prop] + '</dd>';
                } else {
                    result += '<dt>' + prop + '</dt><dd>' + JSON.stringify(object[prop]) + '</dd>';
                }
            }
            result += '</dl>';

            this.$el.append(result);

            this.delegateEvents();
            return this;
        }
    });

    // TODO: candidate for commons
    obj.ArrayCell = Backgrid.Cell.extend({
        className: 'array-formatter-cell',

        buildHtml: function (arrayVal) {
            var result = '<ul>',
                i = 0;

            for (; i < arrayVal.length; i++) {
                if (_.isString(arrayVal[i])) {
                    result += '<li>' + arrayVal[i] + '</li>';
                } else {
                    result += '<li>' + JSON.stringify(arrayVal[i]) + '</li>';
                }
            }
            result += '</ul>';

            return result;
        },

        render: function () {
            this.$el.empty();

            var arrayVal = this.model.get(this.column.attributes.name);
            this.$el.append(this.buildHtml(arrayVal));

            this.delegateEvents();
            return this;
        }
    });

    // TODO: candidate for commons, placeholder is the only difference with UMA
    obj.FilterHeaderCell = Backgrid.HeaderCell.extend({
        className: 'filter-header-cell',
        render: function () {
            var filter = new Backgrid.Extension.ServerSideFilter({
                name: this.column.get("name"),
                placeholder: $.t('policy.applications.list.filterBy', { value: this.column.get("label") }),
                collection: this.collection
            });
            this.collection.state.filters = this.collection.state.filters ? this.collection.state.filters : [];
            this.collection.state.filters.push(filter);
            obj.FilterHeaderCell.__super__.render.apply(this);
            this.$el.append(filter.render().el);
            return this;
        }
    });

    obj.queryFilter = function (customFilters) {
        var params = [];

        customFilters = customFilters || [];

        _.each(this.state.filters, function (filter) {
            if (filter.query() !== '') {
                // todo: No server side support for 'co' ATM
                params.push(filter.name + '+eq+' + encodeURIComponent('"*' + filter.query() + '*"'));
            }
        });

        params = params.concat(customFilters);

        return params.length === 0 || params.join('+AND+');
    };

    obj.sync = function (method, model, options) {
        var params = [],
            includeList = ['_pageSize', '_pagedResultsOffset', '_sortKeys', '_queryFilter'];

        _.forIn(options.data, function (val, key) {
            if (_.include(includeList, key)) {
                params.push(key + '=' + val);
            }
        });

        options.data = params.join('&');

        return Backbone.sync(method, model, options);
    };

    /**
     * Clickable Row
     * <p>
     * You must extend this row and specify a "callback" attribute e.g.
     * <p>
     * MyRow = BackgridUtils.ClickableRow.extend({
     *     callback: myCallback
     * });
     */
        //TODO: commons candidate
    obj.ClickableRow = Backgrid.Row.extend({
        events: {
            "click": "onClick"
        },

        onClick: function (e) {
            if (this.callback) {
                this.callback(e);
            }
        }
    });

    // TODO: candidate for commons, have not changed it, using UMA version
    obj.parseRecords = function (data, options) {
        return data.result;
    };

    // TODO: candidate for commons, have not changed it, using UMA version
    obj.sortKeys = function () {
        return this.state.order === 1 ? '-' + this.state.sortKey : this.state.sortKey;
    };

    // TODO: candidate for commons, have not changed it, using UMA version
    // FIXME: Workaround to fix "Double sort indicators" issue
    // @see https://github.com/wyuenho/backgrid/issues/453
    obj.doubleSortFix = function (model) {
        // No ids so identify model with CID
        var cid = model.cid,
            filtered = model.collection.filter(function (model) {
                return model.cid !== cid;
            });

        _.each(filtered, function (model) {
            model.set('direction', null);
        });
    };

    // TODO: candidate for commons, have not changed it, using UMA version
    obj.parseState = function (resp, queryParams, state, options) {
        if (!this.state.totalRecords) {
            this.state.totalRecords = resp.remainingPagedResults + resp.resultCount;
        }
        if (!this.state.totalPages) {
            this.state.totalPages = Math.ceil(this.state.totalRecords / this.state.pageSize);
        }
        return this.state;
    };

    // TODO: candidate for commons, have not changed it, using UMA version
    obj.pagedResultsOffset = function () {
        return (this.state.currentPage - 1) * this.state.pageSize;
    };

    obj.getQueryParams = function (data) {
        data = data || {};

        return {
            _sortKeys: this.sortKeys,
            _queryFilter: function () {
                return obj.queryFilter.call(this, data._queryFilter);
            },
            pageSize: "_pageSize",
            _pagedResultsOffset: this.pagedResultsOffset
        };
    };

    obj.getState = function (data) {
        var state = {
            pageSize: 10,
            sortKey: "name"
        };

        if (data && typeof data === 'object') {
            _.extend(state, data);
        }
        return state;
    };

    return obj;
});