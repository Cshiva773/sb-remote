import { z } from "zod";


export function registerContractTools(mcpServer, db, ObjectId) {
    mcpServer.tool(
        "getContractDetails",
        "Fetch contract details by contract ID",
        {
            contractId: z.string().describe("The ID of the contract to fetch"),
        },
        async ({ contractId}) => {
            try {
                if (!db) throw new Error("Database not connected");
                const collection = db.collection('contracts');
                let query = ObjectId.isValid(contractId)
                    ? { _id: new ObjectId(contractId) }
                    : { contractId };
                const contract = await collection.findOne(query);
                if (!contract) {
                    return { content: [{ type: "text", text: `Contract with ID ${contractId} not found` }] };
                }
                return { content: [{ type: "text", text: `Contract Details: ${JSON.stringify(contract, null, 2)}` }] };
            } catch (error) {
                return { content: [{ type: "text", text: `Error: ${error.message}` }] };
            }
        }
    );

    mcpServer.tool(
        "listAllContracts",
        "List all available contracts",
        {
            limit: z.number().optional().describe("Maximum number of contracts to return (default: 10)"),
        },
        async ({ limit = 10 }) => {
            try {
                if (!db) {
                    throw new Error("Database not connected");
                }

              

                // Now that the user is authenticated, proceed with listing contracts
                const collection = db.collection('contracts');
                const contracts = await collection.find({}).limit(limit).toArray();

                return {
                    content: [
                        {
                            type: "text",
                            text: `Contracts List: ${JSON.stringify(contracts, null, 2)}`,
                        },
                    ],
                };
            } catch (error) {
                console.error("Error in listAllContracts:", error.message);
                return {
                    content: [
                        {
                            type: "text",
                            text: `Error: ${error.message}`,
                        },
                    ],
                };
            }
        }
    );

    mcpServer.tool(
        "getCustomerDetails",
        "Fetch customer details from a contract",
        {
            contractId: z.string().describe("The ID of the contract to fetch customer details from"),
        },
        async ({ contractId }) => {
            try {
                if (!db) {
                    throw new Error("Database not connected");
                }

                const collection = db.collection('contracts');
                const contract = await collection.findOne({ contractId });

                if (!contract) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: `Contract with ID ${contractId} not found`,
                            },
                        ],
                    };
                }

                const customerDetails = contract.customerDetails;
                return {
                    content: [
                        {
                            type: "text",
                            text: `Customer Details:
    Name: ${customerDetails.firstName} ${customerDetails.middleName || ''} ${customerDetails.lastName}
    Email: ${customerDetails.emailAddress}
    Phone: ${customerDetails.phoneNumber}
    Address: ${customerDetails.addressDetails.addressLine1}
    ${customerDetails.addressDetails.addressLine2 || ''}
    ${customerDetails.addressDetails.city}, ${customerDetails.addressDetails.state} ${customerDetails.addressDetails.zipCode}
    ${customerDetails.addressDetails.country}`,
                        },
                    ],
                };
            } catch (error) {
                console.error("Error in getCustomerDetails:", error.message);
                return {
                    content: [
                        {
                            type: "text",
                            text: `Error: ${error.message}`,
                        },
                    ],
                };
            }
        }
    );

    mcpServer.tool(
        "getProductDetails",
        "Fetch product details from a contract",
        {
            contractId: z.string().describe("The ID of the contract to fetch product details from"),
        },
        async ({ contractId}) => {
            try {
                if (!db) {
                    throw new Error("Database not connected");
                }


                const collection = db.collection('contracts');
                const contract = await collection.findOne({ contractId });

                if (!contract) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: `Contract with ID ${contractId} not found`,
                            },
                        ],
                    };
                }

                const productDetails = contract.productDetails;
                return {
                    content: [
                        {
                            type: "text",
                            text: `Product Details:
    Title: ${productDetails.productTitle}
    Partner Product ID: ${productDetails.partnerProductId}
    Partner Variant ID: ${productDetails.partnerVariantId}
    Sale Price: $${productDetails.salePrice}
    List Price: $${productDetails.listPrice}
    Condition: ${productDetails.productCondition}
    Store: ${productDetails.partnerPlatformId}
    Model Number: ${productDetails.sbModelNumber || 'N/A'}
    Manufacturer: ${productDetails.sbManufacturer || 'N/A'}
    Serial Number: ${productDetails.sbSerialNumber || 'N/A'}`,
                        },
                    ],
                };
            } catch (error) {
                console.error("Error in getProductDetails:", error.message);
                return {
                    content: [
                        {
                            type: "text",
                            text: `Error: ${error.message}`,
                        },
                    ],
                };
            }
        }
    );


    mcpServer.tool(
        "getEnrollmentDetails",
        "Fetch enrollment details from a contract",
        {
            contractId: z.string().describe("The ID of the contract to fetch enrollment details from"),
        },
        async ({ contractId}) => {
            try {
                if (!db) {
                    throw new Error("Database not connected");
                }

              

                const collection = db.collection('contracts');
                const contract = await collection.findOne({ contractId });

                if (!contract) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: `Contract with ID ${contractId} not found`,
                            },
                        ],
                    };
                }

                const enrollmentDetails = contract.enrollmentDetails;
                return {
                    content: [
                        {
                            type: "text",
                            text: `Enrollment Details:
      Policy SKU: ${enrollmentDetails.policySKU}
      Policy Tenure: ${enrollmentDetails.policyTenure} years
      Amount Paid: $${enrollmentDetails.amountPaid}
      Policy Quote Price: $${enrollmentDetails.policyQuotePrice}
      Merchant Margin: $${enrollmentDetails.merchantMargin}
      SB Margin: $${enrollmentDetails.sbMargin}
      Insurer Cost: $${enrollmentDetails.insurerCost}
      Effective Date: ${new Date(enrollmentDetails.policyEffectiveDate).toLocaleDateString()}
      Expiration Date: ${new Date(enrollmentDetails.policyExpirationDate).toLocaleDateString()}
      Insurer Category: ${enrollmentDetails.policyInsurerCategory}`,
                        },
                    ],
                };
            } catch (error) {
                console.error("Error in getEnrollmentDetails:", error.message);
                return {
                    content: [
                        {
                            type: "text",
                            text: `Error: ${error.message}`,
                        },
                    ],
                };
            }
        }
    );
    mcpServer.tool(
        "getFulfillmentStatus",
        "Fetch fulfillment status and history from a contract",
        {
            contractId: z.string().describe("The ID of the contract to fetch fulfillment status from"),
        },
        async ({ contractId}) => {
            try {
                if (!db) {
                    throw new Error("Database not connected");
                }

            

                const collection = db.collection('contracts');
                const contract = await collection.findOne({ contractId });

                if (!contract) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: `Contract with ID ${contractId} not found`,
                            },
                        ],
                    };
                }

                const fulfillmentDetails = contract.fulfillmentDetails;
                const history = fulfillmentDetails.changeHistory
                    .map(h => `${h.stage} - ${h.status} (${new Date(h.createdAt).toLocaleString()})`)
                    .join('\n');

                return {
                    content: [
                        {
                            type: "text",
                            text: `Fulfillment Status:
    Current Stage: ${fulfillmentDetails.stage}
    Current Status: ${fulfillmentDetails.status}
    Retry Count: ${fulfillmentDetails.stageRetryCount}
    
    Change History:
    ${history}`,
                        },
                    ],
                };
            } catch (error) {
                console.error("Error in getFulfillmentStatus:", error.message);
                return {
                    content: [
                        {
                            type: "text",
                            text: `Error: ${error.message}`,
                        },
                    ],
                };
            }
        }
    );


    mcpServer.tool(
        "getOrderDetails",
        "Fetch order details from a contract",
        {
            contractId: z.string().describe("The ID of the contract to fetch order details from"),
        },
        async ({ contractId }) => {
            try {
                if (!db) {
                    throw new Error("Database not connected");
                }

               

                const collection = db.collection('contracts');
                const contract = await collection.findOne({ contractId });

                if (!contract) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: `Contract with ID ${contractId} not found`,
                            },
                        ],
                    };
                }

                const orderDetails = contract.orderDetails;
                return {
                    content: [
                        {
                            type: "text",
                            text: `Order Details:
    Partner Order ID: ${orderDetails.partnerOrderId}
    Order Creation Date: ${new Date(orderDetails.orderCreationDate).toLocaleDateString()}`,
                        },
                    ],
                };
            } catch (error) {
                console.error("Error in getEnrollmentDetails:", error.message);
                return {
                    content: [
                        {
                            type: "text",
                            text: `Error: ${error.message}`,
                        },
                    ],
                };
            }
        }

    );

    // ...add other contract-related tools here (listAllContracts, getCustomerDetails, etc.)
}