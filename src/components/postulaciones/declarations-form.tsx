"use client";

import { Controller, useFormContext } from "react-hook-form";
import { AlertCircle } from "lucide-react";

export function DeclarationsForm() {
  const { control, formState: { errors } } = useFormContext();

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
        rules={{ required: "Debes aceptar los compromisos institucionales" }}
        render={({ field }) => (
          <div>
            <fieldset>
              <legend className="text-sm font-medium text-gray-700 mb-3">
                ¿Aceptas los compromisos institucionales establecidos?
                <span className="text-red-500 ml-1">*</span>
              </legend>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    value="true"
                    checked={field.value === true}
                    onChange={(e) => field.onChange(e.target.value === "true")}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    aria-describedby={errors.compromisosInstitucionales ? "compromisos-error" : undefined}
                  />
                  <span className="text-sm text-gray-700">Sí, acepto</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    value="false"
                    checked={field.value === false}
                    onChange={(e) => field.onChange(e.target.value === "true")}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">No acepto</span>
                </label>
              </div>
            </fieldset>
            {errors.compromisosInstitucionales && (
              <div id="compromisos-error" className="flex items-start gap-2 mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
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
        rules={{ required: "Debes autorizar la consulta de antecedentes" }}
        render={({ field }) => (
          <div>
            <fieldset>
              <legend className="text-sm font-medium text-gray-700 mb-3">
                ¿Autorizas la consulta de antecedentes?
                <span className="text-red-500 ml-1">*</span>
              </legend>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    value="true"
                    checked={field.value === true}
                    onChange={(e) => field.onChange(e.target.value === "true")}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    aria-describedby={errors.autorizacionAntecedentes ? "antecedentes-error" : undefined}
                  />
                  <span className="text-sm text-gray-700">Sí, autorizo</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    value="false"
                    checked={field.value === false}
                    onChange={(e) => field.onChange(e.target.value === "true")}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">No autorizo</span>
                </label>
              </div>
            </fieldset>
            {errors.autorizacionAntecedentes && (
              <div id="antecedentes-error" className="flex items-start gap-2 mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
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
        rules={{ required: "Debes aceptar la responsabilidad como líder" }}
        render={({ field }) => (
          <div>
            <fieldset>
              <legend className="text-sm font-medium text-gray-700 mb-3">
                ¿Aceptas la responsabilidad como líder de la plancha?
                <span className="text-red-500 ml-1">*</span>
              </legend>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    value="true"
                    checked={field.value === true}
                    onChange={(e) => field.onChange(e.target.value === "true")}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    aria-describedby={errors.responsabilidadLider ? "responsabilidad-error" : undefined}
                  />
                  <span className="text-sm text-gray-700">Sí, acepto</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    value="false"
                    checked={field.value === false}
                    onChange={(e) => field.onChange(e.target.value === "true")}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">No acepto</span>
                </label>
              </div>
            </fieldset>
            {errors.responsabilidadLider && (
              <div id="responsabilidad-error" className="flex items-start gap-2 mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
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
