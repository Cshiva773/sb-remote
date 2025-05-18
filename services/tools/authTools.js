import { z } from "zod";
import { validateEmail, generateOTP, sendOTP, storeOTP, verifyOTP } from "../../../middlewares/auth.middleware.js";
import { transporter } from "../../../utils/emailTransporter.js";

export function registerAuthTools(mcpServer, db, ObjectId) {
    mcpServer.tool(
        "requestEmailVerification",
        "Send a verification code to the user's email",
        {
            email: z.string().email().describe("The user's email address to verify"),
        },
        async ({ email }) => {
            try {
                // Use email validation middleware
                const { isValid, response } = await validateEmail(email);
                if (!isValid) {
                    return response;
                }

                // Generate OTP
                const otp = generateOTP();

                // Store OTP
                await storeOTP(email, otp);

                // Send OTP email
                const emailSent = await sendOTP(email, otp, transporter);

                if (!emailSent) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: "Failed to send verification code. Please try again later.",
                            },
                        ],
                    };
                }

                return {
                    content: [
                        {
                            type: "text",
                            text: `A verification code has been sent to ${email}. Please check your inbox and enter the code to continue.`,
                        },
                    ],
                };
            } catch (error) {
                console.error("Error in requestEmailVerification:", error.message);
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
        "verifyEmailOTP",
        "Verify the OTP sent to user's email",
        {
            email: z.string().email().describe("The user's email address"),
            otp: z.string().length(6).describe("The 6-digit verification code sent to email"),
        },
        async ({ email, otp }) => {
            try {
                // Use email validation middleware first
                const emailValidation = await validateEmail(email);
                if (!emailValidation.isValid) {
                    return emailValidation.response;
                }

                // Use auth middleware to verify OTP
                const { isValid, sessionToken, response } = await verifyOTP(email, otp);

                // Return the response from the middleware
                return response;
            } catch (error) {
                console.error("Error in verifyEmailOTP:", error.message);
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
