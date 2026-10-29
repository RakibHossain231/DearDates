import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { dispatchWish } from "@/lib/dispatcher";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const wish = await prisma.wish.findFirst({
    where: { id, userId: user.id },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          senderName: true,
          smtpEmail: true,
          smtpPassword: true,
        },
      },
    },
  });

  if (!wish) {
    return NextResponse.json({ error: "Wish not found" }, { status: 404 });
  }

  try {
    const result = await dispatchWish({
      channel: wish.channel,
      recipientContact: wish.recipientContact,
      recipientName: wish.recipientName,
      message: wish.message,
      category: wish.category,
      senderName: wish.user.senderName || wish.user.name,
      smtpEmail: wish.user.smtpEmail,
      smtpPassword: wish.user.smtpPassword,
    });

    // Record delivery log
    await prisma.deliveryLog.create({
      data: {
        wishId: wish.id,
        recipientName: wish.recipientName,
        channel: wish.channel,
        recipientInfo: wish.recipientContact,
        status: result.success ? "SUCCESS" : "FAILED",
        response: result.response + (result.error ? ` | Error: ${result.error}` : ""),
      },
    });

    if (result.success) {
      await prisma.wish.update({
        where: { id: wish.id },
        data: {
          status: wish.repeat === "NONE" ? "SENT" : "PENDING",
          lastSentAt: new Date(),
          failureReason: null,
        },
      });
    } else {
      await prisma.wish.update({
        where: { id: wish.id },
        data: {
          status: "FAILED",
          failureReason: result.error || "Test dispatch failed",
        },
      });
    }

    return NextResponse.json({
      success: result.success,
      result,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Test dispatch failed", details: msg }, { status: 500 });
  }
}
