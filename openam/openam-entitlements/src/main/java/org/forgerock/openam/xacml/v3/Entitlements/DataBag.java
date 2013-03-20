/**
 *
 ~ DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 ~
 ~ Copyright (c) 2011-2013 ForgeRock AS. All Rights Reserved
 ~
 ~ The contents of this file are subject to the terms
 ~ of the Common Development and Distribution License
 ~ (the License). You may not use this file except in
 ~ compliance with the License.
 ~
 ~ You can obtain a copy of the License at
 ~ http://forgerock.org/license/CDDLv1.0.html
 ~ See the License for the specific language governing
 ~ permission and limitations under the License.
 ~
 ~ When distributing Covered Code, include this CDDL
 ~ Header Notice in each file and include the License file
 ~ at http://forgerock.org/license/CDDLv1.0.html
 ~ If applicable, add the following below the CDDL Header,
 ~ with the fields enclosed by brackets [] replaced by
 ~ your own identifying information:
 ~ "Portions Copyrighted [year] [name of copyright owner]"
 *
 */

package org.forgerock.openam.xacml.v3.Entitlements;


/**
 This class Encapsulates a DataValue from the XACML policy.
 In this case, we have the actual Data in the object

 @author Allan.Foster@forgerock.com

 */

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

public class DataBag extends FunctionArgument {
    /**
     * Data Value Object.
     */
    private List<DataValue> data = new ArrayList<DataValue>();

    /**
     * Default Constructor
     */
    public DataBag() {
    }


    /**
     * Constructor used to specify the value represented by String Data.

     * @param type
     * @param value
     */
    public DataBag(String type, DataValue value) {
        setType(type);
        this.add(value);
    }

    public DataBag add(DataValue value)  {
        if (getType().getIndex() != value.getType().getIndex()) {
            return this;                             // Should this be an exception???
        }
        data.add(value);
        return this;
    }

    /**
     * Evaluate the Function Argument Set.
     *
     * @param pip
     * @return
     * @throws XACML3EntitlementException
     */
    public FunctionArgument evaluate(XACMLEvalContext pip) throws XACML3EntitlementException {
        return this;
    }

    /**
     * Get the current Data Value.
     *
     * @param pip
     * @return
     * @throws XACML3EntitlementException
     */
    public Object getValue(XACMLEvalContext pip) throws XACML3EntitlementException {
        return data;
    }

    /**
     * Get the current value in JSON Form.
     *
     * @return
     * @throws JSONException
     */
    public JSONObject toJSONObject() throws JSONException {
        JSONObject jo = super.toJSONObject();
        for (DataValue arg : data ) {
            jo.append("data", arg.toJSONObject());
        }
        return jo;
    }

    /**
     * Initialize Data Value from a JSON Object.
     *
     * @param jo
     * @throws JSONException
     */
    protected void init(JSONObject jo) throws JSONException {
        super.init(jo);
        JSONArray array = jo.getJSONArray("data");
        for (int i = 0; i < array.length(); i++) {
            JSONObject json = (JSONObject)array.get(i);
            data.add((DataValue)FunctionArgument.getInstance(json));
        }
        return;
    }

    /**
     * UnMarshal the exiting DataType to XML.
     *
     * @param type
     * @return
     */
    public String toXML(String type) {
        /*
             Handle Match AnyOf and AllOf specially
        */
        String retVal = "<AttributeValue DataType=" + getType() + data + "</AttributeValue>";

        return retVal;
    }


}
