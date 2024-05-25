import { NextApiRequest, NextApiResponse } from 'next';

function corsMiddleware(req: NextApiRequest, res: NextApiResponse, next: () => void) {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Autorise toutes les origines
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,POST,PUT,DELETE,PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  next();
}

export default corsMiddleware;
