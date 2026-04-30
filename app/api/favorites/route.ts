import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET /api/favorites — devuelve los productIds favoritos del usuario
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ favorites: [] });
    }

    if (!prisma.wishlist) {
      console.error("Prisma model 'wishlist' is undefined. Try restarting the dev server.");
      return NextResponse.json({ error: "Error de configuración de base de datos" }, { status: 500 });
    }

    const items = await prisma.wishlist.findMany({
      where: { userId: session.user.id },
      select: { variantId: true },
    });

    return NextResponse.json({ favorites: items.map((i) => i.variantId) });
  } catch (error) {
    console.error("Error in GET /api/favorites:", error);
    return NextResponse.json({ error: "Error al obtener favoritos" }, { status: 500 });
  }
}

// POST /api/favorites — toggle: agrega si no existe, elimina si ya está
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    if (!prisma.wishlist) {
      console.error("Prisma model 'wishlist' is undefined. Try restarting the dev server.");
      return NextResponse.json({ error: "Error de configuración de base de datos" }, { status: 500 });
    }

    const { variantId } = await request.json();
    if (!variantId) {
      return NextResponse.json({ error: "variantId requerido" }, { status: 400 });
    }

    const existing = await prisma.wishlist.findUnique({
      where: { userId_variantId: { userId: session.user.id, variantId } },
    });

    if (existing) {
      await prisma.wishlist.delete({
        where: { userId_variantId: { userId: session.user.id, variantId } },
      });
      return NextResponse.json({ action: "removed" });
    } else {
      await prisma.wishlist.create({
        data: { userId: session.user.id, variantId },
      });
      return NextResponse.json({ action: "added" });
    }
  } catch (error) {
    console.error("Error in POST /api/favorites:", error);
    return NextResponse.json({ error: "Error al actualizar favoritos" }, { status: 500 });
  }
}
