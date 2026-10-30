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
      channels,
      contacts,
      recipientContact,
      recipientTimezone = "Asia/Dhaka",
      scheduledDate,
      repeat = "NONE",
      deliveryMode = "DEFAULT",
      message,
      category = "BIRTHDAY",
    } = await req.json();

    if (!recipientName || !scheduledDate || !message) {
      return NextResponse.json(
        { error: "Recipient name, scheduled date, and message are required" },
        { status: 400 }
      );
    }

    const scheduledDateTime = new Date(scheduledDate);
    if (isNaN(scheduledDateTime.getTime())) {
      return NextResponse.json({ error: "Invalid scheduled date/time" }, { status: 400 });
    }

    // Support multi-channel broadcast (Idea 2) as well as legacy single channel
    const itemsToCreate: Array<{ channel: string; contact: string }> = [];

    if (Array.isArray(channels) && channels.length > 0) {
      for (const ch of channels) {
        const chKey = String(ch).toUpperCase();
        const contactVal =
          (contacts && contacts[chKey]) ||
          (chKey === (channel || "").toUpperCase() ? recipientContact : "");

        if (contactVal && contactVal.trim()) {
          itemsToCreate.push({ channel: chKey, contact: contactVal.trim() });
        }
      }
    } else if (channel && recipientContact) {
      itemsToCreate.push({ channel: channel.toUpperCase(), contact: recipientContact.trim() });
    }

    if (itemsToCreate.length === 0) {
      return NextResponse.json(
        { error: "Please provide valid contact information for at least one selected delivery channel" },
        { status: 400 }
      );
    }

    const createdWishes = await prisma.$transaction(
      itemsToCreate.map((item) =>
        prisma.wish.create({
          data: {
            userId: user.id,
            recipientName: recipientName.trim(),
            channel: item.channel,
            recipientContact: item.contact,
            recipientTimezone,
            scheduledDate: scheduledDateTime,
            repeat,
            deliveryMode: deliveryMode === "PERSONAL_GMAIL" ? "PERSONAL_GMAIL" : "DEFAULT",
            message: message.trim(),
            category,
            status: "PENDING",
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      message: `${createdWishes.length} celebration wish${createdWishes.length > 1 ? "es" : ""} scheduled successfully!`,
      wishes: createdWishes,
      wish: createdWishes[0],
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Failed to create wish", details: msg }, { status: 500 });
  }
}
