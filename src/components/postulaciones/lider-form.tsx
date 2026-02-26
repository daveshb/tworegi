"use client";

import { useFormContext } from "react-hook-form";
import { CedulaValidation } from "./cedula-validation";
import { FileUpload } from "./file-upload";

interface LiderFormProps {
  tipoPostulacion: "JUNTA_DIRECTIVA" | "CONTROL_SOCIAL" | "APELACIONES";
  onLiderValidated?: (status: "HABIL" | "NO_REGISTRADO" | "INHABIL") => void;
}

export function LiderForm({ tipoPostulacion, onLiderValidated }: LiderFormProps) {
  const { watch, formState: { errors }, register } = useFormContext();
  const liderStatus = watch("lider.asociadoStatus");
  const liderData = watch("lider");
  const isHabil = liderStatus === "HABIL";

  const hasUploadedFile = (value: unknown) => {
    if (!value || typeof value !== "object") return false;
    const file = value as Record<string, unknown>;
    return Boolean(file.url) && Boolean(file.public_id);
  };

  const requiereEconomia = tipoPostulacion !== "APELACIONES";
  const requiereFormacion = tipoPostulacion === "JUNTA_DIRECTIVA";

  // Calcular campos faltantes del líder
  const camposFaltantes: string[] = [];
  if (isHabil) {
    if (!liderData.nombreCompleto) camposFaltantes.push("Nombre Completo");
    if (!liderData.cargoEmpresa) camposFaltantes.push("Cargo en la Empresa");
    if (!liderData.sedeTrabajo) camposFaltantes.push("Sede de Trabajo");
    if (!liderData.celular) camposFaltantes.push("Celular");
    if (!liderData.correo) camposFaltantes.push("Correo");
    if (!hasUploadedFile(liderData.adjuntoCedula)) {
      camposFaltantes.push("cedulaPDF (Cédula PDF)");
    }
    if (requiereEconomia && !hasUploadedFile(liderData.certificadoEconomiaSolidaria)) {
      camposFaltantes.push("Certificado Economía Solidaria");
    }
    if (requiereFormacion && !hasUploadedFile(liderData.soporteFormacionAcademica)) {
      camposFaltantes.push("Soporte Formación Académica");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Datos del Líder</h2>
        <p className="text-gray-600 text-sm">
          El líder es responsable del registro de toda la plancha.
        </p>
      </div>

      {/* Validación de Cédula del Líder */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <CedulaValidation
          isLider={true}
          fieldName="lider.cedula"
          parentField="lider"
          onCedulaValidated={(cedula, status) => {
            onLiderValidated?.(status);
          }}
        />
      </div>

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
        <div className="space-y-6">
          {/* Nombre Completo */}
          <div>
            <label htmlFor="lider-nombre" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre Completo<span className="text-red-500 ml-1">*</span>
            </label>
            <input
              id="lider-nombre"
              type="text"
              placeholder="Nombre desde base de datos"
              {...register("lider.nombreCompleto", {
                required: "Nombre es requerido",
                minLength: { value: 3, message: "Nombre mínimo 3 caracteres" },
              })}
              readOnly
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm bg-gray-100 text-gray-700 cursor-not-allowed"
              aria-describedby={(errors.lider as any)?.nombreCompleto ? "lider-nombre-error" : undefined}
            />
            {(errors.lider as any)?.nombreCompleto && (
              <p id="lider-nombre-error" className="text-sm text-red-600 mt-1">
                {typeof (errors.lider as any).nombreCompleto === "string" 
                  ? (errors.lider as any).nombreCompleto 
                  : ((errors.lider as any).nombreCompleto as any)?.message || "Error en este campo"}
              </p>
            )}
          </div>

          {/* Cargo Empresa */}
          <div>
            <label htmlFor="lider-cargo" className="block text-sm font-medium text-gray-700 mb-1">
              Cargo en la Empresa<span className="text-red-500 ml-1">*</span>
            </label>
            <input
              id="lider-cargo"
              type="text"
              placeholder="Ej: Gerente, Director"
              {...register("lider.cargoEmpresa", {
                required: "Cargo es requerido",
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
              aria-describedby={(errors.lider as any)?.cargoEmpresa ? "lider-cargo-error" : undefined}
            />
            {(errors.lider as any)?.cargoEmpresa && (
              <p id="lider-cargo-error" className="text-sm text-red-600 mt-1">
                {typeof (errors.lider as any).cargoEmpresa === "string" 
                  ? (errors.lider as any).cargoEmpresa 
                  : ((errors.lider as any).cargoEmpresa as any)?.message || "Error en este campo"}
              </p>
            )}
          </div>

          {/* Sede Trabajo */}
          <div>
            <label htmlFor="lider-sede" className="block text-sm font-medium text-gray-700 mb-1">
              Sede de Trabajo<span className="text-red-500 ml-1">*</span>
            </label>
            <input
              id="lider-sede"
              type="text"
              placeholder="Bogotá, Medellín, Cali, etc"
              {...register("lider.sedeTrabajo", {
                required: "Sede es requerida",
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Celular */}
          <div>
            <label htmlFor="lider-celular" className="block text-sm font-medium text-gray-700 mb-1">
              Celular<span className="text-red-500 ml-1">*</span>
            </label>
            <input
              id="lider-celular"
              type="tel"
              placeholder="3001234567"
              {...register("lider.celular", {
                required: "Celular es requerido",
                pattern: {
                  value: /^\d{7,20}$/,
                  message: "Celular debe contener solo números",
                },
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            />
            {(errors.lider as any)?.celular && (
              <p className="text-sm text-red-600 mt-1">
                {typeof (errors.lider as any).celular === "string" 
                  ? (errors.lider as any).celular 
                  : ((errors.lider as any).celular as any)?.message || "Error en este campo"}
              </p>
            )}
          </div>

          {/* Correo */}
          <div>
            <label htmlFor="lider-correo" className="block text-sm font-medium text-gray-700 mb-1">
              Correo<span className="text-red-500 ml-1">*</span>
            </label>
            <input
              id="lider-correo"
              type="email"
              placeholder="correo@ejemplo.com"
              {...register("lider.correo", {
                required: "Correo es requerido",
                pattern: {
                  value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                  message: "Correo debe ser válido",
                },
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            />
            {(errors.lider as any)?.correo && (
              <p className="text-sm text-red-600 mt-1">
                {typeof (errors.lider as any).correo === "string" 
                  ? (errors.lider as any).correo 
                  : ((errors.lider as any).correo as any)?.message || "Error en este campo"}
              </p>
            )}
          </div>

          {/* Tipo de Integrante (oculto para el líder) */}
          <input
            type="hidden"
            {...register("lider.tipoIntegrante")}
            value={tipoPostulacion === "APELACIONES" ? "MIEMBRO" : "PRINCIPAL"}
          />
          <input
            type="hidden"
            {...register("lider.asociadoStatus")}
            value="HABIL"
          />

          {/* Documentos */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Documentos del Líder</h3>
            <div className="space-y-4">
              <FileUpload
                name="lider.adjuntoCedula"
                label="Cédula (PDF)"
                accept="application/pdf"
                resourceType="raw"
                required
                helpText="Documento máximo 10MB"
              />

              {requiereEconomia && (
                <>
                  <FileUpload
                    name="lider.certificadoEconomiaSolidaria"
                    label="Certificado Economía Solidaria (PDF)"
                    accept="application/pdf"
                    resourceType="raw"
                    helpText="Documento máximo 10MB"
                  />
                </>
              )}

              {requiereFormacion && (
                <FileUpload
                  name="lider.soporteFormacionAcademica"
                  label="Soporte Formación Académica (PDF)"
                  accept="application/pdf"
                  resourceType="raw"
                  required
                  helpText="Documento máximo 10MB"
                />
              )}
            </div>
          </div>
        </div>
        </>
      )}

      {liderStatus && liderStatus !== "HABIL" && (
        <>
          {liderStatus === "NO_REGISTRADO" && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Atención:</strong> Esta cédula no está registrada como asociada. 
                Por favor valida otra cédula.
              </p>
            </div>
          )}

          {liderStatus === "INHABIL" && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">
                <strong>Atención:</strong> Esta cédula no es elegible para ser líder de una plancha.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
