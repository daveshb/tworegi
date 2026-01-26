import { NextRequest, NextResponse } from "next/server";
import dbConnection from "@/lib/database";
import Associate from "@/database/models/associates";

export async function GET(request: NextRequest) {
  try {
    await dbConnection();

    const { searchParams } = new URL(request.url);
    const cedula = searchParams.get("cedula");

    if (!cedula) {
      return NextResponse.json(
        { error: "Cedula is required" },
        { status: 400 }
      );
    }

    const associate = await Associate.findOne({ cedula });

    if (!associate) {
      return NextResponse.json(
        { error: "Asociado no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { data: associate },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: `Error fetching associate: ${error}` },
      { status: 500 }
    );
  }
}
