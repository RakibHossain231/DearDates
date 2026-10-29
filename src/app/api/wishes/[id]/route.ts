import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const wish = await prisma.wish.findFirst({
    where: {
      id,
      userId: user.id,
    },
    include: {
      deliveryLogs: {
        orderBy: { sentAt: "desc" },
      },
    },
  });

  if (!wish) {
    return NextResponse.json({ error: "Wish not found" }, { status: 404 });
  }

  return NextResponse.json({ wish });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existingWish = await prisma.wish.findFirst({
    where: { id, userId: user.id },
  });

  if (!existingWish) {
    return NextResponse.json({ error: "Wish not found" }, { status: 404 });
  }

  try {
    const {
      recipientName,
      channel,
      recipientContact,
      recipientTimezone,
      scheduledDate,
      repeat,
      message,
      category,
      status,
    } = await req.json();

    const updateData: {
      recipientName?: string;
      channel?: string;
      recipientContact?: string;
      recipientTimezone?: string;
      scheduledDate?: Date;
      repeat?: string;
      message?: string;
      category?: string;
      status?: string;
    } = {};

    if (recipientName) updateData.recipientName = recipientName.trim();
    if (channel) updateData.channel = channel.toUpperCase();
    if (recipientContact) updateData.recipientContact = recipientContact.trim();
    if (recipientTimezone) updateData.recipientTimezone = recipientTimezone;
    if (scheduledDate) updateData.scheduledDate = new Date(scheduledDate);
    if (repeat) updateData.repeat = repeat;
    if (message !== undefined) updateData.message = message.trim();
    if (category) updateData.category = category;
    if (status) updateData.status = status;

    const updatedWish = await prisma.wish.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "Wish updated successfully",
      wish: updatedWish,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Failed to update wish", details: msg }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existingWish = await prisma.wish.findFirst({
    where: { id, userId: user.id },
  });

  if (!existingWish) {
    return NextResponse.json({ error: "Wish not found" }, { status: 404 });
  }

  await prisma.wish.delete({
    where: { id },
  });

  return NextResponse.json({
    success: true,
    message: "Wish deleted successfully",
  });
}
