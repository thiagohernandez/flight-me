import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

interface TokenCache {
  access_token: string;
  expires_at: number;
  token_type: string;
}

async function fetchNewToken(): Promise<TokenCache> {
  const clientId = process.env.OPEN_SKY_CLIENT_ID;
  const clientSecret = process.env.OPEN_SKY_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    console.error("Missing OpenSky credentials: OPEN_SKY_CLIENT_ID or OPEN_SKY_CLIENT_SECRET not set");
    throw new Error("Missing OpenSky credentials");
  }
  
  console.log("Requesting new token from OpenSky Network...");
  
  const response = await fetch(
    "https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    console.error(`OpenSky auth failed: ${response.status} ${response.statusText}`, errorText);
    throw new Error(`Auth failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  
  if (!data.access_token || !data.expires_in) {
    console.error("Invalid token response from OpenSky:", data);
    throw new Error("Invalid token response");
  }
  
  // Calculate expiration time (subtract 5 minutes as buffer)
  const expiresAt = Date.now() + (data.expires_in - 300) * 1000;
  
  console.log(`New token obtained, expires in ${data.expires_in} seconds`);
  
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
    
    if (!tokenData || !tokenData.value) {
      console.log('No token found in cookies');
      return null;
    }
    
    const token: TokenCache = JSON.parse(tokenData.value);
    
    // Validate the token structure
    if (!token.access_token || !token.expires_at || typeof token.expires_at !== 'number') {
      console.error('Invalid token structure in cookies');
      return null;
    }
    
    return token;
  } catch (error) {
    console.error('Failed to parse token from cookies:', error);
    return null;
  }
}

// Updated function that returns a NextResponse with the token cookie set
export async function getAccessTokenWithResponse(): Promise<{
  token: {
    access_token: string;
    token_type: string;
    cached: boolean;
  } | null;
  response?: NextResponse;
}> {
  try {
    // Check if we have a token in cookies and if it's still valid
    const cookieToken = await getTokenFromCookies();
    
    if (cookieToken && !isTokenExpired(cookieToken)) {
      console.log("Returning cached token from cookies");
      return {
        token: {
          access_token: cookieToken.access_token,
          token_type: cookieToken.token_type,
          cached: true,
        }
      };
    }

    // Token is expired or doesn't exist, fetch a new one
    if (cookieToken) {
      console.log("Token expired, fetching new token");
    } else {
      console.log("No token found in cookies, fetching new token");
    }
    
    const newToken = await fetchNewToken();
    
    console.log("New token received, expires at:", new Date(newToken.expires_at).toISOString());
    
    // Create response with cookie
    const response = new NextResponse();
    const maxAge = Math.floor((newToken.expires_at - Date.now()) / 1000);
    
    // Ensure maxAge is positive and reasonable
    const cookieMaxAge = maxAge > 0 ? Math.min(maxAge, 1800) : 1800;
    
    response.cookies.set('opensky_token', JSON.stringify(newToken), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: cookieMaxAge,
    });
    
    return {
      token: {
        access_token: newToken.access_token,
        token_type: newToken.token_type,
        cached: false,
      },
      response
    };
  } catch (error) {
    console.error("Token request failed:", error);
    return { token: null };
  }
}

// Backwards compatibility function
export async function getAccessToken(): Promise<{
  access_token: string;
  token_type: string;
  cached: boolean;
} | null> {
  const result = await getAccessTokenWithResponse();
  return result.token;
}