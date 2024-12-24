import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import prismadb from '@/lib/prismadb'

// CORS headers
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return NextResponse.json({}, { 
    headers: CORS_HEADERS 
  })
}

export async function GET(
  _req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    if (!params.storeId) {
      return new NextResponse("L'identifiant de la taille est réquis", {
        status: 400,
        headers: CORS_HEADERS 
      })
    }

    const sizes = await prismadb.size.findMany({
      where: {
        storeId: params.storeId
      }
    })

    return NextResponse.json(sizes, { 
      headers: CORS_HEADERS 
    })
  } catch (error) {
    console.error('[SIZES_GET]', error)
    return new NextResponse('Erreur interne', { 
      status: 500,
      headers: CORS_HEADERS 
    })
  }
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

    const size = await prismadb.size.create({
      data: {
        name,
        value,
        storeId: params.storeId
      }
    })

    return NextResponse.json(size, { 
      headers: CORS_HEADERS 
    })
  } catch (error) {
    console.error('[SIZES_POST]', error)
    return new NextResponse('Erreur interne', { 
      status: 500,
      headers: CORS_HEADERS 
    })
  }
}
