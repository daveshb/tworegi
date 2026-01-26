import { NextRequest, NextResponse } from "next/server";
import Associate from "@/database/models/associates";
import  dbConnection  from "@/lib/database";

// Función para generar código de 4 dígitos aleatorio
function generateVerificationCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const { cedula, email } = await request.json();

    if (!cedula || !email) {
      return NextResponse.json(
        { error: "Cédula y email son requeridos" },
        { status: 400 }
      );
    }

    // Conectar a la BD
    await dbConnection();

    // Buscar al asociado por cédula
    const associate = await Associate.findOne({ cedula });

    if (!associate) {
      return NextResponse.json(
        { error: "Asociado no encontrado" },
        { status: 404 }
      );
    }

    // Generar código de verificación aleatorio
    const verificationCode = generateVerificationCode();
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + 10); // El código expira en 10 minutos

    // Determinar qué email se usará
    const emailToUse = email || associate.email;

    console.log(`[generateVerificationCode] Generando código para cédula: ${cedula}, email: ${emailToUse}, código: ${verificationCode}`);

    // Agregar el email al array de emailsUsedForCode si no está ya incluido
    // Usar $addToSet para agregar de forma atómica si no existe
    const updatedAssociate = await Associate.findByIdAndUpdate(
      associate._id,
      {
        verificationCode: verificationCode,
        verificationCodeExpiry: expiryTime,
        $addToSet: { emailsUsedForCode: emailToUse }
      },
      { new: true }
    );

    console.log(`[generateVerificationCode] Asociado actualizado:`, {
      cedula: updatedAssociate.cedula,
      verificationCode: updatedAssociate.verificationCode,
      verificationCodeExpiry: updatedAssociate.verificationCodeExpiry,
      emailsUsedForCode: updatedAssociate.emailsUsedForCode
    });

    // Si todo se guardó correctamente, enviar el email al email proporcionado (o al del asociado si no se proporciona)
    const emailToSend = emailToUse;
    const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/sendVotingPassword`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: emailToSend,
        nombreCompleto: associate.fullName,
        password: verificationCode,
        phoneNumber: associate.cellPhone,
        tipoPostulacion: "verificación",
        descripcion: "Código de verificación para tu participación en la Asamblea General Foncor 2026",
      }),
    });

    if (!emailResponse.ok) {
      throw new Error("Error al enviar el código por email");
    }

    console.log(`[generateVerificationCode] Email enviado a: ${emailToSend}`);

    return NextResponse.json(
      {
        success: true,
        message: "Código de verificación generado y enviado correctamente",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generando código de verificación:", error);
    return NextResponse.json(
      { error: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}` },
      { status: 500 }
    );
  }
}
