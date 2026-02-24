import { NextRequest, NextResponse } from "next/server";
import dbConnection from "@/lib/database";
import { PostulacionControl } from "@/database/models/postulacionControl";
import { postulacionControlSchema } from "@/lib/validators/postulacionesSchemas";

async function handleRequest(
  method: string,
  id: string,
  request?: NextRequest
) {
  try {
    await dbConnection();

    if (method === "PUT") {
      const body = await request!.json();

      const datosValidados = postulacionControlSchema.parse({
        ...body,
        estado: body.estado || "DRAFT",
      });

      const postulacion = await PostulacionControl.findByIdAndUpdate(
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
      const postulacion = await PostulacionControl.findById(id);

      if (!postulacion) {
        return NextResponse.json(
          { error: "Postulación no encontrada" },
          { status: 404 }
        );
      }

      if (postulacion.integrantes.length !== 5) {
        return NextResponse.json(
          { error: "La postulación debe tener exactamente 6 integrantes" },
          { status: 400 }
        );
      }

      const principalesIntegrantes = postulacion.integrantes.filter(
        (i) => i.tipoIntegrante === "PRINCIPAL"
      );
      const suplentesIntegrantes = postulacion.integrantes.filter(
        (i) => i.tipoIntegrante === "SUPLENTE"
      );
      const principales =
        principalesIntegrantes.length +
        (postulacion.lider.tipoIntegrante === "PRINCIPAL" ? 1 : 0);
      const suplentes =
        suplentesIntegrantes.length +
        (postulacion.lider.tipoIntegrante === "SUPLENTE" ? 1 : 0);

      if (principales !== 3 || suplentes !== 3) {
        return NextResponse.json(
          { error: "Debe haber exactamente 3 principales y 3 suplentes" },
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
  } catch (error: unknown) {
    console.error("Error procesando postulación Control Social:", error);
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
