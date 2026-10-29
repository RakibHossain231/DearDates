import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { identifier, code, newPassword } = await req.json();

    if (!identifier || !code || !newPassword) {
      return NextResponse.json({ error: "Identifier, verification code, and new password are required" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
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
      return NextResponse.json({ error: "Invalid verification attempt" }, { status: 400 });
    }

    // Find valid verification code
    const validCode = await prisma.verificationCode.findFirst({
      where: {
        userId: user.id,
        code: code.trim(),
        type: "PASSWORD_RESET",
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

    // Hash and update password
    const hashedPassword = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({
      success: true,
      message: "Password reset successfully. You can now log in with your new password.",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Reset password failed", details: msg }, { status: 500 });
  }
}
