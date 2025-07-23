import { NextResponse } from "next/server";

export async function POST() {
  try {
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
    console.log("Token received:", data);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Token request failed:", error);
    return NextResponse.json(
      { message: "Token request failed" },
      { status: 500 }
    );
  }
}
