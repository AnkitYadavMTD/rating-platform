import { Router } from "express";
import { prisma } from "../prisma.js";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { hashPassword, comparePassword } from "../utils/password.js";
import { auth } from "../middleware/auth.js";

const router = Router();

const emailSchema = z.string().email();
const passwordSchema = z.string().min(8).max(16).regex(/[A-Z]/, "Must contain uppercase").regex(/[^A-Za-z0-9]/, "Must contain special char");
const nameSchema = z.string().min(20).max(60);
const addressSchema = z.string().min(1).max(400);

router.post("/signup", async (req, res) => {
  try {
    const body = z.object({
      name: nameSchema,
      email: emailSchema,
      address: addressSchema,
      password: passwordSchema,
    }).parse(req.body);

    const exists = await prisma.user.findUnique({ where: { email: body.email } });
    if (exists) return res.status(409).json({ error: "Email already registered" });

    const passwordHash = await hashPassword(body.password);
    const user = await prisma.user.create({
      data: { name: body.name, email: body.email, address: body.address, passwordHash, role: "USER" },
    });
    return res.json({ id: user.id, email: user.email });
  } catch (e: any) {
    return res.status(400).json({ error: e.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const body = z.object({
      email: emailSchema,
      password: z.string().min(1),
    }).parse(req.body);

    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await comparePassword(body.password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, process.env.JWT_SECRET || "devsecret", { expiresIn: "7d" });
    return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, address: user.address } });
  } catch (e: any) {
    return res.status(400).json({ error: e.message });
  }
});

router.post("/password", auth(true), async (req, res) => {
  try {
    const body = z.object({
      oldPassword: z.string().min(1),
      newPassword: passwordSchema,
    }).parse(req.body);
    const user = await prisma.user.findUnique({ where: { id: (req as any).user.id } });
    if (!user) return res.status(404).json({ error: "User not found" });
    const ok = await comparePassword(body.oldPassword, user.passwordHash);
    if (!ok) return res.status(400).json({ error: "Old password incorrect" });
    const passwordHash = await hashPassword(body.newPassword);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
    return res.json({ ok: true });
  } catch (e: any) {
    return res.status(400).json({ error: e.message });
  }
});

export default router;
