import nodemailer from "nodemailer";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, nombreCompleto, password, tipoPostulacion, descripcion } = await request.json();

    const userMail = process.env.MAIL_USER;
    const passMail = process.env.MAIL_PASS;

    if (!email || !nombreCompleto || !password) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    // Enviar email
    const emailSent = await sendEmailPassword(email, nombreCompleto, password, userMail, passMail, tipoPostulacion, descripcion);
    
    return NextResponse.json(
      { 
        message: emailSent ? 'Código enviado por email' : 'Error enviando código',
        success: emailSent
      },
      { status: emailSent ? 200 : 500 }
    );
  } catch (error) {
    console.error("Error enviando código de votación:", error);
    return NextResponse.json(
      { error: `Error al enviar código: ${error}` },
      { status: 500 }
    );
  }
}

// Función para enviar email
async function sendEmailPassword(
  email: string,
  nombreCompleto: string,
  password: string,
  userMail: string | undefined,
  passMail: string | undefined,
  tipoPostulacion?: string,
  descripcion?: string
): Promise<boolean> {
  try {
    if (!userMail || !passMail) {
      console.warn("Credenciales de email no configuradas");
      return false;
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: userMail,
        pass: passMail,
      },
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Contraseña de verificación</title>
          <title>Foncor</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #f5f5f5;
              margin: 0;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: #ffffff;
              padding: 40px 20px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 600;
            }
            .content {
              padding: 40px 20px;
              color: #333333;
            }
            .greeting {
              font-size: 18px;
              margin-bottom: 20px;
              line-height: 1.6;
            }
            .password-box {
              background-color: #f0f4ff;
              border: 3px solid #667eea;
              padding: 30px;
              margin: 30px 0;
              border-radius: 8px;
              text-align: center;
            }
            .password-label {
              font-size: 14px;
              color: #666666;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 10px;
            }
            .password-value {
              font-size: 48px;
              font-weight: bold;
              color: #667eea;
              letter-spacing: 8px;
              font-family: 'Courier New', monospace;
            }
            .instructions {
              background-color: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
              color: #856404;
            }
            .security-note {
              background-color: #d4edda;
              border-left: 4px solid #28a745;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
              color: #155724;
              font-size: 14px;
            }
            .footer {
              background-color: #f5f5f5;
              padding: 20px;
              text-align: center;
              font-size: 12px;
              color: #999999;
              border-top: 1px solid #e0e0e0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🗳️ Código de verificación</h1>
              <h1>${tipoPostulacion === 'candidato' ? 'para postulación a delegado de asamblea 2026' : 'para votación delegados asamblea 2026'}</h1>
              <h1>Foncor</h1>
            </div>
            <div class="content">
              <div class="greeting">
                Hola <strong>${nombreCompleto}</strong>,
              </div>
              <p>
                Tu código de verificación para acceder al sistema de ${tipoPostulacion === 'candidato' ? 'postulación' : 'votación'} es:
              </p>
              <div class="password-box">
                <div class="password-label">Tu Código de Acceso</div>
                <div class="password-value">${password}</div>
              </div>
              <div class="instructions">
                <strong>Instrucciones:</strong>
                <ol>
                  <li>Ingresa tu código de verificación en el campo solicitado</li>
                  <li>Haz clic en verificar y continuar</li>
                  <li>Procede a ${tipoPostulacion === 'candidato' ? 'completar tu postulación' : 'completar tu votación'}</li>
                </ol>
              </div>
              <div class="security-note">
                <strong>⚠️ Seguridad:</strong> Nunca compartas este código con nadie. Este es tu código personal y único para verificar tu identidad de forma segura.
              </div>
              <p style="margin-top: 30px; color: #666666;">
                Si no solicitaste este código, por favor ignora este email.
              </p>
            </div>
            <div class="footer">
              <p>
                &copy; 2026 <a href="https://www.dhb-tech.com/" target="_blank" rel="noopener noreferrer">DHB-TECH</a>.
                Solución digital para la gestión eficiente de asambleas y procesos de votación.
                Todos los derechos reservados.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    await transporter.sendMail({
      from: '"Foncor" <no-reply@tworegistro.com>',
      to: email,
      subject: `Tu Código de Votación - ${password}`,
      html: htmlContent,
    });

    return true;
  } catch (error) {
    console.error("Error enviando email:", error);
    return false;
  }
}

