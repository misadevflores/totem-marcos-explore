import { openDb, cors } from './_shared.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const db   = await openDb();
    const data = db.export();          // Uint8Array con el SQLite completo
    const buf  = Buffer.from(data);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', 'attachment; filename="totem-marco.sqlite"');
    res.send(buf);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
