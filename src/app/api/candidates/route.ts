import { NextRequest, NextResponse } from "next/server";
import dbConnection from "@/lib/database";
import Candidate from "@/database/models/candidates";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(request: NextRequest) {
  try {
    await dbConnection();

    const { searchParams } = new URL(request.url);
    const associateId = searchParams.get("associateId");
    const electoralZone = searchParams.get("electoralZone");

    // Si se proporciona associateId, buscar un candidato específico
    if (associateId) {
      const candidate = await Candidate.findOne({ associateId });

      return NextResponse.json(
        { isCandidate: !!candidate, data: candidate || null },
        { status: 200 }
      );
    }

    // Si se proporciona electoralZone, buscar candidatos de esa zona
    if (electoralZone) {
      const candidates = await Candidate.find({ 
        electoralZone,
        isActive: true 
      });

      return NextResponse.json(
        { data: candidates },
        { status: 200 }
      );
    }

    // Si no se proporciona ninguno, retornar todos los candidatos activos
    const allCandidates = await Candidate.find({ isActive: true });

    return NextResponse.json(
      { data: allCandidates },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: `Error al verificar estado de candidato: ${error}` },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnection();

    const formData = await request.formData();
    const imageFile = formData.get("image") as File;
    const associateId = formData.get("associateId") as string;
    const fullName = formData.get("fullName") as string;
    const cedula = formData.get("cedula") as string;
    const electoralZone = formData.get("electoralZone") as string;
    const email = formData.get("email") as string;
    const cellPhone = formData.get("cellPhone") as string;
    const proposalDescription = formData.get("proposalDescription") as string;
    const cargo = formData.get("cargo") as string;
    const localidad = formData.get("localidad") as string;

    // Validar que todos los campos requeridos estén presentes
    if (!imageFile) {
      return NextResponse.json(
        { error: "La imagen es requerida" },
        { status: 400 }
      );
    }

    if (!associateId || !fullName || !cedula || !electoralZone || !email || !cellPhone) {
      return NextResponse.json(
        { error: "Todos los campos requeridos deben ser proporcionados" },
        { status: 400 }
      );
    }

    // Verificar si el asociado ya es candidato
    const existingCandidate = await Candidate.findOne({ associateId });
    if (existingCandidate) {
      return NextResponse.json(
        { error: "Este asociado ya está registrado como candidato" },
        { status: 400 }
      );
    }

    // Convertir el archivo a buffer
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Subir a Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "corona",
          resource_type: "auto",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(buffer);
    });

    const imageUrl = (uploadResult as any).secure_url;

    // Crear el candidato
    const newCandidate = new Candidate({
      associateId,
      fullName,
      cedula,
      electoralZone,
      email,
      cellPhone,
      imageUrl,
      position: cargo || undefined,
      locality: localidad || undefined,
      proposalDescription: proposalDescription || undefined,
      isActive: true,
    });

    await newCandidate.save();

    return NextResponse.json(
      { message: "Candidato registrado exitosamente", data: newCandidate },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json(
        { error: `${field} ya existe` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: `Error al registrar candidato: ${error.message}` },
      { status: 500 }
    );
  }
}
