import { NextRequest, NextResponse } from "next/server";
import dbConnection from "@/lib/database";
import Associate from "@/database/models/associates";

export async function GET(request: NextRequest) {
  try {
    await dbConnection();
    
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    let filter = {};

    if (query) {
      // Buscar en fullName, email o cedula (case-insensitive)
      filter = {
        $or: [
          { fullName: { $regex: query, $options: "i" } },
          { email: { $regex: query, $options: "i" } },
          { cedula: { $regex: query, $options: "i" } },
        ],
      };
    }

    const associates = await Associate.find(filter);
    
    return NextResponse.json(
      { data: associates },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: `Error fetching associates: ${error}` },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnection();
    
    const body = await request.json();
    
    const { fullName, cedula, joinDate, electoralZone, email, cellPhone } = body;

    // Validar campos requeridos
    if (!fullName || !cedula || !electoralZone || !email || !cellPhone) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Generar password aleatorio de 4 dígitos
    const password = String(Math.floor(Math.random() * 10000)).padStart(4, "0");

    // Crear nuevo asociado
    const newAssociate = new Associate({
      fullName,
      cedula,
      joinDate: joinDate || new Date(),
      electoralZone,
      email,
      cellPhone,
      isActive: true,
      password,
    });

    await newAssociate.save();

    return NextResponse.json(
      { message: "Associate created successfully", data: newAssociate },
      { status: 201 }
    );
  } catch (error: unknown) {
    const dbError = error as { message?: string; code?: number; keyPattern?: Record<string, number> };
    // Manejar errores de duplicados
    if (dbError.code === 11000) {
      const field = dbError.keyPattern ? Object.keys(dbError.keyPattern)[0] : 'field';
      return NextResponse.json(
        { error: `${field} already exists` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: `Error updating associate: ${dbError.message}` },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnection();

    const body = await request.json();
    const { id, fullName, cedula, joinDate, electoralZone, email, cellPhone, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Associate ID is required" },
        { status: 400 }
      );
    }

    // Validar campos requeridos
    if (!fullName || !cedula || !electoralZone || !email || !cellPhone || isActive === undefined) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Actualizar asociado
    const updatedAssociate = await Associate.findByIdAndUpdate(
      id,
      {
        fullName,
        cedula,
        joinDate,
        electoralZone,
        email,
        cellPhone,
        isActive,
      },
      { new: true, runValidators: true }
    );

    if (!updatedAssociate) {
      return NextResponse.json(
        { error: "Asociado no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Associate updated successfully", data: updatedAssociate },
      { status: 200 }
    );
  } catch (error: unknown) {
    const dbError = error as { code?: number; keyPattern?: Record<string, number> };
    if (dbError.code === 11000) {
      const field = dbError.keyPattern ? Object.keys(dbError.keyPattern)[0] : 'field';
      return NextResponse.json(
        { error: `${field} already exists` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: `Error updating associate: ${dbError instanceof Error ? dbError.message : 'Error desconocido'}` },
      { status: 500 }
    );
  }
}
