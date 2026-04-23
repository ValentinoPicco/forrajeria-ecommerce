import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request, context: any) {
  try {
    const { id } = context.params;
    const body = await request.json();
    const { name } = body;

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "El nombre de la categoría es requerido." },
        { status: 400 }
      );
    }

    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: name.trim(),
        slug,
      },
    });

    return NextResponse.json(category);
  } catch (error: any) {
    console.error("PUT /api/categories/[id] error:", error);
    
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Ya existe otra categoría con este nombre." },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Error al actualizar la categoría" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, context: any) {
  try {
    const { id } = context.params;

    // Verificar primero si hay productos usando esta categoría.
    // Esto corresponde a la "Opción A" del Plan de Implementación.
    const productsCount = await prisma.product.count({
      where: { categoryId: id },
    });

    if (productsCount > 0) {
      return NextResponse.json(
        { error: `No se puede eliminar. Hay ${productsCount} producto(s) en tu inventario que pertenecen a esta categoría.` },
        { status: 400 }
      );
    }

    // Si está libre, la eliminamos
    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Categoría eliminada con éxito." });
  } catch (error) {
    console.error("DELETE /api/categories/[id] error:", error);
    return NextResponse.json(
      { error: "Error al eliminar la categoría" },
      { status: 500 }
    );
  }
}
