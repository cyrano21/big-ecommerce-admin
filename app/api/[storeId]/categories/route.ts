// pages/api/categories/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import prismadb from '@/lib/prismadb';
import { auth } from '@clerk/nextjs';
import corsMiddleware from '@/lib/cors';


export async function POST(req: NextApiRequest, res: NextApiResponse) {
  await corsMiddleware(req, res, async () => {
    try {
      const { userId } = auth();
      const body = await req.body;
      const { name, billboardId } = body;

      if (!userId) {
        return res.status(401).json('Non autorisé');
      }

      if (!name) {
        return res.status(400).json('Le nom est obligatoire');
      }

      if (!billboardId) {
        return res.status(400).json("L'ID de la catégorie est réquis");
      }

      const storeByUserId = await prismadb.store.findFirst({
        where: { id: req.query.storeId as string, userId },
      });

      if (!storeByUserId) {
        return res.status(403).json('Non autorisé');
      }

      const category = await prismadb.category.create({
        data: {
          name,
          billboardId,
          storeId: req.query.storeId as string,
        },
      });

      return res.status(200).json(category);
    } catch (error) {
      console.log('[CATEGORIES_POST]', error);
      return res.status(500).json('Erreur interne du serveur');
    }
  });
}

export async function GET(req: NextApiRequest, res: NextApiResponse) {
  await corsMiddleware(req, res, async () => {
    try {
      if (!req.query.storeId) {
        return res.status(400).json("L'identifiant de la boutique est réquis");
      }

      const categories = await prismadb.category.findMany({
        where: { storeId: req.query.storeId as string },
      });

      return res.status(200).json(categories);
    } catch (error) {
      console.log('[CATEGORIES_GET]', error);
      return res.status(500).json('Erreur interne du serveur');
    }
  });
}
