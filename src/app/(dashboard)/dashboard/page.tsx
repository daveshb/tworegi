"use client"

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Vote, Users, BarChart3, LogOut, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

type DashboardStats = {
  totalVotes: number;
  totalCandidates: number;
  totalAssociates: number;
  participationRate: number;
};

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalVotes: 0,
    totalCandidates: 0,
    totalAssociates: 0,
    participationRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar token en localStorage y redirigir si no existe
    try {
      const token = localStorage.getItem('tworegi_token');
      if (!token) router.push('/login');
    } catch {
      router.push('/login');
    }

    // Cargar datos del dashboard
    loadDashboardData();
  }, [router]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Obtener datos de votos
      const votesResponse = await fetch('/api/votes');
      const votesData = votesResponse.ok ? await votesResponse.json() : { totalVotes: 0, totalCandidates: 0, votesByZone: {} };
      
      // Obtener datos de candidatos
      const candidatesResponse = await fetch('/api/candidates');
      const candidatesData = candidatesResponse.ok ? await candidatesResponse.json() : { data: [] };
      
      // Obtener datos de asociados
      const associatesResponse = await fetch('/api/associates');
      const associatesData = associatesResponse.ok ? await associatesResponse.json() : { data: [] };
      
      const totalAssociates = associatesData.data?.length || 0;
      const totalVotes = votesData.totalVotes || 0;
      const totalCandidates = candidatesData.data?.length || 0;
      const participationRate = totalAssociates > 0 ? ((totalVotes / totalAssociates) * 100) : 0;
      
      setStats({
        totalVotes,
        totalCandidates,
        totalAssociates,
        participationRate: parseFloat(participationRate.toFixed(1))
      });
      
      console.log('[Dashboard] Datos cargados:', { totalVotes, totalCandidates, totalAssociates, participationRate });
    } catch (error) {
      console.error('[Dashboard] Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    // Borrar token en cliente e intentar limpiar cookie en servidor
    localStorage.removeItem('tworegi_token');
    try {
      await fetch('/api/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    router.push('/login');
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
              <p className="text-sm text-muted-foreground">Panel de Administración</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="cursor-pointer">
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2">¡Bienvenido, Admin!</h2>
          <p className="text-muted-foreground">Gestiona tus elecciones y visualiza estadísticas en tiempo real</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            icon={<Vote className="w-8 h-8 text-primary" />}
            title="Votos Registrados"
            value={loading ? '-' : stats.totalVotes.toString()}
            subtitle={loading ? 'Cargando...' : `En ${new Date().toLocaleDateString('es-CO')}`}
            bgColor="bg-primary-10"
          />
          <StatsCard
            icon={<Users className="w-8 h-8 text-secondary" />}
            title="Candidatos Postulados"
            value={loading ? '-' : stats.totalCandidates.toString()}
            subtitle={loading ? 'Cargando...' : `Total de candidatos registrados`}
            bgColor="bg-secondary/10"
          />
          <StatsCard
            icon={<BarChart3 className="w-8 h-8 text-primary" />}
            title="Tasa de Participación"
            value={loading ? '-' : `${stats.participationRate}%`}
            subtitle={loading ? 'Cargando...' : `${stats.totalVotes} de ${stats.totalAssociates} asociados`}
            bgColor="bg-primary-10"
          />
          <StatsCard
            icon={<Users className="w-8 h-8 text-muted-foreground" />}
            title="Asociados Registrados"
            value={loading ? '-' : stats.totalAssociates.toString()}
            subtitle={loading ? 'Cargando...' : `Total en el sistema`}
            bgColor="bg-muted/10"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button variant="outline" onClick={() => router.push('/reports')} className="cursor-pointer h-12 px-6 text-lg">
            <BarChart3 className="w-5 h-5 mr-2" />
            Ver Reportes
          </Button>
          <Button variant="outline" onClick={() => router.push('/associates')} className="cursor-pointer h-12 px-6 text-lg">
            <Users className="w-5 h-5 mr-2" />
            Gestionar Asociados
          </Button>
        </div>

        {/* Recent Elections */}
        <div className="bg-card rounded-xl border p-6">
          <h3 className="text-xl font-semibold mb-4">Proceso Electoral Actual</h3>
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <p className="text-muted-foreground">Cargando información...</p>
              </div>
            ) : (
              <>
                <ElectionItem
                  title="Votación de Delegados 2026"
                  status="Activa"
                  participants={`${stats.totalVotes} / ${stats.totalAssociates}`}
                  endDate={`Participación: ${stats.participationRate}%`}
                  statusColor="bg-green-100 text-green-800"
                />
                <ElectionItem
                  title="Candidatos Postulados"
                  status="Registrados"
                  participants={`${stats.totalCandidates} candidatos en proceso`}
                  endDate="Segmentados por zonas electorales"
                  statusColor="bg-blue-100 text-blue-800"
                />
                <div className="flex flex-col gap-2 p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Ver más detalles:</p>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => router.push('/reports/voting')}
                      className="flex-1 cursor-pointer"
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Resultados de Votación
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => router.push('/reports/candidates')}
                      className="flex-1 cursor-pointer"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Candidatos Postulados
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const StatsCard = ({ icon, title, value, subtitle, bgColor }: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle: string;
  bgColor: string;
}) => (
  <div className="bg-card rounded-xl border p-6 hover:shadow-lg transition-all">
    <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center mb-4`}>
      {icon}
    </div>
    <h3 className="text-sm font-medium text-muted-foreground mb-1">{title}</h3>
    <p className="text-3xl font-bold mb-1">{value}</p>
    <p className="text-xs text-muted-foreground">{subtitle}</p>
  </div>
);

const ElectionItem = ({ title, status, participants, endDate, statusColor }: {
  title: string;
  status: string;
  participants: string;
  endDate: string;
  statusColor: string;
}) => (
  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/5 transition-colors">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 bg-primary-10 rounded-lg flex items-center justify-center">
        <Vote className="w-5 h-5 text-primary" />
      </div>
      <div>
        <h4 className="font-medium">{title}</h4>
        <p className="text-sm text-muted-foreground">{participants} participantes</p>
      </div>
    </div>
    <div className="text-right">
      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
        {status}
      </span>
      <p className="text-sm text-muted-foreground mt-1">{endDate}</p>
    </div>
  </div>
);