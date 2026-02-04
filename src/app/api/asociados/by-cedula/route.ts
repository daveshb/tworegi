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

    // Mock data - replace with real database query
    const mockAsociados: Record<string, any> = {
      "1234567890": {
        cedula: "1234567890",
        nombreCompleto: "Juan Carlos Pérez García",
        cargoEmpresa: "Gerente General",
        sedeTrabajo: "Bogotá",
        celular: "3001234567",
        correo: "juan.perez@empresa.com",
        asociadoStatus: "HABIL",
        motivoInhabilidad: null,
      },
      "9876543210": {
        cedula: "9876543210",
        nombreCompleto: "María Alexandra López Martínez",
        cargoEmpresa: "Directora Financiera",
        sedeTrabajo: "Medellín",
        celular: "3109876543",
        correo: "maria.lopez@empresa.com",
        asociadoStatus: "HABIL",
        motivoInhabilidad: null,
      },
      "5555555555": {
        cedula: "5555555555",
        nombreCompleto: "No Registrado",
        cargoEmpresa: "",
        sedeTrabajo: "",
        celular: "",
        correo: "",
        asociadoStatus: "NO_REGISTRADO",
        motivoInhabilidad: null,
      },
      "1111111110": {
        cedula: "1111111110",
        nombreCompleto: "Inhábil Usuario",
        cargoEmpresa: "",
        sedeTrabajo: "",
        celular: "",
        correo: "",
        asociadoStatus: "INHABIL",
        motivoInhabilidad: "Tiene antecedentes disciplinarios",
      },
    };

    const asociado = mockAsociados[cedula];

    if (!asociado) {
      // Default to HABIL for other cedulas in demo mode
      return NextResponse.json({
        cedula,
        nombreCompleto: `Asociado ${cedula}`,
        cargoEmpresa: "Empleado",
        sedeTrabajo: "Bogotá",
        celular: "3001234567",
        correo: `asociado${cedula.slice(-4)}@empresa.com`,
        asociadoStatus: "HABIL",
        motivoInhabilidad: null,
      });
    }

    return NextResponse.json(asociado);
  } catch (error) {
    console.error("Error obteniendo datos de asociado:", error);
    return NextResponse.json(
      { error: "Error obteniendo datos del asociado" },
      { status: 500 }
    );
  }
}
