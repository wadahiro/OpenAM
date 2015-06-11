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
 * information: "Portions Copyrighted [year] [name of copyright owner]".
 *
 * Copyright 2014-2015 ForgeRock AS.
 */

package org.forgerock.openam.sts.user.invocation;

import org.forgerock.openam.sts.TokenMarshalException;
import org.forgerock.openam.sts.user.invocation.OpenIdConnectTokenState;
import org.testng.annotations.Test;

import static org.testng.Assert.assertEquals;

public class OpenIdConnectTokenStateTest {
    private static final String TOKEN_VALUE = "eyJhb.eyJpc3MiOiJhY2N.SqcfMU-BsrS69tGLIFRq";

    @Test
    public void testJsonRoundTrip() throws TokenMarshalException {
        OpenIdConnectTokenState tokenState = OpenIdConnectTokenState.builder().tokenValue(TOKEN_VALUE).build();
        assertEquals(tokenState, OpenIdConnectTokenState.fromJson(tokenState.toJson()));
    }
}
