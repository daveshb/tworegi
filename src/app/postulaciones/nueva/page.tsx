"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { useForm, FormProvider } from "react-hook-form";
import type { FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, AlertCircle, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import foncorLogo from "@/assets/imagen.png";
import {
  postulacionJuntaSchema,
  postulacionControlSchema,
  postulacionApelacionesSchema,
  type IIntegrante,
} from "@/lib/validators/postulacionesSchemas";
import {
  LiderForm,
  IntegrantesForm,
  DeclarationsForm,
} from "@/components/postulaciones";

type TipoPostulacion = "JUNTA_DIRECTIVA" | "CONTROL_SOCIAL" | "APELACIONES";

interface PostulacionConfig {
  tipo: TipoPostulacion;
  nombre: string;
  descripcion: string;
  maxIntegrantes: number;
  principalesRequired: number;
  suplentesRequired?: number;
  requiereEconomia: boolean;
  requiereFormacion: boolean;
}

const POSTULACIONES: Record<TipoPostulacion, PostulacionConfig> = {
  JUNTA_DIRECTIVA: {
    tipo: "JUNTA_DIRECTIVA",
    nombre: "Junta Directiva",
    descripcion: "10 integrantes: 5 principales y 5 suplentes",
    maxIntegrantes: 9, // Más el líder = 10
    principalesRequired: 5,
    suplentesRequired: 5,
    requiereEconomia: true,
    requiereFormacion: true,
  },
  CONTROL_SOCIAL: {
    tipo: "CONTROL_SOCIAL",
    nombre: "Control Social",
    descripcion: "6 integrantes: 3 principales y 3 suplentes",
    maxIntegrantes: 5, // Más el líder = 6
    principalesRequired: 3,
    suplentesRequired: 3,
    requiereEconomia: true,
    requiereFormacion: false,
  },
  APELACIONES: {
    tipo: "APELACIONES",
    nombre: "Comité de Apelaciones",
    descripcion: "3 integrantes (miembros)",
    maxIntegrantes: 2, // Más el líder = 3
    principalesRequired: 0,
    requiereEconomia: false,
    requiereFormacion: false,
  },
};

export default function NuevaPostulacionPage() {
  const [tipoPostulacion, setTipoPostulacion] = useState<TipoPostulacion | null>(null);
  const [currentStep, setCurrentStep] = useState(1); // 1: Líder, 2: Integrantes, 3: Declaraciones
  const [liderStatus, setLiderStatus] = useState<"HABIL" | "NO_REGISTRADO" | "INHABIL" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [postulacionId, setPostulacionId] = useState<string | null>(null);

  const config = tipoPostulacion ? POSTULACIONES[tipoPostulacion] : null;

  // Seleccionar el schema correcto
  const schema = useMemo(() => {
    if (!tipoPostulacion) return null;
    switch (tipoPostulacion) {
      case "JUNTA_DIRECTIVA":
        return postulacionJuntaSchema;
      case "CONTROL_SOCIAL":
        return postulacionControlSchema;
      case "APELACIONES":
        return postulacionApelacionesSchema;
    }
  }, [tipoPostulacion]);

  const defaultValues = {
    lider: {
      cedula: "",
      nombreCompleto: "",
      cargoEmpresa: "",
      sedeTrabajo: "",
      celular: "",
      correo: "",
      tipoIntegrante: tipoPostulacion === "APELACIONES" ? "MIEMBRO" : "PRINCIPAL",
      adjuntoCedula: null,
      certificadoEconomiaSolidaria: null,
      soporteFormacionAcademica: null,
      asociadoStatus: null,
      motivoInhabilidad: "",
    },
    integrantes: [],
    compromisosInstitucionales: undefined,
    autorizacionAntecedentes: undefined,
    responsabilidadLider: undefined,
    estado: "DRAFT",
  };

  const methods = useForm({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: schema ? zodResolver(schema as any) : undefined,
    mode: "onChange",
    defaultValues,
  });

  const { handleSubmit, watch, getValues } = methods;

  const integrantes = watch("integrantes");
  const compromisosInstitucionales = watch("compromisosInstitucionales");
  const autorizacionAntecedentes = watch("autorizacionAntecedentes");
  const responsabilidadLider = watch("responsabilidadLider");
  const liderData = watch("lider");

  const esSecuenciaJuntaValida = (integrantesActuales: IIntegrante[]) =>
    integrantesActuales.every((integrante, index) => {
      const tipoEsperado = index % 2 === 0 ? "SUPLENTE" : "PRINCIPAL";
      return integrante.tipoIntegrante === tipoEsperado;
    });

  const hasUploadedFile = (value: unknown) => {
    if (!value || typeof value !== "object") return false;
    const file = value as Record<string, unknown>;
    return Boolean(file.url) && Boolean(file.public_id);
  };

  // Validar si el líder está habilitado (validado en cédula)
  const isLiderHabil = useMemo(() => {
    return liderStatus === "HABIL" || liderData?.asociadoStatus === "HABIL";
  }, [liderStatus, liderData?.asociadoStatus]);

  const submitBlockers = useMemo(() => {
    const blockers: string[] = [];
    if (!config) {
      blockers.push("Selecciona un tipo de postulación");
      return blockers;
    }

    const requiereEconomia = config.requiereEconomia;
    const requiereFormacion = config.requiereFormacion;

    const estadoLider = liderData?.asociadoStatus || liderStatus;
    if (estadoLider && estadoLider !== "HABIL") {
      blockers.push("La cédula del líder debe estar habilitada");
    }

    if (!liderData?.nombreCompleto) blockers.push("Líder: falta Nombre Completo");
    if (!liderData?.cargoEmpresa) blockers.push("Líder: falta Cargo en la Empresa");
    if (!liderData?.sedeTrabajo) blockers.push("Líder: falta Sede de Trabajo");
    if (!liderData?.celular) blockers.push("Líder: falta Celular");
    if (!liderData?.correo) blockers.push("Líder: falta Correo");
    if (!hasUploadedFile(liderData?.adjuntoCedula)) {
      blockers.push("Líder: falta cedulaPDF");
    }
    if (requiereEconomia && !hasUploadedFile(liderData?.certificadoEconomiaSolidaria)) {
      blockers.push("Líder: falta Certificado Economía Solidaria (PDF)");
    }
    if (requiereFormacion && !hasUploadedFile(liderData?.soporteFormacionAcademica)) {
      blockers.push("Líder: falta Soporte Formación Académica (PDF)");
    }

    const totalIntegrantes = 1 + integrantes.length;
    const totalEsperado = config.maxIntegrantes + 1;
    if (totalIntegrantes !== totalEsperado) {
      blockers.push(`Debe haber exactamente ${totalEsperado} integrantes (actual: ${totalIntegrantes})`);
    }

    if (config.suplentesRequired) {
      const principalesIntegrantes = integrantes.filter(
        (i: IIntegrante) => i.tipoIntegrante === "PRINCIPAL"
      ).length;
      const suplentesIntegrantes = integrantes.filter(
        (i: IIntegrante) => i.tipoIntegrante === "SUPLENTE"
      ).length;
      const principales =
        (liderData.tipoIntegrante === "PRINCIPAL" ? 1 : 0) +
        principalesIntegrantes;
      const suplentes =
        (liderData.tipoIntegrante === "SUPLENTE" ? 1 : 0) +
        suplentesIntegrantes;
      if (principales !== config.principalesRequired || suplentes !== config.suplentesRequired) {
        blockers.push(`La distribución debe ser ${config.principalesRequired} principales y ${config.suplentesRequired} suplentes`);
      }
    }

    if (config.suplentesRequired) {
      if (liderData.tipoIntegrante !== "PRINCIPAL") blockers.push("El líder debe ser principal");
      if (!esSecuenciaJuntaValida(integrantes as IIntegrante[])) {
        blockers.push("La secuencia debe alternar suplente/principal");
      }
    }

    const integrantesIncompletos: number[] = [];
    (integrantes as IIntegrante[]).forEach((integrante, idx) => {
      const baseCompleto =
        Boolean(integrante?.cedula) &&
        Boolean(integrante?.nombreCompleto) &&
        Boolean(integrante?.cargoEmpresa) &&
        Boolean(integrante?.sedeTrabajo) &&
        Boolean(integrante?.celular) &&
        Boolean(integrante?.correo) &&
        hasUploadedFile(integrante?.adjuntoCedula);

      const economiaCompleta = !requiereEconomia || hasUploadedFile(integrante?.certificadoEconomiaSolidaria);
      const formacionCompleta = !requiereFormacion || hasUploadedFile(integrante?.soporteFormacionAcademica);

      if (!baseCompleto || !economiaCompleta || !formacionCompleta) {
        integrantesIncompletos.push(idx + 2);
      }
    });
    if (integrantesIncompletos.length > 0) {
      blockers.push(`Faltan datos/documentos en integrante(s): ${integrantesIncompletos.join(", ")}`);
    }

    if (!compromisosInstitucionales) blockers.push("Acepta la declaración de compromisos institucionales");
    if (!autorizacionAntecedentes) blockers.push("Acepta la declaración de autorización de antecedentes");
    if (!responsabilidadLider) blockers.push("Acepta la declaración de responsabilidad del líder");

    return blockers;
  }, [
    config,
    integrantes,
    compromisosInstitucionales,
    autorizacionAntecedentes,
    responsabilidadLider,
    liderStatus,
    liderData,
  ]);

  const canSubmit = submitBlockers.length === 0;

  useEffect(() => {
    if (!config || !error) return;

    const expectedTotal = config.maxIntegrantes + 1;
    const totalActual = 1 + integrantes.length;
    const expectedMessage = `Debes tener exactamente ${expectedTotal} integrantes`;

    if (error === expectedMessage && totalActual === expectedTotal) {
      setError(null);
    }
  }, [config, error, integrantes.length]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    if (isSubmitting || isRedirecting) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const normalizeAdjunto = (adjunto: unknown) => {
        if (!adjunto || typeof adjunto !== "object") return adjunto;
        const file = adjunto as Record<string, unknown>;

        const extensionFromName =
          typeof file.original_filename === "string" && file.original_filename.includes(".")
            ? file.original_filename.split(".").pop()?.toLowerCase()
            : undefined;
        const extensionFromPublicId =
          typeof file.public_id === "string" && file.public_id.includes(".")
            ? file.public_id.split(".").pop()?.toLowerCase()
            : undefined;
        const extensionFromUrl =
          typeof file.url === "string" && file.url.includes(".")
            ? file.url.split(".").pop()?.split("?")[0]?.toLowerCase()
            : undefined;

        return {
          ...file,
          format:
            file.format ||
            extensionFromName ||
            extensionFromPublicId ||
            extensionFromUrl ||
            "pdf",
        };
      };

      const payload = {
        ...data,
        estado: "ENVIADA",
        lider: {
          ...data.lider,
          adjuntoCedula: normalizeAdjunto(data?.lider?.adjuntoCedula),
          certificadoEconomiaSolidaria: normalizeAdjunto(data?.lider?.certificadoEconomiaSolidaria),
          soporteFormacionAcademica: normalizeAdjunto(data?.lider?.soporteFormacionAcademica),
        },
        integrantes: Array.isArray(data.integrantes)
          ? (data.integrantes as Array<Record<string, unknown>>).map((integrante) => ({
              ...integrante,
              adjuntoCedula: normalizeAdjunto(integrante?.adjuntoCedula),
              certificadoEconomiaSolidaria: normalizeAdjunto(integrante?.certificadoEconomiaSolidaria),
              soporteFormacionAcademica: normalizeAdjunto(integrante?.soporteFormacionAcademica),
            }))
          : [],
      };

      // Determinar endpoint según tipo
      const endpoint = `
        /api/postulaciones/${
          tipoPostulacion === "JUNTA_DIRECTIVA"
            ? "junta-directiva"
            : tipoPostulacion === "CONTROL_SOCIAL"
            ? "control-social"
            : "comite-apelaciones"
        }${postulacionId ? `/${postulacionId}` : ""}
      `.trim();

      const method = postulacionId ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorMessage = "Error guardando postulación";
        const contentType = response.headers.get("content-type") || "";

        if (contentType.includes("application/json")) {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } else {
          const rawError = await response.text();
          if (rawError.includes("<!DOCTYPE")) {
            errorMessage = "Error interno del servidor al guardar la postulación";
          } else if (rawError.trim()) {
            errorMessage = rawError;
          }
        }

        throw new Error(errorMessage);
      }

      const result = await response.json();
      setPostulacionId(result._id);
      setError(null);
      setMissingFields([]);
      setSaveSuccess(true);
      setIsRedirecting(true);

      setTimeout(() => {
        setTipoPostulacion(null);
        setCurrentStep(1);
        setLiderStatus(null);
        setPostulacionId(null);
        setMissingFields([]);
        setError(null);
        setSaveSuccess(false);
        setIsRedirecting(false);
        methods.reset(defaultValues);
      }, 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onInvalidSubmit = (invalidErrors: FieldErrors) => {
    const data = getValues() as Record<string, unknown>;
    const faltantes: string[] = [];

    const pushIfMissing = (condition: boolean, label: string) => {
      if (condition) faltantes.push(label);
    };

    const lider = (data.lider as Record<string, unknown>) || {};

    const liderCedulaNumero = typeof lider.cedula === "string" ? lider.cedula.trim() : "";

    pushIfMissing(!liderCedulaNumero, "Líder: Cédula (número)");
    pushIfMissing(!lider.nombreCompleto, "Líder: Nombre Completo");
    pushIfMissing(!lider.cargoEmpresa, "Líder: Cargo en la Empresa");
    pushIfMissing(!lider.sedeTrabajo, "Líder: Sede de Trabajo");
    pushIfMissing(!lider.celular, "Líder: Celular");
    pushIfMissing(!lider.correo, "Líder: Correo");
    pushIfMissing(!hasUploadedFile(lider.adjuntoCedula), "Líder: cedulaPDF (archivo Cédula PDF)");

    if (config?.requiereEconomia) {
      pushIfMissing(!hasUploadedFile(lider.certificadoEconomiaSolidaria), "Líder: Certificado Economía Solidaria (PDF)");
    }
    if (config?.requiereFormacion) {
      pushIfMissing(!hasUploadedFile(lider.soporteFormacionAcademica), "Líder: Soporte Formación Académica (PDF)");
    }

    const integrantesActuales = Array.isArray(data.integrantes)
      ? (data.integrantes as Array<Record<string, unknown>>)
      : [];
    integrantesActuales.forEach((integrante, index: number) => {
      const n = index + 2;
      const cedulaNumero = typeof integrante?.cedula === "string" ? integrante.cedula.trim() : "";
      pushIfMissing(!cedulaNumero, `Integrante ${n}: Cédula (número)`);
      pushIfMissing(!integrante?.nombreCompleto, `Integrante ${n}: Nombre Completo`);
      pushIfMissing(!integrante?.cargoEmpresa, `Integrante ${n}: Cargo en la Empresa`);
      pushIfMissing(!integrante?.sedeTrabajo, `Integrante ${n}: Sede de Trabajo`);
      pushIfMissing(!integrante?.celular, `Integrante ${n}: Celular`);
      pushIfMissing(!integrante?.correo, `Integrante ${n}: Correo`);
      pushIfMissing(!hasUploadedFile(integrante?.adjuntoCedula), `Integrante ${n}: cedulaPDF (archivo Cédula PDF)`);

      if (config?.requiereEconomia) {
        pushIfMissing(!hasUploadedFile(integrante?.certificadoEconomiaSolidaria), `Integrante ${n}: Certificado Economía Solidaria (PDF)`);
      }
      if (config?.requiereFormacion) {
        pushIfMissing(!hasUploadedFile(integrante?.soporteFormacionAcademica), `Integrante ${n}: Soporte Formación Académica (PDF)`);
      }
    });

    pushIfMissing(!data.compromisosInstitucionales, "Declaración: Compromisos institucionales (Sí)");
    pushIfMissing(!data.autorizacionAntecedentes, "Declaración: Autorización de antecedentes (Sí)");
    pushIfMissing(!data.responsabilidadLider, "Declaración: Responsabilidad del líder (Sí)");

    const totalEsperado = (config?.maxIntegrantes ?? 0) + 1;
    const totalActual = 1 + integrantesActuales.length;
    if (config && totalActual !== totalEsperado) {
      faltantes.unshift(`Cantidad de integrantes: ${totalActual}/${totalEsperado}`);
    }

    const flattenErrors = (
      errors: Record<string, unknown>,
      parentPath = ""
    ): string[] => {
      const items: string[] = [];

      Object.entries(errors).forEach(([key, value]) => {
        const currentPath = parentPath ? `${parentPath}.${key}` : key;

        if (!value || typeof value !== "object") return;

        const entry = value as Record<string, unknown>;
        const message = entry.message;
        if (typeof message === "string" && message.trim()) {
          items.push(`${currentPath}: ${message}`);
        }

        const nested = Object.fromEntries(
          Object.entries(entry).filter(([nestedKey, nestedValue]) => {
            return nestedKey !== "message" && nestedValue && typeof nestedValue === "object";
          })
        );

        if (Object.keys(nested).length > 0) {
          items.push(...flattenErrors(nested, currentPath));
        }
      });

      return items;
    };

    const erroresValidador = flattenErrors(invalidErrors as Record<string, unknown>);
    if (faltantes.length === 0 && erroresValidador.length > 0) {
      faltantes.push(...erroresValidador);
    }
    if (faltantes.length === 0) {
      faltantes.push("Revisa los campos en rojo del formulario.");
    }

    setMissingFields(faltantes);
    const firstMissing = faltantes[0] || "";
    if (firstMissing.startsWith("Líder:")) setCurrentStep(1);
    else if (firstMissing.startsWith("Integrante") || firstMissing.startsWith("Cantidad de integrantes")) setCurrentStep(2);
    else setCurrentStep(3);

    setError("Hay campos pendientes o inválidos. Completa los campos marcados abajo.");
    setSaveSuccess(false);
  };

  if (!tipoPostulacion) {
    return (
      <div className="min-h-screen bg-linear-to-b from-blue-50 to-white">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <Image
              src={foncorLogo}
              alt="Logo Foncor"
              className="h-20 w-auto mx-auto mb-6"
              priority
            />
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Nueva Postulación
            </h1>
            <p className="text-gray-600 text-lg">
              Selecciona el tipo de plancha a postular
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {Object.values(POSTULACIONES).map((config) => (
              <button
                key={config.tipo}
                onClick={() => setTipoPostulacion(config.tipo)}
                className={cn(
                  "p-6 rounded-lg border-2 transition-all text-left",
                  "hover:shadow-lg hover:border-blue-500",
                  "border-gray-200 bg-white"
                )}
              >
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {config.nombre}
                </h3>
                <p className="text-gray-600 text-sm mb-4">{config.descripcion}</p>
                <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  {config.maxIntegrantes + 1} integrantes totales
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Image
            src={foncorLogo}
            alt="Logo Foncor"
            className="h-16 w-auto mb-4"
            priority
          />
          <button
            onClick={() => {
              setTipoPostulacion(null);
              setCurrentStep(1);
              setLiderStatus(null);
              methods.reset(defaultValues);
            }}
            className="text-blue-600 hover:text-blue-700 text-sm mb-4"
          >
            ← Volver al selector
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Postulación: {config?.nombre}
          </h1>
          <p className="text-gray-600">{config?.descripcion}</p>
        </div>

        {/* Pasos */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-8">
            {[
              { step: 1, label: "Líder" },
              { step: 2, label: "Integrantes" },
              { step: 3, label: "Declaraciones" },
            ].map((item, i) => (
              <div key={item.step} className="flex items-center flex-1">
                <button
                  onClick={() => {
                    if (item.step < currentStep || (item.step === 2 && isLiderHabil)) {
                      setCurrentStep(item.step);
                    }
                  }}
                  className={cn(
                    "flex items-center justify-center w-12 h-12 rounded-full font-bold transition-all",
                    currentStep === item.step
                      ? "bg-blue-600 text-white"
                      : item.step < currentStep || (item.step === 2 && isLiderHabil)
                      ? "bg-green-600 text-white cursor-pointer"
                      : "bg-gray-300 text-gray-600"
                  )}
                >
                  {item.step < currentStep ? <CheckCircle className="w-5 h-5" /> : item.step}
                </button>
                <span className="ml-2 text-sm font-medium text-gray-700">
                  {item.label}
                </span>
                {i < 2 && (
                  <div className={cn(
                    "flex-1 h-1 mx-4",
                    i < currentStep - 1 ? "bg-green-600" : "bg-gray-300"
                  )} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Formulario */}
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit, onInvalidSubmit)} className="space-y-8">
            {/* Paso 1: Líder */}
            {currentStep === 1 && (
              <div className="bg-white rounded-lg shadow p-8">
                <LiderForm
                  tipoPostulacion={tipoPostulacion}
                  onLiderValidated={(status) => setLiderStatus(status)}
                />

                <div className="mt-8 flex gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      if (isLiderHabil) {
                        setCurrentStep(2);
                      }
                    }}
                    disabled={!isLiderHabil}
                    className={cn(
                      "flex-1 px-6 py-3 rounded-md font-medium transition-colors",
                      isLiderHabil
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-300 text-gray-600 cursor-not-allowed"
                    )}
                    title={!isLiderHabil ? "Valida la cédula del líder para continuar" : ""}
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}

            {/* Paso 2: Integrantes */}
            {currentStep === 2 && config && (
              <div className="bg-white rounded-lg shadow p-8">
                <IntegrantesForm
                  tipoPostulacion={tipoPostulacion as TipoPostulacion}
                  maxIntegrantes={config.maxIntegrantes}
                  mainFieldName="integrantes"
                />

                <div className="mt-8 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Anterior
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      const totalIntegrantes = 1 + integrantes.length;
                      if (totalIntegrantes === config.maxIntegrantes + 1) {
                        if (config.suplentesRequired && !esSecuenciaJuntaValida(integrantes as IIntegrante[])) {
                          setError(
                            "La secuencia debe ser: líder principal, luego suplente/principal alternados"
                          );
                          return;
                        }
                        setError(null);
                        setCurrentStep(3);
                      } else {
                        setError(`Debes tener exactamente ${config.maxIntegrantes + 1} integrantes`);
                      }
                    }}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}

            {/* Paso 3: Declaraciones */}
            {currentStep === 3 && (
              <div className="space-y-8">
                <div className="bg-white rounded-lg shadow p-8">
                  <DeclarationsForm />
                </div>

                <div className="bg-white rounded-lg shadow p-8">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Resumen de la Postulación
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="font-medium">Tipo:</span> {config?.nombre}
                      </p>
                      <p>
                        <span className="font-medium">Líder:</span> {liderData.nombreCompleto || "(pendiente)"}
                      </p>
                      <p>
                        <span className="font-medium">Integrantes totales:</span> {1 + integrantes.length}/{(config?.maxIntegrantes ?? 0) + 1}
                      </p>
                      <p>
                        <span className="font-medium">Estado:</span> LISTA PARA GUARDAR
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 flex gap-4">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="flex-1 px-6 py-3 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Anterior
                    </button>
                    <button
                      type="submit"
                      disabled={!canSubmit || isSubmitting || isRedirecting}
                      className="flex-1 px-6 py-3 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="w-4 h-4" />
                      {isSubmitting
                        ? "Guardando..."
                        : isRedirecting
                        ? "Redirigiendo..."
                        : "Guardar"}
                    </button>
                  </div>

                  {!canSubmit && (
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-sm font-medium text-yellow-900 mb-2">Para habilitar Guardar, falta:</p>
                      <ul className="list-disc pl-5 text-sm text-yellow-800 space-y-1">
                        {submitBlockers.slice(0, 8).map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </form>
        </FormProvider>

        {/* Mensajes */}
        {saveSuccess && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-green-900">¡Guardado exitosamente!</p>
              <p className="text-sm text-green-800">Tu postulación fue guardada correctamente</p>
              <p className="text-sm text-green-800">Serás redirigido al inicio en 5 segundos...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-red-900">Error</p>
              <p className="text-sm text-red-800">{error}</p>
              {missingFields.length > 0 && (
                <ul className="mt-2 list-disc pl-5 text-sm text-red-800 space-y-1">
                  {missingFields.slice(0, 12).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
