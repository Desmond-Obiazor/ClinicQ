import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth, requireStaff } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const slots = await prisma.slot.findMany({
    where: { isBooked: false, startTime: { gte: new Date() } },
    orderBy: { startTime: "asc" },
    include: { clinic: true },
  });
  res.json(slots);
});

// clinicId now comes from the logged-in staff member's own account, not the request body
router.post("/", requireAuth, requireStaff, async (req, res) => {
  const { startTime, durationMins } = req.body;
  if (!startTime) {
    return res.status(400).json({ error: "startTime is required" });
  }
  if (!req.user.clinicId) {
    return res.status(400).json({ error: "Your account isn't linked to a clinic yet" });
  }
  const slot = await prisma.slot.create({
    data: { clinicId: req.user.clinicId, startTime: new Date(startTime), durationMins: durationMins || 20 },
  });
  res.status(201).json(slot);
});

export default router;