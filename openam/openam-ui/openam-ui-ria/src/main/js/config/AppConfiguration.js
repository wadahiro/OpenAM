/**
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 *
 * Copyright (c) 2011-2015 ForgeRock AS. All rights reserved.
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

/*global define*/

/**
 * @author yaromin
 */
define("config/AppConfiguration", [
    "org/forgerock/commons/ui/common/util/Constants"
], function(Constants) {
    var obj = {
            moduleDefinition: [
                {
                    moduleClass: "org/forgerock/commons/ui/common/main/SessionManager",
                    configuration: {
                        loginHelperClass: "org/forgerock/openam/ui/user/login/RESTLoginHelper"
                    }
                },
                {
                    moduleClass: "org/forgerock/commons/ui/common/main/GenericRouteInterfaceMap",
                    configuration: {
                        LoginView : "org/forgerock/openam/ui/user/login/RESTLoginView",
                        UserProfileView : "org/forgerock/commons/ui/user/profile/UserProfileView",
                        LoginDialog : "org/forgerock/openam/ui/user/login/RESTLoginDialog",
                        RegisterView : "org/forgerock/openam/ui/user/profile/RegisterView",
                        ChangeSecurityDataDialog : "org/forgerock/openam/ui/user/profile/ChangeSecurityDataDialog"
                    }
                },
                {
                    moduleClass: "org/forgerock/commons/ui/common/main/Router",
                    configuration: {
                        routes: { },
                        loader: [
                            { "routes": "config/routes/AMRoutesConfig" },
                            { "routes": "config/routes/CommonRoutesConfig" },
                            { "routes": "config/routes/UserRoutesConfig" },
                            { "routes": "config/routes/admin/AdminRoutes" },
                            { "routes": "config/routes/admin/RealmsRoutes" },
                            { "routes": "config/routes/user/UMARoutes" }
                        ]
                    }
                },
                {
                    moduleClass: "org/forgerock/commons/ui/common/SiteConfigurator",
                    configuration: {
                        selfRegistration: false,
                        enterprise: false,
                        remoteConfig: true,
                        delegate: "org/forgerock/openam/ui/common/delegates/SiteConfigurationDelegate"
                    }
                },
                {
                    moduleClass: "org/forgerock/commons/ui/common/main/ProcessConfiguration",
                    configuration: {
                        processConfigurationFiles: [
                            "config/process/AMConfig",
                            "config/process/UserConfig",
                            "config/process/CommonConfig"
                        ]
                    }
                },
                {
                    moduleClass: "org/forgerock/commons/ui/common/main/ServiceInvoker",
                    configuration: {
                        defaultHeaders: {
                        }
                    }
                },
                {
                    moduleClass: "org/forgerock/commons/ui/common/main/ErrorsHandler",
                    configuration: {
                        defaultHandlers: {
                        },
                        loader: [
                                {"defaultHandlers":"config/errorhandlers/CommonErrorHandlers"}
                        ]
                    }
                },
                {
                    moduleClass: "org/forgerock/commons/ui/common/util/UIUtils",
                    configuration: {
                        templateUrls: [
                            "templates/uma/backgrid/cell/RevokeCell.html",
                            "templates/uma/backgrid/cell/SelectizeCell.html",
                            "templates/user/ConfirmPasswordDialogTemplate.html"
                        ]
                    }
                },
                {
                    moduleClass: "org/forgerock/commons/ui/common/components/Messages",
                    configuration: {
                        messages: {
                        },
                        loader: [
                                {"messages":"config/messages/CommonMessages"},
                                {"messages":"config/messages/UserMessages"},
                                {"messages":"config/AppMessages"}
                        ]
                    }
                },
                {
                    moduleClass: "org/forgerock/commons/ui/common/main/ValidatorsManager",
                    configuration: {
                         policyDelegate: "org/forgerock/openam/ui/common/delegates/PolicyDelegate",
                         validators: { },
                         loader: [
                             {"validators": "config/validators/UserValidators"},
                             {"validators": "config/validators/CommonValidators"}
                         ]
                    }
                },
                {
                    moduleClass: "org/forgerock/commons/ui/common/components/Navigation",
                    configuration: {
                        userBar: [
                            {
                                "id": "profileLink",
                                "href": "#profile/",
                                "i18nKey": "common.user.profile"
                            }, {
                                "id": "changePasswordLink",
                                "event" : Constants.EVENT_SHOW_CHANGE_SECURITY_DIALOG,
                                "i18nKey": "common.user.changePassword"
                            }, {
                                "id": "logoutLink",
                                "href": "#logout/",
                                "i18nKey": "common.form.logout"
                            }
                        ],
                        links: {
                            "admin": {
                                "role": "ui-admin",
                                "urls": {
                                    "commonTasks": {
                                        "url": "#commonTasks",
                                        "name": "config.AppConfiguration.Navigation.links.commonTasks",
                                        "icon": "fa fa-check"
                                    },
                                    "realms": {
                                        "url": "#realms",
                                        "name": "config.AppConfiguration.Navigation.links.realms",
                                        "icon": "fa fa-cloud",
                                        "dropdown" : true,
                                        "urls": [{
                                            "url": "#realms",
                                            "name": "Show All",
                                            "icon": "fa fa-th"
                                        },
                                        {
                                            "event": "New Realm BS Event triggered here",
                                            "name": "New Realm",
                                            "icon": "fa fa-plus"
                                        }]
                                    },
                                    "federation": {
                                        "url": "#federation",
                                        "name": "config.AppConfiguration.Navigation.links.federation",
                                        "icon": "fa fa-building-o"
                                    },
                                    "configuration": {
                                        "url": "#configuration",
                                        "name": "config.AppConfiguration.Navigation.links.configuration",
                                        "icon": "fa fa-cog"
                                    },
                                    "sessions": {
                                        "url": "#sessions",
                                        "name": "config.AppConfiguration.Navigation.links.sessions",
                                        "icon": "fa fa-users"
                                    }
                                }
                            },
                            "user" : {
                                "urls": {
                                    "dashboard": {
                                        "url": "#dashboard/",
                                        "name": "config.AppConfiguration.Navigation.links.dashboard",
                                        "icon": "fa fa-dashboard",
                                        "inactive": false
                                    },
                                    "uma": {
                                        "url": "#uma/resources/",
                                        "icon": "fa fa-user",
                                        "name": "config.AppConfiguration.Navigation.links.uma",
                                        "urls": {
                                            "listResource": {
                                                "url": "#uma/resources/",
                                                "name": "config.AppConfiguration.Navigation.links.umaLinks.resources"
                                            },
                                            "listHistory": {
                                                "url": "#uma/history/",
                                                "name": "config.AppConfiguration.Navigation.links.umaLinks.history"
                                            }/*,
                                            "users": {
                                                "url": "#uma/users/",
                                                "name": "config.AppConfiguration.Navigation.links.umaLinks.users"
                                            },
                                            "listApplication": {
                                                "url": "#uma/apps/",
                                                "name": "config.AppConfiguration.Navigation.links.umaLinks.apps"
                                            }*/
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            ],
            loggerLevel: 'debug'
        };
    return obj;
});
