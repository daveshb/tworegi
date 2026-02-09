"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Vote } from "lucide-react";
import { login as loginService } from "@/services/auth";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const data = await loginService(email, password);
      // Guardar token en localStorage para mantener sesión
      if (data?.token) {
        localStorage.setItem("tworegi_token", data.token);
      }
      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Error en el inicio de sesión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50 p-6">
      <div className="w-full max-w-md shadow-xl rounded-xl border bg-white text-gray-900">
        <div className="space-y-1 text-center p-8 pb-2">
          <div className="mx-auto w-14 h-14 bg-gradient-to-r from-primary to-primary/80 rounded-2xl flex items-center justify-center mb-4">
            <Vote className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold">Iniciar sesión</h2>
          <p className="text-sm text-muted-foreground">Accede al panel de administración</p>
        </div>
        <div className="p-6 pt-0">
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Correo electrónico</label>
              <Input
                id="email"
                type="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">Contraseña</label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={4}
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              disabled={isLoading}
            >
              {isLoading ? "Cargando..." : "Entrar"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}