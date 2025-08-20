import { Router } from "express";
import { prisma } from "../prisma.js";
import { z } from "zod";
import { auth, requireRole } from "../middleware/auth.js";
import { hashPassword } from "../utils/password.js";

const router = Router();
router.use(auth(true), requireRole("ADMIN"));

const emailSchema = z.string().email().optional().or(z.string().email());
const nameSchema = z.string().min(20).max(60);
const addressSchema = z.string().min(1).max(400);
const passwordSchema = z.string().min(8).max(16).regex(/[A-Z]/).regex(/[^A-Za-z0-9]/);
const roleSchema = z.enum(["ADMIN", "USER", "OWNER"]);

router.post("/users", async (req, res) => {
  try {
    const body = z.object({
      name: nameSchema,
      email: z.string().email(),
      password: passwordSchema,
      address: addressSchema,
      role: roleSchema
    }).parse(req.body);

    const exists = await prisma.user.findUnique({ where: { email: body.email } });
    if (exists) return res.status(409).json({ error: "Email already exists" });
    const passwordHash = await hashPassword(body.password);
    const user = await prisma.user.create({ data: { name: body.name, email: body.email, address: body.address, passwordHash, role: body.role } });
    return res.json({ id: user.id, email: user.email, role: user.role });
  } catch (e: any) {
    return res.status(400).json({ error: e.message });
  }
});

router.get("/users", async (req, res) => {
  const q = z.object({
    name: z.string().optional(),
    email: z.string().optional(),
    address: z.string().optional(),
    role: z.enum(["ADMIN", "USER", "OWNER"]).optional(),
    sortBy: z.enum(["name", "email", "address", "role", "createdAt"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
    skip: z.coerce.number().min(0).optional(),
    take: z.coerce.number().min(1).max(100).optional()
  }).parse(req.query);

  const where: any = {
    AND: [
      q.name ? { name: { contains: q.name, mode: "insensitive" } } : {},
      q.email ? { email: { contains: q.email, mode: "insensitive" } } : {},
      q.address ? { address: { contains: q.address, mode: "insensitive" } } : {},
      q.role ? { role: q.role } : {}
    ]
  };
  const orderBy = q.sortBy ? { [q.sortBy]: q.sortOrder || "asc" } : { createdAt: "desc" as const };

  const [items, total] = await Promise.all([
    prisma.user.findMany({ where, orderBy, skip: q.skip, take: q.take }),
    prisma.user.count({ where })
  ]);

  res.json({ total, items });
});

router.get("/users/:id", async (req, res) => {
  const id = Number(req.params.id);
  const user = await prisma.user.findUnique({ where: { id }, include: { store: true } });
  if (!user) return res.status(404).json({ error: "Not found" });

  let ownerRating: number | null = null;
  if (user.role === "OWNER" && user.store) {
    const agg = await prisma.rating.aggregate({
      _avg: { value: true },
      where: { storeId: user.store.id }
    });
    ownerRating = agg._avg.value ?? null;
  }

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    address: user.address,
    role: user.role,
    rating: ownerRating
  });
});

router.post("/stores", async (req, res) => {
  try {
    const body = z.object({
      name: z.string().min(1),
      email: z.string().email().optional(),
      address: z.string().min(1).max(400),
      ownerId: z.number().optional()
    }).parse(req.body);

    const store = await prisma.store.create({ data: body });
    res.json(store);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.get("/stores", async (req, res) => {
  const q = z.object({
    name: z.string().optional(),
    email: z.string().optional(),
    address: z.string().optional(),
    sortBy: z.enum(["name", "email", "address", "createdAt"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
    skip: z.coerce.number().min(0).optional(),
    take: z.coerce.number().min(1).max(100).optional()
  }).parse(req.query);

  const where: any = {
    AND: [
      q.name ? { name: { contains: q.name, mode: "insensitive" } } : {},
      q.email ? { email: { contains: q.email, mode: "insensitive" } } : {},
      q.address ? { address: { contains: q.address, mode: "insensitive" } } : {},
    ]
  };
  const orderBy = q.sortBy ? { [q.sortBy]: q.sortOrder || "asc" } : { createdAt: "desc" as const };

  const items = await prisma.store.findMany({ where, orderBy, skip: q.skip, take: q.take, include: { ratings: true } });
  const mapped = items.map(s => {
    const avg = s.ratings.length ? s.ratings.reduce((a, r) => a + r.value, 0) / s.ratings.length : 0;
    return { id: s.id, name: s.name, email: s.email, address: s.address, rating: Number(avg.toFixed(2)) };
  });
  const total = await prisma.store.count({ where });

  res.json({ total, items: mapped });
});

router.get("/metrics", async (_req, res) => {
  const [totalUsers, totalStores, totalRatings] = await Promise.all([
    prisma.user.count(),
    prisma.store.count(),
    prisma.rating.count()
  ]);
  res.json({ totalUsers, totalStores, totalRatings });
});

export default router;
