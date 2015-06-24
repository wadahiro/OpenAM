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
 * Copyright 2014-2015 ForgeRock AS.
 */

/*
 * Portions Copyrighted 2015 Nomura Research Institute, Ltd.
 */

package org.forgerock.openam.oauth2;

import static org.forgerock.json.fluent.JsonValue.*;
import static org.forgerock.oauth2.core.OAuth2Constants.Params.*;
import static org.forgerock.util.query.QueryFilter.*;

import com.iplanet.am.util.SystemProperties;
import com.iplanet.sso.SSOException;
import com.iplanet.sso.SSOToken;
import com.iplanet.sso.SSOTokenManager;
import com.sun.identity.authentication.util.ISAuthConstants;
import com.sun.identity.shared.debug.Debug;
import java.security.KeyPair;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import javax.inject.Inject;
import javax.inject.Singleton;
import org.forgerock.json.fluent.JsonValue;
import org.forgerock.json.jose.jws.JwsAlgorithm;
import org.forgerock.json.jose.jws.JwsAlgorithmType;
import org.forgerock.json.jose.utils.Utils;
import org.forgerock.oauth2.core.AccessToken;
import org.forgerock.oauth2.core.AuthorizationCode;
import org.forgerock.oauth2.core.OAuth2Constants;
import org.forgerock.oauth2.core.OAuth2ProviderSettings;
import org.forgerock.oauth2.core.OAuth2ProviderSettingsFactory;
import org.forgerock.oauth2.core.OAuth2Request;
import org.forgerock.oauth2.core.RefreshToken;
import org.forgerock.oauth2.core.ResourceOwner;
import org.forgerock.oauth2.core.exceptions.InvalidClientException;
import org.forgerock.oauth2.core.exceptions.InvalidGrantException;
import org.forgerock.oauth2.core.exceptions.InvalidRequestException;
import org.forgerock.oauth2.core.exceptions.NotFoundException;
import org.forgerock.oauth2.core.exceptions.ServerException;
import org.forgerock.oauth2.core.exceptions.UnauthorizedClientException;
import org.forgerock.openam.cts.api.fields.OAuthTokenField;
import org.forgerock.openam.cts.exceptions.CoreTokenException;
import org.forgerock.openam.oauth2.OAuth2AuditLogger;
import org.forgerock.openam.openidconnect.OpenAMOpenIdConnectToken;
import org.forgerock.openam.utils.RealmNormaliser;
import org.forgerock.openidconnect.OpenIdConnectClientRegistration;
import org.forgerock.openidconnect.OpenIdConnectClientRegistrationStore;
import org.forgerock.openidconnect.OpenIdConnectToken;
import org.forgerock.openidconnect.OpenIdConnectTokenStore;
import org.forgerock.util.encode.Base64url;
import org.json.JSONException;
import org.json.JSONObject;
import org.restlet.Request;
import org.restlet.data.Status;
import org.restlet.ext.servlet.ServletUtils;
/**
 * Implementation of the OpenId Connect Token Store which the OpenId Connect Provider will implement.
 *
 * @since 12.0.0
 */
@Singleton
public class OpenAMTokenStore implements OpenIdConnectTokenStore {

    private final Debug logger = Debug.getInstance("OAuth2Provider");
    private final OAuth2AuditLogger auditLogger;
    private final OAuthTokenStore tokenStore;
    private final OAuth2ProviderSettingsFactory providerSettingsFactory;
    private final OpenIdConnectClientRegistrationStore clientRegistrationStore;
    private final RealmNormaliser realmNormaliser;
    private final SSOTokenManager ssoTokenManager;
    private final CookieExtractor cookieExtractor;

    /**
     * Constructs a new OpenAMTokenStore.
     *
     * @param tokenStore An instance of the OAuthTokenStore.
     * @param providerSettingsFactory An instance of the OAuth2ProviderSettingsFactory.
     * @param clientRegistrationStore An instance of the OpenIdConnectClientRegistrationStore.
     * @param realmNormaliser An instance of the RealmNormaliser.
     * @param ssoTokenManager An instance of the SSOTokenManager
     * @param cookieExtractor An instance of the CookieExtractor
     * @param auditLogger An instance of OAuth2AuditLogger
     */
    @Inject
    public OpenAMTokenStore(OAuthTokenStore tokenStore, OAuth2ProviderSettingsFactory providerSettingsFactory,
            OpenIdConnectClientRegistrationStore clientRegistrationStore, RealmNormaliser realmNormaliser,
            SSOTokenManager ssoTokenManager, CookieExtractor cookieExtractor, OAuth2AuditLogger auditLogger) {
        this.tokenStore = tokenStore;
        this.providerSettingsFactory = providerSettingsFactory;
        this.clientRegistrationStore = clientRegistrationStore;
        this.realmNormaliser = realmNormaliser;
        this.ssoTokenManager = ssoTokenManager;
        this.cookieExtractor = cookieExtractor;
        this.auditLogger = auditLogger;
    }

    /**
     * {@inheritDoc}
     */
    public AuthorizationCode createAuthorizationCode(Set<String> scope, ResourceOwner resourceOwner,
            String clientId, String redirectUri, String nonce, OAuth2Request request) throws ServerException, NotFoundException {

        logger.message("DefaultOAuthTokenStoreImpl::Creating Authorization code");
        final OAuth2ProviderSettings providerSettings = providerSettingsFactory.get(request);
        final String code = UUID.randomUUID().toString();
        final long expiryTime = (providerSettings.getAuthorizationCodeLifetime() * 1000) + System.currentTimeMillis();
        final String ssoTokenId = getSsoTokenId(request);


        final OpenAMAuthorizationCode authorizationCode = new OpenAMAuthorizationCode(code, resourceOwner.getId(), clientId,
                redirectUri, scope, getClaimsFromRequest(request), expiryTime, nonce, realmNormaliser.normalise(request.<String>getParameter(REALM)),
                getAuthModulesFromSSOToken(request), getAuthenticationContextClassReferenceFromRequest(request),
                ssoTokenId);

        // Store in CTS
        try {
            tokenStore.create(authorizationCode);
        } catch (CoreTokenException e) {
            logger.error("Unable to create authorization code " + authorizationCode.getTokenInfo(), e);
            throw new ServerException("Could not create token in CTS");
        }

        request.setToken(AuthorizationCode.class, authorizationCode);

        return authorizationCode;
    }

    private String getClaimsFromRequest(OAuth2Request request) {
        return request.getParameter(OAuth2Constants.Custom.CLAIMS);
    }

    private String getSsoTokenId(OAuth2Request request) {
        return cookieExtractor.extract(ServletUtils.getRequest(request.<Request>getRequest()),
                SystemProperties.get("com.iplanet.am.cookie.name"));
    }

    private String getAuthModulesFromSSOToken(OAuth2Request request) {
        String authModules = null;
        try {
            SSOToken token = ssoTokenManager.createSSOToken(ServletUtils.getRequest(request.<Request>getRequest()));
            if (token != null) {
                authModules = token.getProperty(ISAuthConstants.AUTH_TYPE);
            }
        } catch (SSOException e) {
            logger.warning("Could not get list of auth modules from authentication", e);
        }
        return authModules;
    }

    private String getAuthenticationContextClassReferenceFromRequest(OAuth2Request request) {
        return request.getParameter(OAuth2Constants.JWTTokenParams.ACR);
    }

    /**
     * {@inheritDoc}
     */
    public OpenIdConnectToken createOpenIDToken(ResourceOwner resourceOwner, String clientId,
            String authorizationParty, String nonce, String ops, OAuth2Request request)
            throws ServerException, InvalidClientException, NotFoundException {

        final OAuth2ProviderSettings providerSettings = providerSettingsFactory.get(request);

        final OpenIdConnectClientRegistration clientRegistration = clientRegistrationStore.get(clientId, request);
        final String algorithm = clientRegistration.getIDTokenSignedResponseAlgorithm();

        final long currentTimeInSeconds = System.currentTimeMillis() / 1000;
        Long tokenLifetimeInSeconds = clientRegistration.getIdTokenLifeTime();
        if (tokenLifetimeInSeconds == null) {
            tokenLifetimeInSeconds = providerSettings.getOpenIdTokenLifetime();
        }
        final long exp = currentTimeInSeconds + tokenLifetimeInSeconds;

        final String realm = realmNormaliser.normalise(request.<String>getParameter(REALM));

        final String iss = providerSettings.getIssuer();

        final List<String> amr = getAMRFromAuthModules(request, providerSettings);

        final byte[] clientSecret = clientRegistration.getClientSecret().getBytes(Utils.CHARSET);
        final KeyPair keyPair = providerSettings.getServerKeyPair();

        final String atHash = generateAtHash(algorithm, request, providerSettings);
        final String cHash = generateCHash(algorithm, request, providerSettings);

        final String acr = getAuthenticationContextClassReference(request);

        final String kid = generateKid(providerSettings.getJWKSet(), algorithm);

        final String opsId = UUID.randomUUID().toString();

        final long authTime = resourceOwner.getAuthTime();

        final String subId = clientRegistration.getSubValue(resourceOwner.getId(), providerSettings);

        try {
            tokenStore.create(json(object(
                    field(OAuth2Constants.CoreTokenParams.ID, set(opsId)),
                    field(OAuth2Constants.JWTTokenParams.LEGACY_OPS, set(ops)),
                    field(OAuth2Constants.CoreTokenParams.EXPIRE_TIME, set(Long.toString(exp))))));
        } catch (CoreTokenException e) {
            logger.error("Unable to create id_token user session token", e);
            throw new ServerException("Could not create token in CTS");
        }

        final OpenAMOpenIdConnectToken oidcToken = new OpenAMOpenIdConnectToken(kid, clientSecret, keyPair, algorithm,
                iss, subId, clientId, authorizationParty, exp, currentTimeInSeconds,
                authTime, nonce, opsId, atHash, cHash, acr, amr, realm);
        request.setSession(ops);

        //See spec section 5.4. - add claims to id_token based on 'response_type' parameter
        String responseType = request.getParameter(OAuth2Constants.Params.RESPONSE_TYPE);
        if (responseType != null && responseType.trim().equals(OAuth2Constants.JWTTokenParams.ID_TOKEN)) {
            appendIdTokenClaims(request, providerSettings, oidcToken);
        } else if (providerSettings.getClaimsParameterSupported()) {
            appendRequestedIdTokenClaims(request, providerSettings, oidcToken);
        }

        return oidcToken;
    }

    //return all claims from scopes + claims requested in the id_token
    private void appendIdTokenClaims(OAuth2Request request, OAuth2ProviderSettings providerSettings,
                                     OpenAMOpenIdConnectToken oidcToken)
            throws ServerException, NotFoundException, InvalidClientException {

        try {
            AccessToken accessToken = request.getToken(AccessToken.class);
            Map<String, Object> userInfo = providerSettings.getUserInfo(accessToken, request);

            for (Map.Entry<String, Object> claim : userInfo.entrySet()) {
                oidcToken.put(claim.getKey(), claim.getValue());
            }

        } catch (UnauthorizedClientException e) {
            throw new InvalidClientException(e.getMessage());
        }

    }

    //See spec section 5.5. - add claims to id_token based on 'claims' parameter in the access token
    private void appendRequestedIdTokenClaims(OAuth2Request request, OAuth2ProviderSettings providerSettings,
                                              OpenAMOpenIdConnectToken oidcToken)
            throws ServerException, NotFoundException, InvalidClientException {

        AccessToken accessToken = request.getToken(AccessToken.class);
        String claims;
        if (accessToken != null) {
            claims = (String) accessToken.toMap().get(OAuth2Constants.Custom.CLAIMS);
        } else {
            claims = request.getParameter(OAuth2Constants.Custom.CLAIMS);
        }

        if (claims != null) {
            try {
                JSONObject claimsObject = new JSONObject(claims);
                JSONObject idTokenClaimsRequest = claimsObject.getJSONObject(OAuth2Constants.JWTTokenParams.ID_TOKEN);
                Map<String, Object> userInfo = providerSettings.getUserInfo(accessToken, request);

                Iterator<String> it = idTokenClaimsRequest.keys();
                while (it.hasNext()) {
                    String keyName = it.next();

                    if (userInfo.containsKey(keyName)) {
                        oidcToken.put(keyName, userInfo.get(keyName));
                    }
                }
            } catch (UnauthorizedClientException e) {
                throw new InvalidClientException(e.getMessage());
            } catch (JSONException e) {
                //if claims object not found, fall through
            }

        }

    }

    private String generateKid(JsonValue jwkSet, String algorithm) {

        final JwsAlgorithm jwsAlgorithm = JwsAlgorithm.valueOf(algorithm);
        if (JwsAlgorithmType.RSA.equals(jwsAlgorithm.getAlgorithmType())) {
            JsonValue jwks = jwkSet.get(OAuth2Constants.JWTTokenParams.KEYS);
            if (!jwks.isNull() && !jwks.asList().isEmpty()) {
                return jwks.get(0).get(OAuth2Constants.JWTTokenParams.KEY_ID).asString();
            }
        }

        return null;
    }

    private List<String> getAMRFromAuthModules(OAuth2Request request, OAuth2ProviderSettings providerSettings) throws ServerException {
        List<String> amr = null;

        String authModules;
        if (request.getToken(AuthorizationCode.class) != null) {
            authModules = request.getToken(AuthorizationCode.class).getAuthModules();
        } else if (request.getToken(RefreshToken.class) != null) {
            authModules = request.getToken(RefreshToken.class).getAuthModules();
        } else {
            authModules = getAuthModulesFromSSOToken(request);
        }

        if (authModules != null) {
            Map<String, String> amrMappings = providerSettings.getAMRAuthModuleMappings();
            if (!amrMappings.isEmpty()) {
                amr = new ArrayList<String>();
                List<String> modulesUsed = Arrays.asList(authModules.split("\\|"));
                for (Map.Entry<String, String> amrToModuleMapping : amrMappings.entrySet()) {
                    if (modulesUsed.contains(amrToModuleMapping.getValue())) {
                        amr.add(amrToModuleMapping.getKey());
                    }
                }
            }
        }

        return amr;
    }

    private String getAuthenticationContextClassReference(OAuth2Request request) {
        if (request.getToken(AuthorizationCode.class) != null) {
            return request.getToken(AuthorizationCode.class).getAuthenticationContextClassReference();
        } else if (request.getToken(RefreshToken.class) != null) {
            return request.getToken(RefreshToken.class).getAuthenticationContextClassReference();
        } else {
            return getAuthenticationContextClassReferenceFromRequest(request);
        }
    }

    /**
     * For at_hash values, used when token and id_token exist in scope.
     */
    private String generateAtHash(String algorithm, OAuth2Request request,
                                  OAuth2ProviderSettings providerSettings) throws ServerException {

        final AccessToken accessToken = request.getToken(AccessToken.class);

        if (accessToken == null) {
            logger.message("at_hash generation requires an existing access_token.");
            return null;
        }

        final String accessTokenValue = ((String) accessToken.getTokenInfo().get(OAuth2Constants.Params.ACCESS_TOKEN));

        return generateHash(algorithm, accessTokenValue, providerSettings);

    }

    /**
     * For c_hash, used when code and id_token exist in scope.
     */
    private String generateCHash(String algorithm, OAuth2Request request,
                                 OAuth2ProviderSettings providerSettings) throws ServerException {

        final AuthorizationCode authorizationCode = request.getToken(AuthorizationCode.class);

        if (authorizationCode == null) {
            logger.message("c_hash generation requires an existing code.");
            return null;
        }

        final String codeValue = authorizationCode.getTokenId();

        return generateHash(algorithm, codeValue, providerSettings);
    }

    /**
     * Generates hash values, by hashing the valueToEncode using the requests's "alg"
     * parameter, then returning the base64url encoding of the
     * leftmost half of the returned bytes. Used for both at_hash and c_hash claims.
     */
    private String generateHash(String algorithm, String valueToEncode, OAuth2ProviderSettings providerSettings)
            throws ServerException {

        if (!providerSettings.getSupportedIDTokenSigningAlgorithms().contains(algorithm)) {
            logger.message("Unsupported signing algorithm requested for hash value.");
            return null;
        }

        final JwsAlgorithm alg = JwsAlgorithm.valueOf(algorithm);

        MessageDigest digest;
        try {
            digest = MessageDigest.getInstance(alg.getMdAlgorithm());
        } catch (NoSuchAlgorithmException e) {
            logger.message("Unsupported signing algorithm chosen for hashing.");
            throw new ServerException("Algorithm not supported.");
        }

        final byte[] result = digest.digest(valueToEncode.getBytes(Utils.CHARSET));
        final byte[] toEncode = Arrays.copyOfRange(result, 0, result.length / 2);

        return Base64url.encode(toEncode);
    }

    /**
     * {@inheritDoc}
     */
    public AccessToken createAccessToken(String grantType, String accessTokenType, String authorizationCode,
            String resourceOwnerId, String clientId, String redirectUri, Set<String> scope,
            RefreshToken refreshToken, String nonce, String claims, OAuth2Request request)
            throws ServerException, NotFoundException {

        OpenIdConnectClientRegistration clientRegistration = null;
        try {
            clientRegistration = clientRegistrationStore.get(clientId, request);
        } catch (InvalidClientException e) {
            logger.error(e.getMessage(), e);
            throw new ServerException(e.getMessage());
        }

        final OAuth2ProviderSettings providerSettings = providerSettingsFactory.get(request);
        final String id = UUID.randomUUID().toString();
        Long tokenLifetimeInSeconds = clientRegistration.getAccessTokenLifeTime();
        if (tokenLifetimeInSeconds == null) {
            tokenLifetimeInSeconds = providerSettings.getAccessTokenLifetime();
        }
        final long expiryTime = tokenLifetimeInSeconds * 1000 + System.currentTimeMillis();
        final AccessToken accessToken;
        if (refreshToken == null) {
            accessToken = new OpenAMAccessToken(id, authorizationCode, resourceOwnerId, clientId, redirectUri,
                    scope, expiryTime, null, OAuth2Constants.Token.OAUTH_ACCESS_TOKEN, grantType, nonce,
                    realmNormaliser.normalise(request.<String>getParameter(REALM)), claims);
        } else {
            accessToken = new OpenAMAccessToken(id, authorizationCode, resourceOwnerId, clientId, redirectUri,
                    scope, expiryTime, refreshToken.getTokenId(), OAuth2Constants.Token.OAUTH_ACCESS_TOKEN, grantType,
                    nonce, realmNormaliser.normalise(request.<String>getParameter(REALM)), claims);
        }
        try {
            tokenStore.create(accessToken);
            if (auditLogger.isAuditLogEnabled()) {
                String[] obs = {"CREATED_TOKEN", accessToken.toString()};
                auditLogger.logAccessMessage("CREATED_TOKEN", obs, null);
            }
        } catch (CoreTokenException e) {
            if (logger.errorEnabled()) {
                logger.error("Could not create token in CTS: " + e.getMessage());
            }
            if (auditLogger.isAuditLogEnabled()) {
                String[] obs = {"FAILED_CREATE_TOKEN", accessToken.toString()};
                auditLogger.logErrorMessage("FAILED_CREATE_TOKEN", obs, null);
            }
            throw new ServerException("Could not create token in CTS: " + e.getMessage());
        }
        request.setToken(AccessToken.class, accessToken);
        return accessToken;
    }

    /**
     * {@inheritDoc}
     */
    public RefreshToken createRefreshToken(String grantType, String clientId, String resourceOwnerId,
            String redirectUri, Set<String> scope, OAuth2Request request)
            throws ServerException, NotFoundException {
        logger.message("Create refresh token");

        OpenIdConnectClientRegistration clientRegistration = null;
        try {
            clientRegistration = clientRegistrationStore.get(clientId, request);
        } catch (InvalidClientException e) {
            logger.error(e.getMessage(), e);
            throw new ServerException(e.getMessage());
        }

        final OAuth2ProviderSettings providerSettings = providerSettingsFactory.get(request);
        Long tokenLifetimeInSeconds = clientRegistration.getRefreshTokenLifeTime();
        if (tokenLifetimeInSeconds == null) {
            tokenLifetimeInSeconds = providerSettings.getRefreshTokenLifetime();
        }
        final long expiryTime = tokenLifetimeInSeconds * 1000 + System.currentTimeMillis();
        AuthorizationCode token = request.getToken(AuthorizationCode.class);
        String authModules = null;
        String acr = null;
        if (token != null) {
            authModules = token.getAuthModules();
            acr = token.getAuthenticationContextClassReference();
        }

        final String realm = realmNormaliser.normalise(request.<String>getParameter(REALM));
        final String id = UUID.randomUUID().toString();

        RefreshToken refreshToken = new OpenAMRefreshToken(id, resourceOwnerId, clientId, redirectUri, scope,
                expiryTime, OAuth2Constants.Bearer.BEARER, OAuth2Constants.Token.OAUTH_REFRESH_TOKEN, grantType,
                realm, authModules, acr);

        try {
            tokenStore.create(refreshToken);
        } catch (CoreTokenException e) {
            logger.error("Unable to create refresh token: " + refreshToken.getTokenInfo(), e);
            throw new ServerException("Could not create token in CTS: " + e.getMessage());
        }

        request.setToken(RefreshToken.class, refreshToken);

        return refreshToken;
    }

    /**
     * {@inheritDoc}
     */
    public AuthorizationCode readAuthorizationCode(OAuth2Request request, String code) throws InvalidGrantException, ServerException {
        if (logger.messageEnabled()) {
            logger.message("Reading Authorization code: " + code);
        }
        final JsonValue token;

        // Read from CTS
        try {
            token = tokenStore.read(code);
        } catch (CoreTokenException e) {
            logger.error("Unable to read authorization code corresponding to id: " + code, e);
            throw new ServerException("Could not read token from CTS: " + e.getMessage());
        }

        if (token == null) {
            logger.error("Unable to read authorization code corresponding to id: " + code);
            throw new InvalidGrantException("The provided access grant is invalid, expired, or revoked.");
        }

        OpenAMAuthorizationCode authorizationCode = new OpenAMAuthorizationCode(token);
        if (!authorizationCode.getRealm().equals(request.<String>getParameter(REALM))) {
            throw new InvalidGrantException("Grant is not valid for the requested realm");
        }
        request.setToken(AuthorizationCode.class, authorizationCode);
        return authorizationCode;
    }

    /**
     * {@inheritDoc}
     */
    public void updateAuthorizationCode(AuthorizationCode authorizationCode) {
        deleteAuthorizationCode(authorizationCode.getTokenId());

        // Store in CTS
        try {
            tokenStore.create(authorizationCode);
        } catch (CoreTokenException e) {
            logger.error("DefaultOAuthTokenStoreImpl::Unable to create authorization code "
                    + authorizationCode.getTokenInfo(), e);
            throw new OAuthProblemException(Status.SERVER_ERROR_INTERNAL.getCode(),
                    "Internal error", "Could not create token in CTS", null);
        }
    }

    public void updateAccessToken(AccessToken accessToken) {
        try {
            deleteAccessToken(accessToken.getTokenId());
            tokenStore.create(accessToken);
        } catch (ServerException e) {
            logger.error("DefaultOAuthTokenStoreImpl::Unable to delete access token "
                    + accessToken.getTokenId(), e);
            throw new OAuthProblemException(Status.SERVER_ERROR_INTERNAL.getCode(),
                    "Internal error", "Could not delete token in CTS", null);
        } catch (CoreTokenException e) {
            logger.error("DefaultOAuthTokenStoreImpl::Unable to create access token "
                    + accessToken.getTokenId(), e);
            throw new OAuthProblemException(Status.SERVER_ERROR_INTERNAL.getCode(),
                    "Internal error", "Could not create token in CTS", null);
        }
    }

    @Override
    public void updateRefreshToken(RefreshToken refreshToken) {
        try {
            deleteRefreshToken(refreshToken.getTokenId());
            tokenStore.create(refreshToken);
        } catch (CoreTokenException e) {
            logger.error("DefaultOAuthTokenStoreImpl::Unable to create refresh token "
                    + refreshToken.getTokenId(), e);
            throw new OAuthProblemException(Status.SERVER_ERROR_INTERNAL.getCode(),
                    "Internal error", "Could not create token in CTS", null);
        } catch (InvalidRequestException e) {
            logger.error("DefaultOAuthTokenStoreImpl::Unable to delete refresh token "
                    + refreshToken.getTokenId(), e);
            throw new OAuthProblemException(Status.SERVER_ERROR_INTERNAL.getCode(),
                    "Internal error", "Could not delete token in CTS", null);
        }
    }

    /**
     * {@inheritDoc}
     */
    public void deleteAuthorizationCode(String authorizationCode) {
        if (logger.messageEnabled()){
            logger.message("DefaultOAuthTokenStoreImpl::Deleting Authorization code: " + authorizationCode);
        }
        JsonValue oAuthToken;

        // Read from CTS
        try {
            oAuthToken = tokenStore.read(authorizationCode);
        } catch (CoreTokenException e) {
            logger.error("DefaultOAuthTokenStoreImpl::Unable to read authorization code corresponding to id: "
                    + authorizationCode, e);
            throw new OAuthProblemException(Status.SERVER_ERROR_INTERNAL.getCode(),
                    "Internal error", "Could not read token from CTS: " + e.getMessage(), null);
        }

        if (oAuthToken == null) {
            logger.error("DefaultOAuthTokenStoreImpl::Unable to read authorization code corresponding to id: "
                    + authorizationCode);
            throw new OAuthProblemException(Status.CLIENT_ERROR_NOT_FOUND.getCode(), "Not found",
                    "Could not find token using CTS", null);
        }

        // Delete the code
        try {
            tokenStore.delete(authorizationCode);
        } catch (CoreTokenException e) {
            logger.error("DefaultOAuthTokenStoreImpl::Unable to delete authorization code corresponding to id: "
                    + authorizationCode, e);
            throw new OAuthProblemException(Status.SERVER_ERROR_INTERNAL.getCode(),
                    "Internal error", "Could not delete token from CTS: " + e.getMessage(), null);
        }
    }

    /**
     * {@inheritDoc}
     */
    public JsonValue queryForToken(String tokenId) throws InvalidRequestException {

        JsonValue results;

        try {
            results = tokenStore.query(or(
                    equalTo(OAuthTokenField.PARENT.getField(), tokenId),
                    equalTo(OAuthTokenField.REFRESH_TOKEN.getField(), tokenId)));
        } catch (CoreTokenException e) {
            logger.error("Unable to query refresh token corresponding to id: " + tokenId, e);
            throw new InvalidRequestException();
        }

        return results;
    }

    /**
     * {@inheritDoc}
     */
    public void deleteAccessToken(String accessTokenId) throws ServerException {
        logger.message("Deleting access token");

        // Delete the code
        try {
            tokenStore.delete(accessTokenId);
        } catch (CoreTokenException e) {
            logger.error("Unable to delete access token corresponding to id: " + accessTokenId, e);
            throw new ServerException("Could not delete token from CTS: " + e.getMessage());
        }
    }

    /**
     * {@inheritDoc}
     */
    public void deleteRefreshToken(String refreshTokenId) throws InvalidRequestException {

        // Delete the code
        try {
            tokenStore.delete(refreshTokenId);
        } catch (CoreTokenException e) {
            logger.error("Unable to delete refresh token corresponding to id: " + refreshTokenId, e);
            throw new InvalidRequestException();
        }
    }

    /**
     * {@inheritDoc}
     */
    public AccessToken readAccessToken(OAuth2Request request, String tokenId) throws ServerException,
            InvalidGrantException {

        logger.message("Reading access token");

        JsonValue token;

        // Read from CTS
        try {
            token = tokenStore.read(tokenId);
        } catch (CoreTokenException e) {
            logger.error("Unable to read access token corresponding to id: " + tokenId, e);
            throw new ServerException("Could not read token in CTS: " + e.getMessage());
        }

        if (token == null) {
            logger.error("Unable to read access token corresponding to id: " + tokenId);
            throw new InvalidGrantException("Could not read token in CTS");
        }

        OpenAMAccessToken accessToken = new OpenAMAccessToken(token);
        if (!accessToken.getRealm().equals(request.<String>getParameter(REALM))) {
            throw new InvalidGrantException("Grant is not valid for the requested realm");
        }
        request.setToken(AccessToken.class, accessToken);
        return accessToken;
    }

    /**
     * {@inheritDoc}
     */
    public RefreshToken readRefreshToken(OAuth2Request request, String tokenId) throws ServerException,
            InvalidGrantException {

        logger.message("Read refresh token");
        JsonValue token;

        try {
            token = tokenStore.read(tokenId);
        } catch (CoreTokenException e) {
            logger.error("Unable to read refresh token corresponding to id: " + tokenId, e);
            throw new ServerException("Could not read token in CTS: " + e.getMessage());
        }

        if (token == null) {
            logger.error("Unable to read refresh token corresponding to id: " + tokenId);
            throw new InvalidGrantException("grant is invalid");
        }

        OpenAMRefreshToken refreshToken = new OpenAMRefreshToken(token);
        if (!refreshToken.getRealm().equals(request.<String>getParameter(REALM))) {
            throw new InvalidGrantException("Grant is not valid for the requested realm");
        }
        request.setToken(RefreshToken.class, refreshToken);
        return refreshToken;
    }
}
