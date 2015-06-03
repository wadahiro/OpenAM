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

/*global $, require, QUnit */

define([
    "jquery",
    "org/forgerock/commons/ui/common/main/EventManager",
    "org/forgerock/commons/ui/common/util/Constants",
    "../test/tests/CommonTests",
    "../test/tests/EditTests",
    "../test/tests/ListTests"
], function ($, EventManager, Constants, CommonTests, EditViewsTests, ListViewsTests) {
    return function () {
        EventManager.registerListener(Constants.EVENT_APP_INTIALIZED, function () {
            $.doTimeout = function (name, time, func) {
                func(); // run the function immediately rather than delayed.
            };

            require("ThemeManager").getTheme().then(function () {
                QUnit.start();

                CommonTests.executeAll();
                EditViewsTests.executeAll();
                ListViewsTests.executeAll();
            });
        });
    }
});