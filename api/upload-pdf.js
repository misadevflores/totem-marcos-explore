import { put } from '@vercel/blob';
import { cors } from './_shared.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { filename, base64Data } = req.body ?? {};
    if (!filename || !base64Data) {
      return res.status(400).json({ error: 'filename y base64Data requeridos' });
    }

    const base64Clean = base64Data.replace(/^data:application\/pdf;base64,/, '');
    const buffer   = Buffer.from(base64Clean, 'base64');
    const safeName = `${Date.now()}_${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    const blob = await put(`pdfs/${safeName}`, buffer, {
      access: 'public',
      contentType: 'application/pdf',
    });

    res.json({
      success: true,
      url: blob.url,
      filename: safeName,
      size: buffer.length,
    });
  } catch (err) {
    console.error('[UPLOAD-PDF]', err.message);
    res.status(500).json({ error: err.message });
  }
}
