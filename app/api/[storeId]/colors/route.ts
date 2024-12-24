import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import prismadb from '@/lib/prismadb'

// CORS headers with specific origin
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'http://localhost:3000', // Explicitly set the frontend origin
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true'
}

// Handle OPTIONS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS
  })
}

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = auth()
    const body = await req.json()
    const { name, value } = body

    if (!userId) {
      return new NextResponse('Non autorisé', { 
        status: 401,
        headers: CORS_HEADERS 
      })
    }

    if (!name) {
      return new NextResponse('Le nom est réquis', {
        status: 400,
        headers: CORS_HEADERS
      })
    }

    if (!value) {
      return new NextResponse('La valeur est réquise', {
        status: 400,
        headers: CORS_HEADERS
      })
    }

    if (!params.storeId) {
      return new NextResponse("L'identifiant de la boutique est réquis", {
        status: 400,
        headers: CORS_HEADERS
      })
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    })

    if (!storeByUserId) {
      return new NextResponse('Non autorisé', {
        status: 403,
        headers: CORS_HEADERS
      })
    }

    const color = await prismadb.color.create({
      data: {
        name,
        value,
        storeId: params.storeId,
      },
    })

    return NextResponse.json(color, { 
      headers: CORS_HEADERS 
    })
  } catch (error) {
    console.log('[COLORS_POST]', error)
    return new NextResponse('Erreur interne du serveur', { 
      status: 500,
      headers: CORS_HEADERS 
    })
  }
}

export async function GET(
  _req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    if (!params.storeId) {
      return new NextResponse("L'identifiant de la couleur est réquis", {
        status: 400,
        headers: CORS_HEADERS
      })
    }

    const colors = await prismadb.color.findMany({
      where: {
        storeId: params.storeId,
      },
    })

    return NextResponse.json(colors, { 
      headers: CORS_HEADERS 
    })
  } catch (error) {
    console.log('[COLORS_GET]', error)
    return new NextResponse('Erreur interne du serveur', { 
      status: 500,
      headers: CORS_HEADERS 
    })
  }
}
