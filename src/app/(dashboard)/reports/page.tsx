"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Vote, Users, TrendingUp, Eye, ArrowLeft, Calendar, BarChart3 } from "lucide-react";
import { useRouter } from "next/navigation";

// Tipos
type ElectionStatus = 'active' | 'completed' | 'scheduled';

type Election = {
  id: string;
  title: string;
  description: string;
  status: ElectionStatus;
  startDate: Date;
  endDate: Date;
  totalVoters: number;
  votesCount: number;
  participationRate: number;
  candidates: Array<{
    id: number;
    name: string;
    party: string;
    votes: number;
  }>;
};

// Mock data para elecciones
const mockElections: Election[] = [
  {
    id: 'election-2025-pres',
    title: 'Elección Presidencial 2025',
    description: 'Elección para presidente de la República',
    status: 'active',
    startDate: new Date('2025-11-01'),
    endDate: new Date('2025-11-30'),
    totalVoters: 15000,
    votesCount: 8750,
    participationRate: 58.33,
    candidates: [
      { id: 1, name: 'Miguel González', party: 'Partido Progresista', votes: 3500 },
      { id: 2, name: 'Carlos Rodríguez', party: 'Alianza Nacional', votes: 3200 },
      { id: 3, name: 'Ana Martínez', party: 'Movimiento Ciudadano', votes: 2050 }
    ]
  },
  {
    id: 'election-2025-congress',
    title: 'Elección Congreso 2025',
    description: 'Elección para diputados al Congreso Nacional',
    status: 'active',
    startDate: new Date('2025-10-15'),
    endDate: new Date('2025-11-15'),
    totalVoters: 20000,
    votesCount: 12400,
    participationRate: 62.00,
    candidates: [
      { id: 4, name: 'Laura Pérez', party: 'Partido Liberal', votes: 4800 },
      { id: 5, name: 'Roberto Silva', party: 'Unión Popular', votes: 4200 },
      { id: 6, name: 'Carmen López', party: 'Alianza Verde', votes: 3400 }
    ]
  },
  {
    id: 'election-2025-mayor',
    title: 'Elección Alcaldía Municipal',
    description: 'Elección para alcalde del municipio',
    status: 'completed',
    startDate: new Date('2025-09-01'),
    endDate: new Date('2025-09-30'),
    totalVoters: 8500,
    votesCount: 7650,
    participationRate: 90.00,
    candidates: [
      { id: 7, name: 'Diego Morales', party: 'Movimiento Cívico', votes: 4200 },
      { id: 8, name: 'Patricia Ruiz', party: 'Partido Democrático', votes: 2450 },
      { id: 9, name: 'Andrés Castro', party: 'Independiente', votes: 1000 }
    ]
  }
];

export default function ReportsPage() {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<'all' | ElectionStatus>('all');

  const filteredElections = mockElections.filter(election => 
    selectedStatus === 'all' || election.status === selectedStatus
  );

  const handleViewDetails = (electionId: string) => {
    router.push(`/reports/${electionId}`);
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  const getStatusColor = (status: ElectionStatus) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: ElectionStatus) => {
    switch (status) {
      case 'active': return 'Activa';
      case 'completed': return 'Finalizada';
      case 'scheduled': return 'Programada';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-voting-gradient">
      {/* Header */}
      <header className="border-b bg-card-50 backdrop-blur supports-backdrop-filter:bg-card/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-logo-gradient rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">TwoRegi - Reportes</h1>
              <p className="text-sm text-muted-foreground">Análisis de Votaciones</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleBackToDashboard}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Dashboard
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Filtros */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Votaciones y Reportes</h2>
          <div className="flex gap-2">
            <Button
              variant={selectedStatus === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedStatus('all')}
            >
              Todas
            </Button>
            <Button
              variant={selectedStatus === 'active' ? 'default' : 'outline'}
              onClick={() => setSelectedStatus('active')}
            >
              Activas
            </Button>
            <Button
              variant={selectedStatus === 'completed' ? 'default' : 'outline'}
              onClick={() => setSelectedStatus('completed')}
            >
              Finalizadas
            </Button>
            <Button
              variant={selectedStatus === 'scheduled' ? 'default' : 'outline'}
              onClick={() => setSelectedStatus('scheduled')}
            >
              Programadas
            </Button>
          </div>
        </div>

        {/* Lista de Elecciones */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredElections.map((election) => (
            <div key={election.id} className="bg-card rounded-xl border p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold mb-1">{election.title}</h3>
                  <p className="text-sm text-muted-foreground">{election.description}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(election.status)}`}>
                  {getStatusText(election.status)}
                </span>
              </div>

              {/* Estadísticas */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Participación</span>
                  </div>
                  <span className="font-medium">{election.participationRate}%</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Vote className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Votos</span>
                  </div>
                  <span className="font-medium">{election.votesCount.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Habilitados</span>
                  </div>
                  <span className="font-medium">{election.totalVoters.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Período</span>
                  </div>
                  <span className="text-xs">
                    {election.startDate.toLocaleDateString()} - {election.endDate.toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Barra de progreso */}
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1">
                  <span>Progreso de votación</span>
                  <span>{election.participationRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-button-gradient h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${election.participationRate}%` }}
                  ></div>
                </div>
              </div>

              {/* Botón Ver Detalles */}
              <Button 
                onClick={() => handleViewDetails(election.id)}
                className="w-full bg-primary hover:bg-primary/90"
              >
                <Eye className="w-4 h-4 mr-2" />
                Ver Reportes Detallados
              </Button>
            </div>
          ))}
        </div>

        {filteredElections.length === 0 && (
          <div className="text-center py-12">
            <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay votaciones disponibles</h3>
            <p className="text-muted-foreground">
              No se encontraron votaciones con el filtro seleccionado.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}