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

package org.forgerock.openam.sts.tokengeneration.saml2.xmlsig;

import org.forgerock.openam.sts.AMSTSConstants;
import org.forgerock.openam.sts.config.user.SAML2Config;
import org.testng.annotations.Test;

import java.io.UnsupportedEncodingException;
import java.util.HashMap;
import java.util.Map;

import static org.testng.Assert.assertTrue;

public class SAML2CryptoProviderImplTest {

    @Test
    public void testCreation() throws Exception {
        SAML2CryptoProvider keyProvider = new SAML2CryptoProviderImpl(createSAML2Config());
        assertTrue(keyProvider.getIDPPrivateKey("test", "changeit") != null);
    }

    private SAML2Config createSAML2Config() throws UnsupportedEncodingException {
        Map<String, String> attributeMap = new HashMap<>();
        attributeMap.put("email", "mail");

        return SAML2Config.builder()
                .attributeMap(attributeMap)
                .nameIdFormat("urn:oasis:names:tc:SAML:2.0:nameid-format:persistent")
                .spEntityId("http://host.com/sp/entity/id")
                .keystoreFile("keystore.jks")
                .keystorePassword("changeit".getBytes(AMSTSConstants.UTF_8_CHARSET_ID))
                .encryptionKeyAlias("test")
                .signatureKeyAlias("test")
                .signAssertion(true)
                .signatureKeyPassword("changeit".getBytes(AMSTSConstants.UTF_8_CHARSET_ID))
                .idpId("da_idp")
                .build();
    }
}
