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

package org.forgerock.openam.sts.rest.token.validator;

/**
 *  Defines the parameter state which needs to be passed to the RestTokenValidator#validateToken instances. The generic
 *  type will correspond to the to-be-validated token.
 *
 *  For custom RestTokenValidator implementations, this generic type will be {@link org.forgerock.json.fluent.JsonValue}
 */
public interface RestTokenValidatorParameters<T> {
    /**
     *
     * @return the to-be-validated token.
     */
    T getInputToken();
}
