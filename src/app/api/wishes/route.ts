import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status"); // PENDING, SENT, FAILED, ALL

  const whereClause: {
    userId: string;
    status?: string;
  } = {
    userId: user.id,
  };

  if (status && status !== "ALL") {
    whereClause.status = status;
  }

  try {
    const wishes = await prisma.wish.findMany({
      where: whereClause,
      orderBy: { scheduledDate: "asc" },
      include: {
        deliveryLogs: {
          orderBy: { sentAt: "desc" },
          take: 3,
        },
      },
    });

    return NextResponse.json({ wishes });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Failed to fetch wishes", details: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const {
      recipientName,
      channel,
      recipientContact,
      recipientTimezone = "Asia/Dhaka",
      scheduledDate,
      repeat = "NONE",
      deliveryMode = "DEFAULT",
      message,
      category = "BIRTHDAY",
    } = await req.json();

    if (!recipientName || !channel || !recipientContact || !scheduledDate || !message) {
      return NextResponse.json(
        { error: "Recipient name, channel, contact, scheduled date, and message are required" },
        { status: 400 }
      );
    }

    const scheduledDateTime = new Date(scheduledDate);
    if (isNaN(scheduledDateTime.getTime())) {
      return NextResponse.json({ error: "Invalid scheduled date/time" }, { status: 400 });
    }

    const wish = await prisma.wish.create({
      data: {
        userId: user.id,
        recipientName: recipientName.trim(),
        channel: channel.toUpperCase(),
        recipientContact: recipientContact.trim(),
        recipientTimezone,
        scheduledDate: scheduledDateTime,
        repeat,
        deliveryMode: deliveryMode === "PERSONAL_GMAIL" ? "PERSONAL_GMAIL" : "DEFAULT",
        message: message.trim(),
        category,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Wish scheduled successfully!",
      wish,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Failed to create wish", details: msg }, { status: 500 });
  }
}
