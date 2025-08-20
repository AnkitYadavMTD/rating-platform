import { Router } from "express";
import { prisma } from "../prisma.js";
import { auth, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(auth(true), requireRole("OWNER", "ADMIN"));

router.get("/summary", async (req, res) => {
  const user = (req as any).user;
  let ownerId = user.id;
  if (user.role === "ADMIN") {
    // admins can pass ownerId to inspect
    const q = Number((req.query as any).ownerId);
    if (q) ownerId = q;
  }

  const store = await prisma.store.findFirst({ where: { ownerId } });
  if (!store) return res.status(404).json({ error: "Store not assigned to owner" });

  const agg = await prisma.rating.aggregate({ _avg: { value: true }, where: { storeId: store.id } });
  const ratings = await prisma.rating.findMany({ where: { storeId: store.id }, include: { user: true } });

  const raters = ratings.map(r => ({
    id: r.user.id,
    name: r.user.name,
    email: r.user.email,
    value: r.value,
    ratedAt: r.createdAt
  }));

  res.json({
    store: { id: store.id, name: store.name, address: store.address },
    avgRating: Number((agg._avg.value ?? 0).toFixed(2)),
    raters
  });
});

export default router;
