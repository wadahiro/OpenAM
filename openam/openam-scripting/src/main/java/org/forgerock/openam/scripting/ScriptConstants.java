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
 * Copyright 2015 ForgeRock AS.
 */
package org.forgerock.openam.scripting;

/**
 * Constants used for managing scripts.
 *
 * @since 13.0.0
 */
public final class ScriptConstants {

    private ScriptConstants() {
        throw new RuntimeException("Constructor for ScriptConstants is not supported.");
    }

    /**
     * Resource bundle used for error messages.
     */
    public static final String RESOURCE_BUNDLE = "scripting";

    public static final String SCRIPT_NAME = "name";
    public static final String JSON_UUID = "_id";
    public static final String SCRIPT_TEXT = "script";
    public static final String SCRIPT_LANGUAGE = "language";
    public static final String SCRIPT_CONTEXT = "context";
    public static final String SCRIPT_DESCRIPTION = "description";
    public static final String SCRIPT_CREATED_BY = "createdBy";
    public static final String SCRIPT_CREATION_DATE = "creationDate";
    public static final String SCRIPT_LAST_MODIFIED_BY = "lastModifiedBy";
    public static final String SCRIPT_LAST_MODIFIED_DATE = "lastModifiedDate";
    public static final String SERVICE_NAME = "ScriptingService";
    public static final String SCRIPT_CONFIGURATION = "scriptConfiguration";
    public static final String SCRIPT_CONFIGURATIONS = "scriptConfigurations";
    public static final String EMPTY = "";
    public static final String EMPTY_SCRIPT_SELECTION = "[Empty]";

    public static final String SCRIPT_TIMEOUT = "serverTimeout";
    public static final String THREAD_POOL_CORE_SIZE = "coreThreads";
    public static final String THREAD_POOL_MAX_SIZE = "maxThreads";
    public static final String THREAD_POOL_QUEUE_SIZE = "queueSize";
    public static final String THREAD_POOL_IDLE_TIMEOUT = "idleTimeout";
    public static final String WHITE_LIST = "whiteList";
    public static final String BLACK_LIST = "blackList";
    public static final String USE_SECURITY_MANAGER = "useSecurityManager";
    public static final String ENGINE_CONFIGURATION = "EngineConfiguration";

    public static final int DEFAULT_CORE_THREADS = 10;
    public static final int DEFAULT_MAX_THREADS = 10;
    public static final int DEFAULT_QUEUE_SIZE = 10;
    public static final long DEFAULT_IDLE_TIMEOUT_SECONDS = 60l; // Seconds

    public static final String LOGGER_NAME = "Scripting";

    public static final String AUTHENTICATION_SERVER_SIDE_NAME = "AUTHENTICATION_SERVER_SIDE";
    public static final String POLICY_CONDITION_NAME = "POLICY_CONDITION";
    public static final String OIDC_CLAIMS_NAME = "OIDC_CLAIMS";

    /**
     * The context in which a script will be used.
     */
    public static enum ScriptContext {
        AUTHENTICATION_SERVER_SIDE,
        AUTHENTICATION_CLIENT_SIDE,
        POLICY_CONDITION,
        OIDC_CLAIMS
    }

    /**
     * Predefined global script configuration IDs. The global script configurations are defined in the
     * scripting service and accessible in all realms.
     */
    public static enum GlobalScript {
        AUTH_MODULE_SERVER_SIDE("Scripted Module - Server Side", "7e3d7067-d50f-4674-8c76-a3e13a810c33"),
        AUTH_MODULE_CLIENT_SIDE("Scripted Module - Client Side", ""),
        DEVICE_ID_MATCH_SERVER_SIDE("Device Id (Match) - Server Side", "703dab1a-1921-4981-98dd-b8e5349d8548"),
        DEVICE_ID_MATCH_CLIENT_SIDE("Device Id (Match) - Client Side", "157298c0-7d31-4059-a95b-eeb08473b7e5"),
        OIDC_CLAIMS_SCRIPT("OIDC Claims Script", "36863ffb-40ec-48b9-94b1-9a99f71cc3b5");

        private final String displayName;
        private final String id;

        private GlobalScript(String displayName, String id) {
            this.displayName = displayName;
            this.id = id;
        }

        /**
         * Get the display name of the global script.
         * @return The display name of the script.
         */
        public String getDisplayName() {
            return displayName;
        }

        /**
         * Get the Id of the global script.
         * @return The Id of the global script.
         */
        public String getId() {
            return id;
        }
    }

    /**
     * Error messages are stored in the scripting.properties file to facilitate translation. Each entry in this
     * enum corresponds to a specific error message in the file keyed on the code.
     */
    public static enum ScriptErrorCode {
        CONTEXT_NOT_RECOGNISED("1"),
        LANGUAGE_NOT_SUPPORTED("2"),
        FIND_BY_NAME_FAILED("3"),
        FIND_BY_UUID_FAILED("4"),
        DELETE_FAILED("5"),
        RETRIEVE_FAILED("6"),
        RETRIEVE_ALL_FAILED("7"),
        SAVE_FAILED("8"),
        MISSING_SCRIPT_UUID("9"),
        MISSING_SCRIPT_NAME("10"),
        MISSING_SCRIPT("11"),
        MISSING_SCRIPTING_LANGUAGE("12"),
        MISSING_SCRIPT_CONTEXT("13"),
        SCRIPT_NAME_EXISTS("14"),
        SCRIPT_UUID_EXISTS("15"),
        SCRIPT_UUID_NOT_FOUND("16"),
        FILTER_BOOLEAN_LITERAL_FALSE("17"),
        FILTER_EXTENDED_MATCH("18"),
        FILTER_GREATER_THAN("19"),
        FILTER_GREATER_THAN_OR_EQUAL("20"),
        FILTER_LESS_THAN("21"),
        FILTER_LESS_THAN_OR_EQUAL("22"),
        FILTER_NOT("23"),
        FILTER_PRESENT("24"),
        SCRIPT_ENCODING_FAILED("25"),
        RESOURCE_FILTER_NOT_SUPPORTED("26");

        private final String code;

        private ScriptErrorCode(String code) {
            this.code = code;
        }

        /**
         * Get the code for this error message.
         * @return the error message code
         */
        public String getCode() {
            return code;
        }
    }

    /**
     * Retrieve the {@code SupportedScriptingLanguage} instance for the given language.
     * @param languageName The name of the required scripting language.
     * @return The {@code SupportedScriptingLanguage}.
     * @throws ScriptException If the given language is not supported.
     */
    public static SupportedScriptingLanguage getLanguageFromString(String languageName) throws ScriptException {
        for (SupportedScriptingLanguage ssl : SupportedScriptingLanguage.values()) {
            if (ssl.name().equalsIgnoreCase(languageName)) {
                return ssl;
            }
        }
        throw new ScriptException(ScriptErrorCode.LANGUAGE_NOT_SUPPORTED, languageName);
    }

    /**
     * Retrieve the {@code ScriptContext} instance for the given context.
     * @param context The name of the required scripting context.
     * @return The {@code ScriptContext}.
     * @throws ScriptException If the given context is not supported.
     */
    public static ScriptContext getContextFromString(String context) throws ScriptException {
        for (ScriptContext sc : ScriptContext.values()) {
            if (sc.name().equalsIgnoreCase(context)) {
                return sc;
            }
        }
        throw new ScriptException(ScriptErrorCode.CONTEXT_NOT_RECOGNISED, context);
    }
}
