import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export interface AuthUser {
  id: number;
  role: "ADMIN" | "USER" | "OWNER";
  email: string;
}

export function auth(required = true) {
  return (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      if (required) return res.status(401).json({ error: "Unauthorized" });
      return next();
    }
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || "devsecret") as AuthUser;
      (req as any).user = payload;
      return next();
    } catch (e) {
      if (required) return res.status(401).json({ error: "Invalid token" });
      return next();
    }
  };
}

export function requireRole(...roles: Array<"ADMIN" | "OWNER" | "USER">) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as AuthUser | undefined;
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    if (!roles.includes(user.role)) return res.status(403).json({ error: "Forbidden" });
    next();
  };
}
