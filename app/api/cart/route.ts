import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET /api/cart — Obtiene el carrito del usuario logueado
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    if (!prisma.cart) {
      return NextResponse.json({ error: "DB Error" }, { status: 500 });
    }

    let cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    images: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!cart) {
      // Si no tiene carrito, se lo creamos vacío
      cart = await prisma.cart.create({
        data: { userId: session.user.id },
        include: { items: { include: { variant: { include: { product: { include: { images: true } } } } } } },
      });
    }

    return NextResponse.json(cart);
  } catch (error) {
    console.error("Error GET /api/cart:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// POST /api/cart — Agrega una variante al carrito
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { variantId, quantity = 1 } = await request.json();
    if (!variantId) {
      return NextResponse.json({ error: "variantId requerido" }, { status: 400 });
    }

    // Buscamos o creamos el carrito
    let cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: session.user.id },
      });
    }

    // Buscamos si ya existe el ítem
    const existingItem = await prisma.cartItem.findUnique({
      where: { cartId_variantId: { cartId: cart.id, variantId } },
    });

    if (existingItem) {
      // Sumamos cantidad
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      // Creamos nuevo ítem
      await prisma.cartItem.create({
        data: { cartId: cart.id, variantId, quantity },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error POST /api/cart:", error);
    return NextResponse.json({ error: "Error al agregar al carrito" }, { status: 500 });
  }
}
