import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const logs = await prisma.deliveryLog.findMany({
      where: {
        wish: {
          userId: user.id,
        },
      },
      orderBy: { sentAt: "desc" },
      take: 50,
      include: {
        wish: {
          select: {
            id: true,
            recipientName: true,
            category: true,
            repeat: true,
          },
        },
      },
    });

    return NextResponse.json({ logs });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Failed to fetch delivery logs", details: msg }, { status: 500 });
  }
}
