"use client";

import { useState } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AsociadoData {
  cedula: string;
  nombreCompleto: string;
  cargoEmpresa: string;
  sedeTrabajo: string;
  celular: string;
  correo: string;
  asociadoStatus: "HABIL" | "NO_REGISTRADO" | "INHABIL";
  motivoInhabilidad?: string | null;
}

interface CedulaValidationProps {
  onCedulaValidated?: (cedula: string, status: "HABIL" | "NO_REGISTRADO" | "INHABIL", data?: AsociadoData) => void;
  tipoIntegrante?: "PRINCIPAL" | "SUPLENTE" | "MIEMBRO";
  isLider?: boolean;
  fieldName?: string;
  parentField?: string; // e.g., "lider" or "integrantes.0"
}

export function CedulaValidation({ onCedulaValidated, isLider = false, fieldName = "cedula", parentField }: CedulaValidationProps) {
  const { watch, formState: { errors }, trigger, register, setValue } = useFormContext();
  const cedula = watch(fieldName);
  
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<"HABIL" | "NO_REGISTRADO" | "INHABIL" | null>(null);
  const [validationMotivo, setValidationMotivo] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [asociadoData, setAsociadoData] = useState<AsociadoData | null>(null);

  const handleValidateCedula = async () => {
    setValidationError(null);

    // Validar que la cédula sea válida primero
    const isValid = await trigger(fieldName);
    if (!isValid) return;

    setIsValidating(true);

    try {
      const response = await fetch(`/api/asociados/by-cedula?cedula=${cedula}`);
      if (!response.ok) {
        throw new Error("Error validando cédula");
      }

      const data: AsociadoData = await response.json();
      setValidationStatus(data.asociadoStatus);
      setValidationMotivo(data.motivoInhabilidad || null);
      setAsociadoData(data);

      // Precargar datos si es HABIL
      if (data.asociadoStatus === "HABIL" && parentField) {
        const fields = [
          { path: `${parentField}.nombreCompleto`, value: data.nombreCompleto },
          { path: `${parentField}.cargoEmpresa`, value: data.cargoEmpresa },
          { path: `${parentField}.sedeTrabajo`, value: data.sedeTrabajo },
          { path: `${parentField}.celular`, value: data.celular },
          { path: `${parentField}.correo`, value: data.correo },
        ];

        fields.forEach(({ path, value }) => {
          setValue(path, value);
        });
      }

      if (onCedulaValidated) {
        onCedulaValidated(cedula, data.asociadoStatus, data);
      }
    } catch (error) {
      setValidationError(
        error instanceof Error ? error.message : "Error validando cédula"
      );
    } finally {
      setIsValidating(false);
    }
  };

  const fieldError = errors[fieldName]?.message as string | undefined;

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor={fieldName} className="block text-sm font-medium text-gray-700 mb-2">
          Cédula
          <span className="text-red-500 ml-1">*</span>
        </label>
        <div className="flex gap-2">
          <input
            id={fieldName}
            placeholder="Ej: 1234567890"
            {...register(fieldName as any, {
              required: "Cédula es requerida",
              pattern: {
                value: /^\d+$/,
                message: "Cédula solo debe contener números"
              }
            })}
            className={cn(
              "flex-1 px-3 py-2 border rounded-md text-sm",
              "placeholder-gray-400 transition-colors",
              fieldError || validationStatus === "INHABIL"
                ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                : validationStatus === "HABIL"
                ? "border-green-300 focus:border-green-500 focus:ring-green-500"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            )}
            disabled={validationStatus === "HABIL"}
            aria-describedby={fieldError ? `${fieldName}-error` : undefined}
          />
          <button
            type="button"
            onClick={handleValidateCedula}
            disabled={isValidating || !cedula || !!fieldError || validationStatus === "HABIL"}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-colors",
              isValidating || !cedula || fieldError || validationStatus === "HABIL"
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            )}
          >
            {isValidating ? "Validando..." : "Validar"}
          </button>
        </div>

        {fieldError && (
          <div className="flex items-start gap-2 mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
            <span id={`${fieldName}-error`} className="text-sm text-red-700">{fieldError}</span>
          </div>
        )}

        {validationError && (
          <div className="flex items-start gap-2 mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-red-700">{validationError}</span>
          </div>
        )}
      </div>

      {validationStatus && (
        <div
          className={cn(
            "flex items-start gap-2 p-3 rounded-md",
            validationStatus === "HABIL"
              ? "bg-green-50 border border-green-200"
              : validationStatus === "NO_REGISTRADO"
              ? "bg-yellow-50 border border-yellow-200"
              : "bg-red-50 border border-red-200"
          )}
        >
          {validationStatus === "HABIL" ? (
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          )}
          <div className="flex-1">
            <p
              className={cn(
                "text-sm font-medium",
                validationStatus === "HABIL"
                  ? "text-green-800"
                  : validationStatus === "NO_REGISTRADO"
                  ? "text-yellow-800"
                  : "text-red-800"
              )}
            >
              {validationStatus === "HABIL"
                ? "Asociado habilitado - puedes completar el formulario"
                : validationStatus === "NO_REGISTRADO"
                ? "Esta cédula no está registrada como asociada"
                : "Esta cédula no puede participar"}
            </p>
            {validationMotivo && (
              <p className="text-sm text-gray-600 mt-1">{validationMotivo}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
