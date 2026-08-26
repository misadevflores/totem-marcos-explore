import { openDb, persistAfterMutation, cors } from './_shared.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { statements } = req.body ?? {};
    if (!Array.isArray(statements)) return res.status(400).json({ error: 'statements array requerido' });

    const db = await openDb();
    const results = [];

    for (const sql of statements) {
      db.run(sql);
      await persistAfterMutation(db, sql);
      results.push({ sql, changes: 1 });
    }

    res.json({ success: true, results });
  } catch (err) {
    console.error('[BATCH]', err.message);
    res.status(400).json({ error: err.message });
  }
}
