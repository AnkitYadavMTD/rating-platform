import { Router } from "express";
import { prisma } from "../prisma.js";
import { z } from "zod";
import { auth } from "../middleware/auth.js";

const router = Router();
router.use(auth(true));

router.get("/", async (req, res) => {
  const q = z.object({
    name: z.string().optional(),
    address: z.string().optional(),
    sortBy: z.enum(["name", "address", "createdAt"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
    skip: z.coerce.number().min(0).optional(),
    take: z.coerce.number().min(1).max(100).optional()
  }).parse(req.query);

  const where: any = {
    AND: [
      q.name ? { name: { contains: q.name, mode: "insensitive" } } : {},
      q.address ? { address: { contains: q.address, mode: "insensitive" } } : {},
    ]
  };
  const orderBy = q.sortBy ? { [q.sortBy]: q.sortOrder || "asc" } : { createdAt: "desc" as const };

  const userId = (req as any).user.id;

  const items = await prisma.store.findMany({
    where, orderBy, skip: q.skip, take: q.take,
    include: {
      ratings: { where: { userId } }
    }
  });

  const withRatings = await Promise.all(items.map(async (s) => {
    const agg = await prisma.rating.aggregate({ _avg: { value: true }, where: { storeId: s.id } });
    return {
      id: s.id,
      name: s.name,
      address: s.address,
      overallRating: Number((agg._avg.value ?? 0).toFixed(2)),
      userRating: s.ratings[0]?.value ?? null
    };
  }));

  const total = await prisma.store.count({ where });
  res.json({ total, items: withRatings });
});

router.post("/:id/rate", async (req, res) => {
  try {
    const params = z.object({ id: z.coerce.number().min(1) }).parse(req.params);
    const body = z.object({ value: z.coerce.number().min(1).max(5) }).parse(req.body);
    const userId = (req as any).user.id;

    const store = await prisma.store.findUnique({ where: { id: params.id } });
    if (!store) return res.status(404).json({ error: "Store not found" });

    const existing = await prisma.rating.findUnique({ where: { userId_storeId: { userId, storeId: store.id } } });
    if (existing) {
      const updated = await prisma.rating.update({ where: { id: existing.id }, data: { value: body.value } });
      return res.json({ updated: true, rating: updated });
    } else {
      const created = await prisma.rating.create({ data: { userId, storeId: store.id, value: body.value } });
      return res.json({ created: true, rating: created });
    }
  } catch (e: any) {
    return res.status(400).json({ error: e.message });
  }
});

export default router;
