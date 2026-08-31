import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth, requireStaff } from "../middleware/auth.js";
import { sendReminderNow } from "../jobs/reminderJob.js";

const router = Router();

router.post("/", requireAuth, async (req, res) => {
  try {
    const { slotId } = req.body;
    if (!slotId) {
      return res.status(400).json({ error: "slotId is required" });
    }
    const slot = await prisma.slot.findUnique({ where: { id: slotId } });
    if (!slot || slot.isBooked) {
      return res.status(409).json({ error: "Slot not available" });
    }

    const [appointment] = await prisma.$transaction([
      prisma.appointment.create({ data: { patientId: req.user.id, slotId } }),
      prisma.slot.update({ where: { id: slotId }, data: { isBooked: true } }),
    ]);

    res.status(201).json(appointment);
  } catch (err) {
    console.error("Booking failed:", err);
    res.status(500).json({ error: "Booking failed" });
  }
});

router.get("/mine", requireAuth, async (req, res) => {
  try {
    const appointments = await prisma.appointment.findMany({
      where: { patientId: req.user.id },
      include: { slot: { include: { clinic: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(appointments);
  } catch (err) {
    console.error("Fetch mine failed:", err);
    res.status(500).json({ error: "Could not fetch appointments" });
  }
});

router.get("/today", requireAuth, requireStaff, async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const appointments = await prisma.appointment.findMany({
      where: {
        slot: { startTime: { gte: start, lte: end }, clinicId: req.user.clinicId },
      },
      include: { slot: { include: { clinic: true } }, patient: true },
      orderBy: { slot: { startTime: "asc" } },
    });
    res.json(appointments);
  } catch (err) {
    console.error("Fetch today failed:", err);
    res.status(500).json({ error: "Could not fetch today's appointments" });
  }
});

// Confirms the appointment actually belongs to this staff member's clinic before allowing the change
async function assertOwnClinic(req, res, appointmentId) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { slot: true },
  });
  if (!appointment || appointment.slot.clinicId !== req.user.clinicId) {
    res.status(403).json({ error: "Not your clinic's appointment" });
    return null;
  }
  return appointment;
}

router.patch("/:id/status", requireAuth, requireStaff, async (req, res) => {
  try {
    const owned = await assertOwnClinic(req, res, req.params.id);
    if (!owned) return;
    const { status } = req.body;
    const appointment = await prisma.appointment.update({
      where: { id: req.params.id },
      data: { status },
    });
    res.json(appointment);
  } catch (err) {
    console.error("Status update failed:", err);
    res.status(500).json({ error: "Could not update status" });
  }
});

router.post("/:id/send-reminder", requireAuth, requireStaff, async (req, res) => {
  try {
    const owned = await assertOwnClinic(req, res, req.params.id);
    if (!owned) return;
    const result = await sendReminderNow(req.params.id);
    res.json(result);
  } catch (err) {
    console.error("Send reminder failed:", err);
    res.status(500).json({ error: "Could not send reminder" });
  }
});

export default router;