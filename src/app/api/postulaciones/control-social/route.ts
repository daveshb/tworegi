import { NextRequest, NextResponse } from "next/server";
import dbConnection from "@/lib/database";
import { PostulacionControl } from "@/database/models/postulacionControl";
import { postulacionControlSchema } from "@/lib/validators/postulacionesSchemas";

export async function POST(request: NextRequest) {
  try {
    await dbConnection();

    const body = await request.json();

    const datosValidados = postulacionControlSchema.parse({
      ...body,
      estado: body.estado || "DRAFT",
    });

    const nuevaPostulacion = await PostulacionControl.create(datosValidados);

    return NextResponse.json(nuevaPostulacion, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creando postulación Control Social:", error);
    const parsedError = error as {
      name?: string;
      message?: string;
      errors?: unknown;
    };

    if (parsedError.name === "ZodError") {
      return NextResponse.json(
        { error: "Validación fallida", details: parsedError.errors },
        { status: 400 }
      );
    }

    if (parsedError.name === "ValidationError") {
      return NextResponse.json(
        { error: "Error de validación", details: parsedError.message },
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
      const postulacion = await PostulacionControl.findById(id);
      if (!postulacion) {
        return NextResponse.json(
          { error: "Postulación no encontrada" },
          { status: 404 }
        );
      }
      return NextResponse.json(postulacion);
    }

    const postulaciones = await PostulacionControl.find();
    return NextResponse.json(postulaciones);
  } catch (error) {
    console.error("Error obteniendo postulaciones Control Social:", error);
    return NextResponse.json(
      { error: "Error obteniendo postulaciones" },
      { status: 500 }
    );
  }
}
