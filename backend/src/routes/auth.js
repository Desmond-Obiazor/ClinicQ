import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../db.js";

const router = Router();

function normalizePhone(raw) {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("234")) return `+${digits}`;
  if (digits.startsWith("0")) return `+234${digits.slice(1)}`;
  return `+234${digits}`;
}

router.post("/register", async (req, res) => {
  const { name, phone, email, password } = req.body;
  if (!name || !phone || !email || !password) {
    return res
      .status(400)
      .json({ error: "name, phone, email, and password are required" });
  }

  const normalizedPhone = normalizePhone(phone);
  const existing = await prisma.user.findUnique({
    where: { phone: normalizedPhone },
  });
  if (existing)
    return res.status(409).json({ error: "Phone already registered" });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      phone: normalizedPhone,
      email: email || null,
      passwordHash,
      role: "PATIENT",
    },
  });

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );
  res
    .status(201)
    .json({ token, user: { id: user.id, name: user.name, role: user.role } });
});

router.post("/login", async (req, res) => {
  const { phone, password } = req.body;
  const normalizedPhone = normalizePhone(phone || "");
  const user = await prisma.user.findUnique({
    where: { phone: normalizedPhone },
  });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: "Invalid phone or password" });
  }
  const token = jwt.sign(
    { id: user.id, role: user.role, clinicId: user.clinicId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );
  res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
});

export default router;
