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
        "listContractsWithLimit",
        "List available contracts (default limit: 10, unless specified)",
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
                const customerDetails = contract.customerDetails;
                const productDetails = contract.productDetails;
                const enrollmentDetails = contract.enrollmentDetails;
                const fulfillmentDetails = contract.fulfillmentDetails;

                return {
                    content: [
                        {
                            type: "text",
                            text: `Order Details:
    Contract ID: ${contract.contractId}
    
    Customer Information:
    - Name: ${customerDetails.firstName} ${customerDetails.middleName || ''} ${customerDetails.lastName}
    - Email: ${customerDetails.emailAddress}
    - Phone: ${customerDetails.phoneNumber}
    - Address: ${customerDetails.addressDetails.addressLine1}
      ${customerDetails.addressDetails.addressLine2 || ''}
      ${customerDetails.addressDetails.city}, ${customerDetails.addressDetails.state} ${customerDetails.addressDetails.zipCode}
      ${customerDetails.addressDetails.country}
    
    Order Information:
    - Partner Order ID: ${orderDetails.partnerOrderId}
    - Order Creation Date: ${new Date(orderDetails.orderCreationDate).toLocaleDateString()}
    
    Product Information:
    - Title: ${productDetails.productTitle}
    - Partner Product ID: ${productDetails.partnerProductId}
    - Partner Variant ID: ${productDetails.partnerVariantId}
    - Sale Price: $${productDetails.salePrice}
    - List Price: $${productDetails.listPrice}
    - Condition: ${productDetails.productCondition}
    - Store: ${productDetails.partnerPlatformId}
    - Model Number: ${productDetails.sbModelNumber || 'N/A'}
    - Manufacturer: ${productDetails.sbManufacturer || 'N/A'}
    - Serial Number: ${productDetails.sbSerialNumber || 'N/A'}
    
    Enrollment Information:
    - Policy SKU: ${enrollmentDetails.policySKU}
    - Policy Tenure: ${enrollmentDetails.policyTenure} years
    - Amount Paid: $${enrollmentDetails.amountPaid}
    - Policy Quote Price: $${enrollmentDetails.policyQuotePrice}
    - Merchant Margin: $${enrollmentDetails.merchantMargin}
    - SB Margin: $${enrollmentDetails.sbMargin}
    - Insurer Cost: $${enrollmentDetails.insurerCost}
    - Effective Date: ${new Date(enrollmentDetails.policyEffectiveDate).toLocaleDateString()}
    - Expiration Date: ${new Date(enrollmentDetails.policyExpirationDate).toLocaleDateString()}
    - Insurer Category: ${enrollmentDetails.policyInsurerCategory}
    
    Fulfillment Status:
    - Current Stage: ${fulfillmentDetails.stage}
    - Current Status: ${fulfillmentDetails.status}
    - Retry Count: ${fulfillmentDetails.stageRetryCount}
    
    Change History:
    ${fulfillmentDetails.changeHistory.map(h => 
        `    - ${h.stage} - ${h.status} (${new Date(h.createdAt).toLocaleString()})`
    ).join('\n')}`,
                        },
                    ],
                };
            } catch (error) {
                console.error("Error in getOrderDetails:", error.message);
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

    //fetch order details with date range
    mcpServer.tool(
        "getOrderDetailsWithDateRange",
        "Fetch order details from all contracts with date",
        {
            StartDate: z.string().describe("fetch all order details from this date"),
            EndDate: z.string().describe("fetch all order details to this date"),
        },
        async ({ StartDate, EndDate }) => {
            try {
                if (!db) {
                    throw new Error("Database not connected");
                }

                const collection = db.collection('contracts');
                
                // Convert string dates to start and end of day
                const startDate = new Date(StartDate + 'T00:00:00.000Z');
                const endDate = new Date(EndDate + 'T23:59:59.999Z');

                // Validate dates
                if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                    throw new Error("Invalid date format. Please use YYYY-MM-DD format");
                }

                if (startDate > endDate) {
                    throw new Error("Start date cannot be after end date");
                }

                console.log('Searching for orders between:', startDate.toISOString(), 'and', endDate.toISOString());

                // First, let's get all contracts to check the data
                const allContracts = await collection.find({}).toArray();
                console.log('Total contracts found:', allContracts.length);

                // Find contracts that have orderDetails matching the date range
                const contracts = await collection.find({
                    $expr: {
                        $and: [
                            { $ne: ["$orderDetails", null] },
                            { $ne: ["$orderDetails.orderCreationDate", null] },
                            {
                                $gte: [
                                    { $dateFromString: { dateString: "$orderDetails.orderCreationDate" } },
                                    startDate
                                ]
                            },
                            {
                                $lte: [
                                    { $dateFromString: { dateString: "$orderDetails.orderCreationDate" } },
                                    endDate
                                ]
                            }
                        ]
                    }
                }).toArray();

                console.log('Contracts with orders in date range:', contracts.length);

                if (!contracts || contracts.length === 0) {
                    // Let's check what dates we actually have in the database
                    const sampleDates = allContracts
                        .filter(c => c.orderDetails && c.orderDetails.orderCreationDate)
                        .map(c => c.orderDetails.orderCreationDate)
                        .slice(0, 5);
                    
                    console.log('Sample order dates in database:', sampleDates);
                    
                    return {
                        content: [
                            { 
                                type: "text", 
                                text: `No contracts found with orders between ${StartDate} and ${EndDate}. Sample dates in database: ${sampleDates.join(', ')}` 
                            }
                        ]
                    };
                }

                // Format the response with more details
                const formattedResults = contracts.map(contract => {
                    try {
                        return {
                            contractId: contract.contractId,
                            customerName: contract.customerDetails ? 
                                `${contract.customerDetails.firstName} ${contract.customerDetails.lastName}` : 'N/A',
                            order: {
                                partnerOrderId: contract.orderDetails.partnerOrderId,
                                orderCreationDate: contract.orderDetails.orderCreationDate,
                                productTitle: contract.productDetails?.productTitle || 'N/A',
                                salePrice: contract.productDetails?.salePrice || 'N/A'
                            }
                        };
                    } catch (err) {
                        console.error('Error formatting contract:', err);
                        return null;
                    }
                }).filter(result => result !== null);

                if (formattedResults.length === 0) {
                    return {
                        content: [
                            { 
                                type: "text", 
                                text: `Error formatting results. Please check the data structure.` 
                            }
                        ]
                    };
                }

                // Create a summary of the results
                const summary = `Found ${formattedResults.length} contracts with orders between ${StartDate} and ${EndDate}:\n\n`;
                const details = formattedResults.map((result, index) => {
                    return `Contract ${index + 1}:
- Contract ID: ${result.contractId}
- Customer: ${result.customerName}
- Order ID: ${result.order.partnerOrderId}
- Order Date: ${result.order.orderCreationDate}
- Product: ${result.order.productTitle}
- Price: $${result.order.salePrice}\n`;
                }).join('\n');

                const response = {
                    content: [
                        { 
                            type: "text", 
                            text: summary + details
                        }
                    ]
                };

                console.log('Sending response:', JSON.stringify(response));
                return response;

            }
            catch (error) {
                console.error("Error in getOrderDetailsWithDateRange:", error.message);
                return {
                    content: [
                        { type: "text", text: `Error: ${error.message}` }
                    ]
                };
            }
        }
    );




    // ...add other contract-related tools here (listAllContracts, getCustomerDetails, etc.)
}