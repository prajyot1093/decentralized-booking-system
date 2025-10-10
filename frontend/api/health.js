// Vercel API Route - Health Check
export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(Date.now() / 1000),
      mode: 'demo',
      platform: 'vercel',
      message: 'Decentralized Booking System - Vercel Deployment'
    });
  } else {
    res.status(405).json({ 
      error: 'Method not allowed',
      allowed: ['GET'] 
    });
  }
}