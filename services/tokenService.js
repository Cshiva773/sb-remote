import fetch from "node-fetch";

/**
 * Service to handle Auth0 token refreshing
 */
export class TokenService {
  constructor(config) {
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.audience = config.audience;
    this.tokenEndpoint = `${config.issuerBaseURL}/oauth/token`;
  }

  /**
   * Checks if a token needs refreshing and refreshes if necessary
   * @param {Object} authContext - User auth context containing tokens
   * @returns {Promise<Object>} Updated auth context
   */
  async refreshTokenIfNeeded(authContext) {
    if (!authContext || !authContext.refreshToken) {
      return authContext;
    }

    // Check if token is expired or about to expire
    const now = Math.floor(Date.now() / 1000);
    const isExpired = authContext.tokenExpiry <= now;
    const isExpiringSoon = authContext.tokenExpiry <= now + 300; // 5 minutes
    
    if (isExpired || isExpiringSoon) {
      try {
        console.error("Token is expiring soon or expired, refreshing...");
        
        const response = await fetch(this.tokenEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            grant_type: "refresh_token",
            client_id: this.clientId,
            client_secret: this.clientSecret,
            refresh_token: authContext.refreshToken,
            audience: this.audience
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Token refresh failed:", errorData);
          throw new Error(`Token refresh failed: ${errorData.error_description || errorData.error}`);
        }

        const tokenData = await response.json();
        
        // Update the auth context with new tokens
        const updatedContext = {
          ...authContext,
          accessToken: tokenData.access_token,
          idToken: tokenData.id_token,
          refreshToken: tokenData.refresh_token || authContext.refreshToken,
          tokenExpiry: Math.floor(Date.now() / 1000) + tokenData.expires_in,
          isTokenExpired: false,
          isTokenExpiringSoon: false
        };
        
        console.error("Access token refreshed successfully");
        return updatedContext;
      } catch (error) {
        console.error("Error refreshing token:", error.message);
        throw error;
      }
    }
    
    return authContext;
  }
}