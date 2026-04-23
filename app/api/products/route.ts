import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Listar todos los productos con sus relaciones
export async function GET(request: Request) {
  try {
    const products = await prisma.product.findMany({
      include: {
        images: true,
        variants: true,
        brand: true,
        category: true,
      },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json(
      { error: "Error al obtener los productos" },
      { status: 500 }
    );
  }
}

// POST: Crear un nuevo producto con variantes e imágenes
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, brandId, categoryId, images, variants } = body;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        brandId,
        categoryId,
        images: {
          create: images, // Ej: [{ url, publicId, altText, isMain: true }]
        },
        variants: {
          create: variants, // Ej: [{ name, price, stock, sku }]
        },
      },
      include: {
        images: true,
        variants: true,
        brand: true,
        category: true,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("POST /api/products error:", error);
    return NextResponse.json(
      { error: "Error al crear el producto" },
      { status: 500 }
    );
  }
}
