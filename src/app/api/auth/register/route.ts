import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { sendOtpCode } from "@/lib/dispatcher";

export async function POST(req: NextRequest) {
  try {
    const { name, signupMethod = "email", identifier, password, timezone = "Asia/Dhaka" } = await req.json();

    if (!name || !identifier || !password) {
      return NextResponse.json({ error: "Name, contact information, and password are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const cleanIdentifier = identifier.trim().toLowerCase();
    const isEmail = signupMethod === "email";

    if (isEmail && !cleanIdentifier.includes("@")) {
      return NextResponse.json({ error: "Please provide a valid email address" }, { status: 400 });
    }

    // Check if an existing verified user has this email or phone
    const existingUser = await prisma.user.findFirst({
      where: isEmail ? { email: cleanIdentifier } : { phone: cleanIdentifier },
    });

    if (existingUser && existingUser.isVerified) {
      return NextResponse.json(
        { error: `An active account already exists with this ${isEmail ? "email" : "phone number"}` },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    let user;
    if (existingUser) {
      // Re-use unverified user record
      user = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          name: name.trim(),
          password: hashedPassword,
          timezone,
        },
      });
    } else {
      user = await prisma.user.create({
        data: {
          name: name.trim(),
          email: isEmail ? cleanIdentifier : null,
          phone: !isEmail ? cleanIdentifier : null,
          password: hashedPassword,
          timezone,
          isVerified: false,
        },
      });
    }

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Invalidate prior codes
    await prisma.verificationCode.updateMany({
      where: {
        userId: user.id,
        type: "SIGNUP_VERIFY",
        used: false,
      },
      data: { used: true },
    });

    // Create verification code
    await prisma.verificationCode.create({
      data: {
        userId: user.id,
        target: cleanIdentifier,
        type: "SIGNUP_VERIFY",
        code,
        expiresAt,
      },
    });

    // Dispatch OTP code
    await sendOtpCode({
      target: cleanIdentifier,
      channel: isEmail ? "EMAIL" : "WHATSAPP",
      code,
      userName: user.name,
    });

    return NextResponse.json({
      success: true,
      message: `A 6-digit verification code has been dispatched to your ${isEmail ? "email" : "phone/WhatsApp"}.`,
      identifier: cleanIdentifier,
      signupMethod,
      devCode: process.env.NODE_ENV !== "production" ? code : undefined,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Registration failed", details: msg }, { status: 500 });
  }
}
