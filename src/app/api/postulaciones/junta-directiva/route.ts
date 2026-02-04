import { NextRequest, NextResponse } from "next/server";
import dbConnection from "@/lib/database";
import { PostulacionJunta } from "@/database/models/postulacionJunta";
import { postulacionJuntaSchema } from "@/lib/validators/postulacionesSchemas";

export async function POST(request: NextRequest) {
  try {
    await dbConnection();

    const body = await request.json();

    // Validar con Zod
    const datosValidados = postulacionJuntaSchema.parse({
      ...body,
      estado: "DRAFT",
    });

    const nuevaPostulacion = await PostulacionJunta.create(datosValidados);

    return NextResponse.json(nuevaPostulacion, { status: 201 });
  } catch (error: any) {
    console.error("Error creando postulación Junta:", error);

    // Manejo de errores de validación Zod
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validación fallida", details: error.errors },
        { status: 400 }
      );
    }

    // Errores de Mongoose
    if (error.name === "ValidationError") {
      return NextResponse.json(
        { error: "Error de validación", details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Error creando postulación" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnection();

    const id = request.nextUrl.searchParams.get("id");

    if (id) {
      const postulacion = await PostulacionJunta.findById(id);
      if (!postulacion) {
        return NextResponse.json(
          { error: "Postulación no encontrada" },
          { status: 404 }
        );
      }
      return NextResponse.json(postulacion);
    }

    const postulaciones = await PostulacionJunta.find();
    return NextResponse.json(postulaciones);
  } catch (error) {
    console.error("Error obteniendo postulaciones Junta:", error);
    return NextResponse.json(
      { error: "Error obteniendo postulaciones" },
      { status: 500 }
    );
  }
}
