import { Schema } from "mongoose";

export interface IArchivoAdjunto {
  url: string;
  public_id: string;
  bytes: number;
  format: string;
  original_filename: string;
  resource_type: "raw" | "image";
  createdAt: Date;
}

export const archivoAdjuntoSchema = new Schema<IArchivoAdjunto>(
  {
    url: {
      type: String,
      required: [true, "URL del archivo es requerida"],
      trim: true,
    },
    public_id: {
      type: String,
      required: [true, "Public ID de Cloudinary es requerido"],
      trim: true,
    },
    bytes: {
      type: Number,
      required: [true, "Tamaño del archivo es requerido"],
    },
    format: {
      type: String,
      required: [true, "Formato del archivo es requerido"],
      trim: true,
    },
    original_filename: {
      type: String,
      required: [true, "Nombre original del archivo es requerido"],
      trim: true,
    },
    resource_type: {
      type: String,
      enum: ["raw", "image"],
      required: [true, "Tipo de recurso es requerido"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);
