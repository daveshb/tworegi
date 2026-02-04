"use client";

import { useFieldArray, useFormContext, Controller } from "react-hook-form";
import { Trash2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { FileUpload } from "./file-upload";
import { CedulaValidation } from "./cedula-validation";

interface IntegrantFormProps {
  tipoPostulacion: "JUNTA_DIRECTIVA" | "CONTROL_SOCIAL" | "APELACIONES";
  maxIntegrantes: number;
  mainFieldName: "integrantes";
}

export function IntegrantesForm({ tipoPostulacion, maxIntegrantes }: IntegrantFormProps) {
  const { control, watch, formState: { errors } } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "integrantes",
  });

  const integrantes = watch("integrantes");

  const canAddMore = integrantes.length < maxIntegrantes;

  const requiereEconomia = tipoPostulacion !== "APELACIONES";
  const requiereFormacion = tipoPostulacion === "JUNTA_DIRECTIVA";

  const handleAddIntegrante = () => {
    if (canAddMore) {
      append({
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
      });
    }
  };

  const getTipoOptions = () => {
    if (tipoPostulacion === "APELACIONES") {
      return [{ value: "MIEMBRO", label: "Miembro" }];
    }
    return [
      { value: "PRINCIPAL", label: "Principal" },
      { value: "SUPLENTE", label: "Suplente" },
    ];
  };

  const tipoOptions = getTipoOptions();

  const getRequiredFiles = (tipo: string) => {
    const files = ["adjuntoCedula"];
    
    if (requiereEconomia) {
      files.push("certificadoEconomiaSolidaria", "compromisoFirmado");
    }
    
    if (requiereFormacion) {
      files.push("soporteFormacionAcademica");
    }
    
    return files;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">
          Integrantes {fields.length}/{maxIntegrantes}
        </h3>
        <button
          type="button"
          onClick={handleAddIntegrante}
          disabled={!canAddMore}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
            canAddMore
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          )}
        >
          <Plus className="w-4 h-4" />
          Agregar integrante
        </button>
      </div>

      {fields.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-8">
          Haz clic en "Agregar integrante" para comenzar
        </p>
      )}

      {fields.map((field, index) => {
        const fieldError = (errors.integrantes as any)?.[index];
        const integranteStatus = integrantes?.[index]?.asociadoStatus;
        const isHabil = integranteStatus === "HABIL";

        return (
          <div
            key={field.id}
            className="p-6 border border-gray-200 rounded-lg bg-gray-50"
          >
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-base font-medium text-gray-900">
                Integrante {index + 1}
              </h4>
              <button
                type="button"
                onClick={() => remove(index)}
                className="text-red-600 hover:text-red-700 transition-colors"
                aria-label="Eliminar integrante"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Validación de Cédula */}
              <div>
                <CedulaValidation 
                  fieldName={`integrantes.${index}.cedula`}
                  parentField={`integrantes.${index}`}
                  onCedulaValidated={(cedula, status) => {
                    // Actualizar estado de validación en el formulario
                    const field = integrantes[index];
                    if (field) {
                      field.asociadoStatus = status;
                    }
                  }}
                />
              </div>

              {/* Mostrar campos solo si está habilitado */}
              {isHabil && (
                <>
                  {/* Nombre Completo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre Completo<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Nombre completo"
                      {...control.register(`integrantes.${index}.nombreCompleto` as const, {
                        required: "Nombre es requerido",
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                      aria-describedby={fieldError?.nombreCompleto ? `integrantes-${index}-nombre-error` : undefined}
                    />
                    {fieldError?.nombreCompleto && (
                      <p id={`integrantes-${index}-nombre-error`} className="text-sm text-red-600 mt-1">
                        {fieldError.nombreCompleto.message}
                      </p>
                    )}
                  </div>

                  {/* Cargo Empresa */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cargo en la Empresa<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Gerente, Analista"
                      {...control.register(`integrantes.${index}.cargoEmpresa` as const, {
                        required: "Cargo es requerido",
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Sede Trabajo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sede de Trabajo<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Bogotá, Medellín, etc"
                      {...control.register(`integrantes.${index}.sedeTrabajo` as const, {
                        required: "Sede es requerida",
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Celular */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Celular<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="3001234567"
                      {...control.register(`integrantes.${index}.celular` as const, {
                        required: "Celular es requerido",
                        pattern: {
                          value: /^\d{7,20}$/,
                          message: "Celular debe contener solo números",
                        },
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Correo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Correo<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="correo@ejemplo.com"
                      {...control.register(`integrantes.${index}.correo` as const, {
                        required: "Correo es requerido",
                        pattern: {
                          value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                          message: "Correo inválido",
                        },
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Tipo Integrante */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rol<span className="text-red-500">*</span>
                    </label>
                    <select
                      {...control.register(`integrantes.${index}.tipoIntegrante` as const, {
                        required: "Tipo es requerido",
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Seleccionar...</option>
                      {tipoOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Archivos */}
                  <div className="pt-4 border-t border-gray-200 space-y-4">
                    <h5 className="text-sm font-medium text-gray-900">Documentos</h5>

                    <FileUpload
                      name={`integrantes.${index}.adjuntoCedula` as any}
                      label="Cédula (PDF)"
                      accept="application/pdf"
                      resourceType="raw"
                      required
                      helpText="Documento máximo 10MB"
                    />

                    {requiereEconomia && (
                      <>
                        <div className="text-sm text-gray-600 font-medium">
                          Selecciona uno de los siguientes:
                        </div>
                        <FileUpload
                          name={`integrantes.${index}.certificadoEconomiaSolidaria` as any}
                          label="Certificado Economía Solidaria (PDF)"
                          accept="application/pdf"
                          resourceType="raw"
                          helpText="Documento máximo 10MB"
                        />

                        <FileUpload
                          name={`integrantes.${index}.compromisoFirmado` as any}
                          label="Compromiso Firmado (PDF)"
                          accept="application/pdf"
                          resourceType="raw"
                          helpText="Documento máximo 10MB"
                        />
                      </>
                    )}

                    {requiereFormacion && (
                      <FileUpload
                        name={`integrantes.${index}.soporteFormacionAcademica` as any}
                        label="Soporte Formación Académica (PDF)"
                        accept="application/pdf"
                        resourceType="raw"
                        required
                        helpText="Documento máximo 10MB"
                      />
                    )}
                  </div>
                </>
              )}

              {integranteStatus === "NO_REGISTRADO" && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">
                    Esta cédula no está registrada. Valida otra cédula.
                  </p>
                </div>
              )}

              {integranteStatus === "INHABIL" && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800">
                    Esta cédula no es elegible para participar.
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
