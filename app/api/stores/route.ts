import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import prismadb from '@/lib/prismadb'

export async function POST(req: Request) {
  try {
    const { userId } = auth()
    const body = await req.json()
    const { name, address } = body

    if (!userId) {
      console.log('Authorization Failed: No user ID provided')
      return new NextResponse('Non autorisé', { status: 401 })
    }

    if (!name || !address) {
      console.log('Validation Error: Missing fields', { name, address })
      return new NextResponse('Tous les champs sont obligatoires', {
        status: 400,
      })
    }

    const store = await prismadb.store.create({
      data: {
        name,
        address,
        userId,
      },
    })

    return NextResponse.json(store)
  } catch (error) {
    console.error('[STORES_POST] Error:', error)
    return new NextResponse('Erreur interne du serveur', { status: 500 })
  }
}
