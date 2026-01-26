import { NextRequest, NextResponse } from "next/server";
import Associate from "@/database/models/associates";
import  dbConnection  from "@/lib/database";

export async function POST(request: NextRequest) {
  try {
    const { cedula, code } = await request.json();

    if (!cedula || !code) {
      return NextResponse.json(
        { error: "Cédula y código son requeridos" },
        { status: 400 }
      );
    }

    // Conectar a la BD
    await dbConnection();

    // Buscar al asociado por cédula
    const associate = await Associate.findOne({ cedula });

    console.log(`[verifyCode] Buscando asociado con cédula: ${cedula}`);
    console.log(`[verifyCode] Asociado encontrado:`, associate ? `Sí (${associate.fullName})` : "No");

    if (!associate) {
      return NextResponse.json(
        { error: "Asociado no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que el código existe y no ha expirado
    console.log(`[verifyCode] Código en BD: ${associate.verificationCode}, Código ingresado: ${code}`);
    console.log(`[verifyCode] Expiración: ${associate.verificationCodeExpiry}`);

    if (!associate.verificationCode) {
      return NextResponse.json(
        { error: "No hay código de verificación generado. Solicita uno nuevo." },
        { status: 400 }
      );
    }

    if (associate.verificationCodeExpiry && new Date() > associate.verificationCodeExpiry) {
      return NextResponse.json(
        { error: "El código ha expirado. Solicita uno nuevo." },
        { status: 400 }
      );
    }

    // Verificar que el código coincide
    if (associate.verificationCode !== code) {
      return NextResponse.json(
        { error: "Código incorrecto. Verifica el código enviado a tu email" },
        { status: 400 }
      );
    }

    // Limpiar el código de verificación después de validarlo usando findByIdAndUpdate
    await Associate.findByIdAndUpdate(
      associate._id,
      {
        $unset: {
          verificationCode: 1,
          verificationCodeExpiry: 1
        }
      },
      { new: true }
    );

    console.log(`[verifyCode] Código verificado y limpiado correctamente para cédula: ${cedula}`);

    return NextResponse.json(
      {
        success: true,
        message: "Código verificado correctamente",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error verificando código:", error);
    return NextResponse.json(
      { error: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}` },
      { status: 500 }
    );
  }
}
