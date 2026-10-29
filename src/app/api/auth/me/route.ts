import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, hashPassword, comparePassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ user });
}

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const {
      name,
      email,
      phone,
      timezone,
      deliveryNotification,
      avatar,
      senderName,
      smtpEmail,
      smtpPassword,
      currentPassword,
      newPassword,
    } = await req.json();

    const updateData: {
      name?: string;
      email?: string | null;
      phone?: string | null;
      timezone?: string;
      deliveryNotification?: boolean;
      avatar?: string;
      senderName?: string | null;
      smtpEmail?: string | null;
      smtpPassword?: string | null;
      password?: string;
    } = {};

    if (name) updateData.name = name.trim();
    if (email !== undefined) {
      const cleanEmail = email ? email.trim().toLowerCase() : null;
      if (cleanEmail) {
        const existingEmail = await prisma.user.findFirst({
          where: { email: cleanEmail, id: { not: user.id } },
        });
        if (existingEmail) {
          return NextResponse.json({ error: "Email is already linked to another account" }, { status: 400 });
        }
      }
      updateData.email = cleanEmail;
    }
    if (phone !== undefined) {
      const cleanPhone = phone ? phone.trim() : null;
      if (cleanPhone) {
        const existingPhone = await prisma.user.findFirst({
          where: { phone: cleanPhone, id: { not: user.id } },
        });
        if (existingPhone) {
          return NextResponse.json({ error: "Phone number is already linked to another account" }, { status: 400 });
        }
      }
      updateData.phone = cleanPhone;
    }
    if (timezone) updateData.timezone = timezone;
    if (deliveryNotification !== undefined) updateData.deliveryNotification = deliveryNotification;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (senderName !== undefined) updateData.senderName = senderName ? senderName.trim() : null;
    if (smtpEmail !== undefined) updateData.smtpEmail = smtpEmail && smtpEmail.trim() !== "" ? smtpEmail.trim() : null;
    if (smtpPassword !== undefined) updateData.smtpPassword = smtpPassword && smtpPassword.trim() !== "" ? smtpPassword.trim() : null;

    // Handle password change if requested
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: "Current password is required to set a new password" }, { status: 400 });
      }

      const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
      if (!dbUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const isMatch = await comparePassword(currentPassword, dbUser.password);
      if (!isMatch) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
      }

      if (newPassword.length < 6) {
        return NextResponse.json({ error: "New password must be at least 6 characters" }, { status: 400 });
      }

      updateData.password = await hashPassword(newPassword);
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        timezone: true,
        deliveryNotification: true,
        emailVerified: true,
        phoneVerified: true,
        senderName: true,
        smtpEmail: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Failed to update profile", details: msg }, { status: 500 });
  }
}
