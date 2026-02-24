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

    if (!asociado) {
      // No existe en la BD
      return NextResponse.json({
        cedula,
        nombreCompleto: "",
        cargoEmpresa: "",
        sedeTrabajo: "",
        celular: "",
        correo: "",
        asociadoStatus: "NO_REGISTRADO",
        motivoInhabilidad: null,
      });
    }

    // Existe en la BD
    const status = asociado.isActive ? "HABIL" : "INHABIL";

    return NextResponse.json({
      cedula: asociado.cedula,
      nombreCompleto: asociado.fullName || "",
      cargoEmpresa: asociado.cargoEmpresa || "",
      sedeTrabajo: asociado.sedeTrabajo || "",
      celular: asociado.cellPhone || asociado.celular || "",
      correo: asociado.email || asociado.correo || "",
      asociadoStatus: status,
      motivoInhabilidad: status === "INHABIL" ? "Usuario inactivo en el sistema" : null,
    });
  } catch (error) {
    console.error("Error obteniendo datos de asociado:", error);
    return NextResponse.json(
      { error: "Error obteniendo datos del asociado" },
      { status: 500 }
    );
  }
}
