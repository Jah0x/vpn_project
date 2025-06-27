/**
 * @jest-environment node
 */
import request from "supertest";
import bcrypt from "bcryptjs";
import createPrismaMock from "prisma-mock";
import { mockReset } from "jest-mock-extended";
import { Prisma } from "@prisma/client";
process.env.STRIPE_SECRET_KEY = "sk_test";
process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
jest.mock("../src/lib/prisma", () => ({
  prisma: createPrismaMock({}, (Prisma as any).dmmf.datamodel),
}));
import { prisma } from "../src/lib/prisma";
import { app } from "../src/server";
import Stripe from "stripe";

const stripe = new Stripe("sk_test", { apiVersion: "2025-05-28.basil" });

beforeEach(async () => {
  mockReset(prisma);
  await prisma.user.create({
    data: {
      id: "u1",
      email: "user@test.com",
      passwordHash: bcrypt.hashSync("user", 10),
      uuid: "uuid-u1",
      role: "USER",
    },
  });
});

describe("Billing webhook", () => {
  it("creates subscription on checkout completed", async () => {
    const payload = {
      id: "evt_1",
      object: "event",
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_1",
          subscription: "sub_123",
          metadata: { userId: "u1", planId: "pro" },
        },
      },
    } as any;
    const signature = stripe.webhooks.generateTestHeaderString({
      payload: JSON.stringify(payload),
      secret: "whsec_test",
    });

    const res = await request(app)
      .post("/api/billing/webhook")
      .set("stripe-signature", signature)
      .set("Content-Type", "application/json")
      .send(JSON.stringify(payload));

    expect(res.status).toBe(200);
    expect(prisma.subscription.create).toHaveBeenCalledWith({
      data: {
        userId: "u1",
        stripeSubId: "sub_123",
        status: "active",
        planId: "pro",
        maxActiveVpns: 5,
      },
    });
  });
});
