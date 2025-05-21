// services/tools/authTools.js
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { storeAuthToken, removeAuthToken } from '../../middlewares/auth.middleware.js';

// In-memory storage for OTPs with TTL
class OTPStore {
  constructor() {
    this.otps = new Map();
    this.expiryTimes = new Map();
  }

  /**
   * Store an OTP with TTL
   * @param {string} email - User email
   * @param {string} otp - One-time password
   * @param {number} ttlInMs - Time to live in milliseconds
   */
  setOTP(email, otp, ttlInMs = 300000) { // Default 5 minutes TTL
    this.otps.set(email, otp);
    
    // Set expiry
    const expiryTime = Date.now() + ttlInMs;
    this.expiryTimes.set(email, expiryTime);
    
    // Schedule cleanup
    setTimeout(() => {
      if (this.otps.has(email)) {
        this.otps.delete(email);
        this.expiryTimes.delete(email);
      }
    }, ttlInMs);
  }

  /**
   * Get OTP if not expired
   * @param {string} email - User email
   * @returns {string|null} - OTP or null if expired/not found
   */
  getOTP(email) {
    const otp = this.otps.get(email);
    const expiryTime = this.expiryTimes.get(email);
    
    if (!otp || !expiryTime || Date.now() > expiryTime) {
      // Clean up expired OTP
      if (this.otps.has(email)) {
        this.otps.delete(email);
        this.expiryTimes.delete(email);
      }
      return null;
    }
    
    return otp;
  }

  /**
   * Remove OTP after successful verification
   * @param {string} email - User email
   */
  removeOTP(email) {
    this.otps.delete(email);
    this.expiryTimes.delete(email);
  }
}

// Create single instance of OTP store
const otpStore = new OTPStore();

/**
 * Generate a random 6-digit OTP
 * @returns {string} - 6-digit OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Generate a JWT token
 * @param {string} email - User email
 * @returns {string} - JWT token
 */
const generateAuthToken = (email) => {
  const secret = process.env.JWT_SECRET || 'defaultSecretKeyChangeInProduction';
  return jwt.sign({ email }, secret, { expiresIn: '24h' });
};

/**
 * Register authentication tools with the MCP server
 * @param {Object} mcpServer - MCP server instance
 * @param {Object} transporter - Email transporter for sending OTPs
 */
export function registerAuthTools(mcpServer, transporter) {
  // Request OTP tool
  mcpServer.defineStringTool({
    name: "requestOTP",
    description: "Request a one-time password (OTP) to be sent to your email",
    parameters: z.object({
      email: z.string().email("Please provide a valid email address")
    }),
    handler: async (request) => {
      try {
        const { email } = request;
        
        // Generate OTP
        const otp = generateOTP();
        
        // Store OTP in memory with 5-minute expiry
        otpStore.setOTP(email, otp);
        
        // Send OTP via email
        if (transporter) {
          await transporter.sendMail({
            from: process.env.EMAIL_FROM || 'no-reply@example.com',
            to: email,
            subject: 'Your Authentication Code',
            text: `Your OTP is: ${otp}. This code will expire in 5 minutes.`,
            html: `<p>Your OTP is: <strong>${otp}</strong></p><p>This code will expire in 5 minutes.</p>`
          });
        } else {
          console.log(`[DEV MODE] OTP for ${email}: ${otp}`);
        }
        
        return `OTP sent to ${email}. Please check your inbox and enter the code to verify.`;
      } catch (error) {
        console.error('OTP request error:', error);
        return `Failed to send OTP: ${error.message}`;
      }
    }
  });
  
  // Verify OTP tool
  mcpServer.defineObjectTool({
    name: "verifyOTP",
    description: "Verify the OTP and authenticate the user",
    parameters: z.object({
      email: z.string().email("Please provide a valid email address"),
      otp: z.string().length(6, "OTP must be 6 digits")
    }),
    handler: async (request, context) => {
      try {
        const { email, otp } = request;
        
        // Get stored OTP
        const storedOTP = otpStore.getOTP(email);
        
        if (!storedOTP) {
          return {
            success: false,
            message: "OTP expired or not found. Please request a new one."
          };
        }
        
        // Validate OTP
        if (otp !== storedOTP) {
          return {
            success: false,
            message: "Invalid OTP. Please try again."
          };
        }
        
        // Remove the used OTP
        otpStore.removeOTP(email);
        
        // Generate auth token
        const authToken = generateAuthToken(email);
        
        // Store token in Redis
        await storeAuthToken(email, authToken);
        
        // Update Claude's context with authentication data
        if (context && context.setMemoryContext) {
          await context.setMemoryContext({
            email,
            authToken
          });
        }
        
        return {
          success: true,
          message: "Authentication successful",
          email
        };
      } catch (error) {
        console.error('OTP verification error:', error);
        return {
          success: false,
          message: `Authentication failed: ${error.message}`
        };
      }
    }
  });
  
  // Logout tool
  mcpServer.defineObjectTool({
    name: "logout",
    description: "Log out the current user",
    parameters: z.object({}),
    handler: async (request, context) => {
      try {
        // Get email from Claude's context
        const { email } = context?.memoryContext || {};
        
        if (!email) {
          return {
            success: false,
            message: "No active session found"
          };
        }
        
        // Remove auth token from Redis
        await removeAuthToken(email);
        
        // Clear Claude's context
        if (context && context.setMemoryContext) {
          await context.setMemoryContext({});
        }
        
        return {
          success: true,
          message: "Logged out successfully"
        };
      } catch (error) {
        console.error('Logout error:', error);
        return {
          success: false,
          message: `Logout failed: ${error.message}`
        };
      }
    }
  });
}