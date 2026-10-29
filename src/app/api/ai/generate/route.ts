import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { generateAiWish } from "@/lib/ai";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { recipientName, relationship, occasion, tone, language, extraNotes } = await req.json();

    if (!recipientName || !occasion) {
      return NextResponse.json({ error: "Recipient name and occasion are required" }, { status: 400 });
    }

    const generatedText = await generateAiWish({
      recipientName,
      relationship: relationship || "Friend",
      occasion,
      tone: tone || "Warm & Friendly",
      language: language || "bn",
      extraNotes,
    });

    return NextResponse.json({
      success: true,
      wish: generatedText,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "AI generation failed", details: msg }, { status: 500 });
  }
}
