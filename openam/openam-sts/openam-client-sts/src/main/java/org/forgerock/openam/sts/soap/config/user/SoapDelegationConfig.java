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

package org.forgerock.openam.sts.soap.config.user;

import org.forgerock.guava.common.base.Objects;
import org.forgerock.json.fluent.JsonValue;
import org.forgerock.openam.sts.MapMarshallUtils;
import org.forgerock.openam.sts.TokenType;
import org.forgerock.openam.utils.CollectionUtils;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.forgerock.json.fluent.JsonValue.field;
import static org.forgerock.json.fluent.JsonValue.json;
import static org.forgerock.json.fluent.JsonValue.object;

/**
 * This class encapsulates the configuration pertaining to the OnBehalfOf and ActAs elements in the WS-Trust specification.
 * If the Soap STS instance is to issue SenderVouches SAML2 assertions, then this configuration must be set. In short,
 * a WS-Trust STS will only issue SenderVouches SAML2 assertions if the OnBehalfOf or ActAs elements in the RequestSecurityToken
 * are set. When they are set, they indicate that the STS is being consumed in a gateway context, and that the original
 * client consuming the gateway is asserted by the OnBehalfOf or ActAs elements in the RST. See
 * http://owulff.blogspot.com/2012/03/saml-sender-vouches-use-case.html and
 * http://coheigea.blogspot.com/2011/08/ws-trust-14-support-in-cxf.html
 * for more detail.
 *
 * When the CXF TokenIssueOperation encounters either the OnBehalfOf or ActAs element in the RST, it
 * 1. runs through the TokenValidators registered with the IssueOperation to validate the ActAs/OnBehalfOf token (in 3.0.3 code-base, this is true;
 * in the 2.7.8 code-base, TokenValidators are called only for OnBehalfOf tokens, not ActAs tokens. See
 * TokenIssueOperation#handleDelegationToken (3.0.3 code-base), and AbstactOperation#performDelegationHandling (2.7.8 code-base)
 * for details). If no registered TokenValidators can handle the token, then the request is NOT failed.
 * 2. runs through the registered TokenDelegationHandler instances, to see if they approve the delegation relationship. If
 * no TokenDelegationHandlers are registered, or if none approve the delegation, then the Issue operation is failed.
 *
 * In this class, the TokenTypes set in the validatedDelegatedTokenConfiguration determine the set of TokenValidators to be created, which
 * will be invoked in step 1 above. If no custom delegation token handlers are specified, then the DefaultTokenDelegationHandler
 * will be plugged-in, which will approve of the delegation provided that one of the TokenValidators could successfully
 * validate the token state in the OnBehalfOf or ActAs element. If additional delegation work needs to be done above and
 * beyond TokenValidation, the customDelegationTokenHandlers have to be specified with the class names of the
 * org.apache.cxf.sts.token.delegation.TokenDelegationHandler implementations which will perform this additional work.
 */
public class SoapDelegationConfig {
    /*
    The following two names correspond to the entries defined in soapSTS.xml
     */
    static final String DELEGATION_TOKEN_VALIDATORS = "validated-delegated-token-types";
    static final String CUSTOM_DELEGATION_TOKEN_HANDLERS = "custom-delegation-token-handlers";
    public static class SoapDelegationConfigBuilder {
        /*
        The set of Tokens for which TokenValidators will be created to validate OnBehalfOf and ActAs tokens sent in a
        RST as part of a IssueOperation invocation.
         */
        private Set<TokenValidationConfig> validatedDelegatedTokenConfiguration;

        /*
        The class names of customer implementations of the org.apache.cxf.sts.token.delegation.TokenDelegationHandler
        interface. Will be registered as the DelegationHandlers with the IssueOperation. If a delegation relationship
        is supported (i.e. OnBehalfOf and ActAs is to be supported, so that SV SAML2 assertions can be issued),
         */
        private Set<String> customDelegationTokenHandlers;

        private SoapDelegationConfigBuilder() {
            validatedDelegatedTokenConfiguration = new HashSet<>();
            customDelegationTokenHandlers = new HashSet<>();
        }

        public SoapDelegationConfigBuilder addValidatedDelegationTokenType(TokenType tokenType, boolean invalidateInterimSession) {
            this.validatedDelegatedTokenConfiguration.add(new TokenValidationConfig(tokenType, invalidateInterimSession));
            return this;
        }

        public SoapDelegationConfigBuilder withValidatedDelegatedTokenSet(Set<TokenValidationConfig> configs) {
            this.validatedDelegatedTokenConfiguration.addAll(configs);
            return this;
        }

        public SoapDelegationConfigBuilder addCustomDelegationTokenHandler(String tokenDelegationHandlerImplName) {
            this.customDelegationTokenHandlers.add(tokenDelegationHandlerImplName);
            return this;
        }

        public SoapDelegationConfig build() {
            return new SoapDelegationConfig(this);
        }

    }
    /*
    The set of Tokens for which TokenValidators will be created to validate OnBehalfOf and ActAs tokens sent in a
    RST as part of a IssueOperation invocation.
     */
    private final Set<TokenValidationConfig> validatedDelegatedTokenConfiguration;

    /*
    The class names of customer implementations of the org.apache.cxf.sts.token.delegation.TokenDelegationHandler
    interface. Will be registered as the DelegationHandlers with the IssueOperation. If a delegation relationship
    is supported (i.e. OnBehalfOf and ActAs is to be supported, so that SV SAML2 assertions can be issued),
     */
    private final Set<String> customDelegationTokenHandlers;

    private SoapDelegationConfig(SoapDelegationConfigBuilder builder) {
        this.validatedDelegatedTokenConfiguration = Collections.unmodifiableSet(builder.validatedDelegatedTokenConfiguration);
        this.customDelegationTokenHandlers = Collections.unmodifiableSet(builder.customDelegationTokenHandlers);
        if (validatedDelegatedTokenConfiguration.isEmpty() && customDelegationTokenHandlers.isEmpty()) {
            throw new IllegalStateException("At least one of the validatedDelegatedTokenConfiguration or customDelegationTokenHandler " +
                    "collections must be non-empty!");
        }
        /*
        Throw an exception if x509 tokens are specified to be validated as delegated token types, as x509 certificates
        are an adequate representation of a subject's identity only when proof of ownership of the associated private
        key is demonstrated, which is not possible when x509 certificates are simply presented in the ActAs/OnBehalfOf
        element in a RequestSecurityToken request.
         */
        for (TokenValidationConfig validationConfig : validatedDelegatedTokenConfiguration) {
            if (TokenType.X509.equals(validationConfig.getValidatedTokenType())) {
                throw new IllegalStateException("X509 tokens are not supported as delegated token types.");
            }
        }
    }

    public Set<TokenValidationConfig> getValidatedDelegatedTokenConfiguration() {
        return validatedDelegatedTokenConfiguration;
    }

    public Set<String> getCustomDelegationTokenHandlers() {
        return customDelegationTokenHandlers;
    }

    public static SoapDelegationConfigBuilder builder() {
        return new SoapDelegationConfigBuilder();
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder("SoapDelegationConfig instance:");
        sb.append('\n');
        sb.append('\t').append("validatedDelegatedTokenConfiguration: ").append(validatedDelegatedTokenConfiguration).append('\n');
        sb.append('\t').append("customDelegationTokenHandlers: ").append(customDelegationTokenHandlers).append('\n');
        return sb.toString();
    }

    @Override
    public int hashCode() {
        return toString().hashCode();
    }

    @Override
    public boolean equals(Object other) {
        if (other instanceof SoapDelegationConfig) {
            SoapDelegationConfig otherConfig = (SoapDelegationConfig)other;
            return Objects.equal(validatedDelegatedTokenConfiguration, otherConfig.getValidatedDelegatedTokenConfiguration()) &&
                            Objects.equal(customDelegationTokenHandlers, otherConfig.getCustomDelegationTokenHandlers());
        }
        return false;
    }

    public JsonValue toJson() {
        JsonValue baseValue = json(object(field(CUSTOM_DELEGATION_TOKEN_HANDLERS, customDelegationTokenHandlers)));

        JsonValue validatedTokenConfiguration = new JsonValue(new ArrayList<>(validatedDelegatedTokenConfiguration.size()));
        List<Object> validationList = validatedTokenConfiguration.asList();
        for (TokenValidationConfig config : validatedDelegatedTokenConfiguration) {
            validationList.add(config.toJson());
        }
        baseValue.add(DELEGATION_TOKEN_VALIDATORS, validatedTokenConfiguration);

        return baseValue;
    }

    public static SoapDelegationConfig fromJson(JsonValue json) {
        SoapDelegationConfigBuilder builder = SoapDelegationConfig.builder();

        if (!json.get(DELEGATION_TOKEN_VALIDATORS).isNull()) {
            Set<TokenValidationConfig> validationConfigs = new HashSet<>();
            for (Object obj : json.get(DELEGATION_TOKEN_VALIDATORS).asCollection()) {
                validationConfigs.add(TokenValidationConfig.fromJson(new JsonValue(obj)));
            }
            builder.withValidatedDelegatedTokenSet(validationConfigs);
        }
        if (!json.get(CUSTOM_DELEGATION_TOKEN_HANDLERS).isNull()) {
            for (Object obj : json.get(CUSTOM_DELEGATION_TOKEN_HANDLERS).asCollection()) {
                builder.addCustomDelegationTokenHandler((String) obj);
            }
        }
        return builder.build();
    }

    public Map<String, Set<String>> marshalToAttributeMap() {
        Map<String, Set<String>> interimMap = MapMarshallUtils.toSmsMap(toJson().asMap());
        interimMap.remove(DELEGATION_TOKEN_VALIDATORS);
        Set<String> tokenTypes = new HashSet<>();
        interimMap.put(DELEGATION_TOKEN_VALIDATORS, tokenTypes);
        for (TokenValidationConfig tvc : validatedDelegatedTokenConfiguration) {
            tokenTypes.add(tvc.toSMSString());
        }

        interimMap.remove(CUSTOM_DELEGATION_TOKEN_HANDLERS);
        interimMap.put(CUSTOM_DELEGATION_TOKEN_HANDLERS, customDelegationTokenHandlers);
        return interimMap;
    }

    public static SoapDelegationConfig marshalFromAttributeMap(Map<String, Set<String>> attributeMap) {
        //first check to see if the relevant attributes are present, indicating that a non-null instance can be created
        if (CollectionUtils.isEmpty(attributeMap.get(DELEGATION_TOKEN_VALIDATORS)) && CollectionUtils.isEmpty(attributeMap.get(CUSTOM_DELEGATION_TOKEN_HANDLERS))) {
            return null;
        }
        Map<String, Object> jsonAttributes = MapMarshallUtils.toJsonValueMap(attributeMap);

        /*
         The DELEGATION_TOKEN_VALIDATORS are currently each in a String representation in the Set<String> map entry corresponding
         to the DELEGATION_TOKEN_VALIDATORS key. I need to marshal each back into a TokenValidationConfig instance, and then
         call toJson on each, and put them in a JsonValue wrapping a list.
         */
        if (attributeMap.get(DELEGATION_TOKEN_VALIDATORS) != null) {
            ArrayList<JsonValue> jsonValidationConfigList = new ArrayList<>();
            JsonValue jsonTranslations = new JsonValue(jsonValidationConfigList);
            jsonAttributes.remove(DELEGATION_TOKEN_VALIDATORS);
            jsonAttributes.put(DELEGATION_TOKEN_VALIDATORS, jsonTranslations);
            Set<String> stringTokenTranslations = attributeMap.get(DELEGATION_TOKEN_VALIDATORS);
            for (String translation : stringTokenTranslations) {
                jsonValidationConfigList.add(TokenValidationConfig.fromSMSString(translation).toJson());
            }
        }

        /*
        Ultimately, the CUSTOM_DELEGATION_TOKEN_HANDLERS is a set, but it's set type gets stripped by the MapMarshalUtils.toJsonValueMap
        method. Thus it is a 'complex' object, which must be reconstituted in this method. Note also that the map may not
        have an entry if the instance was first marshaled to json, which is the first step in marshaling to an attribute map.
         */
        if (attributeMap.get(CUSTOM_DELEGATION_TOKEN_HANDLERS) != null) {
            Set<String> jsonHandlerSet = new HashSet<>();
            JsonValue jsonHandlerTypes = new JsonValue(jsonHandlerSet);
            jsonAttributes.remove(CUSTOM_DELEGATION_TOKEN_HANDLERS);
            jsonAttributes.put(CUSTOM_DELEGATION_TOKEN_HANDLERS, jsonHandlerTypes);
            Set<String> handlerClasses = attributeMap.get(CUSTOM_DELEGATION_TOKEN_HANDLERS);
            for (String handlerClass : handlerClasses) {
                jsonHandlerSet.add(handlerClass);
            }
        }
        return fromJson(new JsonValue(jsonAttributes));
    }

    /*
    This method is called from SoapSTSInstanceConfig if the encapsulated SoapSTSKeystoreConfig reference is null. It should
    return a Map<String,Set<String>> for each of the sms attributes defined for the SoapSTSKeystoreConfig object, with an empty
    Set<String> value, so that SMS writes will over-write any previous, non-null values. This will occur in the AdminUI
    when an admin edits a soap-sts instance to remove existing delegation configurations.
    */
    public static Map<String, Set<String>> getEmptySMSAttributeState() {
        HashMap<String, Set<String>> emptyAttributeMap = new HashMap<>();
        emptyAttributeMap.put(DELEGATION_TOKEN_VALIDATORS, Collections.<String>emptySet());
        emptyAttributeMap.put(CUSTOM_DELEGATION_TOKEN_HANDLERS, Collections.<String>emptySet());
        return emptyAttributeMap;
    }

}
