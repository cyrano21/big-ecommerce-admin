import { NextApiRequest, NextApiResponse } from 'next';

const allowedOrigins = [
  'http://localhost:3000', 
  'http://localhost:3001', 
  'https://your-production-domain.com'
];

export function cors(req: NextApiRequest, res: NextApiResponse, next: () => void) {
  const origin = req.headers.origin || '';
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  // Other CORS headers
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
}
