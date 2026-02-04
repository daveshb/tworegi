import { NextRequest, NextResponse } from "next/server";
import dbConnection from "@/lib/database";
import { PostulacionApelaciones } from "@/database/models/postulacionApelaciones";
import { postulacionApelacionesSchema } from "@/lib/validators/postulacionesSchemas";

async function handleRequest(
  method: string,
  id: string,
  request?: NextRequest
) {
  try {
    await dbConnection();

    if (method === "PUT") {
      const body = await request!.json();

      const datosValidados = postulacionApelacionesSchema.parse({
        ...body,
        estado: body.estado || "DRAFT",
      });

      const postulacion = await PostulacionApelaciones.findByIdAndUpdate(
        id,
        datosValidados,
        { new: true, runValidators: true }
      );

      if (!postulacion) {
        return NextResponse.json(
          { error: "Postulación no encontrada" },
          { status: 404 }
        );
      }

      return NextResponse.json(postulacion);
    }

    if (method === "POST") {
      const postulacion = await PostulacionApelaciones.findById(id);

      if (!postulacion) {
        return NextResponse.json(
          { error: "Postulación no encontrada" },
          { status: 404 }
        );
      }

      if (postulacion.integrantes.length !== 2) {
        return NextResponse.json(
          { error: "La postulación debe tener exactamente 3 integrantes" },
          { status: 400 }
        );
      }

      if (
        !postulacion.compromisosInstitucionales ||
        !postulacion.autorizacionAntecedentes ||
        !postulacion.responsabilidadLider
      ) {
        return NextResponse.json(
          { error: "Todas las declaraciones deben ser aceptadas" },
          { status: 400 }
        );
      }

      postulacion.estado = "ENVIADA";
      await postulacion.save();

      return NextResponse.json({
        message: "Postulación enviada exitosamente",
        postulacion,
      });
    }

    return NextResponse.json(
      { error: "Método no permitido" },
      { status: 405 }
    );
  } catch (error: any) {
    console.error("Error procesando postulación Apelaciones:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validación fallida", details: error.errors },
        { status: 400 }
      );
    }

    if (error.name === "ValidationError") {
      return NextResponse.json(
        { error: "Error de validación", details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Error procesando postulación" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id?: string }> }
) {
  const { id } = await params;
  return handleRequest("PUT", id || "", request);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id?: string }> }
) {
  const { id } = await params;
  return handleRequest("POST", id || "", request);
}
