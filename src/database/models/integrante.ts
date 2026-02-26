import { Schema } from "mongoose";
import { archivoAdjuntoSchema, IArchivoAdjunto } from "./archivoAdjunto";

export type TipoIntegrante = "PRINCIPAL" | "SUPLENTE" | "MIEMBRO";
export type EstadoAsociado = "HABIL" | "NO_REGISTRADO" | "INHABIL";

export interface IIntegrante {
  cedula: string;
  nombreCompleto: string;
  cargoEmpresa: string;
  sedeTrabajo: string;
  celular: string;
  correo: string;
  tipoIntegrante: TipoIntegrante;
  
  // Documentos requeridos
  adjuntoCedula: IArchivoAdjunto;
  certificadoEconomiaSolidaria?: IArchivoAdjunto; // Junta y Control Social
  soporteFormacionAcademica?: IArchivoAdjunto; // Solo Junta Directiva
  
  // Estado de validación
  asociadoStatus: EstadoAsociado;
  motivoInhabilidad?: string;
  
  createdAt?: Date;
  updatedAt?: Date;
}

export const integranteSchema = new Schema<IIntegrante>(
  {
    cedula: {
      type: String,
      required: [true, "Cédula es requerida"],
      trim: true,
      match: [/^\d+$/, "Cédula debe contener solo números"],
    },
    nombreCompleto: {
      type: String,
      required: [true, "Nombre completo es requerido"],
      trim: true,
    },
    cargoEmpresa: {
      type: String,
      required: [true, "Cargo en empresa es requerido"],
      trim: true,
    },
    sedeTrabajo: {
      type: String,
      required: [true, "Sede de trabajo es requerida"],
      trim: true,
    },
    celular: {
      type: String,
      required: [true, "Celular es requerido"],
      trim: true,
      match: [/^\d+$/, "Celular debe contener solo números"],
    },
    correo: {
      type: String,
      required: [true, "Correo es requerido"],
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Correo debe ser válido",
      ],
    },
    tipoIntegrante: {
      type: String,
      enum: ["PRINCIPAL", "SUPLENTE", "MIEMBRO"],
      required: [true, "Tipo de integrante es requerido"],
    },
    adjuntoCedula: {
      type: archivoAdjuntoSchema,
      required: [true, "Adjunto de cédula es requerido"],
    },
    certificadoEconomiaSolidaria: {
      type: archivoAdjuntoSchema,
      required: false,
    },
    soporteFormacionAcademica: {
      type: archivoAdjuntoSchema,
      required: false,
    },
    asociadoStatus: {
      type: String,
      enum: ["HABIL", "NO_REGISTRADO", "INHABIL"],
      required: [true, "Estado del asociado es requerido"],
    },
    motivoInhabilidad: {
      type: String,
      trim: true,
      required: false,
    },
  },
  { timestamps: true }
);
