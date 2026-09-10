import { Request, Response, NextFunction } from 'express';
import { User, Role } from '../types/index.js';
import { db } from '../db/database.js';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

// In-memory token session registry for demo
export const SESSIONS: Record<string, string> = {
  // initial tokens
  'session-stu-1001': 'user-stu-1001',
  'session-stu-1002': 'user-stu-1002',
  'session-tch-1001': 'user-tch-1001',
};

export function createSession(userId: string): string {
  const token = `sess-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  SESSIONS[token] = userId;
  return token;
}

export function destroySession(token: string): boolean {
  if (SESSIONS[token]) {
    delete SESSIONS[token];
    return true;
  }
  return false;
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  const userId = SESSIONS[token];

  if (userId) {
    const user = db.findUserById(userId);
    if (user) {
      req.user = user;
    }
  }

  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      error: 'Unauthorized: Authentication required to access this endpoint.',
      code: 'AUTH_REQUIRED',
    });
  }
  next();
}

export function requireRole(allowedRole: Role) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized: Authentication required.',
        code: 'AUTH_REQUIRED',
      });
    }

    if (req.user.role !== allowedRole) {
      return res.status(403).json({
        error: `Access Restricted: This resource requires ${allowedRole} privileges. Your role: ${req.user.role}.`,
        code: 'ACCESS_RESTRICTED',
      });
    }

    next();
  };
}

export const requireStudent = requireRole('student');
export const requireTeacher = requireRole('teacher');
