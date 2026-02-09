"use client"

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Vote, Users, BarChart3, Clock, LogOut, Plus, Settings } from "lucide-react";
import { useEffect } from "react";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // Verificar token en localStorage y redirigir si no existe
    try {
      const token = localStorage.getItem('tworegi_token');
      if (!token) router.push('/login');
    } catch (err) {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = async () => {
    // Borrar token en cliente e intentar limpiar cookie en servidor
    localStorage.removeItem('tworegi_token');
    try {
      await fetch('/api/logout', { method: 'POST' });
    } catch (e) {
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
          <Button variant="outline" size="sm" onClick={handleLogout}>
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
            title="Elecciones Activas"
            value="3"
            subtitle="2 finalizando hoy"
            bgColor="bg-primary-10"
          />
          <StatsCard
            icon={<Users className="w-8 h-8 text-secondary" />}
            title="Votantes Registrados"
            value="1,247"
            subtitle="+89 esta semana"
            bgColor="bg-secondary/10"
          />
          <StatsCard
            icon={<BarChart3 className="w-8 h-8 text-primary" />}
            title="Participación Promedio"
            value="87.5%"
            subtitle="+5.2% vs mes anterior"
            bgColor="bg-primary-10"
          />
          <StatsCard
            icon={<Clock className="w-8 h-8 text-muted-foreground" />}
            title="Elecciones Programadas"
            value="7"
            subtitle="Próximas 30 días"
            bgColor="bg-muted/10"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button className="bg-button-gradient text-white">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Elección
          </Button>
          <Button variant="outline" onClick={() => router.push('/reports')}>
            <BarChart3 className="w-4 h-4 mr-2" />
            Ver Reportes
          </Button>
          <Button variant="outline" onClick={() => router.push('/associates')}>
            <Users className="w-4 h-4 mr-2" />
            Gestionar Asociados
          </Button>
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Configuración
          </Button>
        </div>

        {/* Recent Elections */}
        <div className="bg-card rounded-xl border p-6">
          <h3 className="text-xl font-semibold mb-4">Elecciones Recientes</h3>
          <div className="space-y-4">
            <ElectionItem
              title="Elección de Junta Directiva 2025"
              status="Activa"
              participants="324 / 400"
              endDate="Finaliza en 2 días"
              statusColor="bg-green-100 text-green-800"
            />
            <ElectionItem
              title="Votación Presupuesto Anual"
              status="Finalizada"
              participants="287 / 350"
              endDate="Finalizada hace 1 semana"
              statusColor="bg-gray-100 text-gray-800"
            />
            <ElectionItem
              title="Selección de Proyectos Comunitarios"
              status="Programada"
              participants="0 / 200"
              endDate="Inicia en 5 días"
              statusColor="bg-blue-100 text-blue-800"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const StatsCard = ({ icon, title, value, subtitle, bgColor }: {
  icon: React.ReactNode;
  title: string;
  value: string;
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