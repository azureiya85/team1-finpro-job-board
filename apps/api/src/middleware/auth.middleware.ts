// apps/api/src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../prisma";    // ← your prisma client

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: string;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET!;

/**
 * requireAuth checks for a Bearer token, verifies it,
 * and attaches `userId` and `userRole` to `req`.
 */
export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string };
    req.userId = payload.sub;

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    req.userRole = user.role;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
    return;
  }
};

/**
 * requireRole ensures the authenticated user has the given role.
 */
export const requireRole = (role: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.userRole !== role) {
      res.status(403).json({ message: "Forbidden: insufficient role" });
      return;
    }
    next();
  };
};
