// services/registerTools.d.ts

import { ObjectId } from "mongodb";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerAllTools(
  mcpServer: McpServer,
  db: any,
  ObjectId: typeof ObjectId,
  transporter?: any
): void;
