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

/*global require, define*/
define([
    "text!templates/policy/common/HelpLinkTemplate.html",
    "text!templates/policy/common/StripedListItemTemplate.html",
    "text!templates/policy/common/StripedListWrapperTemplate.html",

    "text!templates/policy/login/LoginDialog.html",

    "text!templates/policy/applications/EditApplicationTemplate.html",
    "text!templates/policy/applications/ApplicationsListToolbarTemplate.html",
    "text!templates/policy/applications/ApplicationsListActionsCellTemplate.html",
    "text!templates/policy/applications/ApplicationsListTemplate.html",
    "text!templates/policy/applications/ReviewApplicationStepTemplate.html",

    "text!templates/policy/policies/attributes/StaticAttributesTemplate.html",
    "text!templates/policy/policies/attributes/SubjectAttributesTemplate.html",

    "text!templates/policy/policies/conditions/ConditionAttrArray.html",
    "text!templates/policy/policies/conditions/ConditionAttrBoolean.html",
    "text!templates/policy/policies/conditions/ConditionAttrDate.html",
    "text!templates/policy/policies/conditions/ConditionAttrDay.html",
    "text!templates/policy/policies/conditions/ConditionAttrEnum.html",
    "text!templates/policy/policies/conditions/ConditionAttrObject.html",
    "text!templates/policy/policies/conditions/ConditionAttrString.html",
    "text!templates/policy/policies/conditions/ConditionAttrTime.html",
    "text!templates/policy/policies/conditions/ConditionAttrTimeZone.html",
    "text!templates/policy/policies/conditions/EditEnvironmentTemplate.html",
    "text!templates/policy/policies/conditions/EditSubjectTemplate.html",
    "text!templates/policy/policies/conditions/LegacyListItem.html",
    "text!templates/policy/policies/conditions/ListItem.html",
    "text!templates/policy/policies/conditions/ManageRulesTemplate.html",
    "text!templates/policy/policies/conditions/OperatorRulesTemplate.html",

    "text!templates/policy/policies/EditPolicyTemplate.html",
    "text!templates/policy/policies/PoliciesListToolbarTemplate.html",
    "text!templates/policy/policies/PoliciesListTemplate.html",
    "text!templates/policy/policies/ReviewPolicyStepTemplate.html",
    "text!templates/policy/policies/PoliciesListHeaderTemplate.html",
    "text!templates/policy/policies/ResourcesStepTemplate.html",
    "text!templates/policy/policies/PolicyActionsTemplate.html",
    "text!templates/policy/policies/StripedListActionItemTemplate.html",

    "text!templates/policy/resources/CreatedResourcesTemplate.html",

    "text!templates/policy/resourcetypes/EditResourceTypeTemplate.html",
    "text!templates/policy/resourcetypes/ResourceTypesListToolbarTemplate.html",
    "text!templates/policy/resourcetypes/ResourceTypesListTemplate.html",
    "text!templates/policy/resourcetypes/ResourceTypesActionsTemplate.html",
    "text!templates/policy/resourcetypes/ResourceTypesPatternsTemplate.html",
    "text!templates/policy/resourcetypes/ReviewResourceTypeStepTemplate.html",

    "text!configuration.json"
], function () {
    /* an unfortunate need to duplicate the file names here, but I haven't
     yet found a way to fool requirejs into doing dynamic dependencies */
    var staticFiles = [
            "templates/policy/common/HelpLinkTemplate.html",
            "templates/policy/common/StripedListItemTemplate.html",
            "templates/policy/common/StripedListWrapperTemplate.html",

            "templates/policy/login/LoginDialog.html",

            "templates/policy/applications/EditApplicationTemplate.html",
            "templates/policy/applications/ApplicationsListToolbarTemplate.html",
            "templates/policy/applications/ApplicationsListActionsCellTemplate.html",
            "templates/policy/applications/ApplicationsListTemplate.html",
            "templates/policy/applications/ReviewApplicationStepTemplate.html",

            "templates/policy/policies/attributes/StaticAttributesTemplate.html",
            "templates/policy/policies/attributes/SubjectAttributesTemplate.html",

            "templates/policy/policies/conditions/ConditionAttrArray.html",
            "templates/policy/policies/conditions/ConditionAttrBoolean.html",
            "templates/policy/policies/conditions/ConditionAttrDate.html",
            "templates/policy/policies/conditions/ConditionAttrDay.html",
            "templates/policy/policies/conditions/ConditionAttrEnum.html",
            "templates/policy/policies/conditions/ConditionAttrObject.html",
            "templates/policy/policies/conditions/ConditionAttrString.html",
            "templates/policy/policies/conditions/ConditionAttrTime.html",
            "templates/policy/policies/conditions/ConditionAttrTimeZone.html",
            "templates/policy/policies/conditions/EditEnvironmentTemplate.html",
            "templates/policy/policies/conditions/EditSubjectTemplate.html",
            "templates/policy/policies/conditions/LegacyListItem.html",
            "templates/policy/policies/conditions/ListItem.html",
            "templates/policy/policies/conditions/ManageRulesTemplate.html",
            "templates/policy/policies/conditions/OperatorRulesTemplate.html",

            "templates/policy/policies/EditPolicyTemplate.html",
            "templates/policy/policies/PoliciesListToolbarTemplate.html",
            "templates/policy/policies/PoliciesListTemplate.html",
            "templates/policy/policies/ReviewPolicyStepTemplate.html",
            "templates/policy/policies/PoliciesListHeaderTemplate.html",
            "templates/policy/policies/ResourcesStepTemplate.html",
            "templates/policy/policies/PolicyActionsTemplate.html",
            "templates/policy/policies/StripedListActionItemTemplate.html",

            "templates/policy/resources/CreatedResourcesTemplate.html",

            "templates/policy/resourcetypes/EditResourceTypeTemplate.html",
            "templates/policy/resourcetypes/ResourceTypesListToolbarTemplate.html",
            "templates/policy/resourcetypes/ResourceTypesListTemplate.html",
            "templates/policy/resourcetypes/ResourceTypesActionsTemplate.html",
            "templates/policy/resourcetypes/ResourceTypesPatternsTemplate.html",
            "templates/policy/resourcetypes/ReviewResourceTypeStepTemplate.html",

            "configuration.json"
        ],
        deps = arguments;

    return function (server) {

        _.each(staticFiles, function (file, i) {
            server.respondWith(
                "GET",
                new RegExp(file.replace(/([\/\.\-])/g, "\\$1") + "$"),
                [
                    200,
                    { },
                    deps[i]
                ]
            );
        });

        server.respondWith(
            "GET",
            /\/json\/serverinfo\/\*/,
            [
                200,
                {
                    "Date": "Wed, 04 Mar 2015 08:59:05 GMT",
                    "Cache-Control": "no-cache",
                    "Server": "Apache-Coyote/1.1",
                    "ETag": "&quot;-451943112&quot;",
                    "Content-Length": "447",
                    "Content-API-Version": "protocol=1.0,resource=1.1",
                    "Content-Type": "application/json;charset=UTF-8"
                },
                "{\"domains\":[\".esergueeva.com\"],\"protectedUserAttributes\":[],\"cookieName\":\"iPlanetDirectoryPro\",\"secureCookie\":false,\"twoFactorAuthEnabled\":\"false\",\"twoFactorAuthMandatory\":\"false\",\"forgotPassword\":\"false\",\"selfRegistration\":\"false\",\"lang\":\"en\",\"successfulUserRegistrationDestination\":\"default\",\"socialImplementations\":[],\"referralsEnabled\":\"false\",\"zeroPageLogin\":{\"enabled\":false,\"refererWhitelist\":[\"\"],\"allowedWithoutReferer\":true},\"FQDN\":null}"
            ]
        );

        server.respondWith(
            "GET",
            /\/json\/applications\?/,
            [
                200,
                {
                    "Date": "Tue, 17 Feb 2015 14:38:47 GMT",
                    "Cache-Control": "no-cache",
                    "Server": "Apache-Coyote/1.1",
                    "Content-Length": "1034",
                    "Content-API-Version": "protocol=1.0,resource=2.0",
                    "Content-Type": "application/json;charset=UTF-8"
                },
                '{"result":[{"name":"123","attributeNames":[],"createdBy":"id=amadmin,ou=user,dc=openam,dc=forgerock,dc=org","applicationType":"iPlanetAMWebAgentService","lastModifiedBy":"id=amadmin,ou=user,dc=openam,dc=forgerock,dc=org","resourceTypeUuids":["76656a38-5f8e-401b-83aa-4ccb74ce88d2","74e62178-ab00-45cb-94e5-29dedbd617a5","6a90eabe-9638-4333-b688-3223aec7f58a"],"conditions":["AuthenticateToService","Script","AuthScheme","IPv6","SimpleTime","OAuth2Scope","IPv4","AuthenticateToRealm","OR","AMIdentityMembership","LDAPFilter","AuthLevel","SessionProperty","Policy","LEAuthLevel","Session","NOT","AND","ResourceEnvIP"],"realm":"/","description":null,"resourceComparator":null,"lastModifiedDate":1432631976414,"creationDate":1432631976414,"subjects":["JwtClaim","AuthenticatedUsers","Identity","NOT","Policy","AND","NONE","OR"],"entitlementCombiner":"DenyOverride","saveIndex":null,"searchIndex":null,"editable":true},{"name":"iPlanetAMWebAgentService","attributeNames":[],"createdBy":"id=dsameuser,ou=user,dc=openam,dc=forgerock,dc=org","applicationType":"iPlanetAMWebAgentService","lastModifiedBy":"id=dsameuser,ou=user,dc=openam,dc=forgerock,dc=org","resourceTypeUuids":["76656a38-5f8e-401b-83aa-4ccb74ce88d2"],"conditions":["AuthenticateToService","Script","AuthScheme","IPv6","SimpleTime","OAuth2Scope","IPv4","AuthenticateToRealm","OR","AMIdentityMembership","LDAPFilter","AuthLevel","SessionProperty","LEAuthLevel","Session","NOT","AND","ResourceEnvIP"],"realm":"/","description":"The built-in Application used by OpenAM Policy Agents.","resourceComparator":null,"lastModifiedDate":1430847403638,"creationDate":1430847403638,"subjects":["JwtClaim","AuthenticatedUsers","Identity","NOT","AND","NONE","OR"],"entitlementCombiner":"DenyOverride","saveIndex":null,"searchIndex":null,"editable":true}],"resultCount":2,"pagedResultsCookie":null,"remainingPagedResults":0}'
            ]
        );

        server.respondWith(
            "GET",
            /\/applications\/iPlanetAMWebAgentService/,
            [
                200,
                {
                    "Date": "Tue, 24 Feb 2015 10:05:38 GMT",
                    "Cache-Control": "no-cache",
                    "Server": "Apache-Coyote/1.1",
                    "ETag": "&quot;1424769879321&quot;",
                    "Content-Length": "874",
                    "Content-API-Version": "protocol=1.0,resource=1.0",
                    "Content-Type": "application/json;charset=UTF-8"
                },
                '{"name":"iPlanetAMWebAgentService","attributeNames":[],"createdBy":"id=dsameuser,ou=user,dc=openam,dc=forgerock,dc=org","applicationType":"iPlanetAMWebAgentService","lastModifiedBy":"id=dsameuser,ou=user,dc=openam,dc=forgerock,dc=org","resourceTypeUuids":["76656a38-5f8e-401b-83aa-4ccb74ce88d2"],"conditions":["AuthenticateToService","Script","AuthScheme","IPv6","SimpleTime","OAuth2Scope","IPv4","AuthenticateToRealm","OR","AMIdentityMembership","LDAPFilter","AuthLevel","SessionProperty","LEAuthLevel","Session","NOT","AND","ResourceEnvIP"],"realm":"/","description":"The built-in Application used by OpenAM Policy Agents.","resourceComparator":null,"lastModifiedDate":1430847403638,"creationDate":1430847403638,"subjects":["JwtClaim","AuthenticatedUsers","Identity","NOT","AND","NONE","OR"],"entitlementCombiner":"DenyOverride","saveIndex":null,"searchIndex":null,"editable":true}'
            ]
        );

        server.respondWith(
            "GET",
            /\/json\/applicationtypes\/iPlanetAMWebAgentService/,
            [
                200,
                {
                    "Date": "Thu, 18 Sep 2014 18:39:20 GMT",
                    "Cache-Control": "no-cache",
                    "Server": "Apache-Coyote/1.1",
                    "ETag": "&quot;1411065560848&quot;",
                    "Content-Length": "415",
                    "Content-API-Version": "protocol=1.0,resource=1.0",
                    "Content-Type": "application/json;charset=UTF-8"
                },
                "{\"name\":\"iPlanetAMWebAgentService\",\"actions\":{\"POST\":true,\"PATCH\":true,\"GET\":true,\"DELETE\":true,\"OPTIONS\":true,\"PUT\":true,\"HEAD\":true},\"saveIndex\":\"org.forgerock.openam.entitlement.indextree.TreeSaveIndex\",\"searchIndex\":\"org.forgerock.openam.entitlement.indextree.TreeSearchIndex\",\"applicationClassName\":\"com.sun.identity.entitlement.Application\",\"resourceComparator\":\"com.sun.identity.entitlement.URLResourceName\"}"
            ]
        );

        server.respondWith(
            "GET",
            /\/json\/subjecttypes\?_queryId=&_fields=title,logical,config/,
            [
                200,
                {
                    "Date": "Tue, 17 Feb 2015 14:38:53 GMT",
                    "Cache-Control": "no-cache",
                    "Server": "Apache-Coyote/1.1",
                    "Content-Length": "1072",
                    "Content-API-Version": "protocol=1.0,resource=1.0",
                    "Content-Type": "application/json;charset=UTF-8"
                },
                "{\"result\":[{\"title\":\"AND\",\"logical\":true,\"config\":{\"type\":\"object\",\"properties\":{\"subjects\":{\"type\":\"array\",\"items\":{\"type\":\"any\"}}}}},{\"title\":\"AuthenticatedUsers\",\"logical\":false,\"config\":{\"type\":\"object\",\"properties\":{}}},{\"title\":\"Identity\",\"logical\":false,\"config\":{\"type\":\"object\",\"properties\":{\"subjectValues\":{\"type\":\"array\",\"items\":{\"type\":\"string\"}}}}},{\"title\":\"JwtClaim\",\"logical\":false,\"config\":{\"type\":\"object\",\"properties\":{\"claimName\":{\"type\":\"string\"},\"claimValue\":{\"type\":\"string\"}}}},{\"title\":\"NONE\",\"logical\":false,\"config\":{\"type\":\"object\",\"properties\":{}}},{\"title\":\"NOT\",\"logical\":true,\"config\":{\"type\":\"object\",\"properties\":{\"subject\":{\"type\":\"object\",\"properties\":{}}}}},{\"title\":\"OR\",\"logical\":true,\"config\":{\"type\":\"object\",\"properties\":{\"subjects\":{\"type\":\"array\",\"items\":{\"type\":\"any\"}}}}},{\"title\":\"Policy\",\"logical\":false,\"config\":{\"type\":\"object\",\"properties\":{\"name\":{\"type\":\"string\"},\"className\":{\"type\":\"string\"},\"values\":{\"type\":\"array\",\"items\":{\"type\":\"string\"}}}}}],\"resultCount\":8,\"pagedResultsCookie\":null,\"remainingPagedResults\":0}"
            ]
        );

        server.respondWith(
            "GET",
            /\/json\/conditiontypes\?_queryId=&_fields=title,logical,config/,
            [
                200,
                {
                    "Date": "Tue, 17 Feb 2015 14:38:53 GMT",
                    "Cache-Control": "no-cache",
                    "Server": "Apache-Coyote/1.1",
                    "Content-Length": "2850",
                    "Content-API-Version": "protocol=1.0,resource=1.0",
                    "Content-Type": "application/json;charset=UTF-8"
                },
                "{\"result\":[{\"title\":\"AMIdentityMembership\",\"logical\":false,\"config\":{\"type\":\"object\",\"properties\":{\"amIdentityName\":{\"type\":\"array\",\"items\":{\"type\":\"string\"}}}}},{\"title\":\"AND\",\"logical\":true,\"config\":{\"type\":\"object\",\"properties\":{\"conditions\":{\"type\":\"array\",\"items\":{\"type\":\"any\"}}}}},{\"title\":\"AuthLevel\",\"logical\":false,\"config\":{\"type\":\"object\",\"properties\":{\"authLevel\":{\"type\":\"integer\"}}}},{\"title\":\"AuthScheme\",\"logical\":false,\"config\":{\"type\":\"object\",\"properties\":{\"authScheme\":{\"type\":\"array\",\"items\":{\"type\":\"string\"}},\"applicationIdleTimeout\":{\"type\":\"integer\"},\"applicationName\":{\"type\":\"string\"}}}},{\"title\":\"AuthenticateToRealm\",\"logical\":false,\"config\":{\"type\":\"object\",\"properties\":{\"authenticateToRealm\":{\"type\":\"string\"}}}},{\"title\":\"AuthenticateToService\",\"logical\":false,\"config\":{\"type\":\"object\",\"properties\":{\"authenticateToService\":{\"type\":\"string\"}}}},{\"title\":\"IPv4\",\"logical\":false,\"config\":{\"type\":\"object\",\"properties\":{\"startIp\":{\"type\":\"string\"},\"endIp\":{\"type\":\"string\"},\"dnsName\":{\"type\":\"array\",\"items\":{\"type\":\"string\"}}}}},{\"title\":\"IPv6\",\"logical\":false,\"config\":{\"type\":\"object\",\"properties\":{\"startIp\":{\"type\":\"string\"},\"endIp\":{\"type\":\"string\"},\"dnsName\":{\"type\":\"array\",\"items\":{\"type\":\"string\"}}}}},{\"title\":\"LDAPFilter\",\"logical\":false,\"config\":{\"type\":\"object\",\"properties\":{\"ldapFilter\":{\"type\":\"string\"}}}},{\"title\":\"LEAuthLevel\",\"logical\":false,\"config\":{\"type\":\"object\",\"properties\":{\"authLevel\":{\"type\":\"integer\"}}}},{\"title\":\"NOT\",\"logical\":true,\"config\":{\"type\":\"object\",\"properties\":{\"condition\":{\"type\":\"object\",\"properties\":{}}}}},{\"title\":\"OAuth2Scope\",\"logical\":false,\"config\":{\"type\":\"object\",\"properties\":{\"requiredScopes\":{\"type\":\"array\",\"items\":{\"type\":\"string\"}}}}},{\"title\":\"OR\",\"logical\":true,\"config\":{\"type\":\"object\",\"properties\":{\"conditions\":{\"type\":\"array\",\"items\":{\"type\":\"any\"}}}}},{\"title\":\"Policy\",\"logical\":false,\"config\":{\"type\":\"object\",\"properties\":{\"className\":{\"type\":\"string\"},\"properties\":{\"type\":\"object\"}}}},{\"title\":\"ResourceEnvIP\",\"logical\":false,\"config\":{\"type\":\"object\",\"properties\":{\"resourceEnvIPConditionValue\":{\"type\":\"array\",\"items\":{\"type\":\"string\"}}}}},{\"title\":\"Session\",\"logical\":false,\"config\":{\"type\":\"object\",\"properties\":{\"maxSessionTime\":{\"type\":\"number\"},\"terminateSession\":{\"type\":\"boolean\",\"required\":true}}}},{\"title\":\"SessionProperty\",\"logical\":false,\"config\":{\"type\":\"object\",\"properties\":{\"ignoreValueCase\":{\"type\":\"boolean\",\"required\":true},\"properties\":{\"type\":\"object\"}}}},{\"title\":\"SimpleTime\",\"logical\":false,\"config\":{\"type\":\"object\",\"properties\":{\"startTime\":{\"type\":\"string\"},\"endTime\":{\"type\":\"string\"},\"startDay\":{\"type\":\"string\"},\"endDay\":{\"type\":\"string\"},\"startDate\":{\"type\":\"string\"},\"endDate\":{\"type\":\"string\"},\"enforcementTimeZone\":{\"type\":\"string\"}}}}],\"resultCount\":18,\"pagedResultsCookie\":null,\"remainingPagedResults\":0}"
            ]
        );

        server.respondWith(
            "GET",
            /\/json\/decisioncombiners\/\?_queryId=&_fields=title/,
            [
                200,
                {
                    "Date": "Thu, 19 Feb 2015 08:30:40 GMT",
                    "Cache-Control": "no-cache",
                    "Server": "Apache-Coyote/1.1",
                    "Content-Length": "105",
                    "Content-API-Version": "protocol=1.0,resource=1.0",
                    "Content-Type": "application/json;charset=UTF-8"
                },
                "{\"result\":[{\"title\":\"DenyOverride\"}],\"resultCount\":1,\"pagedResultsCookie\":null,\"remainingPagedResults\":0}"
            ]
        );

        server.respondWith(
            "GET",
            /\/json\/subjectattributes\?_queryFilter=true/,
            [
                200,
                {
                    "Date": "Tue, 17 Feb 2015 14:38:53 GMT",
                    "Cache-Control": "no-cache",
                    "Server": "Apache-Coyote/1.1",
                    "Content-Length": "2722",
                    "Content-API-Version": "protocol=1.0,resource=1.0",
                    "Content-Type": "application/json;charset=UTF-8"
                },
                "{\"result\":[\"sunIdentityServerPPInformalName\",\"sunIdentityServerPPFacadeGreetSound\",\"uid\",\"manager\",\"sunIdentityServerPPCommonNameMN\",\"sunIdentityServerPPLegalIdentityGender\",\"preferredLocale\",\"iplanet-am-session-get-valid-sessions\",\"sunIdentityServerPPFacadegreetmesound\",\"iplanet-am-user-password-reset-question-answer\",\"telephoneNumber\",\"employeeNumber\",\"iplanet-am-user-admin-start-dn\",\"iplanet-am-user-success-url\",\"sunIdentityServerPPDemographicsDisplayLanguage\",\"iplanet-am-user-federation-info\",\"objectClass\",\"sunIdentityServerPPDemographicsLanguage\",\"authorityRevocationList\",\"sunIdentityServerPPLegalIdentityDOB\",\"sunIdentityServerPPSignKey\",\"sunIdentityServerPPEmploymentIdentityOrg\",\"createTimestamp\",\"iplanet-am-session-max-caching-time\",\"sn\",\"iplanet-am-session-quota-limit\",\"sunIdentityServerPPEncryPTKey\",\"iplanet-am-session-max-session-time\",\"sunIdentityServerPPCommonNamePT\",\"sun-fm-saml2-nameid-info\",\"sunIdentityServerDiscoEntries\",\"iplanet-am-user-login-status\",\"sunIdentityServerPPCommonNameCN\",\"distinguishedName\",\"iplanet-am-session-max-idle-time\",\"cn\",\"sunIdentityServerPPLegalIdentityVATIdType\",\"iplanet-am-user-password-reset-options\",\"preferredlanguage\",\"iplanet-am-user-federation-info-key\",\"sunIdentityServerPPDemographicsAge\",\"inetUserHttpURL\",\"iplanet-am-user-alias-list\",\"sunIdentityServerPPFacadeNamePronounced\",\"sunIdentityServerPPEmploymentIdentityJobTitle\",\"sunIdentityMSISDNNumber\",\"sunIdentityServerPPMsgContact\",\"givenName\",\"sunIdentityServerPPLegalIdentityMaritalStatus\",\"devicePrintProfiles\",\"memberOf\",\"sun-fm-saml2-nameid-infokey\",\"iplanet-am-session-service-status\",\"sunIdentityServerPPLegalIdentityVATIdValue\",\"userPassword\",\"sunIdentityServerPPFacadeMugShot\",\"sunIdentityServerPPEmploymentIdentityAltO\",\"iplanet-am-user-auth-config\",\"assignedDashboard\",\"iplanet-am-user-failure-url\",\"sunAMAuthInvalidAttemptsData\",\"sunIdentityServerPPLegalIdentityLegalName\",\"adminRole\",\"sunIdentityServerPPCommonNameAltCN\",\"dn\",\"iplanet-am-session-add-session-listener-on-all-sessions\",\"userCertificate\",\"mail\",\"sunIdentityServerPPLegalIdentityAltIdValue\",\"iplanet-am-user-password-reset-force-reset\",\"caCertificate\",\"sunIdentityServerPPEmergencyContact\",\"sunIdentityServerPPDemographicsBirthDay\",\"sunIdentityServerPPFacadeWebSite\",\"preferredtimezone\",\"sunIdentityServerPPLegalIdentityAltIdType\",\"sunIdentityServerPPCommonNameSN\",\"sunIdentityServerPPAddressCard\",\"postalAddress\",\"iplanet-am-session-destroy-sessions\",\"modifyTimestamp\",\"inetUserStatus\",\"iplanet-am-auth-configuration\",\"iplanet-am-user-auth-modules\",\"iplanet-am-user-account-life\",\"sunIdentityServerPPDemographicsTimeZone\",\"sunIdentityServerPPCommonNameFN\"],\"resultCount\":87,\"pagedResultsCookie\":null,\"remainingPagedResults\":0}"
            ]
        );

        server.respondWith(
            "GET",
            /\/json\/policies\/test/,
            [
                200,
                {
                    "Date": "Tue, 24 Feb 2015 12:36:16 GMT",
                    "Cache-Control": "no-cache",
                    "Server": "Apache-Coyote/1.1",
                    "ETag": "&quot;1424781371280&quot;",
                    "Content-Length": "470",
                    "Content-API-Version": "protocol=1.0,resource=2.0",
                    "Content-Type": "application/json;charset=UTF-8"
                },
                '{"name":"test","active":true,"description":"","resources":["*://*:*/*"],"applicationName":"iPlanetAMWebAgentService","actionValues":{"PUT":true,"HEAD":true},"subject":{"type":"NONE"},"resourceTypeUuid":"76656a38-5f8e-401b-83aa-4ccb74ce88d2","lastModifiedBy":"id=amadmin,ou=user,dc=openam,dc=forgerock,dc=org","lastModifiedDate":"2015-05-20T07:51:35.753Z","createdBy":"id=amadmin,ou=user,dc=openam,dc=forgerock,dc=org","creationDate":"2015-05-20T07:51:35.753Z"}'
            ]
        );

        server.respondWith(
            "GET",
            /\/json\/policies\?/,
            [
                200,
                {
                    "Date": "Tue, 17 Feb 2015 11:32:58 GMT",
                    "Cache-Control": "no-cache",
                    "Server": "Apache-Coyote/1.1",
                    "Content-Length": "912",
                    "Content-API-Version": "protocol=1.0,resource=2.0",
                    "Content-Type": "application/json;charset=UTF-8"
                },
                '{"result":[{"name":"iPlanetAMWebAgentServicepol","active":true,"description":"","resources":["*://*:*/*?*"],"applicationName":"iPlanetAMWebAgentService","actionValues":{"OPTIONS":false,"HEAD":true},"subject":{"type":"NONE"},"resourceTypeUuid":"76656a38-5f8e-401b-83aa-4ccb74ce88d2","lastModifiedBy":"id=amadmin,ou=user,dc=openam,dc=forgerock,dc=org","lastModifiedDate":"2015-05-22T10:38:10.903Z","createdBy":"id=amadmin,ou=user,dc=openam,dc=forgerock,dc=org","creationDate":"2015-05-20T07:52:07.129Z"},{"name":"qqqauthenticated","active":true,"description":"","resources":["*://*:*/*"],"applicationName":"iPlanetAMWebAgentService","actionValues":{"DELETE":true,"OPTIONS":true},"subject":{"type":"NONE"},"resourceTypeUuid":"76656a38-5f8e-401b-83aa-4ccb74ce88d2","lastModifiedBy":"id=dsameuser,ou=user,dc=openam,dc=forgerock,dc=org","lastModifiedDate":"2015-05-19T14:22:25.204Z","createdBy":"id=amadmin,ou=user,dc=openam,dc=forgerock,dc=org","creationDate":"2015-05-11T11:15:48.206Z"},{"name":"test","active":true,"description":"","resources":["*://*:*/*"],"applicationName":"iPlanetAMWebAgentService","actionValues":{"PUT":true,"HEAD":true},"subject":{"type":"NONE"},"resourceTypeUuid":"76656a38-5f8e-401b-83aa-4ccb74ce88d2","lastModifiedBy":"id=amadmin,ou=user,dc=openam,dc=forgerock,dc=org","lastModifiedDate":"2015-05-20T07:51:35.753Z","createdBy":"id=amadmin,ou=user,dc=openam,dc=forgerock,dc=org","creationDate":"2015-05-20T07:51:35.753Z"}],"resultCount":3,"pagedResultsCookie":null,"remainingPagedResults":0}'
            ]
        );

        server.respondWith(
            "GET",
            /\/json\/resourcetypes\?/,
            [
                200,
                {
                    "Date": "Tue, 24 Feb 2015 09:54:44 GMT",
                    "Cache-Control": "no-cache",
                    "Server": "Apache-Coyote/1.1",
                    "Content-Length": "5210",
                    "Content-API-Version": "protocol=1.0,resource=1.0",
                    "Content-Type": "application/json;charset=UTF-8"
                },
                '{"result":[{"uuid":"398207e2-a643-4f8c-b46b-42da0f7dc63f","name":"Bank","description":"The built-in bank Resource Type available to OpenAM Policies.","patterns":["*://*:*/*?*","*://*:*/*"],"actions":{"TRANSFER":true},"createdBy":"id=dsameuser,ou=user,dc=openam,dc=forgerock,dc=org","creationDate":1422892465848,"lastModifiedBy":"id=dsameuser,ou=user,dc=openam,dc=forgerock,dc=org","lastModifiedDate":1422892465848},{"uuid":"6a90eabe-9638-4333-b688-3223aec7f58a","name":"CREST","description":"The built-in CREST Resource Type available to OpenAM Policies.","patterns":["http://*:*/*","http://*:*/*?*","https://*:*/*?*","https://*:*/*"],"actions":{"UPDATE":true,"QUERY":true,"PATCH":true,"CREATE":true,"DELETE":true,"READ":true,"ACTION":true},"createdBy":"id=dsameuser,ou=user,dc=openam,dc=forgerock,dc=org","creationDate":1422892465848,"lastModifiedBy":"id=dsameuser,ou=user,dc=openam,dc=forgerock,dc=org","lastModifiedDate":1422892465848},{"uuid":"74e62178-ab00-45cb-94e5-29dedbd617a5","name":"Calendar","description":"The built-in calendar Resource Type available to OpenAM Policies.","patterns":["http://calendar.sun.com/my/*","http://calendar.sun.com/*/calendars?calId=*","http://calendar.sun.com/*","http://calendar.sun.com/admin"],"actions":{"POST":true,"PATCH":true,"GET":true,"DELETE":true,"OPTIONS":true,"HEAD":true,"PUT":true},"createdBy":"id=dsameuser,ou=user,dc=openam,dc=forgerock,dc=org","creationDate":1422892465848,"lastModifiedBy":"id=dsameuser,ou=user,dc=openam,dc=forgerock,dc=org","lastModifiedDate":1422892465848},{"uuid":"20a13582-1f32-4f83-905f-f71ff4e2e00d","name":"Delegation Service","description":"The built-in delegation Resource Type available to OpenAM Policies.","patterns":["sms://*:*/*?*","sms://*:*/*"],"actions":{"MODIFY":true,"READ":true,"DELEGATE":true},"createdBy":"id=dsameuser,ou=user,dc=openam,dc=forgerock,dc=org","creationDate":1422892465848,"lastModifiedBy":"id=dsameuser,ou=user,dc=openam,dc=forgerock,dc=org","lastModifiedDate":1422892465848},{"uuid":"1491322b-5c50-4133-8c40-1646e1170cbb","name":"Discovery Service","description":"The built-in discovery Resource Type available to OpenAM Policies.","patterns":["http://*:*/*","http://*:*/*?*","https://*:*/*?*","https://*:*/*"],"actions":{"LOOKUP":true,"UPDATE":true},"createdBy":"id=dsameuser,ou=user,dc=openam,dc=forgerock,dc=org","creationDate":1422892465848,"lastModifiedBy":"id=dsameuser,ou=user,dc=openam,dc=forgerock,dc=org","lastModifiedDate":1422892465848},{"uuid":"504fe694-f1e3-4fdf-8d69-fcf2a4fce06b","name":"IM","description":"The built-in IM Resource Type available to OpenAM Policies.","patterns":["http://im.sun.com/register","http://im.sun.com/im.jnlp"],"actions":{"POST":true,"PATCH":true,"GET":true,"DELETE":true,"OPTIONS":true,"HEAD":true,"PUT":true},"createdBy":"id=dsameuser,ou=user,dc=openam,dc=forgerock,dc=org","creationDate":1422892465848,"lastModifiedBy":"id=dsameuser,ou=user,dc=openam,dc=forgerock,dc=org","lastModifiedDate":1422892465848},{"uuid":"09496ad8-26e3-4002-b90e-24facc2e78c1","name":"Liberty Service","description":"The built-in liberty Resource Type available to OpenAM Policies.","patterns":["*://*:*/*?*","*://*:*/*"],"actions":{"QUERY_interactForConsent":false,"QUERY_interactForValue":false,"MODIFY_interactForValue":false,"QUERY_deny":false,"MODIFY_deny":false,"MODIFY_interactForConsent":false,"MODIFY_allow":true,"QUERY_allow":true},"createdBy":"id=dsameuser,ou=user,dc=openam,dc=forgerock,dc=org","creationDate":1422892465848,"lastModifiedBy":"id=dsameuser,ou=user,dc=openam,dc=forgerock,dc=org","lastModifiedDate":1422892465848},{"uuid":"13b27ffe-0415-4751-821c-b81675c7acc8","name":"Paycheck","description":"The built-in paycheck Resource Type available to OpenAM Policies.","patterns":["http://paycheck.sun.com:8081/*/private","http://paycheck.sun.com:8081/*","http://paycheck.sun.com:8081/*/users/*"],"actions":{"POST":true,"PATCH":true,"GET":true,"DELETE":true,"OPTIONS":true,"HEAD":true,"PUT":true},"createdBy":"id=dsameuser,ou=user,dc=openam,dc=forgerock,dc=org","creationDate":1422892465848,"lastModifiedBy":"id=dsameuser,ou=user,dc=openam,dc=forgerock,dc=org","lastModifiedDate":1422892465848},{"uuid":"b5ceba86-4346-4cf5-a5f2-1d2884d1a025","name":"Provisioning Service","description":"The built-in provisioning Resource Type available to OpenAM Policies.","patterns":["/*"],"actions":{"UPDATE":true,"CREATE":true,"DELETE":true,"READ":true},"createdBy":"id=dsameuser,ou=user,dc=openam,dc=forgerock,dc=org","creationDate":1422892465848,"lastModifiedBy":"id=dsameuser,ou=user,dc=openam,dc=forgerock,dc=org","lastModifiedDate":1422892465848},{"uuid":"76656a38-5f8e-401b-83aa-4ccb74ce88d2","name":"URL","description":"The built-in URL Resource Type available to OpenAM Policies.","patterns":["*://*:*/*?*","*://*:*/*"],"actions":{"POST":true,"PATCH":true,"GET":true,"DELETE":true,"OPTIONS":true,"HEAD":true,"PUT":true},"createdBy":"id=dsameuser,ou=user,dc=openam,dc=forgerock,dc=org","creationDate":1422892465848,"lastModifiedBy":"id=dsameuser,ou=user,dc=openam,dc=forgerock,dc=org","lastModifiedDate":1422892465848}],"resultCount":10,"pagedResultsCookie":null,"remainingPagedResults":0}'
            ]
        );

        server.respondWith(
            "GET",
            /\/json\/resourcetypes\/6a90eabe-9638-4333-b688-3223aec7f58a/,
            [
                200,
                {
                    "Date": "Tue, 24 Feb 2015 09:54:55 GMT",
                    "Cache-Control": "no-cache",
                    "Server": "Apache-Coyote/1.1",
                    "ETag": "&quot;1424771695944&quot;",
                    "Content-Length": "535",
                    "Content-API-Version": "protocol=1.0,resource=1.0",
                    "Content-Type": "application/json;charset=UTF-8"
                },
                "{\"uuid\":\"6a90eabe-9638-4333-b688-3223aec7f58a\",\"name\":\"CREST\",\"realm\":\"/\",\"description\":\"The built-in CREST Resource Type available to OpenAM Policies.\",\"patterns\":[\"http://*:*/*\",\"http://*:*/*?*\",\"https://*:*/*?*\",\"https://*:*/*\"],\"actions\":{\"UPDATE\":true,\"QUERY\":true,\"PATCH\":true,\"CREATE\":true,\"DELETE\":true,\"READ\":true,\"ACTION\":true},\"createdBy\":\"id=dsameuser,ou=user,dc=openam,dc=forgerock,dc=org\",\"creationDate\":1422892465848,\"lastModifiedBy\":\"id=dsameuser,ou=user,dc=openam,dc=forgerock,dc=org\",\"lastModifiedDate\":1422892465848}"
            ]
        );
    };
});
