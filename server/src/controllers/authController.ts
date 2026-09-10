import { Request, Response } from 'express';
import { db } from '../db/database.js';
import { createSession, destroySession } from '../middleware/auth.js';

export function login(req: Request, res: Response) {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ error: 'User ID / Email and password are required.' });
  }

  const user = db.findUserByCredentials(identifier.trim(), password.trim());

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials. Please check your ID and password.' });
  }

  const token = createSession(user.id);

  // Return safe user object (without password)
  const { password: _, ...safeUser } = user;

  return res.json({
    token,
    user: safeUser,
    message: `Logged in successfully as ${user.name} (${user.role.toUpperCase()})`,
  });
}

export function me(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated.' });
  }

  const { password: _, ...safeUser } = req.user;
  return res.json({ user: safeUser });
}

export function logout(req: Request, res: Response) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    destroySession(token);
  }
  return res.json({ message: 'Logged out successfully.' });
}
