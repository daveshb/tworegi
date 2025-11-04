"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Vote, User, CheckCircle, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Tipos
type Candidate = {
  id: number;
  name: string;
  party: string;
  photo: string;
  description: string;
};

// Mock data para candidatos
const candidates: Candidate[] = [
  {
    id: 1,
    name: "Miguel González",
    party: "Partido Progresista",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    description: "Experiencia en gestión pública y desarrollo social"
  },
  {
    id: 2,
    name: "Carlos Rodríguez",
    party: "Alianza Nacional",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    description: "Enfoque en economía y desarrollo empresarial"
  },
  {
    id: 3,
    name: "Ana Martínez",
    party: "Movimiento Ciudadano",
    photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    description: "Especialista en educación y políticas ambientales"
  }
];

type ViewState = 'id-entry' | 'voting' | 'confirmation' | 'success';

export default function VotingPage() {
  const router = useRouter();
  const [currentView, setCurrentView] = useState<ViewState>('id-entry');
  const [voterID, setVoterID] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);
  const [votedCandidateName, setVotedCandidateName] = useState('');

  const handleIDSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (voterID.trim() && voterID.length >= 6) {
      if (!showPassword) {
        setShowPassword(true);
        return;
      }
      if (password === '1234') {
        setCurrentView('voting');
      } else {
        alert('Contraseña incorrecta');
        setPassword('');
      }
    } else {
      alert('Por favor ingresa una cédula válida (mínimo 6 dígitos)');
    }
  };

  const handleCandidateSelect = (candidateId: number) => {
    setSelectedCandidate(candidateId);
  };

  const handleVoteConfirm = () => {
    if (selectedCandidate) {
      const candidate = candidates.find(c => c.id === selectedCandidate);
      setVotedCandidateName(candidate?.name || '');
      setCurrentView('confirmation');
    }
  };

  const handleFinalVote = () => {
    setCurrentView('success');
    
    // Después de 5 segundos, volver a la vista inicial
    setTimeout(() => {
      setCurrentView('id-entry');
      setVoterID('');
      setPassword('');
      setShowPassword(false);
      setSelectedCandidate(null);
      setVotedCandidateName('');
    }, 5000);
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard');
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
              <h1 className="text-xl font-bold">TwoRegi</h1>
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
          />
        )}

        {/* Vista 2: Selección de Candidatos */}
        {currentView === 'voting' && (
          <VotingView
            candidates={candidates}
            selectedCandidate={selectedCandidate}
            onCandidateSelect={handleCandidateSelect}
            onVoteConfirm={handleVoteConfirm}
            voterID={voterID}
          />
        )}

        {/* Vista 3: Confirmación */}
        {currentView === 'confirmation' && (
          <ConfirmationView
            candidateName={votedCandidateName}
            voterID={voterID}
            onConfirm={handleFinalVote}
            onCancel={() => setCurrentView('voting')}
          />
        )}

        {/* Vista 4: Votación Exitosa */}
        {currentView === 'success' && (
          <SuccessView voterID={voterID} />
        )}
      </div>
    </div>
  );
}

// Componente Vista 1: Ingreso de Cédula
const IDEntryView = ({ voterID, setVoterID, password, setPassword, showPassword, onSubmit }: {
  voterID: string;
  setVoterID: (id: string) => void;
  password: string;
  setPassword: (password: string) => void;
  showPassword: boolean;
  onSubmit: (e: React.FormEvent) => void;
}) => (
  <div className="max-w-md mx-auto">
    <div className="bg-card rounded-xl border p-8 text-center">
      <div className="w-16 h-16 bg-primary-10 rounded-full flex items-center justify-center mx-auto mb-6">
        <User className="w-8 h-8 text-primary" />
      </div>
      
      <h2 className="text-2xl font-bold mb-2">Identificación del Votante</h2>
      <p className="text-muted-foreground mb-8">
        Por favor ingresa tu número de cédula para continuar
      </p>

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
            maxLength={10}
            required
          />
        </div>

        {showPassword && (
          <div>
            <label htmlFor="voter-password" className="block text-sm font-medium mb-2">
              Contraseña de Verificación
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
            <p className="text-xs text-muted-foreground mt-1 text-center">
              Esta contraseña fue enviada a tu email/SMS registrado
            </p>
          </div>
        )}

        <Button
          type="submit"
          className="w-full bg-button-gradient text-white text-lg py-3"
          disabled={voterID.length < 6 || (showPassword && password.length < 4)}
        >
          {showPassword ? 'Verificar y Continuar' : 'Continuar'}
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
const VotingView = ({ candidates, selectedCandidate, onCandidateSelect, onVoteConfirm, voterID }: {
  candidates: Candidate[];
  selectedCandidate: number | null;
  onCandidateSelect: (id: number) => void;
  onVoteConfirm: () => void;
  voterID: string;
}) => (
  <div className="max-w-4xl mx-auto">
    <div className="text-center mb-8">
      <h2 className="text-3xl font-bold mb-2">Elección Presidencial 2025</h2>
      <p className="text-muted-foreground">
        Votante: ***{voterID.slice(-4)} | Selecciona tu candidato preferido
      </p>
    </div>

    <div className="grid gap-6 md:grid-cols-3 mb-8">
      {candidates.map((candidate) => (
        <CandidateCard
          key={candidate.id}
          candidate={candidate}
          isSelected={selectedCandidate === candidate.id}
          onSelect={() => onCandidateSelect(candidate.id)}
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
        src={candidate.photo}
        alt={candidate.name}
        width={96}
        height={96}
        className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
      />
      <h3 className="text-lg font-bold mb-1">{candidate.name}</h3>
      <p className="text-sm text-primary font-medium mb-2">{candidate.party}</p>
      <p className="text-xs text-muted-foreground mb-4">{candidate.description}</p>
      
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
const ConfirmationView = ({ candidateName, voterID, onConfirm, onCancel }: {
  candidateName: string;
  voterID: string;
  onConfirm: () => void;
  onCancel: () => void;
}) => (
  <div className="max-w-md mx-auto">
    <div className="bg-card rounded-xl border p-8 text-center">
      <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-8 h-8 text-yellow-600" />
      </div>
      
      <h2 className="text-2xl font-bold mb-2">Confirmar Votación</h2>
      <p className="text-muted-foreground mb-6">
        Por favor confirma tu selección antes de proceder
      </p>

      <div className="bg-primary-10 rounded-lg p-4 mb-6">
        <p className="text-sm text-muted-foreground">Has seleccionado:</p>
        <p className="text-lg font-bold text-primary">{candidateName}</p>
        <p className="text-xs text-muted-foreground mt-2">
          Votante: ***{voterID.slice(-4)}
        </p>
      </div>

      <div className="space-y-3">
        <Button
          onClick={onConfirm}
          className="w-full bg-button-gradient text-white text-lg py-3"
        >
          Confirmar y Votar
          <Vote className="w-5 h-5 ml-2" />
        </Button>
        
        <Button
          onClick={onCancel}
          variant="outline"
          className="w-full"
        >
          Cambiar Selección
        </Button>
      </div>

      <div className="mt-6 p-3 bg-yellow-50 rounded-lg">
        <p className="text-xs text-yellow-700">
          ⚠️ Una vez confirmado, tu voto no podrá ser modificado
        </p>
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
          ✅ Voto encriptado y almacenado de forma segura
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Redirigiendo automáticamente en 5 segundos...
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