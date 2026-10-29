import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { dispatchWish } from "@/lib/dispatcher";
import { addMonths, addYears } from "date-fns";

/**
 * Scheduled Cron Job Endpoint
 * Triggered by Vercel Cron, QStash, or cron-job.org
 * GET or POST /api/cron/dispatch
 */
export async function GET(req: NextRequest) {
  return handleDispatch(req);
}

export async function POST(req: NextRequest) {
  return handleDispatch(req);
}

async function handleDispatch(req: NextRequest) {
  const now = new Date();
  const searchThreshold = new Date(now.getTime() + 60 * 1000); // 1-minute grace window for clock skew
  const summary = {
    dispatchedCount: 0,
    cleanedUpCount: 0,
    errors: [] as string[],
  };

  try {
    // 1. Fetch pending wishes whose scheduled date is <= now (+1 min buffer)
    const pendingWishes = await prisma.wish.findMany({
      where: {
        status: "PENDING",
        scheduledDate: {
          lte: searchThreshold,
        },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            senderName: true,
            smtpEmail: true,
            smtpPassword: true,
            deliveryNotification: true,
          },
        },
      },
      take: 50, // Process in safe batches
    });

    for (const wish of pendingWishes) {
      try {
        const dispatchResult = await dispatchWish({
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
            status: dispatchResult.success ? "SUCCESS" : "FAILED",
            response: dispatchResult.response + (dispatchResult.error ? ` | Error: ${dispatchResult.error}` : ""),
          },
        });

        if (dispatchResult.success) {
          summary.dispatchedCount++;

          if (wish.repeat === "YEARLY") {
            // Repeat next year: advance scheduled date by 1 year, keep status PENDING
            // The user can edit the message anytime before the next year!
            const nextDate = addYears(new Date(wish.scheduledDate), 1);
            await prisma.wish.update({
              where: { id: wish.id },
              data: {
                scheduledDate: nextDate,
                status: "PENDING",
                lastSentAt: now,
                failureReason: null,
              },
            });
          } else if (wish.repeat === "MONTHLY") {
            const nextDate = addMonths(new Date(wish.scheduledDate), 1);
            await prisma.wish.update({
              where: { id: wish.id },
              data: {
                scheduledDate: nextDate,
                status: "PENDING",
                lastSentAt: now,
                failureReason: null,
              },
            });
          } else {
            // One-time wish: set to SENT and schedule automatic deletion in 24 hours
            const autoDeleteAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
            await prisma.wish.update({
              where: { id: wish.id },
              data: {
                status: "SENT",
                lastSentAt: now,
                autoDeleteAt,
                failureReason: null,
              },
            });
          }
        } else {
          // Mark as failed
          await prisma.wish.update({
            where: { id: wish.id },
            data: {
              status: "FAILED",
              failureReason: dispatchResult.error || "Delivery attempt failed",
            },
          });
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        summary.errors.push(`Wish ${wish.id} error: ${msg}`);
      }
    }

    // 2. Auto-Cleanup: Delete one-time wishes that were sent more than 24 hours ago
    const cleanupResult = await prisma.wish.deleteMany({
      where: {
        status: "SENT",
        repeat: "NONE",
        autoDeleteAt: {
          lte: now,
        },
      },
    });

    summary.cleanedUpCount = cleanupResult.count;

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      summary,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Scheduler failed", details: msg }, { status: 500 });
  }
}
