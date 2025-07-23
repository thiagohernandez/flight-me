interface TokenCache {
  access_token: string;
  expires_at: number;
  token_type: string;
}

let tokenCache: TokenCache | null = null;

async function fetchNewToken(): Promise<TokenCache> {
  const response = await fetch(
    "https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: process.env.OPEN_SKY_CLIENT_ID || "",
        client_secret: process.env.OPEN_SKY_CLIENT_SECRET || "",
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Auth failed: ${response.status}`);
  }

  const data = await response.json();
  
  // Calculate expiration time (subtract 60 seconds as buffer)
  const expiresAt = Date.now() + (data.expires_in - 60) * 1000;
  
  return {
    access_token: data.access_token,
    expires_at: expiresAt,
    token_type: data.token_type || "Bearer",
  };
}

function isTokenExpired(token: TokenCache): boolean {
  return Date.now() >= token.expires_at;
}

export async function getAccessToken(): Promise<{
  access_token: string;
  token_type: string;
  cached: boolean;
} | null> {
  try {
    // Check if we have a cached token and if it's still valid
    if (tokenCache && !isTokenExpired(tokenCache)) {
      console.log("Returning cached token");
      return {
        access_token: tokenCache.access_token,
        token_type: tokenCache.token_type,
        cached: true,
      };
    }

    // Token is expired or doesn't exist, fetch a new one
    console.log("Fetching new token");
    tokenCache = await fetchNewToken();
    
    console.log("New token received and cached");
    return {
      access_token: tokenCache.access_token,
      token_type: tokenCache.token_type,
      cached: false,
    };
  } catch (error) {
    console.error("Token request failed:", error);
    return null;
  }
}