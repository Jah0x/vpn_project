/**
 * @jest-environment node
 */
import request from "supertest";
import createPrismaMock from "prisma-mock";
import { mockReset } from "jest-mock-extended";
import { Prisma } from "@prisma/client";

jest.mock("../src/lib/prisma", () => ({
  prisma: createPrismaMock({}, (Prisma as any).dmmf.datamodel),
}));
import { prisma } from "../src/lib/prisma";
import { app } from "../src/server";
import { signAccessToken } from "../src/auth";
import { Role } from "../src/types";

beforeEach(() => {
  mockReset(prisma);
  app.set("trust proxy", true);
});

describe("Security middleware", () => {
  it("rate limits after 100 requests", async () => {
    const token = signAccessToken({ id: "u1", role: Role.USER });
    for (let i = 0; i < 100; i++) {
      await request(app)
        .get("/api/vpn")
        .set("Authorization", `Bearer ${token}`)
        .set("X-Forwarded-For", "1.1.1.1");
    }
    const res = await request(app)
      .get("/api/vpn")
      .set("Authorization", `Bearer ${token}`)
      .set("X-Forwarded-For", "1.1.1.1");
    expect(res.status).toBe(429);
    expect(res.headers["retry-after"]).toBeDefined();
  });

  it("/metrics is not rate limited", async () => {
    let res: request.Response | undefined;
    for (let i = 0; i < 101; i++) {
      res = await request(app)
        .get("/metrics")
        .set("X-Forwarded-For", "2.2.2.2");
    }
    expect(res!.status).toBe(200);
  });
});
