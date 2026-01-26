import { NextRequest, NextResponse } from "next/server";
import dbConnection from "@/lib/database";
import Vote from "@/database/models/votes";

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
