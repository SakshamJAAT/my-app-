import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

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

function todayIST() {
  return new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
}

const ALLOWED_ORIGINS = [
  'https://nexoraa.store',
  'https://www.nexoraa.store',
  'https://nexoraa-shop.vercel.app',
];

export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: 'Email aur OTP dono chahiye.' });
  }

  const otpRef = db.collection('otp_store').doc(email);
  const dailyRef = db.collection('daily_reset').doc(email);

  // Daily limit check
  const dailyDoc = await dailyRef.get();
  if (dailyDoc.exists && dailyDoc.data().date === todayIST()) {
    return res.status(429).json({ error: 'Aaj ka password reset ho chuka hai. Kal dobara try karo.' });
  }

  const otpDoc = await otpRef.get();

  if (!otpDoc.exists) {
    return res.status(400).json({ error: 'OTP expire ho gaya. Dobara bhejo.' });
  }

  const { otp: storedOtp, expiry } = otpDoc.data();

  if (Date.now() > expiry) {
    await otpRef.delete();
    return res.status(400).json({ error: 'OTP expire ho gaya (5 min). Dobara bhejo.' });
  }

  if (otp !== storedOtp) {
    return res.status(400).json({ error: 'Galat OTP hai. Dobara check karo.' });
  }

  // OTP sahi — cleanup
  await otpRef.delete();
  await dailyRef.set({ date: todayIST() });

  return res.status(200).json({ success: true, message: 'OTP v
erified!' });
}
