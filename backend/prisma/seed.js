import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const CLINICS = [
  {
    name: "Federal Medical Centre, Umuahia",
    address: "Aba Road, opposite Guaranty Trust Bank, Umu Obasi, Umuahia.",
    services: ["General"],
    staffName: "Nurse Adaeze",
    staffPhone: "+2348012345678",
  },
  {
    name: "Abia State Specialist Hospital and Diagnostic Centre",
    address: "42 Aba Road, Umu Obasi, Umuahia, Abia State",
    services: ["Eye Clinic"],
    staffName: "Nurse Bisi",
    staffPhone: "+2348022223333",
  },
  {
    name: "Christiana Dental Clinic",
    address: "24 Azikiwe Road, Umu Obasi, Umuahia.",
    services: ["Dental"],
    staffName: "Nurse Chidi",
    staffPhone: "+2348033334444",
  },
];

async function main() {
  await prisma.appointment.deleteMany({});
  await prisma.slot.deleteMany({});
  await prisma.user.deleteMany({ where: { role: "STAFF" } });
  await prisma.clinic.deleteMany({});

  const staffPasswordHash = await bcrypt.hash("staffpass123", 10);
  const now = new Date();

  for (const c of CLINICS) {
    const clinic = await prisma.clinic.create({
      data: { name: c.name, address: c.address, services: c.services },
    });

    await prisma.user.create({
      data: {
        name: c.staffName,
        phone: c.staffPhone,
        passwordHash: staffPasswordHash,
        role: "STAFF",
        clinicId: clinic.id,
      },
    });

    const slots = Array.from({ length: 4 }).map((_, i) => ({
      clinicId: clinic.id,
      startTime: new Date(now.getTime() + (i + 1) * 60 * 60 * 1000),
      durationMins: 20,
    }));
    await prisma.slot.createMany({ data: slots });
  }

  console.log("Seeded 3 clinics, 3 staff accounts, 4 open slots each.");
  console.log("Staff logins (all password: staffpass123):");
  for (const c of CLINICS) console.log(`  ${c.name}: ${c.staffPhone}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());