"use client";

import { useEffect } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
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
  const { control, watch, setValue, formState: { errors } } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "integrantes",
  });

  const integrantes = watch("integrantes");
  const lider = watch("lider");

  const canAddMore = integrantes.length < maxIntegrantes;

  const requiereEconomia = tipoPostulacion !== "APELACIONES";
  const requiereFormacion = tipoPostulacion === "JUNTA_DIRECTIVA";
  const esJuntaDirectiva = tipoPostulacion === "JUNTA_DIRECTIVA";
  const usaSecuenciaSuplentes =
    tipoPostulacion === "JUNTA_DIRECTIVA" || tipoPostulacion === "CONTROL_SOCIAL";

  const hasUploadedFile = (value: unknown) => {
    if (!value || typeof value !== "object") return false;
    const file = value as Record<string, unknown>;
    return Boolean(file.url) && Boolean(file.public_id);
  };

  const getTipoIntegranteAutomatico = (index: number) => {
    // En Junta y Control: posición 1 es líder (principal), la posición 2 inicia en suplente y alterna.
    if (usaSecuenciaSuplentes) {
      return index % 2 === 0 ? "SUPLENTE" : "PRINCIPAL";
    }
    if (tipoPostulacion === "APELACIONES") {
      return "MIEMBRO";
    }
    return "PRINCIPAL";
  };

  const getTituloIntegrante = (index: number) => {
    const numeroIntegrante = index + 2;
    if (!usaSecuenciaSuplentes) return `Integrante ${numeroIntegrante}`;

    const tipo = getTipoIntegranteAutomatico(index);
    if (tipo === "SUPLENTE") {
      return `Integrante ${numeroIntegrante} (Suplente integrante ${numeroIntegrante - 1})`;
    }

    return `Integrante ${numeroIntegrante} (Principal)`;
  };

  const handleAddIntegrante = () => {
    if (canAddMore) {
      const nextIndex = fields.length;
      append({
        cedula: "",
        nombreCompleto: "",
        cargoEmpresa: "",
        sedeTrabajo: "",
        celular: "",
        correo: "",
        tipoIntegrante: getTipoIntegranteAutomatico(nextIndex),
        adjuntoCedula: null,
        certificadoEconomiaSolidaria: null,
        soporteFormacionAcademica: null,
        asociadoStatus: null,
        motivoInhabilidad: "",
      });
    }
  };

  useEffect(() => {
    if (!usaSecuenciaSuplentes) return;

    integrantes.forEach((_: unknown, index: number) => {
      const tipoEsperado = index % 2 === 0 ? "SUPLENTE" : "PRINCIPAL";
      setValue(`integrantes.${index}.tipoIntegrante`, tipoEsperado, {
        shouldDirty: true,
      });
    });
  }, [integrantes, usaSecuenciaSuplentes, setValue]);

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

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">
        Integrantes {1 + fields.length}/{maxIntegrantes + 1}
      </h3>

      {fields.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-8">
          Haz clic en Agregar integrante para comenzar
        </p>
      )}

      {usaSecuenciaSuplentes && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800">
          Secuencia automática: #1 líder (principal), #2 suplente, #3 principal, #4 suplente...
        </div>
      )}

      <div className="p-4 border border-green-200 rounded-lg bg-green-50">
        <h4 className="text-base font-semibold text-green-900 mb-2">
          Integrante 1 (Líder - {tipoPostulacion === "APELACIONES" ? "Miembro" : "Principal"})
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-green-900 mb-1">
              Cédula<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={lider?.cedula || ""}
              readOnly
              className="w-full px-3 py-2 border border-green-300 rounded-md text-sm bg-green-100 text-green-900 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-green-900 mb-1">
              Nombre Completo<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={lider?.nombreCompleto || ""}
              readOnly
              className="w-full px-3 py-2 border border-green-300 rounded-md text-sm bg-green-100 text-green-900 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-green-900 mb-1">
              Cargo en la Empresa<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Ej: Gerente, Analista"
              {...control.register("lider.cargoEmpresa" as const, {
                required: "Cargo es requerido",
              })}
              className="w-full px-3 py-2 border border-green-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-green-900 mb-1">
              Sede de Trabajo<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Bogotá, Medellín, etc"
              {...control.register("lider.sedeTrabajo" as const, {
                required: "Sede es requerida",
              })}
              className="w-full px-3 py-2 border border-green-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-green-900 mb-1">
              Celular<span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              placeholder="3001234567"
              {...control.register("lider.celular" as const, {
                required: "Celular es requerido",
                pattern: {
                  value: /^\d{7,20}$/,
                  message: "Celular debe contener solo números",
                },
              })}
              className="w-full px-3 py-2 border border-green-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-green-900 mb-1">
              Correo<span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              placeholder="correo@ejemplo.com"
              {...control.register("lider.correo" as const, {
                required: "Correo es requerido",
                pattern: {
                  value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                  message: "Correo inválido",
                },
              })}
              className="w-full px-3 py-2 border border-green-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-green-200 space-y-4">
          <h5 className="text-sm font-semibold text-green-900">Documentos del Líder</h5>

          <FileUpload
            name={"lider.adjuntoCedula" as never}
            label="Cédula del Líder (PDF)"
            accept="application/pdf"
            resourceType="raw"
            required
            helpText="Documento máximo 10MB"
          />

          {requiereEconomia && (
            <>
              <FileUpload
                name={"lider.certificadoEconomiaSolidaria" as never}
                label="Certificado Economía Solidaria (PDF)"
                accept="application/pdf"
                resourceType="raw"
                helpText="Documento máximo 10MB"
              />
            </>
          )}

          {requiereFormacion && (
            <FileUpload
              name={"lider.soporteFormacionAcademica" as never}
              label="Soporte Formación Académica (PDF)"
              accept="application/pdf"
              resourceType="raw"
              required
              helpText="Documento máximo 10MB"
            />
          )}
        </div>
      </div>

      {fields.map((field, index) => {
        const fieldError = (
          errors.integrantes as
            | Array<Record<string, { message?: string }>>
            | undefined
        )?.[index];
        const integranteStatus = integrantes?.[index]?.asociadoStatus;
        const isHabil = integranteStatus === "HABIL";
        const integranteData = integrantes?.[index] as Record<string, unknown> | undefined;
        const camposFaltantes: string[] = [];

        if (isHabil) {
          if (!integranteData?.nombreCompleto) camposFaltantes.push("Nombre Completo");
          if (!integranteData?.cargoEmpresa) camposFaltantes.push("Cargo en la Empresa");
          if (!integranteData?.sedeTrabajo) camposFaltantes.push("Sede de Trabajo");
          if (!integranteData?.celular) camposFaltantes.push("Celular");
          if (!integranteData?.correo) camposFaltantes.push("Correo");
          if (!hasUploadedFile(integranteData?.adjuntoCedula)) {
            camposFaltantes.push("cedulaPDF (Cédula PDF)");
          }
          if (requiereEconomia && !hasUploadedFile(integranteData?.certificadoEconomiaSolidaria)) {
            camposFaltantes.push("Certificado Economía Solidaria");
          }
          if (requiereFormacion && !hasUploadedFile(integranteData?.soporteFormacionAcademica)) {
            camposFaltantes.push("Soporte Formación Académica");
          }
        }

        return (
          <div
            key={field.id}
            className="p-6 border border-gray-200 rounded-lg bg-gray-50"
          >
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-base font-medium text-gray-900">
                {getTituloIntegrante(index)}
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
                    setValue(`integrantes.${index}.asociadoStatus`, status, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                  }}
                />
              </div>

              {/* Mostrar campos solo si está habilitado */}
              {isHabil && (
                <>
                  {camposFaltantes.length > 0 && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <div className="text-yellow-700 mt-0.5">
                          <p className="font-medium text-sm">Campos faltantes por completar:</p>
                          <ul className="mt-2 space-y-1">
                            {camposFaltantes.map((campo) => (
                              <li key={campo} className="text-sm flex items-center gap-2">
                                <span className="text-yellow-600">•</span> {campo}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Nombre Completo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre Completo<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Nombre desde base de datos"
                      {...control.register(`integrantes.${index}.nombreCompleto` as const, {
                        required: "Nombre es requerido",
                      })}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-100 text-gray-700 cursor-not-allowed"
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
                    {usaSecuenciaSuplentes ? (
                      <input
                        type="text"
                        value={getTipoIntegranteAutomatico(index) === "SUPLENTE" ? "Suplente" : "Principal"}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-100 text-gray-700 cursor-not-allowed"
                      />
                    ) : (
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
                    )}
                  </div>

                  {/* Archivos */}
                  <div className="pt-4 border-t border-gray-200 space-y-4">
                    <h5 className="text-sm font-medium text-gray-900">Documentos</h5>

                    <FileUpload
                      name={`integrantes.${index}.adjuntoCedula` as never}
                      label="Cédula (PDF)"
                      accept="application/pdf"
                      resourceType="raw"
                      required
                      helpText="Documento máximo 10MB"
                    />

                    {requiereEconomia && (
                      <>
                        <FileUpload
                          name={`integrantes.${index}.certificadoEconomiaSolidaria` as never}
                          label="Certificado Economía Solidaria (PDF)"
                          accept="application/pdf"
                          resourceType="raw"
                          helpText="Documento máximo 10MB"
                        />
                      </>
                    )}

                    {requiereFormacion && (
                      <FileUpload
                        name={`integrantes.${index}.soporteFormacionAcademica` as never}
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

              {integranteStatus && integranteStatus !== "HABIL" && (
                <>
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
                </>
              )}
            </div>
          </div>
        );
      })}

      <div className="pt-2">
        <button
          type="button"
          onClick={handleAddIntegrante}
          disabled={!canAddMore}
          className={cn(
            "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md text-sm font-medium transition-colors",
            canAddMore
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          )}
        >
          <Plus className="w-4 h-4" />
          Agregar integrante
        </button>
      </div>
    </div>
  );
}
