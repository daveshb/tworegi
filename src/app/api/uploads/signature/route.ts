import { NextRequest, NextResponse } from "next/server";
import { generarFirmaCloudinary } from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
  try {
    const firma = generarFirmaCloudinary();
    return NextResponse.json(firma);
  } catch (error) {
    console.error("Error generando firma Cloudinary:", error);
    return NextResponse.json(
      { error: "Error generando firma de upload" },
      { status: 500 }
    );
  }
}
