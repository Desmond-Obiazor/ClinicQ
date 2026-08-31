import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import slotRoutes from "./routes/slots.js";
import appointmentRoutes from "./routes/appointments.js";
import { startReminderJob } from "./jobs/reminderJob.js";

process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection:", err);
});
const app = express();
app.use(cors({ origin: "https://clinic-q-murex.vercel.app/" }));
app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true }));
app.use("/auth", authRoutes);
app.use("/slots", slotRoutes);
app.use("/appointments", appointmentRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Clinic appointment API running on port ${port}`);
  startReminderJob();
});
