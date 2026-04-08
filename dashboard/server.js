import express from 'express';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Try loading .env from project root (works whether started from dashboard/ or root)
const envResult = dotenv.config({ path: resolve(__dirname, '..', '.env') });
if (envResult.error) {
  dotenv.config({ path: resolve(process.cwd(), '.env') });
}

const app = express();
app.use(express.json());

// CORS for Vite dev server
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.post('/api/test-email', async (req, res) => {
  const { to } = req.body;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 465;
  const user = process.env.SMTP_USER;
  console.log(`[SMTP] host=${host} port=${port} user=${user}`);
  const pass = process.env.SMTP_PASSWORD;
  const from = process.env.SMTP_FROM || user;

  if (!host || !user || !pass) {
    return res.json({
      success: false,
      error: 'SMTP not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASSWORD in .env',
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    await transporter.sendMail({
      from,
      to: to || 'mah5472651@gmail.com',
      subject: 'Hello World - SMTP Test',
      text: 'Hello World! Your SMTP configuration is working correctly.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
          <h1 style="color: #6366f1; margin-bottom: 16px;">Hello World!</h1>
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Your SMTP configuration is working correctly.
          </p>
          <p style="color: #9ca3af; font-size: 13px; margin-top: 24px;">
            Sent from Aeitron Finance Dashboard
          </p>
        </div>
      `,
    });

    res.json({ success: true, message: `Test email sent to ${to || 'mah5472651@gmail.com'}` });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

const PORT = process.env.API_PORT || 3001;
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
