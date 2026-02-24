import { NextRequest, NextResponse } from "next/server";
import dbConnection from "@/lib/database";
import Associate from "@/database/models/associates";

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

    // Buscar en la base de datos
    const asociado = await Associate.findOne({ cedula: cedula.trim() });

    type EstadoAsociado = "HABIL" | "NO_REGISTRADO" | "INHABIL";
    type Motivo = string | undefined;

    let status: EstadoAsociado = "NO_REGISTRADO";
    let motivo: Motivo = undefined;

    if (asociado) {
      // Existe en la BD
      status = asociado.isActive ? "HABIL" : "INHABIL";
      if (!asociado.isActive) {
        motivo = "Usuario inactivo en el sistema";
      }
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
