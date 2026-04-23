import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Obtener el detalle de un producto específico
export async function GET(
  request: Request,
  context: any
) {
  try {
    const { id } = context.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        variants: true,
        brand: true,
        category: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("GET /api/products/[id] error:", error);
    return NextResponse.json(
      { error: "Error al obtener el producto" },
      { status: 500 }
    );
  }
}

// PUT/PATCH: Actualizar un producto, sus variantes e imágenes
export async function PUT(
  request: Request,
  context: any
) {
  try {
    const { id } = context.params;
    const body = await request.json();
    const { name, description, brandId, categoryId, images, variants } = body;

    // Estrategia: Actualizar la entidad principal, borrar las colecciones
    // previas y crear las nuevas. Esto simplifica mucho el manejo del estado
    // al no tener que buscar y hacer "upserts". 

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        brandId,
        categoryId,
        // Limpiar todas las imágenes previas y re-crearlas con el nuevo estado
        images: {
          deleteMany: {},
          create: images,
        },
        // Limpiar todas las variantes previas y re-crearlas
        variants: {
          deleteMany: {},
          create: variants,
        },
      },
      include: {
        images: true,
        variants: true,
        brand: true,
        category: true,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("PUT /api/products/[id] error:", error);
    return NextResponse.json(
      { error: "Error al actualizar el producto" },
      { status: 500 }
    );
  }
}

// DELETE: Borrar un producto 
export async function DELETE(
  request: Request,
  context: any
) {
  try {
    const { id } = context.params;

    // Prisma se encarga de eliminar las Variantes e Imágenes gracias a al
    // onDelete: Cascade que configuramos en schema.prisma.
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Producto eliminado correctamente" });
  } catch (error) {
    console.error("DELETE /api/products/[id] error:", error);
    return NextResponse.json(
      { error: "Error al eliminar el producto" },
      { status: 500 }
    );
  }
}
