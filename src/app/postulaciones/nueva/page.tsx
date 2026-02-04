"use client";

import { useState, useMemo } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, AlertCircle, Save, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  postulacionJuntaSchema,
  postulacionControlSchema,
  postulacionApelacionesSchema,
  IPostulacionJunta,
  IPostulacionControl,
  IPostulacionApelaciones,
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

type PostulacionFormType = IPostulacionJunta | IPostulacionControl | IPostulacionApelaciones;

export default function NuevaPostulacionPage() {
  const [tipoPostulacion, setTipoPostulacion] = useState<TipoPostulacion | null>(null);
  const [currentStep, setCurrentStep] = useState(1); // 1: Líder, 2: Integrantes, 3: Declaraciones
  const [liderStatus, setLiderStatus] = useState<"HABIL" | "NO_REGISTRADO" | "INHABIL" | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const defaultValues: any = {
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
      compromisoFirmado: null,
      soporteFormacionAcademica: null,
      asociadoStatus: "NO_REGISTRADO",
      motivoInhabilidad: "",
    },
    integrantes: [],
    compromisosInstitucionales: false,
    autorizacionAntecedentes: false,
    responsabilidadLider: false,
    estado: "DRAFT",
  };

  const methods = useForm<any>({
    resolver: schema ? zodResolver(schema) : undefined,
    mode: "onChange",
    defaultValues,
  });

  const { handleSubmit, watch, formState: { isValid, isDirty } } = methods;

  const integrantes = watch("integrantes");
  const compromisosInstitucionales = watch("compromisosInstitucionales");
  const autorizacionAntecedentes = watch("autorizacionAntecedentes");
  const responsabilidadLider = watch("responsabilidadLider");
  const liderData = watch("lider");

  // Validar que el formulario esté completo para enviar
  const canSubmit = useMemo(() => {
    if (!config || !liderStatus || liderStatus !== "HABIL") return false;

    const totalIntegrantes = 1 + integrantes.length;
    if (totalIntegrantes !== config.maxIntegrantes + 1) return false;

    if (config.suplentesRequired) {
      const principales = integrantes.filter((i: any) => i.tipoIntegrante === "PRINCIPAL").length;
      const suplentes = integrantes.filter((i: any) => i.tipoIntegrante === "SUPLENTE").length;
      if (principales !== config.principalesRequired || suplentes !== config.suplentesRequired) {
        return false;
      }
    }

    if (!compromisosInstitucionales || !autorizacionAntecedentes || !responsabilidadLider) {
      return false;
    }

    return isValid;
  }, [config, liderStatus, integrantes, isValid, compromisosInstitucionales, autorizacionAntecedentes, responsabilidadLider]);

  const onSubmit = async (data: PostulacionFormType) => {
    try {
      setIsSubmitting(true);
      setError(null);

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
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error guardando postulación");
      }

      const result = await response.json();
      setPostulacionId(result._id);
      setSaveSuccess(true);

      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSaveDraft = async (data: PostulacionFormType) => {
    try {
      setIsSaving(true);
      setError(null);

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
        body: JSON.stringify({ ...data, estado: "DRAFT" }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error guardando borrador");
      }

      const result = await response.json();
      setPostulacionId(result._id);
      setSaveSuccess(true);

      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsSaving(false);
    }
  };

  if (!tipoPostulacion) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
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
                    if (item.step < currentStep || (item.step === 2 && liderStatus === "HABIL")) {
                      setCurrentStep(item.step);
                    }
                  }}
                  className={cn(
                    "flex items-center justify-center w-12 h-12 rounded-full font-bold transition-all",
                    currentStep === item.step
                      ? "bg-blue-600 text-white"
                      : item.step < currentStep || (item.step === 2 && liderStatus === "HABIL")
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
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
                      if (liderStatus === "HABIL") {
                        setCurrentStep(2);
                      }
                    }}
                    disabled={liderStatus !== "HABIL"}
                    className={cn(
                      "flex-1 px-6 py-3 rounded-md font-medium transition-colors",
                      liderStatus === "HABIL"
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-300 text-gray-600 cursor-not-allowed"
                    )}
                  >
                    Siguiente
                  </button>
                  <button
                    type="button"
                    onClick={() => onSaveDraft(methods.getValues())}
                    disabled={!isDirty || isSaving}
                    className="px-6 py-3 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? "Guardando..." : "Guardar borrador"}
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
                      const totalIntegrantes = 1 + integrantes.length;
                      if (totalIntegrantes === config.maxIntegrantes + 1) {
                        setCurrentStep(3);
                      } else {
                        setError(`Debes tener exactamente ${config.maxIntegrantes + 1} integrantes`);
                      }
                    }}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    Siguiente
                  </button>
                  <button
                    type="button"
                    onClick={() => onSaveDraft(methods.getValues())}
                    disabled={!isDirty || isSaving}
                    className="px-6 py-3 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? "Guardando..." : "Guardar borrador"}
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
                        <span className="font-medium">Integrantes:</span> {integrantes.length}/{config?.maxIntegrantes}
                      </p>
                      <p>
                        <span className="font-medium">Estado:</span> BORRADOR
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
                      type="button"
                      onClick={() => onSaveDraft(methods.getValues())}
                      disabled={!isDirty || isSaving}
                      className="flex-1 px-6 py-3 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {isSaving ? "Guardando..." : "Guardar borrador"}
                    </button>
                    <button
                      type="submit"
                      disabled={!canSubmit || isSubmitting}
                      className="flex-1 px-6 py-3 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4" />
                      {isSubmitting ? "Enviando..." : "Enviar postulación"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </form>
        </FormProvider>

        {/* Mensajes */}
        {saveSuccess && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-green-900">¡Guardado exitosamente!</p>
              <p className="text-sm text-green-800">Tu postulación se guardó como borrador</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-red-900">Error</p>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
