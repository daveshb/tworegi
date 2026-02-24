import { NextRequest, NextResponse } from "next/server";
import { generarFirmaCloudinary } from "@/lib/cloudinary";

export async function GET(request: NextRequest) {
  try {
    const resourceType = (request.nextUrl.searchParams.get("resourceType") || "image") as "raw" | "image";
    const firma = generarFirmaCloudinary(resourceType);
    return NextResponse.json(firma);
  } catch (error) {
    console.error("Error generando firma Cloudinary:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error generando firma de upload" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const resourceType = (body.resourceType || "image") as "raw" | "image";
    const firma = generarFirmaCloudinary(resourceType);
    return NextResponse.json(firma);
  } catch (error) {
    console.error("Error generando firma Cloudinary:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error generando firma de upload" },
      { status: 500 }
    );
  }
}
