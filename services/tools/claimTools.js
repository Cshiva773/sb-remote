import { z } from "zod";

export function registerClaimTools(mcpServer, db, ObjectId) {
    mcpServer.tool(
      "searchClaimsByClaimId",
      "Search claims by claim ID",
      {
        claimId: z.string().describe("The Claim ID to search for"),
      },
      async ({ claimId }) => {
        try {
          if (!db) {
            throw new Error("Database not connected");
          }
    
    
          const collection = db.collection('claim');
          const claim = await collection.findOne({ claimId });
    
          if (!claim) {
            return {
              content: [
                {
                  type: "text",
                  text: `No claim found for Claim ID: ${claimId}`,
                },
              ],
            };
          }
    
          const claimSummary = {
            claimId: claim.claimId,
            description: claim.claimInfo.Description,
            email: claim.claimInfo.Email,
            firstName: claim.claimInfo.FirstName,
            lastName: claim.claimInfo.LastName,
            phone: claim.claimInfo.Phone,
            claimStatus: claim.claimInfo.ClaimStatus,
            claimRemark: claim.claimInfo.ClaimRemark,
            contractId: claim.ContractId,
            updatedAt: new Date(claim.updatedAt).toLocaleDateString(),
            userEmail: claim.userEmail,
          };
    
          return {
            content: [
              {
                type: "text",
                text: `Claim Details for Claim ID ${claimId}:\n${JSON.stringify(claimSummary, null, 2)}`,
              },
            ],
          };
        } catch (error) {
          console.error("Error in searchClaimsByClaimId:", error.message);
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