import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOtpCode } from "@/lib/dispatcher";

export async function POST(req: NextRequest) {
  try {
    const { identifier, channel = "EMAIL" } = await req.json();

    if (!identifier) {
      return NextResponse.json({ error: "Email or phone number is required" }, { status: 400 });
    }

    const cleanIdentifier = identifier.trim().toLowerCase();

    // Check if user exists
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanIdentifier },
          { phone: cleanIdentifier },
        ],
      },
    });

    if (!user) {
      // Don't leak whether user exists, return generic success
      return NextResponse.json({
        success: true,
        message: "If an account exists with this detail, a verification code has been sent.",
      });
    }

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Invalidate existing codes
    await prisma.verificationCode.updateMany({
      where: {
        userId: user.id,
        type: "PASSWORD_RESET",
        used: false,
      },
      data: { used: true },
    });

    // Create verification code
    await prisma.verificationCode.create({
      data: {
        userId: user.id,
        target: cleanIdentifier,
        type: "PASSWORD_RESET",
        code,
        expiresAt,
      },
    });

    // Determine target based on requested channel
    const destination = channel === "EMAIL" ? user.email : (user.phone || cleanIdentifier);

    await sendOtpCode({
      target: destination,
      channel: channel as "EMAIL" | "WHATSAPP" | "SMS",
      code,
    });

    return NextResponse.json({
      success: true,
      message: `A 6-digit verification code has been dispatched to your ${channel.toLowerCase()}.`,
      target: cleanIdentifier,
      // For local development convenience if keys aren't set yet:
      devCode: process.env.NODE_ENV !== "production" ? code : undefined,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Password recovery failed", details: msg }, { status: 500 });
  }
}
