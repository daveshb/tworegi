import { NextRequest, NextResponse } from "next/server";
import dbConnection from "@/lib/database";
import Vote from "@/database/models/votes";

export async function GET(request: NextRequest) {
  try {
    await dbConnection();

    const { searchParams } = new URL(request.url);
    const voterId = searchParams.get("voterId");

    if (!voterId) {
      return NextResponse.json(
        { error: "voterId es requerido" },
        { status: 400 }
      );
    }

    // Verificar si el usuario ya votó
    const existingVote = await Vote.findOne({ voterId });

    return NextResponse.json(
      { 
        hasVoted: !!existingVote,
        vote: existingVote || null
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: `Error al verificar voto: ${error}` },
      { status: 500 }
    );
  }
}
