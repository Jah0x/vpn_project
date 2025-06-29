import { Router, Request, Response } from "express";
import Stripe from "stripe";
import express from "express";
import { authenticateJWT, AuthenticatedRequest } from "./auth";
import { prisma } from "./lib/prisma";
import { stripeWebhookTotal } from "./metrics";
import { logAction } from "./middleware/audit";
import { AuditAction } from "./types";
import { pushSubscription } from "./lib/subPush";

const router = Router();
const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY || "sk_test_dummy",
  {
    apiVersion: "2025-05-28.basil",
  },
);

const priceMap: Record<string, string | undefined> = {
  basic: process.env.STRIPE_PRICE_BASIC,
  pro: process.env.STRIPE_PRICE_PRO,
  team: process.env.STRIPE_PRICE_TEAM,
};

const planLimits: Record<string, number> = {
  basic: 1,
  pro: 5,
  team: 20,
};

router.post(
  "/checkout",
  authenticateJWT,
  async (req: AuthenticatedRequest, res: Response) => {
    const { plan } = req.body as { plan: "basic" | "pro" | "team" };
    if (!plan || !priceMap[plan]) {
      return res.status(400).json({ error: "Invalid plan" });
    }
    try {
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
          {
            price: priceMap[plan]!,
            quantity: 1,
          },
        ],
        success_url:
          (req.headers.origin || "http://localhost:5173") +
          "/dashboard?session_id={CHECKOUT_SESSION_ID}",
        cancel_url:
          (req.headers.origin || "http://localhost:5173") + "/dashboard",
        client_reference_id: req.user!.id,
        metadata: { userId: req.user!.id, planId: plan },
      });
      return res.json({ url: session.url });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: "Stripe error" });
    }
  },
);

router.post("/webhook", async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;
  let event: Stripe.Event;
  if (process.env.NODE_ENV === "test") {
    event = JSON.parse(req.body.toString());
  } else {
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET || "",
      );
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${(err as Error).message}`);
    }
  }

  stripeWebhookTotal.inc({ event: event.type });
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = (session.metadata as any).userId as string;
      const planId = (session.metadata as any).planId as string;
      const maxActiveVpns = planLimits[planId];
      if (userId && session.subscription) {
        await prisma.subscription.create({
          data: {
            userId,
            stripeSubId: session.subscription as string,
            status: "active",
            planId,
            maxActiveVpns,
          },
        });
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user) {
          await pushSubscription(user.uuid, `sub://${user.uuid}`);
        }
      }
      await logAction(AuditAction.SUBSCRIPTION_STATUS, userId, {
        status: "active",
        planId,
      });
      break;
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object as any;
      await prisma.subscription.update({
        where: { stripeSubId: invoice.subscription as string },
        data: { status: "past_due" },
      });
      await logAction(AuditAction.SUBSCRIPTION_STATUS, undefined, {
        status: "past_due",
      });
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await prisma.subscription.update({
        where: { stripeSubId: sub.id },
        data: { status: "canceled" },
      });
      await logAction(AuditAction.SUBSCRIPTION_STATUS, undefined, {
        status: "canceled",
      });
      break;
    }
    default:
      break;
  }
  res.json({ received: true });
});

export default router;
