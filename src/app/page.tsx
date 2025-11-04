
"use client"

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Vote, Shield, BarChart3, Users, CheckCircle, ArrowRight } from "lucide-react";

const Index = () => {
  const router = useRouter();

  return (
     <div className="min-h-screen bg-voting-gradient">
      {/* Header */}
      <header className="border-b bg-card-50 backdrop-blur supports-backdrop-filter:bg-card/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-logo-gradient rounded-lg flex items-center justify-center">
              <Vote className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">TwoRegi</span>
          </div>
          <Button onClick={() => router.push("/login")} variant="outline">
            Iniciar Sesión
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-10 text-primary text-sm font-medium mb-6">
            <CheckCircle className="w-4 h-4" />
            Plataforma Multi-Inquilino Confiable
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-title-gradient bg-clip-text text-transparent">
            Plataforma de Votación Moderna para Organizaciones
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Sistema de votación seguro, transparente y eficiente para tu organización.
            Gestiona elecciones, rastrea la participación y genera reportes en tiempo real.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={() => router.push("/login")}
              className="bg-button-gradient text-white text-lg px-8"
            >
              Comenzar
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push("/login")}
            >
              Ver Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Todo Lo Que Necesitas</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Características poderosas diseñadas para una gestión de votación segura y eficiente
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard
            icon={<Shield className="w-8 h-8 text-primary" />}
            title="Seguro y Privado"
            description="Cifrado de extremo a extremo con pistas de auditoría completas para total transparencia"
          />
          <FeatureCard
            icon={<BarChart3 className="w-8 h-8 text-primary" />}
            title="Resultados en Tiempo Real"
            description="Paneles en vivo con conteo instantáneo de votos y seguimiento de participación"
          />
          <FeatureCard
            icon={<Users className="w-8 h-8 text-primary" />}
            title="Multi-Inquilino"
            description="Datos aislados para cada organización con marca personalizada y temas"
          />
          <FeatureCard
            icon={<Vote className="w-8 h-8 text-primary" />}
            title="Fácil de Usar"
            description="Interfaz intuitiva para votantes y administradores con soporte móvil"
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-cta-gradient rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">¿Listo para modernizar tu proceso de votación?</h2>
          <p className="text-lg mb-8 opacity-90">
            Únete a las organizaciones que confían en TwoRegi para elecciones seguras y transparentes
          </p>
          <Button
            size="lg"
            onClick={() => router.push("/login")}
            className="bg-white text-primary hover:bg-white-90 text-lg px-8"
          >
            Iniciar Prueba Gratuita
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 TwoRegi. Construido con seguridad y transparencia en mente.</p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="bg-card p-6 rounded-xl border hover:shadow-lg transition-all">
    <div className="mb-4">{icon}</div>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
);

export default Index;
