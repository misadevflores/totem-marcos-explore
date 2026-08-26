import { openDb, execQuery, cors } from './_shared.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { sql } = req.body ?? {};
    if (!sql) return res.status(400).json({ error: 'SQL requerido' });

    const db  = await openDb();
    const data = execQuery(db, sql);
    res.json({ success: true, data });
  } catch (err) {
    console.error('[QUERY]', err.message);
    res.status(400).json({ error: err.message });
  }
}
