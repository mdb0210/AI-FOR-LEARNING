import { Request, Response } from 'express';
import { db } from '../db/database.js';

export function getVaultItems(req: Request, res: Response) {
  const studentId = res.locals.studentId as string;
  if (!studentId) {
    return res.status(403).json({ error: 'Access Denied: Missing student identity.' });
  }

  const { search, subjectId, type } = req.query;
  let items = db.getStudentVault(studentId);

  if (subjectId && typeof subjectId === 'string') {
    items = items.filter((i) => i.subjectId === subjectId);
  }

  if (type && typeof type === 'string') {
    items = items.filter((i) => i.contentType === type);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    items = items.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.topicTitle.toLowerCase().includes(q) ||
        (i.textContent && i.textContent.toLowerCase().includes(q)) ||
        (i.transcript && i.transcript.toLowerCase().includes(q)) ||
        (i.notes && i.notes.toLowerCase().includes(q))
    );
  }

  return res.json({
    items,
    total: items.length,
    isPrivate: true,
    ownerStudentId: studentId,
  });
}

export function getVaultItem(req: Request, res: Response) {
  const studentId = res.locals.studentId as string;
  const { id } = req.params;

  const item = db.getVaultItem(studentId, id);
  if (!item) {
    return res.status(404).json({
      error: 'Memory Vault item not found or you do not have permission to view it.',
      code: 'ITEM_NOT_ACCESSIBLE',
    });
  }

  return res.json({ item, isPrivate: true });
}

export function createVaultItem(req: Request, res: Response) {
  const studentId = res.locals.studentId as string;
  const { topicId, subjectId, topicTitle, title, contentType, textContent, voiceDataUrl, voiceDuration, transcript, imageDataUrl, notes } = req.body;

  if (!title || !contentType) {
    return res.status(400).json({ error: 'Title and content type (text, voice, image) are required.' });
  }

  // Pure private save — NO automatic AI analysis
  const item = db.createVaultItem({
    studentId,
    topicId: topicId || 'general',
    subjectId: subjectId || '',
    topicTitle: topicTitle || 'Personal Note',
    title: title.trim(),
    contentType,
    textContent,
    voiceDataUrl,
    voiceDuration,
    transcript,
    imageDataUrl,
    notes,
  });

  return res.status(201).json({
    item,
    message: 'Saved privately to your Memory Vault.',
    isPrivate: true,
  });
}

export function updateVaultItem(req: Request, res: Response) {
  const studentId = res.locals.studentId as string;
  const { id } = req.params;

  const updated = db.updateVaultItem(studentId, id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Memory Vault item not found or not owned by you.' });
  }

  return res.json({ item: updated, message: 'Memory updated successfully.' });
}

export function deleteVaultItem(req: Request, res: Response) {
  const studentId = res.locals.studentId as string;
  const { id } = req.params;

  const deleted = db.deleteVaultItem(studentId, id);
  if (!deleted) {
    return res.status(404).json({ error: 'Memory Vault item not found or not owned by you.' });
  }

  return res.json({ message: 'Memory item removed from your Vault.' });
}
