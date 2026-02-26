"use client";

import { Controller, useFormContext } from "react-hook-form";
import { AlertCircle } from "lucide-react";

export function DeclarationsForm() {
  const { control, formState: { errors } } = useFormContext();

  const renderSiNo = (
    value: boolean | undefined,
    onChange: (value: boolean | undefined) => void,
    ariaDescribedBy?: string
  ) => (
    <div className="flex items-center gap-6 mt-3">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={value === true}
          onChange={() => onChange(value === true ? undefined : true)}
          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
          aria-describedby={ariaDescribedBy}
        />
        <span className="text-sm text-gray-700">Sí</span>
      </label>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={value === false}
          onChange={() => onChange(value === false ? undefined : false)}
          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
          aria-describedby={ariaDescribedBy}
        />
        <span className="text-sm text-gray-700">No</span>
      </label>
    </div>
  );

  return (
    <div className="space-y-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Declaraciones Obligatorias
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Todos los campos son obligatorios para enviar la postulación.
        </p>
      </div>

      {/* Compromisos Institucionales */}
      <Controller
        control={control}
        name="compromisosInstitucionales"
        rules={{
          validate: (value) =>
            value === true || "Debes aceptar los compromisos institucionales",
        }}
        render={({ field }) => (
          <div>
            <fieldset>
              <legend className="text-sm font-medium text-gray-700 mb-3">
                ¿Certifica que todos los integrantes de la plancha, con la postulación y en caso de ser elegidos, se comprometen a:
                <span className="text-red-500 ml-1">*</span>
              </legend>
              <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                <li>Firmar el documento de aceptación del cargo, renglón y período a ocupar.</li>
                <li>Suscribir el acuerdo de confidencialidad.</li>
                <li>Conocer y suscribir el Código de Ética y Conducta y el Código de Buen Gobierno Corporativo del Fondo.</li>
                <li>Manifestar por escrito el conocimiento de las funciones, deberes y prohibiciones establecidas en la normatividad vigente y en el Estatuto del Fondo.</li>
              </ul>
              {renderSiNo(
                field.value as boolean | undefined,
                field.onChange,
                errors.compromisosInstitucionales ? "compromisos-error" : undefined
              )}
            </fieldset>
            {errors.compromisosInstitucionales && (
              <div id="compromisos-error" className="flex items-start gap-2 mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                <p className="text-sm text-red-700">
                  {typeof errors.compromisosInstitucionales.message === "string" 
                    ? errors.compromisosInstitucionales.message 
                    : "Error en este campo"}
                </p>
              </div>
            )}
          </div>
        )}
      />

      {/* Autorización Antecedentes */}
      <Controller
        control={control}
        name="autorizacionAntecedentes"
        rules={{
          validate: (value) =>
            value === true || "Debes autorizar la consulta de antecedentes",
        }}
        render={({ field }) => (
          <div>
            <fieldset>
              <legend className="text-sm font-medium text-gray-700 mb-3">
                ¿Manifiesta, bajo su responsabilidad, que todos los integrantes de la plancha presentada autorizan al Fondo de Empleados FONCOR la consulta de sus antecedentes en centrales de riesgo, judiciales y disciplinarios, conforme a la normatividad vigente?
                <span className="text-red-500 ml-1">*</span>
              </legend>
              {renderSiNo(
                field.value as boolean | undefined,
                field.onChange,
                errors.autorizacionAntecedentes ? "antecedentes-error" : undefined
              )}
            </fieldset>
            {errors.autorizacionAntecedentes && (
              <div id="antecedentes-error" className="flex items-start gap-2 mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                <p className="text-sm text-red-700">
                  {typeof errors.autorizacionAntecedentes.message === "string"
                    ? errors.autorizacionAntecedentes.message
                    : "Error en este campo"}
                </p>
              </div>
            )}
          </div>
        )}
      />

      {/* Responsabilidad Líder */}
      <Controller
        control={control}
        name="responsabilidadLider"
        rules={{
          validate: (value) =>
            value === true || "Debes aceptar la responsabilidad como líder",
        }}
        render={({ field }) => (
          <div>
            <fieldset>
              <legend className="text-sm font-medium text-gray-700 mb-3">
                El líder de la plancha certifica que la información registrada y los documentos cargados en la plataforma son veraces, completos y cumplen con los requisitos legales y estatutarios vigentes, asumiendo la responsabilidad correspondiente frente al Fondo de Empleados FONCOR.
                <span className="text-red-500 ml-1">*</span>
              </legend>
              {renderSiNo(
                field.value as boolean | undefined,
                field.onChange,
                errors.responsabilidadLider ? "responsabilidad-error" : undefined
              )}
            </fieldset>
            {errors.responsabilidadLider && (
              <div id="responsabilidad-error" className="flex items-start gap-2 mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                <p className="text-sm text-red-700">
                  {typeof errors.responsabilidadLider.message === "string"
                    ? errors.responsabilidadLider.message
                    : "Error en este campo"}
                </p>
              </div>
            )}
          </div>
        )}
      />
    </div>
  );
}
