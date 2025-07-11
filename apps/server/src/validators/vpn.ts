import { z } from "zod";
import "zod-to-openapi/dist/zod-extensions";

export const VpnModel = (z
  .object({
    id: z.string().uuid(),
    ownerId: z.string().uuid(),
    name: z.string(),
  }) as any).openapi({ name: "Vpn" });

export const VpnCreate = VpnModel.pick({ name: true }).openapi({
  name: "VpnCreateRequest",
});

export const VpnUpdate = VpnCreate.partial().openapi({
  name: "VpnUpdateRequest",
});
