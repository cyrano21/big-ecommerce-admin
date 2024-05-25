import Cors from 'cors';
import { NextApiRequest, NextApiResponse } from 'next';

// Initialiser le middleware CORS
const cors = Cors({
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'PATCH'],
  origin: 'http://localhost:3001',
  credentials: true,
});

// Helper pour exécuter le middleware
function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: any) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

const corsMiddleware = async (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
  await runMiddleware(req, res, cors);
  next();
};

export default corsMiddleware;
