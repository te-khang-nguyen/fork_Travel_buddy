import { v4 as uuidv4 } from 'uuid';
import { join } from 'path';
import { mkdirSync, writeFileSync } from 'fs';
import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { fileName, totalParts } = req.body;

  if (!fileName || !totalParts) {
    return res.status(400).json({ error: 'Missing fileName or totalParts' });
  }

  const uploadId = uuidv4();
  const uploadDir = join(process.cwd(), 'uploads', uploadId);
  const metaFile = join(uploadDir, 'metadata.json');

  try {
    mkdirSync(uploadDir, { recursive: true });
    writeFileSync(metaFile, JSON.stringify({
      fileName,
      totalParts: parseInt(totalParts),
      receivedParts: []
    }));

    res.status(200).json({ uploadId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}