import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request, context: any) {
  try {
    const params = await context.params;
    const { id } = params;
    const { status } = await request.json();

    const order = await prisma.order.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("PUT /api/orders/[id] error:", error);
    return NextResponse.json(
      { error: "Error al actualizar el estado del pedido" },
      { status: 500 }
    );
  }
}
