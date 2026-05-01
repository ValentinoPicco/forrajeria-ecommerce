import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(request: Request, context: any) {
  try {
    const params = await context.params;
    const { id } = params;

    // Verificar si existe la variante
    const variant = await prisma.productVariant.findUnique({
      where: { id },
      include: { product: { include: { variants: true } } }
    });

    if (!variant) {
      return NextResponse.json({ error: "Variante no encontrada" }, { status: 404 });
    }

    // Eliminar la variante
    await prisma.productVariant.delete({
      where: { id },
    });

    // Opcional: Si era la única variante, podríamos eliminar el producto también.
    // Pero por ahora solo eliminaremos la variante solicitada.

    return NextResponse.json({ message: "Variante eliminada correctamente" });
  } catch (error) {
    console.error("DELETE /api/variants/[id] error:", error);
    return NextResponse.json(
      { error: "Error al eliminar la variante" },
      { status: 500 }
    );
  }
}
