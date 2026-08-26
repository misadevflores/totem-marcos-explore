import { cors } from './_shared.js';

export default function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  res.json({ status: 'ok', message: 'Vercel backend conectado', env: 'vercel' });
}
