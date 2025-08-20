import dotenv from "dotenv";
import { prisma } from "../prisma.js";
import { hashPassword } from "../utils/password.js";

dotenv.config();

async function main() {
  const name = process.env.ADMIN_NAME || "Super Administrator With Long Name";
  const email = process.env.ADMIN_EMAIL || "admin@example.com";
  const password = process.env.ADMIN_PASSWORD || "Admin@1234";
  const address = process.env.ADMIN_ADDRESS || "123 Admin Street";

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    console.log("Admin already exists:", email);
    return;
  }
  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({ data: { name, email, address, role: "ADMIN", passwordHash } });
  console.log("Created admin:", user.email);
}

main().finally(() => prisma.$disconnect());
