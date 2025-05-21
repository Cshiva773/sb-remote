// import { registerAuthTools } from "./tools/authTools.js";
import { registerContractTools } from "./tools/contractTools.js";
import { registerClaimTools } from "./tools/claimTools.js";
import { registerCustomerTools } from "./tools/customerTools.js";

export function registerAllTools(mcpServer, db, ObjectId, transporter) {
  
  // registerAuthTools(mcpServer, transporter);
  registerContractTools(mcpServer, db, ObjectId);
  registerClaimTools(mcpServer, db, ObjectId);
  registerCustomerTools(mcpServer, db, ObjectId);
}