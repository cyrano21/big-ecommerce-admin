import Stripe from 'stripe'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

import { stripe } from '@/lib/stripe'
import prismadb from '../../../lib/prismadb'

export const POST = async (req: Request) => {
  const body = await req.text()
  const signature = headers().get('Stripe-Signature') as string
  console.log('Receiving webhook with signature:', signature)

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error: any) {
    return new NextResponse(`Webhook Error : ${error.message}`)
  }

  const session = event.data.object as Stripe.Checkout.Session

  console.log('Session object:', session)

  const address = session?.customer_details?.address

  const addressComponents = [
    address?.line1,
    address?.line2,
    address?.city,
    address?.state,
    address?.postal_code,
    address?.country,
  ]

  const addressString = addressComponents.filter((a) => a !== null).join(', ')
  console.log('Adresse:', addressString)
  console.log('Téléphone:', session?.customer_details?.phone)

  if (event.type === 'checkout.session.completed') {
    const order = await prismadb.order.update({
      where: { id: session?.metadata?.orderId },
      data: {
        isPaid: true,
        address: addressString,
        phone: session?.customer_details?.phone || '',
      },
      include: { orderItems: true },
    })

    const productIds = order.orderItems.map((orderItem) => orderItem.productId)

    await prismadb.product.updateMany({
      where: {
        id: {
          in: [...productIds],
        },
      },
      data: {
        isArchived: true,
      },
    })
  }

  return new NextResponse(null, {
    status: 200,
  })
}
