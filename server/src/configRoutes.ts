import { Router } from "express";
import { authenticateJWT, authorizeRoles, AuthenticatedRequest } from "./auth";
import { Role } from "./types";
import { logAction } from "./middleware/audit";
import { AuditAction } from "./types";

let configTemplate: any = { v: "2" };

const router = Router();


router.get(
  "/admin/config-template",
  authenticateJWT,
  authorizeRoles(Role.ADMIN),
  (_req, res) => {
    res.json(configTemplate);
  },
);

router.put(
  "/admin/config-template",
  authenticateJWT,
  authorizeRoles(Role.ADMIN),
  (req, res) => {
    const authReq = req as AuthenticatedRequest;
    if (typeof req.body !== "object" || Array.isArray(req.body)) {
      return res.status(400).json({ error: "Invalid JSON" });
    }
    Object.assign(configTemplate, req.body);
    // template stored in memory only
    logAction(AuditAction.TEMPLATE_EDIT, authReq.user!.id, {});
    res.json(configTemplate);
  },
);


export default router;
