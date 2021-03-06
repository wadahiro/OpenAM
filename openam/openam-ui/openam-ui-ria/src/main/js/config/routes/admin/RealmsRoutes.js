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

/*global, define*/
define('config/routes/admin/RealmsRoutes', function () {
    var scopedByRealm = function (fragment) {
        return new RegExp('^realms\/([^\/]+)\/' + fragment + '$');
    },
    defaultScopedByRealm = function (fragment) {
        return scopedByRealm('?(?:' + fragment + ')?');
    };

    return {
        'realms': {
            view: 'org/forgerock/openam/ui/admin/views/realms/RealmsListView',
            url: /^realms\/*$/,
            pattern: 'realms',
            role: 'ui-admin'
        },
        'realmsGeneral': {
            view: 'org/forgerock/openam/ui/admin/views/realms/RealmView',
            page: 'org/forgerock/openam/ui/admin/views/realms/general/GeneralView',
            url: scopedByRealm('general\/?'),
            pattern: 'realms/?/general',
            role: 'ui-admin'
        },
        'realmsAuthenticationSettings': {
            view: 'org/forgerock/openam/ui/admin/views/realms/RealmView',
            page: 'org/forgerock/openam/ui/admin/views/realms/authentication/SettingsView',
            url: defaultScopedByRealm('authentication\/?(?:settings\/?)?'),
            pattern: 'realms/?/authentication/settings',
            role: 'ui-admin'
        },
        // TODO: Remove this *very* soon
        'realmsAuthenticationAdvanced': {
            view: 'org/forgerock/openam/ui/admin/views/realms/RealmView',
            page: 'org/forgerock/openam/ui/admin/views/realms/authentication/AdvancedView',
            url: scopedByRealm('authentication\/advanced\/?'),
            pattern: 'realms/?/authentication/advanced',
            role: 'ui-admin'
        },
        'realmsAuthenticationChains': {
            view: 'org/forgerock/openam/ui/admin/views/realms/RealmView',
            page: 'org/forgerock/openam/ui/admin/views/realms/authentication/ChainsView',
            url: scopedByRealm('authentication\/chains\/?'),
            pattern: 'realms/?/authentication/chains',
            role: 'ui-admin'
        },
        'realmsAuthenticationChainEdit': {
            view: 'org/forgerock/openam/ui/admin/views/realms/RealmView',
            page: 'org/forgerock/openam/ui/admin/views/realms/authentication/chains/EditChainView',
            url: scopedByRealm('authentication\/chains\/([^\/]+)'),
            pattern: 'realms/?/authentication/chains/?',
            role: 'ui-admin'
        },
        'realmsAuthenticationModules': {
            view: 'org/forgerock/openam/ui/admin/views/realms/RealmView',
            page: 'org/forgerock/openam/ui/admin/views/realms/authentication/ModulesView',
            url: scopedByRealm('authentication\/modules\/?'),
            pattern: 'realms/?/authentication/modules',
            role: 'ui-admin'
        },
        'realmsAuthenticationModuleEdit': {
            view: 'org/forgerock/openam/ui/admin/views/realms/RealmView',
            page: 'org/forgerock/openam/ui/admin/views/realms/authentication/modules/EditModuleView',
            url: scopedByRealm('authentication\/modules\/([^\/]+)'),
            pattern: 'realms/?/authentication/modules/?',
            role: 'ui-admin'
        },
        'realmsServices': {
            view: 'org/forgerock/openam/ui/admin/views/realms/RealmView',
            page: 'org/forgerock/openam/ui/admin/views/realms/services/ServicesView',
            url: scopedByRealm('services\/?'),
            pattern: 'realms/?/services',
            role: 'ui-admin'
        },
        'realmsDataStores': {
            view: 'org/forgerock/openam/ui/admin/views/realms/RealmView',
            page: 'org/forgerock/openam/ui/admin/views/realms/dataStores/DataStoresView',
            url: scopedByRealm('dataStores\/?'),
            pattern: 'realms/?/dataStores',
            role: 'ui-admin'
        },
        'realmsPrivileges': {
            view: 'org/forgerock/openam/ui/admin/views/realms/RealmView',
            page: 'org/forgerock/openam/ui/admin/views/realms/privileges/PrivilegesView',
            url: scopedByRealm('privileges\/?'),
            pattern: 'realms/?/privileges',
            role: 'ui-admin'
        },
        'realmsPolicies': {
            view: 'org/forgerock/openam/ui/admin/views/realms/RealmView',
            page: 'org/forgerock/openam/ui/admin/views/realms/policies/PoliciesView',
            url: scopedByRealm('policies\/?'),
            pattern: 'realms/?/policies',
            role: 'ui-admin'
        },
        'realmsSubjects': {
            view: 'org/forgerock/openam/ui/admin/views/realms/RealmView',
            page: 'org/forgerock/openam/ui/admin/views/realms/subjects/SubjectsView',
            url: scopedByRealm('subjects\/?'),
            pattern: 'realms/?/subjects',
            role: 'ui-admin'
        },
        'realmsAgents': {
            view: 'org/forgerock/openam/ui/admin/views/realms/RealmView',
            page: 'org/forgerock/openam/ui/admin/views/realms/agents/AgentsView',
            url: scopedByRealm('agents\/?'),
            pattern: 'realms/?/agents',
            role: 'ui-admin'
        },
        'realmsSTS': {
            view: 'org/forgerock/openam/ui/admin/views/realms/RealmView',
            page: 'org/forgerock/openam/ui/admin/views/realms/sts/STSView',
            url: scopedByRealm('sts\/?'),
            pattern: 'realms/?/sts',
            role: 'ui-admin'
        },
        'realmsScriptList': {
            view: 'org/forgerock/openam/ui/admin/views/realms/RealmView',
            page: 'org/forgerock/openam/ui/admin/views/realms/scripts/ScriptListView',
            url: scopedByRealm('scripts\/list'),
            pattern: 'realms/?/scripts/list',
            role: 'ui-admin'
        },
        'realmsEditScript': {
            view: 'org/forgerock/openam/ui/admin/views/realms/RealmView',
            page: 'org/forgerock/openam/ui/admin/views/realms/scripts/EditScriptView',
            url: scopedByRealm('scripts\/edit\/?'),
            pattern: 'realms/?/scripts/edit/?',
            role: 'ui-admin'
        }
    };
});
