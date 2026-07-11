import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { sanitizePayload } from "@/lib/security/validator";

export async function POST(req: Request) {
  try {
    // 1. Read raw body text first for HMAC verification before parsing JSON
    const rawBody = await req.text();
    const signature = req.headers.get("verif-hash");
    const secretHash = process.env.FLUTTERWAVE_WEBHOOK_HASH;

    if (!signature || !secretHash) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Constant-time comparison using HMAC to prevent length and timing side-channels.
    // Both buffers are the same length (hex-encoded HMAC output) so timingSafeEqual is safe.
    const expectedSig = crypto
      .createHmac("sha256", secretHash)
      .update(rawBody)
      .digest("hex");

    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSig);

    if (
      sigBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(sigBuffer, expectedBuffer)
    ) {
      // Fallback: also allow plain equality match for Flutterwave's header-only hash mode
      if (signature !== secretHash) {
        console.warn("[WEBHOOK_SECURITY] Invalid Flutterwave signature rejected.");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const rawPayload = JSON.parse(rawBody);
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

    // 3. Process charge.completed event
    if (payload.event === "charge.completed" && payload.data.status === "successful") {
      const { tx_ref, amount, currency } = payload.data;
      const transactionId = String(payload.data.id);

      // We expect tx_ref to encode user_id and plan_id. E.g., `sub_usr123_plan456_timestamp`
      const txParts = tx_ref.split("_");

      if (txParts[0] === "sub") {
        const userId = txParts[1];
        const planId = txParts[2];

        const user = await prisma.user.findUnique({ where: { id: userId } });
        const plan = await prisma.plan.findUnique({ where: { id: planId } });

        if (user && plan) {
          // Record Payment — use upsert on transactionId to be idempotent on retries.
          // Flutterwave may retry webhook delivery; create() would produce duplicate records.
          await prisma.payment.upsert({
            where: { transactionId },
            update: { status: "SUCCESSFUL" },
            create: {
              userId,
              planId,
              amount,
              currency,
              status: "SUCCESSFUL",
              provider: "FLUTTERWAVE",
              transactionId,
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
              externalSubscriptionId: `flw_${userId}_${planId}`,
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

          // Notify user — only create if this transaction hasn't already triggered a notification
          const existingNotif = await prisma.notification.findFirst({
            where: { userId, type: "PAYMENT", message: { contains: transactionId } },
          });
          if (!existingNotif) {
            await prisma.notification.create({
              data: {
                userId,
                title: "Payment Successful",
                message: `Your subscription to ${plan.name} is now active. (ref: ${transactionId})`,
                type: "PAYMENT",
              },
            });
          }
        }
      }
    }

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Flutterwave Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
