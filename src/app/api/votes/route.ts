import { NextRequest, NextResponse } from "next/server";
import dbConnection from "@/lib/database";
import Vote from "@/database/models/votes";
import Associate from "@/database/models/associates";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
  try {
    await dbConnection();

    const body = await request.json();
    const {
      voterId,
      voterName,
      voterZone,
      candidateId,
      candidateName,
      candidateZone,
    } = body;

    // Validar campos requeridos
    if (
      !voterId ||
      !voterName ||
      !voterZone ||
      !candidateId ||
      !candidateName ||
      !candidateZone
    ) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    // Validar que la zona del votante coincida con la del candidato
    if (voterZone !== candidateZone) {
      return NextResponse.json(
        { error: "No puedes votar por un candidato de una zona diferente" },
        { status: 400 }
      );
    }

    // Verificar que el votante no haya votado ya
    const existingVote = await Vote.findOne({ voterId });
    if (existingVote) {
      return NextResponse.json(
        { error: "Ya has emitido tu voto. Cada votante puede votar una sola vez" },
        { status: 400 }
      );
    }

    // Crear el voto
    const newVote = new Vote({
      voterId,
      voterName,
      voterZone,
      candidateId,
      candidateName,
      candidateZone,
      votedAt: new Date(),
    });

    await newVote.save();

    // Obtener información del asociado para enviar email
    const associate = await Associate.findOne({ cedula: voterId });
    
    if (associate && associate.email) {
      try {
        // Enviar email de confirmación de votación
        const userMail = process.env.MAIL_USER;
        const passMail = process.env.MAIL_PASS;

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
              <title>Confirmación de Votación</title>
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
                  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
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
                .success-box {
                  background-color: #d1fae5;
                  border-left: 4px solid #10b981;
                  padding: 15px;
                  margin: 20px 0;
                  border-radius: 4px;
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
                  color: #666666;
                }
                .value {
                  color: #333333;
                  text-align: right;
                }
                .cta-button {
                  display: inline-block;
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: #ffffff;
                  padding: 12px 30px;
                  border-radius: 4px;
                  text-decoration: none;
                  margin: 20px 0;
                  font-weight: 600;
                }
                .footer {
                  background-color: #f5f5f5;
                  padding: 20px;
                  text-align: center;
                  font-size: 12px;
                  color: #999999;
                  border-top: 1px solid #e0e0e0;
                }
                .footer a {
                  color: #667eea;
                  text-decoration: none;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>✓ ¡Votación Confirmada!</h1>
                </div>
                <div class="content">
                  <p class="greeting">Hola ${voterName},</p>
                  <p>Tu voto ha sido registrado exitosamente en el sistema de votación de Foncor 2026.</p>
                  
                  <div class="success-box">
                    <p><strong>✓ Votación completada</strong></p>
                    <p>Tu participación en la asamblea general ha sido contabilizada. Tu voto es secreto y será utilizado únicamente para los propósitos electorales establecidos.</p>
                  </div>

                  <div class="info-box">
                    <div class="info-row">
                      <span class="label">Candidato votado:</span>
                      <span class="value"><strong>${candidateName}</strong></span>
                    </div>
                    <div class="info-row">
                      <span class="label">Zona electoral:</span>
                      <span class="value"><strong>${candidateZone}</strong></span>
                    </div>
                    <div class="info-row">
                      <span class="label">Fecha y hora:</span>
                      <span class="value"><strong>${new Date().toLocaleString('es-CO')}</strong></span>
                    </div>
                    <div class="info-row">
                      <span class="label">Comprobante:</span>
                      <span class="value"><strong>VOT-${new Date().getTime().toString().slice(-6)}</strong></span>
                    </div>
                  </div>

                  <p>Si tienes alguna pregunta o necesitas reportar un problema con tu votación, contacta con los administradores del sistema.</p>
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
          from: '"Foncor" <no-reply@corona.com>',
          to: associate.email,
          subject: `¡Votación Confirmada! - Foncor 2026 - ${candidateName}`,
          html: htmlContent,
        });

        console.log('[votes] Email de confirmación enviado a:', associate.email);
      } catch (emailError) {
        console.error('[votes] Error enviando email de confirmación:', emailError);
        // No fallar la votación si hay error en el email
      }
    }

    return NextResponse.json(
      { message: "Voto registrado exitosamente", data: newVote },
      { status: 201 }
    );
  } catch (error: unknown) {
    const dbError = error as { code?: number; keyPattern?: Record<string, number>; message?: string };
    if (dbError.code === 11000) {
      const field = dbError.keyPattern ? Object.keys(dbError.keyPattern)[0] : 'voterId';
      return NextResponse.json(
        { error: `${field} ya existe - No puedes votar dos veces` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: `Error al registrar voto: ${dbError instanceof Error ? dbError.message : 'Error desconocido'}` },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnection();

    const { searchParams } = new URL(request.url);
    const zone = searchParams.get("zone");

    let query = {};

    if (zone) {
      query = { voterZone: zone };
    }

    const votes = await Vote.find(query);

    // Contar votos por candidato
    const votesByCandidate: Record<string, { name: string; zone: string; count: number; id: string }> = {};
    const votesByZone: Record<string, number> = {};

    votes.forEach(vote => {
      const candidateKey = vote.candidateName;
      const voteZone = vote.candidateZone;

      // Contar por candidato
      if (!votesByCandidate[candidateKey]) {
        votesByCandidate[candidateKey] = { 
          name: vote.candidateName, 
          zone: vote.candidateZone, 
          count: 0,
          id: vote.candidateId.toString()
        };
      }
      votesByCandidate[candidateKey].count += 1;

      // Contar por zona
      if (!votesByZone[voteZone]) {
        votesByZone[voteZone] = 0;
      }
      votesByZone[voteZone] += 1;
    });

    // Transformar a array con _id
    const votesByCandiateArray = Object.values(votesByCandidate).map(candidate => ({
      _id: candidate.id,
      candidateName: candidate.name,
      candidateZone: candidate.zone,
      votes: candidate.count
    }));

    return NextResponse.json(
      { 
        totalVotes: votes.length,
        totalCandidates: Object.keys(votesByCandidate).length,
        votesByCandidate: votesByCandiateArray,
        votesByZone,
        data: votes, 
        summary: Object.values(votesByCandidate) 
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: `Error al obtener votos: ${error}` },
      { status: 500 }
    );
  }
}
