import crypto from "crypto";

/**
 * Genera una firma segura para upload directo a Cloudinary
 * Solo se ejecuta en servidor
 */
export function generarFirmaCloudinary(resourceType: "raw" | "image" = "image") {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Variables de entorno de Cloudinary no configuradas correctamente"
    );
  }

  const timestamp = Math.floor(Date.now() / 1000);
  
  // Definir carpeta según tipo de recurso
  const folder = resourceType === "raw" 
    ? "postulaciones/documentos" 
    : "postulaciones/imagenes";

  const paramsToSign = {
    timestamp,
    folder,
    resource_type: resourceType,
  };

  // Crear string para firmar
  const stringToSign = Object.entries(paramsToSign)
    .sort()
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  const signature = crypto
    .createHash("sha1")
    .update(stringToSign + apiSecret)
    .digest("hex");

  return {
    timestamp,
    signature,
    apiKey,
    cloudName,
    folder,
    resource_type: resourceType,
  };
}

/**
 * Extrae metadata de respuesta de Cloudinary
 */
export interface CloudinaryUploadResponse {
  public_id: string;
  version: number;
  signature: string;
  width?: number;
  height?: number;
  format: string;
  resource_type: "image" | "raw" | "video";
  created_at: string;
  tags: string[];
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  folder: string;
  original_filename: string;
}

export function extraerMetadataCloudinary(response: CloudinaryUploadResponse) {
  return {
    url: response.secure_url,
    public_id: response.public_id,
    bytes: response.bytes,
    format: response.format,
    original_filename: response.original_filename,
    resource_type: response.resource_type as "raw" | "image",
    createdAt: new Date(response.created_at),
  };
}
