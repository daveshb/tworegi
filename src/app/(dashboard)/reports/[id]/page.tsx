"use client"

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Vote, TrendingUp, Calendar, Download, RefreshCw } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Tipos
type ElectionDetails = {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'scheduled';
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
    percentage: number;
    color: string;
  }>;
  hourlyData: Array<{
    hour: string;
    votes: number;
  }>;
  demographicData: {
    byAge: Array<{ range: string; votes: number; percentage: number }>;
    byGender: Array<{ gender: string; votes: number; percentage: number }>;
  };
};

// Mock data detallado
const getElectionDetails = (id: string): ElectionDetails | null => {
  const mockData: { [key: string]: ElectionDetails } = {
    'election-2025-pres': {
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
        { id: 1, name: 'Miguel González', party: 'Partido Progresista', votes: 3500, percentage: 40.0, color: '#3B82F6' },
        { id: 2, name: 'Carlos Rodríguez', party: 'Alianza Nacional', votes: 3200, percentage: 36.6, color: '#EF4444' },
        { id: 3, name: 'Ana Martínez', party: 'Movimiento Ciudadano', votes: 2050, percentage: 23.4, color: '#10B981' }
      ],
      hourlyData: [
        { hour: '08:00', votes: 450 },
        { hour: '10:00', votes: 780 },
        { hour: '12:00', votes: 1200 },
        { hour: '14:00', votes: 1650 },
        { hour: '16:00', votes: 2100 },
        { hour: '18:00', votes: 2370 },
        { hour: '20:00', votes: 2200 }
      ],
      demographicData: {
        byAge: [
          { range: '18-25', votes: 1750, percentage: 20.0 },
          { range: '26-35', votes: 2625, percentage: 30.0 },
          { range: '36-50', votes: 2800, percentage: 32.0 },
          { range: '51+', votes: 1575, percentage: 18.0 }
        ],
        byGender: [
          { gender: 'Femenino', votes: 4550, percentage: 52.0 },
          { gender: 'Masculino', votes: 4200, percentage: 48.0 }
        ]
      }
    }
  };

  return mockData[id] || null;
};

export default function ElectionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const electionId = params.id as string;
  
  const election = getElectionDetails(electionId);

  if (!election) {
    return (
      <div className="min-h-screen bg-voting-gradient flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Elección no encontrada</h1>
          <Button onClick={() => router.push('/reports')}>
            Volver a Reportes
          </Button>
        </div>
      </div>
    );
  }

  // Configuración para gráfico de barras (Resultados por candidato)
  const barChartData = {
    labels: election.candidates.map(c => c.name),
    datasets: [
      {
        label: 'Votos',
        data: election.candidates.map(c => c.votes),
        backgroundColor: election.candidates.map(c => c.color),
        borderColor: election.candidates.map(c => c.color),
        borderWidth: 1,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Votos por Candidato',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // Configuración para gráfico de dona (Porcentajes)
  const doughnutChartData = {
    labels: election.candidates.map(c => `${c.name} (${c.percentage}%)`),
    datasets: [
      {
        data: election.candidates.map(c => c.percentage),
        backgroundColor: election.candidates.map(c => c.color),
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  const doughnutChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: true,
        text: 'Distribución de Votos (%)',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
    },
  };

  // Configuración para gráfico de participación por hora
  const hourlyChartData = {
    labels: election.hourlyData.map(h => h.hour),
    datasets: [
      {
        label: 'Votos Acumulados',
        data: election.hourlyData.map(h => h.votes),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
      },
    ],
  };

  const hourlyChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Participación por Hora',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
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
            <Button variant="outline" size="sm" onClick={() => router.push('/reports')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-xl font-bold">{election.title}</h1>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(election.status)}`}>
                  {getStatusText(election.status)}
                </span>
                <span className="text-sm text-muted-foreground">{election.description}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Estadísticas Generales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card rounded-xl border p-6">
            <div className="flex items-center gap-3 mb-2">
              <Vote className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{election.votesCount.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Votos</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border p-6">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{election.totalVoters.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Habilitados</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{election.participationRate}%</p>
                <p className="text-sm text-muted-foreground">Participación</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border p-6">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-lg font-bold">
                  {Math.ceil((election.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
                </p>
                <p className="text-sm text-muted-foreground">Días Restantes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Gráficos Principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Gráfico de Barras - Votos por Candidato */}
          <div className="bg-card rounded-xl border p-6">
            <Bar data={barChartData} options={barChartOptions} />
          </div>

          {/* Gráfico de Dona - Porcentajes */}
          <div className="bg-card rounded-xl border p-6">
            <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
          </div>
        </div>

        {/* Gráfico de Participación por Hora */}
        <div className="bg-card rounded-xl border p-6 mb-8">
          <Bar data={hourlyChartData} options={hourlyChartOptions} />
        </div>

        {/* Tabla de Resultados Detallados */}
        <div className="bg-card rounded-xl border p-6">
          <h3 className="text-xl font-bold mb-4">Resultados Detallados</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Candidato</th>
                  <th className="text-left py-3 px-4">Partido</th>
                  <th className="text-right py-3 px-4">Votos</th>
                  <th className="text-right py-3 px-4">Porcentaje</th>
                  <th className="text-center py-3 px-4">Estado</th>
                </tr>
              </thead>
              <tbody>
                {election.candidates
                  .sort((a, b) => b.votes - a.votes)
                  .map((candidate, index) => (
                    <tr key={candidate.id} className="border-b last:border-b-0">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: candidate.color }}
                          ></div>
                          <div>
                            <p className="font-semibold">{candidate.name}</p>
                            {index === 0 && election.status === 'active' && (
                              <span className="text-xs text-green-600 font-medium">Liderando</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{candidate.party}</td>
                      <td className="py-3 px-4 text-right font-mono">{candidate.votes.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right font-mono">{candidate.percentage}%</td>
                      <td className="py-3 px-4 text-center">
                        {index === 0 ? (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                            1º Lugar
                          </span>
                        ) : (
                          <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                            {index + 1}º Lugar
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}