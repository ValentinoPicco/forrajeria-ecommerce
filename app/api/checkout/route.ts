import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Debes iniciar sesión para comprar' }, { status: 401 });
    }

    const { items } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No hay items en el carrito' }, { status: 400 });
    }

    const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!token) {
      return NextResponse.json({ error: 'Falta configurar el access token de Mercado Pago' }, { status: 500 });
    }

    const client = new MercadoPagoConfig({ accessToken: token });
    const preference = new Preference(client);

    // Calcular el total de la orden
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let totalOrder = 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orderItemsData = items.map((item: any) => {
      const price = Number(item.variant.price);
      totalOrder += price * item.quantity;
      return {
        variantId: item.variant.id,
        quantity: item.quantity,
        price: price
      };
    });

    // Crear la orden en estado PENDING
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        total: totalOrder,
        status: "PENDING",
        items: {
          create: orderItemsData
        }
      }
    });

    // Mapear los items del carrito al formato de Mercado Pago
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const preferenceItems = items.map((item: any) => ({
      id: item.variant.id,
      title: `${item.variant.product.name} - ${item.variant.name}`,
      quantity: item.quantity,
      unit_price: Number(item.variant.price),
      currency_id: 'ARS',
    }));

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    const response = await preference.create({
      body: {
        items: preferenceItems,
        back_urls: {
          success: `${baseUrl}/carrito?status=success`,
          failure: `${baseUrl}/carrito?status=failure`,
          pending: `${baseUrl}/carrito?status=pending`,
        },
        auto_return: 'approved',
        external_reference: order.id,
        notification_url: `${baseUrl}/api/webhooks/mercadopago`,
      }
    });

    return NextResponse.json({ init_point: response.init_point });
  } catch (error) {
    console.error('Error al crear la preferencia de Mercado Pago:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
