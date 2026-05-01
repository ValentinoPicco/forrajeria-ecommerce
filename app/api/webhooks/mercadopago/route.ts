import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('data.id') || url.searchParams.get('id');
    const topic = url.searchParams.get('type') || url.searchParams.get('topic');

    if (topic !== 'payment' || !id) {
      return NextResponse.json({ success: true });
    }

    const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!token) {
      return NextResponse.json({ error: 'Falta configurar el access token' }, { status: 500 });
    }

    const client = new MercadoPagoConfig({ accessToken: token });
    const payment = new Payment(client);

    const paymentInfo = await payment.get({ id });

    // Si el pago está aprobado y tiene una referencia a nuestra base de datos (order.id)
    if (paymentInfo.status === 'approved' && paymentInfo.external_reference) {
      const orderId = paymentInfo.external_reference;

      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true }
      });

      if (order && order.status !== 'PAID') {
        // 1. Marcar como pagado
        await prisma.order.update({
          where: { id: orderId },
          data: { status: 'PAID' }
        });

        // 2. Descontar stock de cada variante
        for (const item of order.items) {
          await prisma.productVariant.update({
            where: { id: item.variantId },
            data: {
              stock: {
                decrement: item.quantity
              }
            }
          });
        }

        // 3. Vaciar el carrito del usuario
        await prisma.cartItem.deleteMany({
          where: {
            cart: {
              userId: order.userId
            }
          }
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('MercadoPago Webhook Error:', error);
    // Debemos responder siempre 200 a MercadoPago o reintentará
    return NextResponse.json({ success: false }); 
  }
}
