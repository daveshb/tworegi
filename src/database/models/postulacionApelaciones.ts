import { Schema, model, Model } from "mongoose";
import { integranteSchema, IIntegrante } from "./integrante";

export type EstadoPostulacion = "DRAFT" | "ENVIADA";

export interface IPostulacionApelaciones {
  lider: IIntegrante;
  integrantes: IIntegrante[]; // 2 más (total 3 miembros, sin distinción de principal/suplente)
  
  // Declaraciones globales
  compromisosInstitucionales: boolean;
  autorizacionAntecedentes: boolean;
  responsabilidadLider: boolean;
  
  estado: EstadoPostulacion;
  createdAt?: Date;
  updatedAt?: Date;
}

const postulacionApelacionesSchema = new Schema<IPostulacionApelaciones>(
  {
    lider: {
      type: integranteSchema,
      required: [true, "Líder de la plancha es requerido"],
    },
    integrantes: {
      type: [integranteSchema],
      required: [true, "Integrantes son requeridos"],
      validate: {
        validator: function (integrantes: IIntegrante[]) {
          // Máximo 2 integrantes más (total 3 con líder)
          return integrantes.length <= 2;
        },
        message: "Comité de Apelaciones puede tener máximo 2 integrantes más",
      },
    },
    compromisosInstitucionales: {
      type: Boolean,
      required: [true, "Compromiso institucional es requerido"],
      default: false,
    },
    autorizacionAntecedentes: {
      type: Boolean,
      required: [true, "Autorización de antecedentes es requerida"],
      default: false,
    },
    responsabilidadLider: {
      type: Boolean,
      required: [true, "Responsabilidad del líder es requerida"],
      default: false,
    },
    estado: {
      type: String,
      enum: ["DRAFT", "ENVIADA"],
      required: [true, "Estado es requerido"],
      default: "DRAFT",
    },
  },
  { timestamps: true }
);

// Validación previa a guardar
postulacionApelacionesSchema.pre("save", function (next) {
  if (this.estado === "ENVIADA") {
    // Total de integrantes incluyendo líder debe ser 3
    const totalIntegrantes = 1 + (this.integrantes?.length || 0);
    if (totalIntegrantes !== 3) {
      throw new Error("Comité de Apelaciones debe tener exactamente 3 integrantes (1 líder + 2)");
    }

    // Validar cédulas únicas
    const cedulas = new Set<string>();
    cedulas.add(this.lider.cedula);
    for (const integrante of this.integrantes) {
      if (cedulas.has(integrante.cedula)) {
        throw new Error("No pueden haber cédulas duplicadas en la plancha");
      }
      cedulas.add(integrante.cedula);
    }

    // Validar que todas las declaraciones sean verdadero
    if (
      !this.compromisosInstitucionales ||
      !this.autorizacionAntecedentes ||
      !this.responsabilidadLider
    ) {
      throw new Error("Todas las declaraciones deben ser aceptadas para enviar");
    }
  }

  next();
});

export const PostulacionApelaciones: Model<IPostulacionApelaciones> =
  model<IPostulacionApelaciones>(
    "postulaciones_comite_apelaciones",
    postulacionApelacionesSchema
  );
