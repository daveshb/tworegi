import { Schema, model, Model } from "mongoose";
import { integranteSchema, IIntegrante } from "./integrante";

export type EstadoPostulacion = "DRAFT" | "ENVIADA";

export interface IPostulacionJunta {
  lider: IIntegrante;
  integrantes: IIntegrante[]; // 9 más (total 10: 5 principales + 5 suplentes)
  
  // Declaraciones globales
  compromisosInstitucionales: boolean;
  autorizacionAntecedentes: boolean;
  responsabilidadLider: boolean;
  
  estado: EstadoPostulacion;
  createdAt?: Date;
  updatedAt?: Date;
}

const postulacionJuntaSchema = new Schema<IPostulacionJunta>(
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
          // Debe haber exactamente 9 integrantes más (total 10 con líder)
          if (integrantes.length > 9) return false;
          
          // Validar distribución: 5 principales y 5 suplentes (en total con líder 6-4 o 5-5)
          const principales = integrantes.filter(
            (i) => i.tipoIntegrante === "PRINCIPAL"
          );
          const suplentes = integrantes.filter(
            (i) => i.tipoIntegrante === "SUPLENTE"
          );
          
          // Permitir que se construya gradualmente
          return true;
        },
        message: "Distribución inválida de integrantes",
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
postulacionJuntaSchema.pre("save", function (next) {
  if (this.estado === "ENVIADA") {
    // Total de integrantes incluyendo líder debe ser 10
    const totalIntegrantes = 1 + (this.integrantes?.length || 0);
    if (totalIntegrantes !== 10) {
      throw new Error("Junta Directiva debe tener exactamente 10 integrantes (1 líder + 9)");
    }

    // Validar distribución: 5 principales + 5 suplentes
    const principales = this.integrantes.filter(
      (i) => i.tipoIntegrante === "PRINCIPAL"
    ).length;
    const suplentes = this.integrantes.filter(
      (i) => i.tipoIntegrante === "SUPLENTE"
    ).length;

    if (principales !== 5 || suplentes !== 5) {
      throw new Error("Junta Directiva debe tener exactamente 5 principales y 5 suplentes");
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

export const PostulacionJunta: Model<IPostulacionJunta> =
  model<IPostulacionJunta>(
    "postulaciones_junta_directiva",
    postulacionJuntaSchema
  );
