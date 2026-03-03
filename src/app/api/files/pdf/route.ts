import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ?? process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ?? process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ALLOWED_HOSTS = ["res.cloudinary.com"];

function isAllowedPdfUrl(fileUrl: string): boolean {
  try {
    const parsed = new URL(fileUrl);
    if (parsed.protocol !== "https:") return false;

    return ALLOWED_HOSTS.some(
      (host) => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`)
    );
  } catch {
    return false;
  }
}

function extractCloudinaryPublicIdVariants(fileUrl: string): string[] {
  try {
    const parsed = new URL(fileUrl);
    const pathSegments = parsed.pathname.split("/").filter(Boolean);

    const uploadIndex = pathSegments.findIndex((segment) => segment === "upload");
    if (uploadIndex === -1 || uploadIndex + 1 >= pathSegments.length) {
      return [];
    }

    const afterUpload = pathSegments.slice(uploadIndex + 1);
    const withoutVersion = /^v\d+$/.test(afterUpload[0]) ? afterUpload.slice(1) : afterUpload;

    if (withoutVersion.length === 0) {
      return [];
    }

    const withExtension = withoutVersion.join("/");
    const withoutExtension = withExtension.replace(/\.pdf$/i, "");

    return Array.from(new Set([withExtension, withoutExtension].filter(Boolean)));
  } catch {
    return [];
  }
}

async function fetchWithSignedCloudinaryUrl(fileUrl: string): Promise<Response | null> {
  const publicIdVariants = extractCloudinaryPublicIdVariants(fileUrl);

  if (publicIdVariants.length === 0) {
    return null;
  }

  const signedCandidates: string[] = [];

  for (const publicId of publicIdVariants) {
    signedCandidates.push(
      cloudinary.utils.private_download_url(publicId, "pdf", {
        resource_type: "raw",
        type: "upload",
        expires_at: Math.floor(Date.now() / 1000) + 300,
      })
    );

    signedCandidates.push(
      cloudinary.utils.private_download_url(publicId, "", {
        resource_type: "raw",
        type: "upload",
        expires_at: Math.floor(Date.now() / 1000) + 300,
      })
    );
  }

  for (const signedUrl of signedCandidates) {
    const response = await fetch(signedUrl, { cache: "no-store" });
    if (response.ok) {
      return response;
    }
  }

  return null;
}

async function fetchCloudinaryPdf(fileUrl: string): Promise<Response> {
  let response = await fetch(fileUrl, { cache: "no-store" });

  if (response.status === 401) {
    const signedResponse = await fetchWithSignedCloudinaryUrl(fileUrl);
    if (signedResponse) {
      response = signedResponse;
    }
  }

  return response;
}

export async function GET(req: NextRequest) {
  try {
    const encodedUrl = req.nextUrl.searchParams.get("url");

    if (!encodedUrl) {
      return NextResponse.json({ error: "url es requerido" }, { status: 400 });
    }

    const fileUrl = decodeURIComponent(encodedUrl);

    if (!isAllowedPdfUrl(fileUrl)) {
      return NextResponse.json({ error: "URL no permitida" }, { status: 400 });
    }

    let response = await fetchCloudinaryPdf(fileUrl);

    const isLegacyPdfImageUrl =
      fileUrl.toLowerCase().includes("/image/upload/") && fileUrl.toLowerCase().includes(".pdf");

    if (!response.ok && isLegacyPdfImageUrl) {
      const rawUrl = fileUrl.replace("/image/upload/", "/raw/upload/");
      response = await fetchCloudinaryPdf(rawUrl);
    }

    if (!response.ok) {
      return NextResponse.json({ error: "No se pudo obtener el PDF" }, { status: response.status });
    }

    const contentType = (response.headers.get("content-type") || "").toLowerCase();
    const looksLikePdfUrl =
      fileUrl.toLowerCase().includes(".pdf") || fileUrl.toLowerCase().includes("/raw/upload/");

    if (
      !contentType.includes("pdf") &&
      !contentType.includes("application/octet-stream") &&
      !looksLikePdfUrl
    ) {
      return NextResponse.json({ error: "El archivo no parece ser PDF" }, { status: 400 });
    }

    const fileBuffer = await response.arrayBuffer();

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Error proxying PDF file:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
