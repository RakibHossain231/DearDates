import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, signToken } from "@/lib/auth";
import { sendOtpCode } from "@/lib/dispatcher";

export async function POST(req: NextRequest) {
  try {
    const { identifier, password } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json({ error: "Email or phone number and password are required" }, { status: 400 });
    }

    const cleanIdentifier = identifier.trim().toLowerCase();

    // Support login via email or phone
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanIdentifier },
          { phone: cleanIdentifier },
        ],
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials. Please check your login details." }, { status: 401 });
    }

    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials. Please check your login details." }, { status: 401 });
    }

    // Check if account is verified
    if (!user.isVerified) {
      // Generate fresh OTP
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await prisma.verificationCode.updateMany({
        where: { userId: user.id, type: "SIGNUP_VERIFY", used: false },
        data: { used: true },
      });

      await prisma.verificationCode.create({
        data: {
          userId: user.id,
          target: cleanIdentifier,
          type: "SIGNUP_VERIFY",
          code,
          expiresAt,
        },
      });

      await sendOtpCode({
        target: cleanIdentifier,
        channel: user.email ? "EMAIL" : "WHATSAPP",
        code,
        userName: user.name,
      });

      return NextResponse.json({
        requiresVerification: true,
        identifier: cleanIdentifier,
        message: "Your account needs verification. A 6-digit OTP code has been sent.",
        devCode: process.env.NODE_ENV !== "production" ? code : undefined,
      });
    }

    const token = signToken({
      userId: user.id,
      email: user.email || user.phone || "user",
    });

    const response = NextResponse.json({
      success: true,
      message: "Logged in successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        timezone: user.timezone,
        deliveryNotification: user.deliveryNotification,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        isVerified: user.isVerified,
      },
    });

    response.cookies.set("deardates_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Login failed", details: msg }, { status: 500 });
  }
}
