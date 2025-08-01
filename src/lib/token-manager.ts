import { cookies } from 'next/headers';

interface TokenCache {
  access_token: string;
  expires_at: number;
  token_type: string;
}

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
  
  // Calculate expiration time (subtract 5 minutes as buffer)
  const expiresAt = Date.now() + (data.expires_in - 300) * 1000;
  
  return {
    access_token: data.access_token,
    expires_at: expiresAt,
    token_type: data.token_type || "Bearer",
  };
}

function isTokenExpired(token: TokenCache): boolean {
  return Date.now() >= token.expires_at;
}

async function getTokenFromCookies(): Promise<TokenCache | null> {
  try {
    const cookieStore = await cookies();
    const tokenData = cookieStore.get('opensky_token');
    
    if (!tokenData) {
      return null;
    }
    
    const token: TokenCache = JSON.parse(tokenData.value);
    return token;
  } catch (error) {
    console.error('Failed to parse token from cookies:', error);
    return null;
  }
}

async function saveTokenToCookies(token: TokenCache): Promise<void> {
  try {
    const cookieStore = await cookies();
    const maxAge = Math.floor((token.expires_at - Date.now()) / 1000); // Convert to seconds
    
    cookieStore.set('opensky_token', JSON.stringify(token), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: maxAge > 0 ? maxAge : 1800, // Default to 30 minutes if calculation fails
    });
  } catch (error) {
    console.error('Failed to save token to cookies:', error);
  }
}

export async function getAccessToken(): Promise<{
  access_token: string;
  token_type: string;
  cached: boolean;
} | null> {
  try {
    // Check if we have a token in cookies and if it's still valid
    const cookieToken = await getTokenFromCookies();
    
    if (cookieToken && !isTokenExpired(cookieToken)) {
      console.log("Returning token from cookies");
      return {
        access_token: cookieToken.access_token,
        token_type: cookieToken.token_type,
        cached: true,
      };
    }

    // Token is expired or doesn't exist, fetch a new one
    console.log("Fetching new token");
    const newToken = await fetchNewToken();
    
    // Save the new token to cookies
    await saveTokenToCookies(newToken);
    
    console.log("New token received and saved to cookies");
    return {
      access_token: newToken.access_token,
      token_type: newToken.token_type,
      cached: false,
    };
  } catch (error) {
    console.error("Token request failed:", error);
    return null;
  }
}