"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Vote,
  Users,
  TrendingUp,
  Eye,
  ArrowLeft,
  Calendar,
  BarChart3,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";

// Tipos
type ElectionStatus = "active" | "completed" | "scheduled";

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
    id: "election-2025-pres",
    title: "Elección Presidencial 2025",
    description: "Elección para presidente de la República",
    status: "active",
    startDate: new Date("2025-11-01"),
    endDate: new Date("2025-11-30"),
    totalVoters: 15000,
    votesCount: 8750,
    participationRate: 58.33,
    candidates: [
      {
        id: 1,
        name: "Miguel González",
        party: "Partido Progresista",
        votes: 3500,
      },
      {
        id: 2,
        name: "Carlos Rodríguez",
        party: "Alianza Nacional",
        votes: 3200,
      },
      {
        id: 3,
        name: "Ana Martínez",
        party: "Movimiento Ciudadano",
        votes: 2050,
      },
    ],
  },
  {
    id: "election-2025-congress",
    title: "Elección Congreso 2025",
    description: "Elección para diputados al Congreso Nacional",
    status: "active",
    startDate: new Date("2025-10-15"),
    endDate: new Date("2025-11-15"),
    totalVoters: 20000,
    votesCount: 12400,
    participationRate: 62.0,
    candidates: [
      { id: 4, name: "Laura Pérez", party: "Partido Liberal", votes: 4800 },
      { id: 5, name: "Roberto Silva", party: "Unión Popular", votes: 4200 },
      { id: 6, name: "Carmen López", party: "Alianza Verde", votes: 3400 },
    ],
  },
  {
    id: "election-2025-mayor",
    title: "Elección Alcaldía Municipal",
    description: "Elección para alcalde del municipio",
    status: "completed",
    startDate: new Date("2025-09-01"),
    endDate: new Date("2025-09-30"),
    totalVoters: 8500,
    votesCount: 7650,
    participationRate: 90.0,
    candidates: [
      { id: 7, name: "Diego Morales", party: "Movimiento Cívico", votes: 4200 },
      {
        id: 8,
        name: "Patricia Ruiz",
        party: "Partido Democrático",
        votes: 2450,
      },
      { id: 9, name: "Andrés Castro", party: "Independiente", votes: 1000 },
    ],
  },
];

export default function ReportsPage() {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<"all" | ElectionStatus>(
    "all",
  );
  const [candidatesCount, setCandidatesCount] = useState(0);
  const [loadingCandidates, setLoadingCandidates] = useState(true);

  const filteredElections = mockElections.filter(
    (election) =>
      selectedStatus === "all" || election.status === selectedStatus,
  );

  console.log('entro')
  // Cargar candidatos de la BD
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoadingCandidates(true);
        const response = await fetch("/api/candidates");
        console.log("[Reports] Endpoint de candidatos respondió:", response.status);
        if (response.ok) {
          const data = await response.json();
          console.log("[Reports] Datos de candidatos:", data);
          const count = data.data?.length || 0;
          console.log("[Reports] Cantidad de candidatos:", count);
          setCandidatesCount(count);
        } else {
          console.error("[Reports] Error en endpoint de candidatos:", response.status);
        }
      } catch (error) {
        console.error("[Reports] Error al cargar candidatos:", error);
      } finally {
        setLoadingCandidates(false);
      }
    };

    fetchCandidates();
  }, []);

  const handleViewDetails = (electionId: string) => {
    router.push(`/reports/${electionId}`);
  };

  const handleBackToDashboard = () => {
    router.push("/dashboard");
  };

  const getStatusColor = (status: ElectionStatus) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "scheduled":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: ElectionStatus) => {
    switch (status) {
      case "active":
        return "Activa";
      case "completed":
        return "Finalizada";
      case "scheduled":
        return "Programada";
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-voting-gradient">
      {/* Header */}
      <header className="border-b bg-card-50 backdrop-blur supports-backdrop-filter:bg-card/50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={handleBackToDashboard} className="cursor-pointer">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Dashboard
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-logo-gradient rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">TwoRegistro - Reportes</h1>
              <p className="text-sm text-muted-foreground">
                Análisis de Votaciones
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Votación de Delegados - Destacado */}
        <div className="mb-8">
          <div
            className="bg-linear-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-xl p-8 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push("/reports/voting")}
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2">
                  🗳️ Votación de Delegados
                </h2>
                <p className="text-muted-foreground mb-4">
                  Visualiza los votos registrados en el sistema electoral en
                  tiempo real
                </p>
                <Button className="bg-button-gradient text-white cursor-pointer">
                  Ver Resultados de Votación
                  <Vote className="w-4 h-4 ml-2" />
                </Button>
              </div>
              <Vote className="w-16 h-16 text-primary/20" />
            </div>
          </div>
        </div>

        {/* Candidatos Postulados - Destacado */}
        <div className="mb-8">
          <div
            className="bg-linear-to-r from-blue-500/10 to-cyan-500/10 border border-blue-200 rounded-xl p-8 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push("/reports/candidates")}
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2">
                  👥 Candidatos Postulados
                </h2>
                <p className="text-muted-foreground mb-4">
                  Lista de todos los asociados postulados segmentados por zonas electorales
                </p>
                <Button className="bg-linear-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 cursor-pointer">
                  Ver Candidatos
                  <Users className="w-4 h-4 ml-2" />
                </Button>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-2">Total de Candidatos</p>
                <p className="text-5xl font-bold text-blue-600">
                  {loadingCandidates ? (
                    <Loader2 className="w-10 h-10 animate-spin inline" />
                  ) : (
                    candidatesCount
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        {false && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">
              Otras Votaciones y Reportes
            </h2>
            <div className="flex gap-2">
              <Button
                variant={selectedStatus === "all" ? "default" : "outline"}
                onClick={() => setSelectedStatus("all")}
              >
                Todas
              </Button>
              <Button
                variant={selectedStatus === "active" ? "default" : "outline"}
                onClick={() => setSelectedStatus("active")}
              >
                Activas
              </Button>
              <Button
                variant={selectedStatus === "completed" ? "default" : "outline"}
                onClick={() => setSelectedStatus("completed")}
              >
                Finalizadas
              </Button>
              <Button
                variant={selectedStatus === "scheduled" ? "default" : "outline"}
                onClick={() => setSelectedStatus("scheduled")}
              >
                Programadas
              </Button>
            </div>
          </div>
        )}

        {/* Lista de Elecciones */}
        {false && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredElections.map((election) => (
              <div
                key={election.id}
                className="bg-card rounded-xl border p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">
                      {election.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {election.description}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(election.status)}`}
                  >
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
                    <span className="font-medium">
                      {election.participationRate}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Vote className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Votos</span>
                    </div>
                    <span className="font-medium">
                      {election.votesCount.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Habilitados</span>
                    </div>
                    <span className="font-medium">
                      {election.totalVoters.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Período</span>
                    </div>
                    <span className="text-xs">
                      {election.startDate.toLocaleDateString()} -{" "}
                      {election.endDate.toLocaleDateString()}
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
        )}

        {filteredElections.length === 0 && (
          <div className="text-center py-12">
            <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No hay votaciones disponibles
            </h3>
            <p className="text-muted-foreground">
              No se encontraron votaciones con el filtro seleccionado.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
