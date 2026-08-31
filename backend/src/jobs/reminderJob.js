import cron from "node-cron";
import { prisma } from "../db.js";
import { sendSms } from "../services/sms.js";
import { sendReminderEmail } from "../services/email.js";

// "email" is active for now — Termii SMS is fully wired below but dormant,
// pending business KYC approval. Flip REMINDER_CHANNEL to "sms" once that clears.
const REMINDER_CHANNEL = process.env.REMINDER_CHANNEL || "email";

function buildMessage(appointment) {
  const { slot, patient } = appointment;
  const when = slot.startTime.toLocaleString("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
  return `Hi ${patient.name}, reminder: your appointment at ${slot.clinic.name} is on ${when}.`;
}

async function sendReminderFor(appointment) {
  const message = buildMessage(appointment);

  if (REMINDER_CHANNEL === "sms") {
    await sendSms(appointment.patient.phone, message);
  } else {
    if (!appointment.patient.email) {
      console.warn(`[reminder] appointment ${appointment.id} has no patient email — skipping`);
      return;
    }
    await sendReminderEmail(appointment.patient.email, "Appointment reminder", message);
  }

  await prisma.appointment.update({
    where: { id: appointment.id },
    data: { reminded: true },
  });
  console.log(`[reminder] sent (${REMINDER_CHANNEL}) for appointment ${appointment.id}`);
}

export async function sendReminderNow(appointmentId) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { slot: { include: { clinic: true } }, patient: true },
  });
  if (!appointment) return { error: "Appointment not found" };
  await sendReminderFor(appointment);
  return { sent: true, appointmentId };
}

export function startReminderJob() {
  const leadHours = Number(process.env.REMINDER_LEAD_HOURS || 24);

  cron.schedule("0 * * * *", async () => {
    const windowStart = new Date();
    const windowEnd = new Date(Date.now() + leadHours * 60 * 60 * 1000);

    const dueAppointments = await prisma.appointment.findMany({
      where: {
        status: "BOOKED",
        reminded: false,
        slot: { startTime: { gte: windowStart, lte: windowEnd } },
      },
      include: { slot: { include: { clinic: true } }, patient: true },
    });

    for (const appointment of dueAppointments) {
      try {
        await sendReminderFor(appointment);
      } catch (err) {
        console.error(`[reminder] failed for appointment ${appointment.id}:`, err.message);
      }
    }
  });

  console.log(`[reminder] cron job started (channel: ${REMINDER_CHANNEL}, lead time: ${leadHours}h)`);
}