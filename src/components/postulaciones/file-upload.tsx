"use client";

import { useCallback, useRef, useState } from "react";
import { Controller, FieldPath, UseFormSetValue, useFormContext } from "react-hook-form";
import { AlertCircle, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps<T extends Record<string, any>> {
  name: FieldPath<T>;
  label: string;
  accept: string;
  resourceType: "raw" | "image";
  maxSizeMB?: number;
  required?: boolean;
  helpText?: string;
}

interface FileMetadata {
  url: string;
  public_id: string;
  bytes: number;
  format: string;
  original_filename: string;
  resource_type: "raw" | "image";
  createdAt: Date;
}

export function FileUpload<T extends Record<string, any>>({
  name,
  label,
  accept,
  resourceType,
  maxSizeMB = 10,
  required = false,
  helpText,
}: FileUploadProps<T>) {
  const { control, watch, setValue, formState: { errors } } = useFormContext<T>();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentValue = watch(name);

  const handleUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setUploadError(null);
      setIsUploading(true);

      try {
        // Validar tamaño
        const sizeMB = file.size / (1024 * 1024);
        if (sizeMB > maxSizeMB) {
          setUploadError(`El archivo no debe exceder ${maxSizeMB}MB`);
          setIsUploading(false);
          return;
        }

        // Obtener firma de Cloudinary
        const signatureResponse = await fetch(`/api/uploads/signature?resourceType=${resourceType}`);
        if (!signatureResponse.ok) {
          throw new Error("No se pudo obtener firma de Cloudinary");
        }
        const { timestamp, signature, apiKey, cloudName, folder } =
          await signatureResponse.json();

        // Construir FormData para Cloudinary
        const formData = new FormData();
        formData.append("file", file);
        formData.append("timestamp", timestamp.toString());
        formData.append("signature", signature);
        formData.append("api_key", apiKey);
        formData.append("folder", folder);
        formData.append("resource_type", resourceType);

        // Subir a Cloudinary
        const uploadPath = resourceType === "raw" ? "raw" : "image";
        const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${uploadPath}/upload`;
        const uploadResponse = await fetch(uploadUrl, {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error("Error al subir archivo a Cloudinary");
        }

        const uploadResult = await uploadResponse.json();

        // Extraer metadata
        const metadata: FileMetadata = {
          url: uploadResult.secure_url,
          public_id: uploadResult.public_id,
          bytes: uploadResult.bytes,
          format: uploadResult.format,
          original_filename: uploadResult.original_filename,
          resource_type: resourceType,
          createdAt: new Date(),
        };

        // Actualizar formulario
        control._formValues[name as any] = metadata;
        setValue(name, metadata as any);
        
        // Resetear input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } catch (error) {
        setUploadError(
          error instanceof Error ? error.message : "Error desconocido"
        );
      } finally {
        setIsUploading(false);
      }
    },
    [control, name, maxSizeMB, resourceType, setValue]
  );

  const handleRemove = useCallback(() => {
    setValue(name, null as any);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [setValue, name]);

  const fieldError = errors[name]?.message as string | undefined;

  return (
    <Controller
      control={control}
      name={name}
      rules={{ required: required ? `${label} es requerido` : false }}
      render={({ field }) => (
        <div className="space-y-2">
          <label htmlFor={name} className="block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>

          {currentValue && typeof currentValue === "object" && "original_filename" in currentValue ? (
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-700">
                  {(currentValue as FileMetadata).original_filename}
                </span>
              </div>
              <button
                onClick={handleRemove}
                type="button"
                className="text-red-600 hover:text-red-700"
                aria-label="Eliminar archivo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                id={name}
                accept={accept}
                onChange={handleUpload}
                disabled={isUploading}
                className="hidden"
                aria-describedby={fieldError ? `${name}-error` : undefined}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className={cn(
                  "w-full flex items-center justify-center gap-2 px-4 py-3",
                  "border-2 border-dashed border-gray-300 rounded-md",
                  "text-sm text-gray-600 hover:text-gray-700",
                  "hover:border-gray-400 transition-colors",
                  isUploading && "opacity-50 cursor-not-allowed"
                )}
              >
                <Upload className="w-4 h-4" />
                {isUploading ? "Subiendo..." : "Seleccionar archivo"}
              </button>
            </div>
          )}

          {helpText && (
            <p className="text-xs text-gray-500 mt-1">{helpText}</p>
          )}

          {uploadError && (
            <div id={`${name}-error`} className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-red-700">{uploadError}</span>
            </div>
          )}

          {fieldError && (
            <div id={`${name}-error`} className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-red-700">{fieldError}</span>
            </div>
          )}
        </div>
      )}
    />
  );
}
