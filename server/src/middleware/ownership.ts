import { Request, Response, NextFunction } from 'express';

export function enforceStudentOwner(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  if (req.user.role !== 'student' || !req.user.studentId) {
    return res.status(403).json({
      error: 'Access Denied: Teachers and unauthorized roles cannot access private Student Memory Vaults.',
      code: 'PRIVACY_PROTECTED',
      reason: 'Memory Vault content is strictly private to the student who created it.',
    });
  }

  // Always bind the studentId from the authenticated user, ignoring any client query injection
  res.locals.studentId = req.user.studentId;
  next();
}
