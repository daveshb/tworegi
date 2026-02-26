import { Schema, model, models, Model } from "mongoose";
import { integranteSchema, IIntegrante } from "./integrante";

export type EstadoPostulacion = "DRAFT" | "ENVIADA";

export interface IPostulacionControl {
  lider: IIntegrante;
  integrantes: IIntegrante[]; // 5 más (total 6: 3 principales + 3 suplentes)
  
  // Declaraciones globales
  compromisosInstitucionales: boolean;
  autorizacionAntecedentes: boolean;
  responsabilidadLider: boolean;
  
  estado: EstadoPostulacion;
  createdAt?: Date;
  updatedAt?: Date;
}

const postulacionControlSchema = new Schema<IPostulacionControl>(
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
          // Máximo 5 integrantes más (total 6 con líder)
          return integrantes.length <= 5;
        },
        message: "Control Social puede tener máximo 5 integrantes más",
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
postulacionControlSchema.pre("save", function (next) {
  if (this.estado === "ENVIADA") {
    // Total de integrantes incluyendo líder debe ser 6
    const totalIntegrantes = 1 + (this.integrantes?.length || 0);
    if (totalIntegrantes !== 6) {
      throw new Error("Control Social debe tener exactamente 6 integrantes (1 líder + 5)");
    }

    // Validar distribución: 3 principales + 3 suplentes
    const principalesIntegrantes = this.integrantes.filter(
      (i) => i.tipoIntegrante === "PRINCIPAL"
    ).length;
    const suplentesIntegrantes = this.integrantes.filter(
      (i) => i.tipoIntegrante === "SUPLENTE"
    ).length;
    const principales =
      (this.lider.tipoIntegrante === "PRINCIPAL" ? 1 : 0) +
      principalesIntegrantes;
    const suplentes =
      (this.lider.tipoIntegrante === "SUPLENTE" ? 1 : 0) +
      suplentesIntegrantes;

    if (principales !== 3 || suplentes !== 3) {
      throw new Error("Control Social debe tener exactamente 3 principales y 3 suplentes");
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

export const PostulacionControl: Model<IPostulacionControl> =
  (models.postulaciones_control_social as Model<IPostulacionControl>) ||
  model<IPostulacionControl>("postulaciones_control_social", postulacionControlSchema);
