/**
 * @jest-environment node
 */
import request from "supertest";
import bcrypt from "bcryptjs";
import createPrismaMock from "prisma-mock";
import { mockReset } from "jest-mock-extended";
import { Prisma } from "@prisma/client";

process.env.STRIPE_SECRET_KEY = "sk_test";
jest.mock("../src/lib/prisma", () => ({
  prisma: createPrismaMock({}, (Prisma as any).dmmf.datamodel),
}));
import { prisma } from "../src/lib/prisma";
import { app } from "../src/server";
import { signAccessToken } from "../src/auth";
import { Role } from "../src/types";

beforeEach(async () => {
  mockReset(prisma);
  await prisma.user.create({
    data: {
      id: "u1",
      email: "admin@test.com",
      passwordHash: bcrypt.hashSync("admin", 10),
      uuid: "uuid-u1",
      role: "USER",
    },
  });
  await prisma.vpn.create({ data: { id: "1", ownerId: "u1", name: "VPN1" } });
});

describe.skip("POST /api/vpn/restart/:id", () => {
  it("returns pending status when vpn exists", async () => {
    const token = signAccessToken({ id: "u1", role: Role.USER });
    const res = await request(app)
      .post("/api/vpn/restart/1")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("pending");
    expect(res.body.jobId).toBeDefined();
  });

  it("returns 404 for missing vpn", async () => {
    const token = signAccessToken({ id: "u1", role: Role.USER });
    const res = await request(app)
      .post("/api/vpn/restart/999")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});
