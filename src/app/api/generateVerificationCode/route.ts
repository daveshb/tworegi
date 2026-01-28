import { NextRequest, NextResponse } from "next/server";
import Associate from "@/database/models/associates";
import dbConnection from "@/lib/database";

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

    // Validar que el asociado tenga email y teléfono
    if (!associate.cellPhone) {
      console.warn(`[generateVerificationCode] Asociado ${cedula} no tiene teléfono registrado`);
    }

    // Generar código de verificación aleatorio
    const verificationCode = generateVerificationCode();
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + 10); // El código expira en 10 minutos

    // Determinar qué email se usará
    const emailToUse = email || associate.email;

    console.log(`[generateVerificationCode] Generando código para cédula: ${cedula}, email: ${emailToUse}, código: ${verificationCode}`);

    // Actualizar el asociado con el código de verificación
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

    const sendResults = {
      email: { success: false, error: null as string | null },
      whatsapp: { success: false, error: null as string | null }
    };

    // Preparar promesas de envío
    const sendPromises = [
      // Envío de email
      fetch('/api/sendVotingPassword', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailToUse,
          nombreCompleto: associate.fullName,
          password: verificationCode,
          phoneNumber: associate.cellPhone,
          tipoPostulacion: "verificación",
          descripcion: "Código de verificación para tu participación en la Asamblea General Foncor 2026",
        }),
      }).then(async (res) => {
        if (!res.ok) {
          const text = await res.text().catch(() => 'no body');
          throw new Error(`Error ${res.status}: ${text}`);
        }
        return res;
      })
    ];

    // Solo agregar envío de WhatsApp si el asociado tiene teléfono
    if (associate.cellPhone) {
      sendPromises.push(
        fetch('/api/sendcodews', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: associate.cellPhone,
            templateName: process.env.WHATSAPP_TEMPLATE_NAME || 'otp',
            languageCode: process.env.WHATSAPP_TEMPLATE_LANG || 'es_CO',
            otp: verificationCode,
          }),
        }).then(async (res) => {
          if (!res.ok) {
            const text = await res.text().catch(() => 'no body');
            throw new Error(`Error ${res.status}: ${text}`);
          }
          return res;
        })
      );
    } else {
      sendResults.whatsapp.error = "No hay número de teléfono registrado";
    }

    // Ejecutar ambos envíos en paralelo usando Promise.allSettled
    const results = await Promise.allSettled(sendPromises);

    // Procesar resultado del email (siempre es el primero)
    const emailResult = results[0];
    if (emailResult.status === 'fulfilled') {
      sendResults.email.success = true;
      console.log(`[generateVerificationCode] Email enviado exitosamente a: ${emailToUse}`);
    } else {
      sendResults.email.error = emailResult.reason.message;
      console.error(`[generateVerificationCode] Error enviando email:`, emailResult.reason);
    }

    // Procesar resultado de WhatsApp (si existe)
    if (results.length > 1) {
      const whatsappResult = results[1];
      if (whatsappResult.status === 'fulfilled') {
        sendResults.whatsapp.success = true;
        console.log(`[generateVerificationCode] WhatsApp enviado exitosamente a: ${associate.cellPhone}`);
      } else {
        sendResults.whatsapp.error = whatsappResult.reason.message;
        console.error(`[generateVerificationCode] Error enviando WhatsApp:`, whatsappResult.reason);
      }
    }

    // Determinar el resultado final
    const bothSucceeded = sendResults.email.success && sendResults.whatsapp.success;
    const atLeastOneSucceeded = sendResults.email.success || sendResults.whatsapp.success;

    if (bothSucceeded) {
      return NextResponse.json(
        {
          success: true,
          message: "Código de verificación generado y enviado correctamente por email y WhatsApp",
          details: sendResults
        },
        { status: 200 }
      );
    } else if (atLeastOneSucceeded) {
      const sentVia = sendResults.email.success ? 'email' : 'WhatsApp';
      return NextResponse.json(
        {
          success: true,
          partial: true,
          message: `Código de verificación generado y enviado por ${sentVia}`,
          details: sendResults
        },
        { status: 207 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "No se pudo enviar el código por ningún medio",
          details: sendResults
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("[generateVerificationCode] Error crítico:", error);
    return NextResponse.json(
      { error: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}` },
      { status: 500 }
    );
  }
}
