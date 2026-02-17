"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, CheckCircle, Loader } from "lucide-react";
import Image from "next/image";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo from "../../../assets/imagen.png";

interface Associate {
  _id: string;
  fullName: string;
  cedula: string;
  email: string;
  cellPhone: string;
  electoralZone: string;
}

export default function ApplyCandidatePage() {
  const [step, setStep] = useState<"search" | "verify" | "form">("search");
  const [cedula, setCedula] = useState("");
  const [associate, setAssociate] = useState<Associate | null>(null);
  const [alreadyCandidate, setAlreadyCandidate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [associatePassword, setAssociatePassword] = useState("");
  const [alternativeWhatsApp, setAlternativeWhatsApp] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [lastWhatsAppUsed, setLastWhatsAppUsed] = useState<string>("");

  const [formData, setFormData] = useState({
    proposalDescription: "",
    image: null as File | null,
    cargo: "",
    localidad: "",
  });

  const [fieldErrors, setFieldErrors] = useState<{
    image?: string;
    cargo?: string;
    localidad?: string;
    proposalDescription?: string;
  }>({});

  // Función para mostrar notificación
  const showNotification = (message: string, type: "success" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Función para validar número de WhatsApp
  const isValidWhatsApp = (phone: string): boolean => {
    const cleaned = phone.replace(/[\s()-]/g, '');
    // Acepta: +573001234567 o 3001234567 o 573001234567
    const phoneRegex = /^(\+57|57)?[1-9]\d{9}$/;
    return phoneRegex.test(cleaned);
  };

  // Función para normalizar número de WhatsApp (asegurar que tenga +57)
  const normalizeWhatsApp = (phone: string): string => {
    const cleaned = phone.replace(/[\s()-]/g, '');
    if (cleaned.startsWith('+57')) {
      return cleaned;
    } else if (cleaned.startsWith('57')) {
      return '+' + cleaned;
    } else {
      return '+57' + cleaned;
    }
  };

  const handleSearchAssociate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setAlreadyCandidate(false);

    try {
      // Buscar asociado
      const response = await fetch(`/api/associates/by-cedula?cedula=${cedula}`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Asociado no encontrado");
      }

      const data = await response.json();
      const associateData = data.data;
      
      // Validar que el asociado tenga al menos 1 año de antigüedad (fecha de corte: 2 de febrero)
      const cutoffDate = new Date(2025, 1, 3); // 3 de febrero de 2025 (para incluir todo el 2 de febrero)
      const joinDate = new Date(associateData.joinDate);

      console.log(joinDate)
      console.log(cutoffDate)
      

      console.log(joinDate > cutoffDate)

      if (joinDate > cutoffDate) {
        setError(`${associateData.fullName}, debes tener al menos 1 año de antigüedad en el fondo (fecha de corte: 2 de febrero) para poder postularte como candidato`);
        setAssociate(null);
        return;
      }
      
      // Verificar si ya es candidato
      const candidateCheck = await fetch(`/api/candidates?associateId=${associateData._id}`);
      const candidateData = await candidateCheck.json();

      if (candidateData.isCandidate) {
        setAlreadyCandidate(true);
        setError(`${associateData.fullName}, ya estás registrado como candidato`);
        setAssociate(null);
      } else {
        setAssociate(associateData);
        setStep("verify");
        setLastWhatsAppUsed(associateData.cellPhone);
        
        // Generar y enviar código de verificación
        const codeResponse = await fetch("/api/generateVerificationCode", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cedula: associateData.cedula,
            email: associateData.email,
            tipoPostulacion: "candidato",
          }),
        });

        if (!codeResponse.ok) {
          const errorData = await codeResponse.json();
          throw new Error(errorData.error || "Error al generar código de verificación");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verificar el código contra la BD
    try {
      const verifyResponse = await fetch("/api/verifyCode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cedula: associate?.cedula,
          code: verificationCode,
        }),
      });

      if (!verifyResponse.ok) {
        const data = await verifyResponse.json();
        setError(data.error || "Código incorrecto");
        setVerificationCode("");
        return;
      }

      setStep("form");
    } catch (err) {
      setError("Error al verificar el código");
    }
  };

  const handleResendCode = async (whatsapp: string) => {
    setResendLoading(true);
    setError("");

    try {
      const normalizedWhatsApp = normalizeWhatsApp(whatsapp || associate?.cellPhone || "");
      
      const codeResponse = await fetch("/api/generateVerificationCode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cedula: associate?.cedula,
          whatsapp: normalizedWhatsApp,
          tipoPostulacion: "candidato",
        }),
      });

      if (!codeResponse.ok) {
        const errorData = await codeResponse.json();
        throw new Error(errorData.error || "Error al enviar el código");
      }

      setError("");
      setLastWhatsAppUsed(normalizedWhatsApp);
      showNotification(`Código enviado exitosamente al WhatsApp: ${normalizedWhatsApp}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar el código. Intenta nuevamente.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitCandidate = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: typeof fieldErrors = {};
    
    if (!formData.image) {
      errors.image = "La imagen es requerida";
    }

    if (!formData.cargo.trim()) {
      errors.cargo = "El cargo es requerido";
    }

    if (!formData.localidad.trim()) {
      errors.localidad = "La localidad de trabajo es requerida";
    }

    if (!formData.proposalDescription.trim()) {
      errors.proposalDescription = "La descripción del perfil es requerida";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("Por favor completa todos los campos obligatorios");
      return;
    }

    if (!associate) {
      setError("Error: Asociado no encontrado");
      return;
    }

    setSubmitting(true);
    setError("");
    setFieldErrors({});

    try {
      const fd = new FormData();
      fd.append("image", formData.image as File);
      fd.append("associateId", associate._id);
      fd.append("fullName", associate.fullName);
      fd.append("cedula", associate.cedula);
      fd.append("electoralZone", associate.electoralZone);
      fd.append("email", associate.email);
      fd.append("cellPhone", associate.cellPhone);
      fd.append("cargo", formData.cargo);
      fd.append("localidad", formData.localidad);
      fd.append("proposalDescription", formData.proposalDescription);

      const response = await fetch("/api/candidates", {
        method: "POST",
        body: fd,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al registrar candidato");
      }

      // Enviar email de confirmación al candidato después del registro exitoso
      await fetch("/api/sendInfo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: associate.email,
          nombreCompleto: associate.fullName,
          zonaElectoral: associate.electoralZone,
        }),
      });

      // Enviar notificación al admin
      await fetch("/api/sendAdminNotification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: associate.fullName,
          cedula: associate.cedula,
          email: associate.email,
          cellPhone: associate.cellPhone,
          electoralZone: associate.electoralZone,
          cargo: formData.cargo,
          localidad: formData.localidad,
          proposalDescription: formData.proposalDescription,
        }),
      });

      toast.success("¡Candidatura registrada exitosamente!", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Reset form
      setTimeout(() => {
        setCedula("");
        setAssociate(null);
        setFormData({ proposalDescription: "", image: null, cargo: "", localidad: "" });
        setImagePreview(null);
        setVerificationCode("");
        setAlternativeWhatsApp("");
        setLastWhatsAppUsed("");
        setStep("search");
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-voting-gradient">
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      {/* Loader Overlay */}
      {submitting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-8 flex flex-col items-center gap-4 shadow-2xl">
            <Loader className="w-12 h-12 text-blue-600 animate-spin" />
            <div className="text-center">
              <h3 className="font-bold text-lg text-gray-800">Registrando candidatura...</h3>
              <p className="text-sm text-gray-600 mt-1">Por favor espera un momento</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="border-b bg-card-50 backdrop-blur supports-backdrop-filter:bg-card/50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
                            <Image src={logo} alt="Logo" width={120} height={120}/>

          

          <div>
            <h1 className="text-2xl font-bold">Postulación a Delegado</h1>
            <p className="text-sm text-muted-foreground">Asamblea General Foncor 2026</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {notification && (
            <div className={`${notification.type === 'success' ? 'bg-green-100 border border-green-400 text-green-800' : 'bg-red-100 border border-red-400 text-red-800'} p-4 rounded-lg mb-6 flex items-center gap-3 animate-pulse`}>
              {notification.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <p className="text-sm">{notification.message}</p>
            </div>
          )}

          {step === "search" ? (
            // Search Step
            <div className="bg-card rounded-xl border p-8 text-center">
              <div className="flex justify-center mb-6">
                <Image src={logo} alt="Logo" width={120} height={120}/>
              </div>
              
              <h2 className="text-3xl font-bold mb-2">Postularse como candidato</h2>
              <h2 className="text-2xl font-bold mb-2">Delegado de Asamblea General</h2>
              <h2 className="text-2xl font-bold mb-6">Foncor 2026</h2>
              <p className="text-sm text-muted-foreground mb-8">
                Ingresa tu cédula para cargar tu información de asociado
              </p>

              {error && (
                <div className="bg-red-100 border-l-4 border-red-600 text-red-900 p-4 rounded-lg mb-6 text-sm font-semibold shadow-lg animate-pulse">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
                    <p>{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSearchAssociate} className="space-y-6">
                <div>
                  <label htmlFor="cedula-input" className="block text-sm font-medium mb-2">Número de Cédula</label>
                  <Input
                    id="cedula-input"
                    type="text"
                    value={cedula}
                    onChange={(e) => setCedula(e.target.value.replace(/\D/g, ''))}
                    placeholder="Ej: 12345678"
                    className="text-center text-lg"
                    maxLength={10}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-button-gradient text-white text-lg py-3"
                  disabled={loading || cedula.length < 6}
                >
                  {loading ? "Buscando..." : "Continuar"}
                </Button>
              </form>
            </div>
          ) : step === "verify" ? (
            // Verification Step
            <div className="bg-card rounded-xl border p-8 text-center max-w-md mx-auto">
              <div className="flex justify-center mb-6">
                <Image src={logo} alt="Logo" width={120} height={120}/>
              </div>

              <h2 className="text-2xl font-bold mb-2">Verificación de Código</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Se ha enviado un código de verificación a tu WhatsApp para confirmar tu postulación como candidato
              </p>

              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
                <p className="text-xs font-semibold text-primary mb-2 uppercase">Proceso de Postulación</p>
                <p className="text-sm text-muted-foreground">
                  Estás a punto de registrarte como <span className="font-semibold text-primary">Postulación a Delegado de Asamblea General 2026</span> de Foncor
                </p>
              </div>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-800 p-3 rounded-lg mb-4 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleVerifyCode} className="space-y-6">
                <div>
                  <label htmlFor="verification-code" className="block text-sm font-medium mb-2">
                    Código de Verificación
                  </label>
                  <Input
                    id="verification-code"
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="Ingresa tu código de 4 dígitos"
                    className="text-center text-lg"
                    maxLength={4}
                    required
                  />
                  
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Este código fue enviado al WhatsApp:
                  </p>
                  <p className="text-sm font-semibold text-primary text-center mb-4 mt-1">
                    {lastWhatsAppUsed}
                  </p>

                  <p className="text-xs text-muted-foreground mb-3 text-center">
                    ¿Deseas recibir el código en otro número de WhatsApp?
                  </p>
                   
                  <Input
                    id="alternative-whatsapp"
                    type="tel"
                    placeholder="+573001234567 o 3001234567"
                    value={alternativeWhatsApp}
                    onChange={(e) => setAlternativeWhatsApp(e.target.value.replace(/\s/g, ''))}
                    className="text-center text-lg mb-3"
                  />

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full mb-4 bg-green-500 text-white hover:bg-green-700 border-green-600"
                    onClick={() => handleResendCode(alternativeWhatsApp)}
                    disabled={!alternativeWhatsApp || !isValidWhatsApp(alternativeWhatsApp) || resendLoading}
                  >
                    {resendLoading ? "Enviando..." : "Enviar Código a Este Número de WhatsApp"}
                  </Button>
                  
                  {alternativeWhatsApp && !isValidWhatsApp(alternativeWhatsApp) && (
                    <p className="text-xs text-red-600 mt-2 text-center">
                      Por favor ingresa un número de WhatsApp válido
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-button-gradient text-white text-lg py-3"
                  disabled={verificationCode.length < 4}
                >
                  Verificar y Continuar
                </Button>
              </form>

              <Button
                type="button"
                variant="ghost"
                className="w-full mt-4 border border-gray-300 bg-gray-500 text-white hover:bg-gray-100 hover:text-gray-900 text-lg"
                onClick={() => {
                  setStep("search");
                  setCedula("");
                  setAssociate(null);
                  setVerificationCode("");
                  setError("");
                  setLastWhatsAppUsed("");
                }}
              >
                Volver
              </Button>
            </div>
          ) : (
            // Form Step
            <div className="bg-card rounded-xl border p-8">
              <div className="flex justify-center mb-6">
                <Image src={logo} alt="Logo" width={120} height={120}/>
              </div>
              
              <h2 className="text-2xl font-bold mb-2">Tu Perfil de Candidato</h2>
              <p className="text-sm text-muted-foreground mb-8">Completa tu información para registrarte como candidato</p>

              <div className="grid gap-6">
                {/* Associate Info Preview */}
                <div className="border rounded-lg p-6 bg-primary/5">
                  <p className="text-xs font-semibold text-primary mb-4 uppercase">Información del Asociado</p>
                  <div className="grid grid-cols-2 gap-6 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Nombre Completo</p>
                      <p className="font-semibold text-base">{associate?.fullName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Cédula</p>
                      <p className="font-semibold text-base">{associate?.cedula}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Zona Electoral</p>
                      <p className="font-semibold text-base">{associate?.electoralZone}</p>
                    </div>
                  </div>
                </div>

                {/* Image Upload */}
                <form onSubmit={handleSubmitCandidate} className="space-y-6">
                  <div>
                    <label htmlFor="image-upload" className="block text-sm font-medium mb-3">
                      Foto del Candidato *
                    </label>
                    <div className={`border-2 border-dashed rounded-lg p-8 text-center bg-muted/30 ${fieldErrors.image ? 'border-red-500 bg-red-50' : ''}`}>
                      {imagePreview ? (
                        <div className="space-y-4">
                          <div className="flex justify-center">
                            <img
                              src={imagePreview}
                              alt="Vista Previa"
                              className="w-32 h-32 object-cover rounded-lg"
                            />
                          </div>
                          <label htmlFor="image-upload-preview" className="block">
                            <div className="bg-primary hover:bg-primary/90 text-white py-2 px-4 rounded-lg cursor-pointer inline-block transition-colors">
                              Cambiar Foto
                            </div>
                          </label>
                          <input
                            id="image-upload-preview"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </div>
                      ) : (
                        <label htmlFor="image-upload" className="block cursor-pointer">
                          <div className="space-y-3 py-4">
                            <svg className="w-12 h-12 mx-auto text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <p className="text-sm text-muted-foreground font-medium">
                              Haz clic para cargar o arrastra y suelta
                            </p>
                            <p className="text-xs text-muted-foreground">
                              PNG, JPG, GIF hasta 10MB
                            </p>
                          </div>
                          <input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                            required
                          />
                        </label>
                      )}
                    </div>
                    {fieldErrors.image && (
                      <p className="text-xs text-red-600 mt-1">{fieldErrors.image}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="cargo" className="block text-sm font-medium mb-3">
                      Cargo *
                    </label>
                    <Input
                      id="cargo"
                      type="text"
                      value={formData.cargo}
                      onChange={(e) => {
                        setFormData({ ...formData, cargo: e.target.value });
                        if (e.target.value.trim()) {
                          setFieldErrors({ ...fieldErrors, cargo: undefined });
                        }
                      }}
                      placeholder="Ej: Gerente, Contador, etc."
                      className={`w-full ${fieldErrors.cargo ? 'border-red-500' : ''}`}
                      required
                    />
                    {fieldErrors.cargo && (
                      <p className="text-xs text-red-600 mt-1">{fieldErrors.cargo}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="localidad" className="block text-sm font-medium mb-3">
                      Localidad de Trabajo *
                    </label>
                    <Input
                      id="localidad"
                      type="text"
                      value={formData.localidad}
                      onChange={(e) => {
                        setFormData({ ...formData, localidad: e.target.value });
                        if (e.target.value.trim()) {
                          setFieldErrors({ ...fieldErrors, localidad: undefined });
                        }
                      }}
                      placeholder="Ej: Bogotá, Girardota, La Estrella."
                      className={`w-full ${fieldErrors.localidad ? 'border-red-500' : ''}`}
                      required
                    />
                    {fieldErrors.localidad && (
                      <p className="text-xs text-red-600 mt-1">{fieldErrors.localidad}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="proposal" className="block text-sm font-medium mb-3">
                      Descripción del Perfil * <span className="text-xs text-muted-foreground">({formData.proposalDescription.length}/80)</span>
                    </label>
                    <textarea
                      id="proposal"
                      value={formData.proposalDescription}
                      onChange={(e) => {
                        const value = e.target.value.slice(0, 80);
                        setFormData({ ...formData, proposalDescription: value });
                        if (value.trim()) {
                          setFieldErrors({ ...fieldErrors, proposalDescription: undefined });
                        }
                      }}
                      placeholder="Describe aquí tu perfil como candidato(a) y tus principales intereses para representar a los asociados en la Asamblea General Foncor 2026."
                      className={`w-full px-4 py-3 border rounded-lg bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 ${fieldErrors.proposalDescription ? 'border-red-500' : ''}`}
                      rows={4}
                      maxLength={80}
                      required
                    />
                    {fieldErrors.proposalDescription && (
                      <p className="text-xs text-red-600 mt-1">{fieldErrors.proposalDescription}</p>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setStep("search");
                        setAssociate(null);
                      }}
                      disabled={submitting}
                    >
                      Atrás
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-button-gradient text-white text-lg py-3"
                      disabled={submitting || !formData.image}
                    >
                      {submitting ? "Registrando..." : (
                        <>
                          <span className="block sm:hidden">Registrar</span>
                          <span className="hidden sm:inline">Registrarse como Candidato</span>
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
