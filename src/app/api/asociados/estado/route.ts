import { NextRequest, NextResponse } from "next/server";
import dbConnection from "@/lib/database";

export async function GET(request: NextRequest) {
  try {
    await dbConnection();

    const cedula = request.nextUrl.searchParams.get("cedula");

    if (!cedula) {
      return NextResponse.json(
        { error: "Cédula es requerida" },
        { status: 400 }
      );
    }

    // Validar que sea numérica
    if (!/^\d+$/.test(cedula)) {
      return NextResponse.json(
        { error: "Cédula debe contener solo números" },
        { status: 400 }
      );
    }

    // TODO: Implementar búsqueda en colección "asociados"
    // Por ahora, retorna mock para demostración
    // En producción, conectarse a la colección de asociados

    type EstadoAsociado = "HABIL" | "NO_REGISTRADO" | "INHABIL";
    type Motivo = string | undefined;

    let status: EstadoAsociado = "HABIL";
    let motivo: Motivo = undefined;

    // Simulación: si la cédula termina en 0, está INHABIL
    if (cedula.endsWith("0")) {
      status = "INHABIL";
      motivo = "Tiene antecedentes disciplinarios";
    }
    // Si termina en 5, NO_REGISTRADO
    else if (cedula.endsWith("5")) {
      status = "NO_REGISTRADO";
    }

    return NextResponse.json({
      status,
      motivo,
    });
  } catch (error) {
    console.error("Error obteniendo estado de asociado:", error);
    return NextResponse.json(
      { error: "Error obteniendo estado del asociado" },
      { status: 500 }
    );
  }
}
