import { NextResponse } from "next/server";
import { getAccessToken } from "@/lib/token-manager";

export async function POST() {
  try {
    const tokenData = await getAccessToken();
    
    if (!tokenData) {
      return NextResponse.json(
        { message: "Token request failed" },
        { status: 500 }
      );
    }

    return NextResponse.json(tokenData);
  } catch (error) {
    console.error("Token request failed:", error);
    return NextResponse.json(
      { message: "Token request failed" },
      { status: 500 }
    );
  }
}
