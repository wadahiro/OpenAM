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
 * Copyright 2015 ForgeRock AS.
 */

package org.forgerock.openam.sts.rest.token.provider;

import org.forgerock.json.fluent.JsonValue;
import org.forgerock.openam.sts.TokenCreationException;
import org.forgerock.openam.sts.TokenTypeId;

/**
 * Interface defining token creators in the rest-sts. The generic type T corresponds to a class
 * which provides the state necessary to produce a token of the specified type. The creation of any
 * specific token (SAML2, OIDC) requires specific state which cannot be subsumed in a specific type.
 */
public interface RestTokenProvider<T> {
    /**
     *
     * @param restTokenProviderParameters the parameters necessary to create a token of a specific type
     * @return the JsonValue corresponding to the created token
     * @throws TokenCreationException if the token could not be created
     */
    JsonValue createToken(RestTokenProviderParameters<T> restTokenProviderParameters) throws TokenCreationException;
}
