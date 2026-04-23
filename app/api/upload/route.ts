import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    
    if (!file) {
      return NextResponse.json({ error: "Error: No se encontró el archivo subido en el envío." }, { status: 400 });
    }

    // Convertir el archivo a formato Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Subir desde el buffer interno al bucket de Cloudinary
    // Se utiliza promesa para interactuar de forma asíncrona pero nativa con Streams 
    const result: any = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { 
          folder: "forrajeria_ecommerce", // Organizar la carpeta del proyecto en clouinary
          format: "webp", // Obligar explícitamente a conversión ultra-optimizada WEBP
          quality: "auto" // Compresión inteligente de Cloudinary
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    return NextResponse.json({ 
      url: result.secure_url, 
      publicId: result.public_id 
    });
  } catch (error) {
    console.error("Error catched on /api/upload:", error);
    return NextResponse.json({ error: "El servidor Node no pudo retransmitir la imagen a Cloudinary." }, { status: 500 });
  }
}
