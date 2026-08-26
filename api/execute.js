import { openDb, persistAfterMutation, cors } from './_shared.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { sql } = req.body ?? {};
    if (!sql) return res.status(400).json({ error: 'SQL requerido' });

    const db = await openDb();
    db.run(sql);
    await persistAfterMutation(db, sql);

    res.json({ success: true, changes: 1, lastId: 0 });
  } catch (err) {
    console.error('[EXECUTE]', err.message);
    res.status(400).json({ error: err.message });
  }
}
