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

package org.forgerock.openam.sts.tokengeneration;

import com.iplanet.sso.SSOToken;
import org.forgerock.openam.sts.TokenCreationException;

/**
 * Interface to represent the concerns of validating an SSOToken and obtaining the corresponding principal name.
 */
public interface SSOTokenIdentity {
    /**
     *
     * @param subjectToken The SSOToken corresponding to the subject of the assertion
     * @return The name of the principal associated with this SSOToken
     * @throws TokenCreationException If the token is invalid or a corresponding identity could not be obtained.
     */
    String validateAndGetTokenPrincipal(SSOToken subjectToken) throws TokenCreationException;
}
