/*
 * DO NOT REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 *
 * Copyright (c) 2012-2014 ForgeRock AS. All rights reserved.
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
 * "Portions copyright [year] [name of copyright owner]"
 */

package org.forgerock.restlet.ext.oauth2.flow;

import org.forgerock.oauth2.core.AccessToken;
import org.forgerock.oauth2.core.AccessTokenRequest;
import org.forgerock.oauth2.core.AccessTokenService;
import org.forgerock.oauth2.core.ClientAuthentication;
import org.forgerock.oauth2.core.InvalidClientException;
import org.forgerock.oauth2.core.InvalidGrantException;
import org.forgerock.oauth2.core.InvalidRequestException;
import org.forgerock.oauth2.core.UnauthorizedClientException;
import org.forgerock.oauth2.reslet.ClientCredentialsExtractor;
import org.forgerock.openam.oauth2.exceptions.OAuthProblemException;
import org.restlet.ext.jackson.JacksonRepresentation;
import org.restlet.representation.Representation;
import org.restlet.resource.Post;

import javax.inject.Inject;
import java.util.Map;

import static org.forgerock.oauth2.core.AccessTokenRequest.createClientCredentialsAccessTokenRequest;

/**
 * Implements the Client Credentials Flow
 *
 * @see <a
 *      href="http://tools.ietf.org/html/rfc6749#section-4.4>4.4.
 *      Client Credentials Grant</a>
 */
public class ClientCredentialsServerResource extends AbstractFlow {

    private final ClientCredentialsExtractor credentialsExtractor;
    private final AccessTokenService accessTokenService;

    @Inject
    public ClientCredentialsServerResource(final ClientCredentialsExtractor credentialsExtractor,
            final AccessTokenService accessTokenService) {
        this.credentialsExtractor = credentialsExtractor;
        this.accessTokenService = accessTokenService;
    }

    @Post                                            //TODO document that this param is required even though not used as otherwise Restlet complains about incorrect content-type
    public Representation represent(final Representation entity) {

        final String scope = getAttribute("scope");

        final ClientAuthentication clientAuthentication;
        try {
            clientAuthentication = credentialsExtractor.extract(getRequest());
        } catch (InvalidRequestException e) {
            throw OAuthProblemException.OAuthError.INVALID_REQUEST.handle(null, "Client authentication failed");
        } catch (InvalidClientException e) {
            throw OAuthProblemException.OAuthError.INVALID_CLIENT.handle(null, "Client authentication failed");
        }

        final AccessTokenRequest accessTokenRequest = createClientCredentialsAccessTokenRequest()
                .clientAuthentication(clientAuthentication)
                .scope(scope)
                .build();

        try {
            final AccessToken accessToken = accessTokenService.requestAccessToken(accessTokenRequest);

            return new JacksonRepresentation<Map<String, Object>>(accessToken.toMap());
        } catch (InvalidClientException e) {
            throw OAuthProblemException.OAuthError.INVALID_CLIENT.handle(getRequest(), e.getMessage());
        } catch (UnauthorizedClientException e) {
            throw OAuthProblemException.OAuthError.UNAUTHORIZED_CLIENT.handle(getRequest(), e.getMessage());
        } catch (InvalidGrantException e) {
            throw OAuthProblemException.OAuthError.INVALID_GRANT.handle(getRequest(), e.getMessage());
        }
    }
}