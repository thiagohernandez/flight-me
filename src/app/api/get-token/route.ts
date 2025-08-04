import { NextResponse } from "next/server";
import { getAccessTokenWithResponse } from "@/lib/token-manager";

export async function POST() {
  try {
    const result = await getAccessTokenWithResponse();
    
    if (!result.token) {
      console.error("Token request failed: No token received");
      return NextResponse.json(
        { message: "Token request failed" },
        { status: 500 }
      );
    }

    // Create response with token data
    const response = NextResponse.json(result.token);
    
    // If we have a new token with cookies, set the cookie
    if (result.response && result.response.cookies.get('opensky_token')) {
      const tokenCookie = result.response.cookies.get('opensky_token');
      if (tokenCookie) {
        response.cookies.set('opensky_token', tokenCookie.value, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 1800, // 30 minutes
        });
      }
    }
    
    return response;
  } catch (error) {
    console.error("Token request failed:", error);
    return NextResponse.json(
      { message: "Token request failed" },
      { status: 500 }
    );
  }
}
