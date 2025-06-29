/**
 * @jest-environment node
 */
import createPrismaMock from "prisma-mock";
import { mockReset } from "jest-mock-extended";
import { Prisma } from "@prisma/client";

jest.mock("../src/lib/prisma", () => ({
  prisma: createPrismaMock({}, (Prisma as any).dmmf.datamodel),
}));
import { prisma } from "../src/lib/prisma";
import { logAction } from "../src/middleware/audit";
import { AuditAction } from "../src/types";

beforeEach(() => {
  mockReset(prisma);
});

test("logAction writes entry", async () => {
  await logAction(AuditAction.LOGIN, "u1", { ip: "127.0.0.1" });
  expect(prisma.auditLog.create).toHaveBeenCalledWith({
    data: { action: "LOGIN", userId: "u1", payload: { ip: "127.0.0.1" } },
  });
});
