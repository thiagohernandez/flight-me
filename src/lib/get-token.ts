export async function getAccessToken(): Promise<string | null> {
  try {
    const res = await fetch("/api/get-token", {
      method: "POST",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch access token");
    }

    const data = await res.json();
    return data.access_token;
  } catch (err) {
    console.error("getAccessToken error:", err);
    return null;
  }
}
