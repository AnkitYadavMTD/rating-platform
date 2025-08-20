import { ZodSchema } from "zod";
import { Request, Response, NextFunction } from "express";

export const validate = (schema: ZodSchema<any>, location: "body" | "query" | "params" = "body") => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse((req as any)[location]);
    if (!result.success) {
      return res.status(400).json({ error: "Validation failed", issues: result.error.issues });
    }
    (req as any)[location] = result.data;
    next();
  };
};
