import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AuthUser, JWTPayload } from '@/types/company';

const prisma = new PrismaClient();

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header or cookies
    let token: string | null = null;
    
    // Check Authorization header first
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    
    // Check cookies for next-auth session token
    if (!token && req.cookies) {
      // Next-Auth typically uses these cookie names
      token = req.cookies['next-auth.session-token'] || 
              req.cookies['__Secure-next-auth.session-token'] ||
              req.cookies['authjs.session-token'] ||
              req.cookies['__Secure-authjs.session-token'] ||
              null;
    }

    if (!token) {
      res.status(401).json({ 
        error: 'Authentication required',
        message: 'No token provided' 
      });
      return;
    }

    // Verify JWT token (Next-Auth v5 format)
    let decoded: JWTPayload;
    try {
      const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;
      if (!secret) {
        throw new Error('JWT secret not configured');
      }
      decoded = jwt.verify(token, secret) as JWTPayload;
    } catch (jwtError) {
      res.status(401).json({ 
        error: 'Invalid token',
        message: 'Token verification failed' 
      });
      return;
    }

    // Get user from database based on token payload
    const userId = decoded.sub || decoded.uid || decoded.id;
    if (!userId) {
      res.status(401).json({ 
        error: 'Invalid token payload',
        message: 'User ID not found in token' 
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        role: true,
        isEmailVerified: true,
        profileImage: true
      }
    });

    if (!user) {
      res.status(401).json({ 
        error: 'User not found',
        message: 'User associated with token does not exist' 
      });
      return;
    }

    // Attach user to request object
    req.user = user as AuthUser;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      error: 'Authentication error',
      message: 'Internal server error during authentication' 
    });
  }
};