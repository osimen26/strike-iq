import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { sanitizePayload } from "@/lib/security/validator";

export async function POST(req: Request) {
  try {
    // 1. Verify the signature from Flutterwave
    const signature = req.headers.get("verif-hash");
    const secretHash = process.env.FLUTTERWAVE_WEBHOOK_HASH;

    if (!signature || signature !== secretHash) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rawPayload = await req.json();
    const payload = sanitizePayload(rawPayload);

    // 2. Log the incoming webhook
    await prisma.paymentWebhook.create({
      data: {
        provider: "FLUTTERWAVE",
        eventType: String(payload.event || "").slice(0, 50),
        payload: JSON.stringify(payload),
        status: "RECEIVED",
      },
    });

    // 3. Process specific events
    // Flutterwave charge.completed event
    if (payload.event === "charge.completed" && payload.data.status === "successful") {
      const { tx_ref, amount, currency, customer } = payload.data;
      
      // We expect tx_ref to encode user_id and plan_id. E.g., `sub_usr123_plan456_timestamp`
      const txParts = tx_ref.split("_");
      
      if (txParts[0] === "sub") {
        const userId = txParts[1];
        const planId = txParts[2];

        // Ensure user and plan exist
        const user = await prisma.user.findUnique({ where: { id: userId } });
        const plan = await prisma.plan.findUnique({ where: { id: planId } });

        if (user && plan) {
          // Record Payment
          await prisma.payment.create({
            data: {
              userId,
              planId,
              amount,
              currency,
              status: "SUCCESSFUL",
              provider: "FLUTTERWAVE",
              transactionId: payload.data.id.toString(),
              reference: tx_ref,
            },
          });

          // Activate or Renew Subscription
          const now = new Date();
          const endDate = new Date(now);
          if (plan.interval === "YEARLY") {
            endDate.setFullYear(endDate.getFullYear() + 1);
          } else {
            endDate.setMonth(endDate.getMonth() + 1);
          }

          await prisma.subscription.upsert({
            where: {
              externalSubscriptionId: `flw_${userId}_${planId}`, // Or unique composite key if defined
            },
            update: {
              status: "ACTIVE",
              currentPeriodEnd: endDate,
            },
            create: {
              userId,
              planId,
              status: "ACTIVE",
              currentPeriodStart: now,
              currentPeriodEnd: endDate,
              externalSubscriptionId: `flw_${userId}_${planId}`,
            },
          });

          // Send a notification to the user
          await prisma.notification.create({
            data: {
              userId,
              title: "Payment Successful",
              message: `Your subscription to ${plan.name} is now active.`,
              type: "PAYMENT",
            }
          });
        }
      }
    }

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Flutterwave Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
