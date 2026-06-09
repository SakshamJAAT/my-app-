import { Resend } from 'resend';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Firebase Admin init — sirf ek baar
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();
const resend = new Resend(process.env.RESEND_API_KEY);

function generateOTP() {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return String(100000 + (arr[0] % 900000));
}

const ALLOWED_ORIGINS = [
  'https://nexoraa.store',
  'https://www.nexoraa.store',
  'https://nexoraa-shop.vercel.app',
];

export default async function handler(req, res) {
  // CORS
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email } = req.body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Sahi email daalo.' });
  }

  // Rate limit — Firestore se check karo (last 5 min mein 3 se zyada nahi)
  const otpRef = db.collection('otp_store').doc(email);
  const otpDoc = await otpRef.get();
  const now = Date.now();

  if (otpDoc.exists) {
    const data = otpDoc.data();
    const attempts = (data.attempts || []).filter(t => now - t < 5 * 60 * 1000);
    if (attempts.length >= 3) {
      return res.status(429).json({ error: 'Bahut zyada OTP requests. 5 min baad try karo.' });
    }
  }

  const otp = generateOTP();
  const expiry = now + 5 * 60 * 1000; // 5 min

  // Firestore mein save karo
  await otpRef.set({
    otp,
    expiry,
    attempts: [...((otpDoc.exists ? otpDoc.data().attempts : []) || []).filter(t => now - t < 5 * 60 * 1000), now],
    createdAt: now,
  });

  try {
    await resend.emails.send({
      from: 'NEXORAA <noreply@nexoraa.store>',
      to: email,
      subject: `${otp} — NEXORAA Password Reset OTP`,
      html: `
<div style="background:#080808;padding:48px 16px;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:460px;margin:0 auto;">
    <div style="background:linear-gradient(135deg,#f5a623 0%,#ff6b35 50%,#f5a623 100%);border-radius:20px 20px 0 0;padding:32px 28px;text-align:center;">
      <div style="font-size:11px;font-weight:700;color:rgba(0,0,0,0.5);letter-spacing:4px;text-transform:uppercase;margin-bottom:8px;">OFFICIAL STORE</div>
      <div style="font-size:34px;font-weight:900;color:#000;letter-spacing:3px;">NEXORAA</div>
      <div style="width:40px;height:2px;background:rgba(0,0,0,0.2);margin:10px auto;border-radius:2px;"></div>
      <div style="font-size:12px;color:rgba(0,0,0,0.6);letter-spacing:1px;">Premium Tech Store</div>
    </div>
    <div style="background:#111;padding:36px 28px;border-left:1px solid #1e1e1e;border-right:1px solid #1e1e1e;">
      <div style="text-align:center;margin-bottom:24px;">
        <div style="display:inline-block;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:20px;padding:14px;">
          <img src="https://i.ibb.co/8g3JWCmt/Screenshot-2026-06-05-21-21-49-45-99c04817c0de5652397fc8b56c3b3817-1.jpg" width="72" height="72" style="display:block;border-radius:12px;" alt="NEXORAA Logo"/>
        </div>
      </div>
      <div style="text-align:center;margin-bottom:28px;">
        <div style="font-size:22px;font-weight:800;color:#ffffff;margin-bottom:8px;">Password Reset Request</div>
        <div style="font-size:13px;color:#555;line-height:1.7;">We received a request to reset your NEXORAA account password.<br>Use the OTP below to proceed.</div>
      </div>
      <div style="background:#0d0d0d;border-radius:16px;padding:28px 20px;text-align:center;margin-bottom:28px;border-top:3px solid #f5a623;">
        <div style="font-size:10px;font-weight:700;color:#444;letter-spacing:4px;text-transform:uppercase;margin-bottom:16px;">YOUR ONE-TIME PASSWORD</div>
        <div style="font-size:32px;font-weight:900;color:#f5a623;letter-spacing:8px;font-family:'Courier New',monospace;">${otp}</div>
        <div style="margin-top:16px;font-size:12px;color:#333;">This OTP expires in <span style="color:#f5a623;font-weight:700;">5 minutes</span></div>
      </div>
      <div style="background:#0d0d0d;border-left:3px solid #f5a623;border-radius:0 10px 10px 0;padding:16px 18px;margin-bottom:28px;">
        <div style="font-size:11px;font-weight:700;color:#f5a623;letter-spacing:1px;margin-bottom:10px;">⚠ SECURITY NOTICE</div>
        <div style="font-size:12px;color:#444;line-height:2;">
          • This OTP is valid for <strong style="color:#888;">5 minutes</strong> only<br>
          • Never share this code with <strong style="color:#888;">anyone</strong><br>
          • NEXORAA will never ask for your OTP<br>
          • Did not request this? <strong style="color:#888;">Ignore this email</strong>
        </div>
      </div>
      <div style="text-align:center;font-size:12px;color:#333;">
        Best regards,<br>
        <span style="color:#f5a623;font-weight:700;">NEXORAA Security Team</span>
      </div>
    </div>
    <div style="background:#0a0a0a;border:1px solid #1a1a1a;border-top:none;border-radius:0 0 20px 20px;padding:20px 28px;text-align:center;">
      <div style="font-size:10px;color:#2a2a2a;letter-spacing:1px;">© ${new Date().getFullYear()} NEXORAA. All rights reserved.</div>
      <div style="font-size:10px;color:#222;margin-top:4px;">nexoraa.store</div>
    </div>
  </div>
</div>`,
    });

    return res.status(200).json({ success: true, message: 'OTP bhej diya!' });

  } catch (err) {
    console.error('Resend error:', err);
    // OTP email fail — Firestore se delete karo
    await otpRef.delete().catch(() => {});
    return res.status(500).json({ error: 'Email nahi bhej saka. Dobara try karo.' });
  }
}
