import { z } from "zod";

// Esquema para archivo adjunto (solo metadata después de upload)
export const archivoAdjuntoSchema = z.object({
  url: z.string().url("URL debe ser válida"),
  public_id: z.string().min(1, "Public ID es requerido"),
  bytes: z.number().positive("Tamaño debe ser positivo"),
  format: z.preprocess(
    (value) => (typeof value === "string" && value.trim() ? value : "pdf"),
    z.string().min(1, "Formato es requerido")
  ),
  original_filename: z.string().min(1, "Nombre de archivo es requerido"),
  resource_type: z.enum(["raw", "image"]),
  createdAt: z.coerce.date().optional(),
});

export type IArchivoAdjunto = z.infer<typeof archivoAdjuntoSchema>;

// Esquema para integrante
export const integranteSchema = z.object({
  cedula: z
    .string()
    .min(5, "Cédula debe tener al menos 5 dígitos")
    .max(20, "Cédula no debe exceder 20 dígitos")
    .regex(/^\d+$/, "Cédula solo debe contener números"),
  nombreCompleto: z
    .string()
    .min(3, "Nombre completo debe tener al menos 3 caracteres")
    .max(100, "Nombre completo no debe exceder 100 caracteres"),
  cargoEmpresa: z
    .string()
    .min(2, "Cargo debe tener al menos 2 caracteres")
    .max(100, "Cargo no debe exceder 100 caracteres"),
  sedeTrabajo: z
    .string()
    .min(2, "Sede de trabajo debe tener al menos 2 caracteres")
    .max(100, "Sede no debe exceder 100 caracteres"),
  celular: z
    .string()
    .min(7, "Celular debe tener al menos 7 dígitos")
    .max(20, "Celular no debe exceder 20 dígitos")
    .regex(/^\d+$/, "Celular solo debe contener números"),
  correo: z.string().email("Correo debe ser válido"),
  tipoIntegrante: z.enum(["PRINCIPAL", "SUPLENTE", "MIEMBRO"]),
  adjuntoCedula: archivoAdjuntoSchema,
  certificadoEconomiaSolidaria: z.preprocess(
    (value) => (value === null ? undefined : value),
    archivoAdjuntoSchema.optional()
  ),
  soporteFormacionAcademica: z.preprocess(
    (value) => (value === null ? undefined : value),
    archivoAdjuntoSchema.optional()
  ),
  asociadoStatus: z.enum(["HABIL", "NO_REGISTRADO", "INHABIL"]),
  motivoInhabilidad: z.string().optional(),
});

export type IIntegrante = z.infer<typeof integranteSchema>;

// Esquema para postulación Junta Directiva
export const postulacionJuntaSchema = z
  .object({
    lider: integranteSchema,
    integrantes: z.array(integranteSchema).max(9, "Máximo 9 integrantes adicionales"),
    compromisosInstitucionales: z.boolean(),
    autorizacionAntecedentes: z.boolean(),
    responsabilidadLider: z.boolean(),
    estado: z.enum(["DRAFT", "ENVIADA"]).default("DRAFT"),
  })
  .refine(
    (data) => {
      // En envío: validar 10 integrantes totales
      if (data.estado === "ENVIADA") {
        return 1 + data.integrantes.length === 10;
      }
      return true;
    },
    {
      message: "Junta debe tener exactamente 10 integrantes (1 líder + 9)",
      path: ["integrantes"],
    }
  )
  .refine(
    (data) => {
      if (data.estado === "ENVIADA") {
        const principalesIntegrantes = data.integrantes.filter(
          (i) => i.tipoIntegrante === "PRINCIPAL"
        ).length;
        const suplentesIntegrantes = data.integrantes.filter(
          (i) => i.tipoIntegrante === "SUPLENTE"
        ).length;
        const principales =
          (data.lider.tipoIntegrante === "PRINCIPAL" ? 1 : 0) +
          principalesIntegrantes;
        const suplentes =
          (data.lider.tipoIntegrante === "SUPLENTE" ? 1 : 0) +
          suplentesIntegrantes;
        return principales === 5 && suplentes === 5;
      }
      return true;
    },
    {
      message: "Junta debe tener exactamente 5 principales y 5 suplentes",
      path: ["integrantes"],
    }
  )
  .refine(
    (data) => {
      if (data.estado === "ENVIADA") {
        if (data.lider.tipoIntegrante !== "PRINCIPAL") return false;
        return data.integrantes.every((integrante, index) => {
          const tipoEsperado = index % 2 === 0 ? "SUPLENTE" : "PRINCIPAL";
          return integrante.tipoIntegrante === tipoEsperado;
        });
      }
      return true;
    },
    {
      message:
        "La secuencia para Junta debe ser: líder principal, luego suplente/principal alternados",
      path: ["integrantes"],
    }
  )
  .refine(
    (data) => {
      if (data.estado === "ENVIADA") {
        const cedulas = new Set<string>();
        cedulas.add(data.lider.cedula);
        for (const integrante of data.integrantes) {
          if (cedulas.has(integrante.cedula)) return false;
          cedulas.add(integrante.cedula);
        }
      }
      return true;
    },
    {
      message: "No pueden haber cédulas duplicadas",
      path: ["integrantes"],
    }
  )
  .refine(
    (data) => {
      if (data.estado === "ENVIADA") {
        return (
          data.compromisosInstitucionales &&
          data.autorizacionAntecedentes &&
          data.responsabilidadLider
        );
      }
      return true;
    },
    {
      message: "Todas las declaraciones deben ser aceptadas",
      path: ["compromisosInstitucionales"],
    }
  );

export type IPostulacionJunta = z.infer<typeof postulacionJuntaSchema>;

// Esquema para postulación Control Social
export const postulacionControlSchema = z
  .object({
    lider: integranteSchema,
    integrantes: z.array(integranteSchema).max(5, "Máximo 5 integrantes adicionales"),
    compromisosInstitucionales: z.boolean(),
    autorizacionAntecedentes: z.boolean(),
    responsabilidadLider: z.boolean(),
    estado: z.enum(["DRAFT", "ENVIADA"]).default("DRAFT"),
  })
  .refine(
    (data) => {
      if (data.estado === "ENVIADA") {
        return 1 + data.integrantes.length === 6;
      }
      return true;
    },
    {
      message: "Control Social debe tener exactamente 6 integrantes (1 líder + 5)",
      path: ["integrantes"],
    }
  )
  .refine(
    (data) => {
      if (data.estado === "ENVIADA") {
        const principalesIntegrantes = data.integrantes.filter(
          (i) => i.tipoIntegrante === "PRINCIPAL"
        ).length;
        const suplentesIntegrantes = data.integrantes.filter(
          (i) => i.tipoIntegrante === "SUPLENTE"
        ).length;
        const principales =
          (data.lider.tipoIntegrante === "PRINCIPAL" ? 1 : 0) +
          principalesIntegrantes;
        const suplentes =
          (data.lider.tipoIntegrante === "SUPLENTE" ? 1 : 0) +
          suplentesIntegrantes;
        return principales === 3 && suplentes === 3;
      }
      return true;
    },
    {
      message: "Control Social debe tener exactamente 3 principales y 3 suplentes",
      path: ["integrantes"],
    }
  )
  .refine(
    (data) => {
      if (data.estado === "ENVIADA") {
        const cedulas = new Set<string>();
        cedulas.add(data.lider.cedula);
        for (const integrante of data.integrantes) {
          if (cedulas.has(integrante.cedula)) return false;
          cedulas.add(integrante.cedula);
        }
      }
      return true;
    },
    {
      message: "No pueden haber cédulas duplicadas",
      path: ["integrantes"],
    }
  )
  .refine(
    (data) => {
      if (data.estado === "ENVIADA") {
        return (
          data.compromisosInstitucionales &&
          data.autorizacionAntecedentes &&
          data.responsabilidadLider
        );
      }
      return true;
    },
    {
      message: "Todas las declaraciones deben ser aceptadas",
      path: ["compromisosInstitucionales"],
    }
  );

export type IPostulacionControl = z.infer<typeof postulacionControlSchema>;

// Esquema para postulación Apelaciones
export const postulacionApelacionesSchema = z
  .object({
    lider: integranteSchema,
    integrantes: z.array(integranteSchema).max(2, "Máximo 2 integrantes adicionales"),
    compromisosInstitucionales: z.boolean(),
    autorizacionAntecedentes: z.boolean(),
    responsabilidadLider: z.boolean(),
    estado: z.enum(["DRAFT", "ENVIADA"]).default("DRAFT"),
  })
  .refine(
    (data) => {
      if (data.estado === "ENVIADA") {
        return 1 + data.integrantes.length === 3;
      }
      return true;
    },
    {
      message: "Apelaciones debe tener exactamente 3 integrantes (1 líder + 2)",
      path: ["integrantes"],
    }
  )
  .refine(
    (data) => {
      if (data.estado === "ENVIADA") {
        const cedulas = new Set<string>();
        cedulas.add(data.lider.cedula);
        for (const integrante of data.integrantes) {
          if (cedulas.has(integrante.cedula)) return false;
          cedulas.add(integrante.cedula);
        }
      }
      return true;
    },
    {
      message: "No pueden haber cédulas duplicadas",
      path: ["integrantes"],
    }
  )
  .refine(
    (data) => {
      if (data.estado === "ENVIADA") {
        return (
          data.compromisosInstitucionales &&
          data.autorizacionAntecedentes &&
          data.responsabilidadLider
        );
      }
      return true;
    },
    {
      message: "Todas las declaraciones deben ser aceptadas",
      path: ["compromisosInstitucionales"],
    }
  );

export type IPostulacionApelaciones = z.infer<typeof postulacionApelacionesSchema>;
