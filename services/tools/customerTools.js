import { z } from "zod";

export function registerCustomerTools(mcpServer, db, ObjectId) {
    mcpServer.tool(
      "searchCustomerByUserAccountId",
      "Search customer details by User Account ID",
      {
        userAccountId: z.string().describe("The User Account ID to search for"),
      },
      async ({ userAccountId}) => {
        try {
          if (!db) {
            throw new Error("Database not connected");
          }
    
         
    
          const collection = db.collection('userAccount');
          const customer = await collection.findOne({ userAccountId });
    
          if (!customer) {
            return {
              content: [
                {
                  type: "text",
                  text: `No customer found for User Account ID: ${userAccountId}`,
                },
              ],
            };
          }
    
          // **Structured Response**
          const customerSummary = {
            userAccountId: customer.userAccountId,
            shortCustomerId: customer.shortCustomerId,
            emailId: customer.emailId,
            phoneNumber: customer.phoneNumber,
            firstName: customer.firstName,
            lastName: customer.lastName,
            address: {
              addressLine1: customer.address?.addressLine1 ?? "N/A",
              addressLine2: customer.address?.addressLine2 ?? "N/A",
              city: customer.address?.city ?? "N/A",
              state: customer.address?.state ?? "N/A",
              country: customer.address?.country ?? "N/A",
              zipCode: customer.address?.zipCode ?? "N/A",
            },
            visitType: customer.visitType ?? "N/A",
            sourceType: customer.sourceType ?? "N/A",
            sourceRef: customer.sourceRef ?? "N/A",
            addressType: customer.addressType ?? "N/A",
            isActive: customer.isActive ?? false,
            visitorType: customer.visitorType ?? "N/A",
            createdAt: new Date(customer.createdAt).toLocaleString(),
            updatedAt: new Date(customer.updatedAt).toLocaleString(),
    
            // Safe navigation and fallback to empty array
            changeLogList: customer.changeLogList?.map((change, index) => ({
              index,
              emailId: change.emailId ?? "N/A",
              phoneNumber: change.phoneNumber ?? "N/A",
              firstName: change.firstName ?? "N/A",
              lastName: change.lastName ?? "N/A",
              address: {
                addressLine1: change.address?.addressLine1 ?? "N/A",
                addressLine2: change.address?.addressLine2 ?? "N/A",
                city: change.address?.city ?? "N/A",
                state: change.address?.state ?? "N/A",
                country: change.address?.country ?? "N/A",
                zipCode: change.address?.zipCode ?? "N/A",
              },
              visitType: change.visitType ?? "N/A",
              sourceType: change.sourceType ?? "N/A",
              sourceRef: change.sourceRef ?? "N/A",
              addressType: change.addressType ?? "N/A",
            })) || [],
          };
    
          return {
            content: [
              {
                type: "text",
                text: `Customer Details for User Account ID ${userAccountId}:\n${JSON.stringify(customerSummary, null, 2)}`,
              },
            ],
          };
        } catch (error) {
          console.error("Error in searchCustomerByUserAccountId:", error.message);
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
}