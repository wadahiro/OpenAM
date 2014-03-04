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
 * Copyright 2014 ForgeRock AS. All rights reserved.
 */

package org.forgerock.openam.sts.rest.config;

import com.google.inject.AbstractModule;
import com.google.inject.Provides;
import com.google.inject.Scopes;
import com.google.inject.name.Names;
import org.forgerock.json.resource.ConnectionFactory;
import org.forgerock.json.resource.Resources;
import org.forgerock.json.resource.Router;
import org.forgerock.openam.sts.AMSTSConstants;
import org.forgerock.openam.sts.persistence.STSInstancePersister;
import org.forgerock.openam.sts.persistence.STSInstancePersisterImpl;
import org.forgerock.openam.sts.rest.publish.RestSTSInstancePublisher;
import org.forgerock.openam.sts.rest.publish.RestSTSInstancePublisherImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Named;
import javax.inject.Singleton;

/**
 * This module defines bindings which are common to all STS instances. This includes, for example, state related to
 * publishing Rest STS instances.
 */
public class RestSTSModule extends AbstractModule {
    private final Router router;
    public RestSTSModule() {
        router = new Router();
    }

    @Override
    protected void configure() {
        bind(RestSTSInstancePublisher.class).to(RestSTSInstancePublisherImpl.class).in(Scopes.SINGLETON);
        bind(STSInstancePersister.class).to(STSInstancePersisterImpl.class).in(Scopes.SINGLETON);

    }

    /*
    Might want to return a dynamic router like the RealmRouterConnectionFactory. For now, take the more static approach.
     */
    @Provides
    @Named(AMSTSConstants.REST_STS_CONNECTION_FACTORY_NAME)
    @Singleton
    ConnectionFactory getConnectionFactory() {
        return Resources.newInternalConnectionFactory(router);
    }

    /*
    Used to obtain the router to publish new Rest STS instances.
     */
    @Provides
    Router getRouter() {
        return router;
    }

    @Provides
    Logger getSlf4jLogger() {
        return LoggerFactory.getLogger(AMSTSConstants.REST_STS_DEBUG_ID);
    }

}
