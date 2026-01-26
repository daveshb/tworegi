import nodemailer from "nodemailer";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, nombreCompleto, zonaElectoral } = await request.json();

    const userMail = process.env.MAIL_USER;
    const passMail = process.env.MAIL_PASS;

    if (!email || !nombreCompleto || !zonaElectoral) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      );
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
          <title>Confirmación de Candidatura</title>
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
            .info-box {
              background-color: #f0f4ff;
              border-left: 4px solid #667eea;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid #e0e0e0;
            }
            .info-row:last-child {
              border-bottom: none;
            }
            .label {
              font-weight: 600;
              color: #667eea;
            }
            .value {
              color: #555555;
            }
            .message {
              margin-top: 30px;
              padding: 20px;
              background-color: #e8f5e9;
              border-radius: 4px;
              border-left: 4px solid #4caf50;
              color: #2e7d32;
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
              <h1>¡Candidatura Confirmada!</h1>
            </div>
            <div class="content">
              <div class="greeting">
                Hola <strong>${nombreCompleto}</strong>,
              </div>
              <p>
                Nos complace informarte que tu candidatura ya se encuentra registrada en nuestro sistema.
              </p>
              <div class="info-box">
                <div class="info-row">
                  <span class="label">Nombre:</span>
                  <span class="value">${nombreCompleto}</span>
                </div>
                <div class="info-row">
                  <span class="label">Zona Electoral:</span>
                  <span class="value">${zonaElectoral}</span>
                </div>
                <div class="info-row">
                  <span class="label">Estado:</span>
                  <span class="value">Candidato(a) Registrado(a)</span>
                </div>
              </div>
              <div class="message">
                <strong>✓ Tu registro como candidato(a) está activo y visible en el sistema de votación.</strong>
              </div>
              <p style="margin-top: 30px; color: #666666;">
                Si tienes alguna pregunta o necesitas ayuda, por favor contacta con nuestro equipo de soporte.
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
      from: '"Forcor" <no-reply@corona.com>',
      to: email,
      subject: `¡Bienvenido(a) ${nombreCompleto}! Tu candidatura ha sido confirmada`,
      html: htmlContent,
    });

    return NextResponse.json(
      { message: "Email enviado exitosamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error enviando email:", error);
    return NextResponse.json(
      { error: `Error al enviar email: ${error}` },
      { status: 500 }
    );
  }
}
