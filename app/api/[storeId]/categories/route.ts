import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import prismadb from '@/lib/prismadb'

// CORS headers configuration
const corsHeaders = {
  'Access-Control-Allow-Origin': 'http://localhost:3000',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Allow-Credentials': 'true',
}

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = auth()
    const body = await req.json()
    const { name, billboardId } = body

    if (!userId) {
      return new NextResponse('Non autorisé', { 
        status: 401,
        headers: corsHeaders,
      })
    }

    if (!name) {
      return new NextResponse('Le nom est obligatoire', {
        status: 400,
        headers: corsHeaders,
      })
    }

    if (!billboardId) {
      return new NextResponse("L'ID de la catégorie est réquis", {
        status: 400,
        headers: corsHeaders,
      })
    }

    if (!params.storeId) {
      return new NextResponse("L'identifiant de la boutique est réquis", {
        status: 400,
        headers: corsHeaders,
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
        headers: corsHeaders,
      })
    }

    const category = await prismadb.category.create({
      data: {
        name,
        billboardId,
        storeId: params.storeId,
      },
    })

    return NextResponse.json(category, { 
      headers: corsHeaders 
    })
  } catch (error) {
    console.log('[CATEGORIES_POST]', error)
    return new NextResponse('Erreur interne du serveur', { 
      status: 500,
      headers: corsHeaders 
    })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: corsHeaders,
  })
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    console.log('Environment Store URL:', process.env.NEXT_PUBLIC_API_URL)
    console.log('Requested Store ID:', params.storeId)

    if (!params.storeId) {
      return new NextResponse("L'identifiant de la boutique est réquis", {
        status: 400,
        headers: corsHeaders,
      })
    }

    const categories = await prismadb.category.findMany({
      where: {
        storeId: params.storeId,
      },
    })

    return NextResponse.json(categories, { 
      headers: corsHeaders 
    })
  } catch (error) {
    console.log('[CATEGORIES_GET]', error)
    return new NextResponse('Erreur interne du serveur', { 
      status: 500,
      headers: corsHeaders 
    })
  }
}
