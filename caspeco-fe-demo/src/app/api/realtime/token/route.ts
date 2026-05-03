import { NextResponse } from "next/server";

export async function POST() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "OpenAI API key not configured" },
      { status: 503 }
    );
  }

  try {
    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini-realtime-preview",
        voice: "sage",
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenAI session error:", error);
      return NextResponse.json(
        { error: "Failed to create session" },
        { status: 503 }
      );
    }

    const data = await response.json();
    return NextResponse.json({ client_secret: data.client_secret.value });
  } catch (err) {
    console.error("Token endpoint error:", err);
    return NextResponse.json(
      { error: "Voice service unavailable" },
      { status: 503 }
    );
  }
}
