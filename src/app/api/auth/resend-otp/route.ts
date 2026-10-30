import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOtpCode } from "@/lib/dispatcher";

export async function POST(req: NextRequest) {
  try {
    const { identifier } = await req.json();

    if (!identifier) {
      return NextResponse.json({ error: "Email or phone number is required" }, { status: 400 });
    }

    const cleanIdentifier = identifier.trim().toLowerCase();

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanIdentifier },
          { phone: cleanIdentifier },
        ],
      },
    });

    if (!user) {
      return NextResponse.json({ error: "No account found with this contact detail" }, { status: 404 });
    }

    // Invalidate existing unused codes
    await prisma.verificationCode.updateMany({
      where: {
        userId: user.id,
        type: "SIGNUP_VERIFY",
        used: false,
      },
      data: { used: true },
    });

    // Generate fresh 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.verificationCode.create({
      data: {
        userId: user.id,
        target: cleanIdentifier,
        type: "SIGNUP_VERIFY",
        code,
        expiresAt,
      },
    });

    const isEmail = cleanIdentifier.includes("@");
    await sendOtpCode({
      target: cleanIdentifier,
      channel: isEmail ? "EMAIL" : "WHATSAPP",
      code,
      userName: user.name,
    });

    return NextResponse.json({
      success: true,
      message: `A fresh 6-digit verification code has been sent to ${cleanIdentifier}.`,
      otpCode: code,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Failed to resend code", details: msg }, { status: 500 });
  }
}
