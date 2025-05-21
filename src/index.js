import express from "express";
import { randomUUID } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { connectToDatabase } from "../config/db.js";
import mongodb, { ObjectId } from "mongodb";
import cors from "cors";

import { registerAllTools } from "../services/registerTools.js";


const app = express();
app.use(cors({
  exposedHeaders: ['mcp-session-id']
}));
app.use(express.json());

// Map to store transports by session ID
const transports = {};
let db;

// Connect to database before starting server
const initializeDatabase = async () => {
  try {
    db = await connectToDatabase();
    console.error("Database connection established.");
    return true;
  } catch (error) {
    console.error("Failed to connect to the database:", error.message);
    return false;
  }
};

// Handle POST requests for client-to-server communication
app.post('/mcp', async (req, res) => {
  try {
    const sessionId = req.headers['mcp-session-id'];
    let transport;

    if (!sessionId && isInitializeRequest(req.body)) {
      const newSessionId = randomUUID();
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => newSessionId,
        onsessioninitialized: (newSessionId) => {
          console.error(`Session initialized with ID: ${newSessionId}`);
          transports[newSessionId] = transport;
        }
      });

      // Set the session ID in response headers
      res.setHeader('mcp-session-id', newSessionId);

      transport.onclose = () => {
        if (transport.sessionId) {
          console.error(`Session closed: ${transport.sessionId}`);
          delete transports[transport.sessionId];
        }
      };

      const server = new McpServer({
        name: "example-server",
        version: "1.0.0",
      });

      // Make sure registerAllTools won't throw any errors
      try {
        if (db) {
          registerAllTools(server, db, ObjectId);
          console.error("All tools registered successfully");
        } else {
          console.error("Database not connected, skipping tool registration");
        }
      } catch (error) {
        console.error("Error registering tools:", error.message);
      }

      await server.connect(transport);
      console.error("Server connected to transport");
    } else if (sessionId && transports[sessionId]) {
      transport = transports[sessionId];
    } else {
      console.error("Bad request: No valid session ID provided");
      res.status(400).json({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'Bad Request: No valid session ID provided',
        },
        id: null,
      });
      return;
    }

    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("Error handling POST request:", error.message);
    res.status(500).json({
      jsonrpc: '2.0',
      error: {
        code: -32000,
        message: `Internal server error: ${error.message}`,
      },
      id: null,
    });
  }
});

// Reusable handler for GET and DELETE requests
const handleSessionRequest = async (req, res) => {
  try {
    const sessionId = req.headers['mcp-session-id'];
    if (!sessionId || !transports[sessionId]) {
      res.status(400).send('Invalid or missing session ID');
      return;
    }
    const transport = transports[sessionId];
    await transport.handleRequest(req, res);
  } catch (error) {
    console.error("Error handling session request:", error.message);
    res.status(500).send(`Internal server error: ${error.message}`);
  }
};

// Handle GET requests for server-to-client notifications via SSE
app.get('/mcp', handleSessionRequest);

// Handle DELETE requests for session termination
app.delete('/mcp', handleSessionRequest);

// Initialize database then start server
const startServer = async () => {
  const dbInitialized = await initializeDatabase();

  const PORT = process.env.PORT || 3003;
  app.listen(PORT, () => {
    console.error(`MCP server started on port ${PORT}`);
  });

  // Keep the process alive
  process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
  });

  // Prevent the process from exiting immediately
  process.stdin.resume();
};

startServer().catch(err => {
  console.error("Failed to start server:", err);
});
