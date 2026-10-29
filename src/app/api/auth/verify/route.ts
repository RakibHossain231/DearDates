import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { identifier, code } = await req.json();

    if (!identifier || !code) {
      return NextResponse.json({ error: "Identifier and verification code are required" }, { status: 400 });
    }

    const cleanIdentifier = identifier.trim().toLowerCase();

    // Find the user
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanIdentifier },
          { phone: cleanIdentifier },
        ],
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found or invalid session" }, { status: 404 });
    }

    // Check valid OTP code
    const validCode = await prisma.verificationCode.findFirst({
      where: {
        userId: user.id,
        code: code.trim(),
        type: "SIGNUP_VERIFY",
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!validCode) {
      return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 });
    }

    // Mark code as used
    await prisma.verificationCode.update({
      where: { id: validCode.id },
      data: { used: true },
    });

    // Mark user as verified
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        emailVerified: Boolean(user.email),
        phoneVerified: Boolean(user.phone),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        timezone: true,
        isVerified: true,
      },
    });

    // Sign JWT token
    const token = signToken({
      userId: updatedUser.id,
      email: updatedUser.email || updatedUser.phone || "user",
    });

    const response = NextResponse.json({
      success: true,
      message: "Account verified successfully! Welcome to DearDates.",
      user: updatedUser,
    });

    response.cookies.set("deardates_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Verification failed", details: msg }, { status: 500 });
  }
}
