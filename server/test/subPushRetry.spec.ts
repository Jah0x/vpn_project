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
import { retrySubPushQueue } from "../src/lib/subPush";

beforeEach(() => {
  mockReset(prisma);
});

test("retry job reduces queue", async () => {
  global.fetch = jest.fn().mockResolvedValue({ ok: true }) as any;
  await prisma.subPushQueue.create({
    data: { id: "q1", uuid: "u1", subString: "s1" },
  });
  await retrySubPushQueue();
  const count = await prisma.subPushQueue.count();
  expect(count).toBe(0);
});
