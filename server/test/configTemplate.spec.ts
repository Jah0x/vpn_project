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
import fs from "fs";

let configTemplate: any = {};

const adminToken = signAccessToken({ id: "u1", role: Role.ADMIN });
const userToken = signAccessToken({ id: "u2", role: Role.USER });

beforeEach(async () => {
  mockReset(prisma);
  await prisma.user.create({
    data: {
      id: "u1",
      email: "admin@test.com",
      passwordHash: bcrypt.hashSync("admin", 10),
      uuid: "uuid-u1",
      role: "ADMIN",
    },
  });
  await prisma.user.create({
    data: {
      id: "u2",
      email: "user@test.com",
      passwordHash: bcrypt.hashSync("user", 10),
      uuid: "uuid-u2",
      role: "USER",
    },
  });
});

describe.skip("Config template admin routes", () => {
  it("admin can get template", async () => {
    const res = await request(app)
      .get("/api/admin/config-template")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toBeDefined();
  });

  it("user forbidden", async () => {
    const res = await request(app)
      .get("/api/admin/config-template")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });

  it("admin can update template", async () => {
    const res = await request(app)
      .put("/api/admin/config-template")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ foo: "bar" });
    expect(res.status).toBe(200);
    expect(res.body.foo).toBe("bar");
  });
});

describe.skip("Webhook generation", () => {
  const configPath = `configs/u2.json`;
  afterAll(() => {
    if (fs.existsSync(configPath)) fs.unlinkSync(configPath);
  });

  beforeAll(() => {
    Object.assign(configTemplate, {
      v: "2",
      ps: "My-VPN",
      add: "vpn.example.com",
      port: 443,
      id: "{{USER_UUID}}",
      aid: 0,
      scy: "auto",
      net: "tcp",
      type: "none",
      host: "",
      path: "",
      tls: "tls",
    });
    if (fs.existsSync(configPath)) fs.unlinkSync(configPath);
  });

  it("creates file with uuid", async () => {
    const res = await request(app)
      .post("/api/stripe/webhook")
      .send({ type: "checkout.session.completed", data: { userId: "u2" } });
    expect(res.status).toBe(200);
    const data = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    expect(data.id).toBe("uuid-u2");
  });
});
