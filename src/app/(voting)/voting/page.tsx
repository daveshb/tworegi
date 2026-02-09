"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Vote, CheckCircle, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo from "../../../assets/imagen.png"

// Tipos
type Candidate = {
  _id: string;
  fullName: string;
  proposalDescription: string;
  imageUrl: string;
  electoralZone: string;
  position?: string;
  locality?: string;
};

type ViewState = 'id-entry' | 'voting' | 'confirmation' | 'success' | 'already-voted';

export default function VotingPage() {
  const router = useRouter();
  const [currentView, setCurrentView] = useState<ViewState>('id-entry');
  const [voterID, setVoterID] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [votedCandidateName, setVotedCandidateName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [associateData, setAssociateData] = useState<{ fullName: string; electoralZone: string; email: string; cellPhone: string } | null>(null);
  const [zoneCandidates, setZoneCandidates] = useState<Candidate[]>([]);
  const [alternativeWhatsApp, setAlternativeWhatsApp] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  // Función para validar número de WhatsApp
  const isValidWhatsApp = (phone: string): boolean => {
    const cleaned = phone.replace(/[\s()-]/g, '');
    const phoneRegex = /^(\+57|57)?[1-9]\d{9}$/;
    return phoneRegex.test(cleaned);
  };

  // Función para normalizar número de WhatsApp
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

  const handleIDSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (voterID.trim() && voterID.length >= 6) {
        if (!showPassword) {
          // Primera vez: buscar asociado y verificar si ya votó
          const response = await fetch(`/api/associates/by-cedula?cedula=${voterID}`);
          
          if (!response.ok) {
            setError('Cédula no encontrada en el sistema');
            setLoading(false);
            return;
          }

          const data = await response.json();
          const associate = data.data;

          // Verificar si el usuario ya votó
          const voteCheckResponse = await fetch(`/api/votes/check?voterId=${voterID}`);
          const voteCheckData = await voteCheckResponse.json();

          if (voteCheckData.hasVoted) {
            // Usuario ya votó
            setCurrentView('already-voted');
            setLoading(false);
            return;
          }

          setAssociateData(associate);

          // Obtener candidatos de la misma zona
          const candidatesResponse = await fetch(`/api/candidates?electoralZone=${associate.electoralZone}`);
          const candidatesData = await candidatesResponse.json();
          setZoneCandidates(candidatesData.data || []);

          // Generar y enviar código de verificación
          const codeResponse = await fetch("/api/generateVerificationCode", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              cedula: associate.cedula,
              whatsapp: associate.cellPhone,
            }),
          });

          if (!codeResponse.ok) {
            const errorData = await codeResponse.json();
            throw new Error(errorData.error || "Error al generar código de verificación");
          }

          setShowPassword(true);
        } else {
          // Segunda vez: validar código
          try {
            const verifyResponse = await fetch("/api/verifyCode", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                cedula: voterID,
                code: password,
              }),
            });

            if (!verifyResponse.ok) {
              const data = await verifyResponse.json();
              setError(data.error || 'Código incorrecto. Verifica el código enviado a tu WhatsApp');
              setPassword('');
              return;
            }

            setCurrentView('voting');
          } catch (err) {
            setError('Error al verificar el código');
          }
        }
      } else {
        setError('Por favor ingresa una cédula válida (mínimo 6 dígitos)');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error');
    } finally {
      setLoading(false);
    }
  };

  const handleCandidateSelect = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
  };

  const handleVoteConfirm = () => {
    if (selectedCandidate) {
      setVotedCandidateName(selectedCandidate.fullName);
      setCurrentView('confirmation');
    }
  };

  const handleFinalVote = async () => {
    if (!selectedCandidate || !associateData) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voterId: voterID,
          voterName: associateData.fullName,
          voterZone: associateData.electoralZone,
          candidateId: selectedCandidate._id,
          candidateName: selectedCandidate.fullName,
          candidateZone: selectedCandidate.electoralZone,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al registrar voto');
      }

      setCurrentView('success');
      
      // Después de 8 segundos, volver a la vista inicial
      setTimeout(() => {
        handleReset();
      }, 8000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar voto');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  const handleResendCode = async (whatsapp: string) => {
    setResendLoading(true);
    setError('');

    try {
      const normalizedWhatsApp = normalizeWhatsApp(whatsapp || associateData?.cellPhone || "");
      
      const codeResponse = await fetch("/api/generateVerificationCode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cedula: voterID,
          whatsapp: normalizedWhatsApp,
        }),
      });

      if (!codeResponse.ok) {
        const errorData = await codeResponse.json();
        throw new Error(errorData.error || "Error al enviar el código");
      }

      setError('');
      toast.success(`Código enviado exitosamente al WhatsApp: ${normalizedWhatsApp}`, {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar el código. Intenta nuevamente.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleReset = () => {
    setCurrentView('id-entry');
    setVoterID('');
    setPassword('');
    setShowPassword(false);
    setSelectedCandidate(null);
    setVotedCandidateName('');
    setError('');
    setAssociateData(null);
    setZoneCandidates([]);
    setAlternativeWhatsApp('');
  };

  return (
    <div className="min-h-screen bg-voting-gradient">
      {/* Header */}
      <header className="border-b bg-card-50 backdrop-blur supports-backdrop-filter:bg-card/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-logo-gradient rounded-lg flex items-center justify-center">
              <Vote className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">TwoRegistro</h1>
              <p className="text-sm text-muted-foreground">Sistema de Votación</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleBackToDashboard}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Dashboard
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Vista 1: Ingreso de Cédula */}
        {currentView === 'id-entry' && (
          <IDEntryView 
            voterID={voterID}
            setVoterID={setVoterID}
            password={password}
            setPassword={setPassword}
            showPassword={showPassword}
            onSubmit={handleIDSubmit}
            loading={loading}
            error={error}
            associateEmail={associateData?.cellPhone}
            alternativeWhatsApp={alternativeWhatsApp}
            setAlternativeWhatsApp={setAlternativeWhatsApp}
            onResendCode={handleResendCode}
            resendLoading={resendLoading}
            isValidWhatsApp={isValidWhatsApp}
          />
        )}

        {/* Vista 2: Selección de Candidatos */}
        {currentView === 'voting' && associateData && (
          <VotingView
            candidates={zoneCandidates}
            selectedCandidate={selectedCandidate}
            onCandidateSelect={handleCandidateSelect}
            onVoteConfirm={handleVoteConfirm}
            voterZone={associateData.electoralZone}
          />
        )}

        {/* Vista 3: Confirmación */}
        {currentView === 'confirmation' && (
          <ConfirmationView
            candidateName={votedCandidateName}
            onConfirm={handleFinalVote}
            onCancel={() => setCurrentView('voting')}
            loading={loading}
          />
        )}

        {/* Vista 4: Votación Exitosa */}
        {currentView === 'success' && (
          <SuccessView voterID={voterID} />
        )}

        {/* Vista 5: Ya Votó */}
        {currentView === 'already-voted' && (
          <AlreadyVotedView 
            onReturn={() => {
              setCurrentView('id-entry');
              setVoterID('');
              setPassword('');
              setShowPassword(false);
              setError('');
            }}
          />
        )}
      </div>
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
      />
    </div>
  );
}

// Componente Vista 1: Ingreso de Cédula
const IDEntryView = ({ voterID, setVoterID, password, setPassword, showPassword, onSubmit, loading, error, associateEmail, alternativeWhatsApp, setAlternativeWhatsApp, onResendCode, resendLoading, isValidWhatsApp }: {
  voterID: string;
  setVoterID: (id: string) => void;
  password: string;
  setPassword: (password: string) => void;
  showPassword: boolean;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  error: string;
  associateEmail?: string;
  alternativeWhatsApp: string;
  setAlternativeWhatsApp: (phone: string) => void;
  onResendCode: (phone: string) => Promise<void>;
  resendLoading: boolean;
  isValidWhatsApp: (phone: string) => boolean;
}) => (
  <div className="max-w-md mx-auto">
    <div className="bg-card rounded-xl border p-8 text-center">
      
      <div className="flex justify-center mb-6">
        <Image src={logo} alt="Logo" width={120} height={120}/>
      </div>
      
      <h2 className="text-xl font-bold mb-3">Votación delegados asamblea general</h2>
      <h2 className="text-xl font-bold mb-3">Foncor 2026</h2>
      <h2 className="text-2xl font-bold mb-6">Identificación del Votante</h2>
      <p className="text-sm text-muted-foreground mb-8">
        Por favor ingresa tu número de cédula para continuar
      </p>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-800 p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label htmlFor="voter-id" className="block text-sm font-medium mb-2">
            Número de Cédula
          </label>
          <Input
            id="voter-id"
            type="text"
            placeholder="Ej: 12345678"
            value={voterID}
            onChange={(e) => setVoterID(e.target.value.replace(/\D/g, ''))}
            className="text-center text-lg"
            required
          />
        </div>

        {showPassword && (
          <div>
            <label htmlFor="voter-password" className="block text-sm font-medium mb-2">
              Código de Verificación
            </label>
            <Input
              id="voter-password"
              type="password"
              placeholder="Ingresa tu código de 4 dígitos"
              value={password}
              onChange={(e) => setPassword(e.target.value.replace(/\D/g, ''))}
              className="text-center text-lg"
              maxLength={4}
              required
            />
          
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Este código fue enviado al WhatsApp:
            </p>
            <p className="text-sm font-semibold text-primary text-center mb-4">
              {associateEmail}
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
              onClick={() => onResendCode(alternativeWhatsApp)}
              disabled={!alternativeWhatsApp || !isValidWhatsApp(alternativeWhatsApp) || resendLoading}
            >
              {resendLoading ? 'Enviando...' : 'Enviar Código a Este Número de WhatsApp'}
            </Button>

            {alternativeWhatsApp && !isValidWhatsApp(alternativeWhatsApp) && (
              <p className="text-xs text-red-600 mt-2 text-center">
                Por favor ingresa un número de WhatsApp válido
              </p>
            )}
          </div>
        )}

        <Button
          type="submit"
          className="w-full bg-button-gradient text-white text-lg py-3"
          disabled={voterID.length < 6 || (showPassword && password.length < 4) || loading}
        >
          {loading ? 'Procesando...' : showPassword ? 'Verificar y Continuar' : 'Continuar'}
          <Vote className="w-5 h-5 ml-2" />
        </Button>
      </form>

      <div className="mt-6 p-4 bg-primary-10 rounded-lg">
        <p className="text-xs text-primary">
          Tu identidad será verificada de forma segura y anónima
        </p>
      </div>
    </div>
  </div>
);

// Componente Vista 2: Votación
const VotingView = ({ candidates, selectedCandidate, onCandidateSelect, onVoteConfirm, voterZone }: {
  candidates: Candidate[];
  selectedCandidate: Candidate | null;
  onCandidateSelect: (candidate: Candidate) => void;
  onVoteConfirm: () => void;
  voterZone: string;
}) => (
  <div className="max-w-4xl mx-auto">
    <div className="text-center mb-8">
      <h2 className="text-3xl font-bold mb-2">Elección Presidencial 2025</h2>
      <p className="text-muted-foreground mb-2">
        Zona Electoral: <span className="font-semibold">{voterZone}</span>
      </p>
      <p className="text-muted-foreground">
        Selecciona tu candidato preferido
      </p>
    </div>

    {candidates.length === 0 ? (
      <div className="text-center p-8">
        <p className="text-muted-foreground">No hay candidatos disponibles en tu zona electoral</p>
      </div>
    ) : (
      <>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {candidates.map((candidate) => (
            <CandidateCard
              key={candidate._id}
              candidate={candidate}
              isSelected={selectedCandidate?._id === candidate._id}
              onSelect={() => onCandidateSelect(candidate)}
            />
          ))}
        </div>

        <div className="text-center">
          <Button
            onClick={onVoteConfirm}
            disabled={!selectedCandidate}
            className="bg-button-gradient text-white text-lg px-8 py-3"
          >
            Confirmar Selección
            <CheckCircle className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </>
    )}
  </div>
);

// Componente Tarjeta de Candidato
const CandidateCard = ({ candidate, isSelected, onSelect }: {
  candidate: Candidate;
  isSelected: boolean;
  onSelect: () => void;
}) => (
  <div 
    className={`bg-card rounded-xl border p-6 cursor-pointer transition-all hover:shadow-lg ${
      isSelected ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : ''
    }`}
    onClick={onSelect}
  >
    <div className="text-center">
      <Image
        src={candidate.imageUrl}
        alt={candidate.fullName}
        width={96}
        height={96}
        className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
      />
      <h3 className="text-lg font-bold mb-1">{candidate.fullName}</h3>
      
      {candidate.position && (
        <p className="text-sm font-semibold text-primary mb-1">{candidate.position}</p>
      )}
      
      {candidate.locality && (
        <p className="text-xs text-muted-foreground mb-2">📍 {candidate.locality}</p>
      )}
      
      <p className="text-xs text-muted-foreground mb-1">Zona: {candidate.electoralZone}</p>
      
      <p className="text-xs text-muted-foreground mb-4 line-clamp-4 max-h-20 overflow-hidden">
        {candidate.proposalDescription ? (
          <>
            {candidate.proposalDescription.length > 300 
              ? candidate.proposalDescription.substring(0, 300) + '...' 
              : candidate.proposalDescription}
            {candidate.proposalDescription.length > 300 && (
              <span className="text-gray-500"> ({candidate.proposalDescription.length}/300 caracteres)</span>
            )}
          </>
        ) : (
          'Sin propuesta registrada'
        )}
      </p>
      
      <Button
        variant={isSelected ? "default" : "outline"}
        className={isSelected ? "bg-primary text-white" : ""}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        {isSelected ? "Seleccionado" : "Seleccionar"}
        {isSelected && <CheckCircle className="w-4 h-4 ml-2" />}
      </Button>
    </div>
  </div>
);

// Componente Vista 3: Confirmación
const ConfirmationView = ({ candidateName, onConfirm, onCancel, loading }: {
  candidateName: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) => (
  <div className="max-w-md mx-auto">
    <div className="bg-card rounded-xl border p-8 text-center">
      <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-8 h-8 text-yellow-600" />
      </div>

      <h2 className="text-2xl font-bold mb-2">Confirmar Voto</h2>
      <p className="text-muted-foreground mb-6">
        Estás a punto de votar por:
      </p>

      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-8">
        <p className="text-xl font-bold text-primary">{candidateName}</p>
      </div>

      <p className="text-sm text-muted-foreground mb-8">
        Una vez confirmado, tu voto será registrado y esta acción no se puede deshacer.
      </p>

      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={onCancel}
          disabled={loading}
        >
          Cambiar
        </Button>
        <Button
          className="flex-1 bg-button-gradient text-white"
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? 'Registrando...' : 'Confirmar Voto'}
          {!loading && <CheckCircle className="w-4 h-4 ml-2" />}
        </Button>
      </div>
    </div>
  </div>
);

// Componente Vista 4: Éxito
const SuccessView = ({ voterID }: { voterID: string }) => (
  <div className="max-w-md mx-auto">
    <div className="bg-card rounded-xl border p-8 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
        <CheckCircle className="w-10 h-10 text-green-600" />
      </div>
      
      <h2 className="text-3xl font-bold text-green-600 mb-2">¡Votación Realizada!</h2>
      <p className="text-muted-foreground mb-6">
        Tu voto ha sido registrado exitosamente
      </p>

      <div className="bg-green-50 rounded-lg p-4 mb-6">
        <p className="text-sm text-green-700">
          <strong>Comprobante:</strong> VOT-{new Date().getTime().toString().slice(-6)}
        </p>
        <p className="text-xs text-green-600 mt-1">
          Votante: ***{voterID.slice(-4)}
        </p>
      </div>

      <div className="bg-primary-10 rounded-lg p-4">
        <p className="text-sm text-primary">
          ✅ Voto registrado exitosamente.
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Redirigiendo automáticamente en 8 segundos...
        </p>
      </div>

      <div className="mt-6">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
        </div>
      </div>
    </div>
  </div>
);

// Componente Vista 5: Ya Votó
const AlreadyVotedView = ({ onReturn }: { onReturn: () => void }) => (
  <div className="max-w-md mx-auto">
    <div className="bg-card rounded-xl border p-8 text-center">
      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-10 h-10 text-blue-600" />
      </div>
      
      <h2 className="text-2xl font-bold text-blue-600 mb-2">Voto Ya Registrado</h2>
      <p className="text-muted-foreground mb-6">
        Tu voto ha sido registrado previamente en nuestro sistema
      </p>

      <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
        <p className="text-sm text-blue-700">
          No es posible votar más de una vez. Tu participación ya ha sido contabilizada.
        </p>
      </div>

      <p className="text-xs text-muted-foreground mb-6">
        Si crees que esto es un error, por favor contacta con los administradores del sistema.
      </p>

      <Button
        onClick={onReturn}
        className="w-full bg-primary text-white py-3"
      >
        Volver al Inicio
      </Button>
    </div>
  </div>
);