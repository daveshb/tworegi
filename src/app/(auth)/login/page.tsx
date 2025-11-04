"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Vote } from "lucide-react";
import { Button, Spinner } from "@heroui/react";
import { login } from "@/services/user";

export default function LoginPage() {
  const router = useRouter();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  // const handleAuth = async () => {
  //   setIsLoading(true)

  //   login({ email: "daves@loq.com", pass: "123423423" })
  //     .then((value) => {

  //       console.log(value);
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //     })
  //     .finally(() => {
  //       console.log("termino");
  //       setIsLoading(false)
  //     });
  // };


  const handleAuth = async () => {
  setIsLoading(true);

const hora = new Date

  console.log(hora)

  try {
    const value = await login({ email: "daves@loq.com", pass: "123423423" });
    console.log(value);
  } catch (error) {
    console.log(error);
  } finally {
    console.log("termino");
    setIsLoading(false);
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-voting-gradient p-4">
      <div className="w-full max-w-md shadow-lg rounded-lg border bg-card text-card-foreground">
        <div className="space-y-1 text-center p-6 pb-2">
          <div className="mx-auto w-12 h-12 bg-logo-gradient rounded-xl flex items-center justify-center mb-4">
            <Vote className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold">
            {isSignUp ? "Crear Cuenta" : "Bienvenido de Vuelta"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isSignUp
              ? "Regístrate para gestionar tu plataforma"
              : "Inicia sesión para acceder a tu panel"}
          </p>
          <div className="mt-2 p-2 bg-primary-10 rounded-md text-xs text-primary">
            Credenciales de prueba: admin / 123456
          </div>
        </div>
        <div className="p-6 pt-0">
          {isSignUp && (
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Full Name
              </label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Usuario
            </label>
            <Input
              id="email"
              type="text"
              placeholder="admin"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Contraseña
            </label>
            <Input
              id="password"
              type="password"
              placeholder="123456"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-button-gradient text-white"
            onPress={handleAuth}
          >
            {isSignUp ? "Registrarse" : "Iniciar Sesión"}
          </Button>

          {isLoading ? (
            <Spinner
              classNames={{ label: "text-foreground mt-4" }}
              variant="gradient"
            />
          ) : (
            <></>
          )}

          {isLoading &&  <Spinner
              classNames={{ label: "text-foreground mt-4" }}
              variant="gradient"
            />
          }



          <div className="mt-4 text-center text-sm">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary hover:underline"
            >
              {isSignUp
                ? "¿Ya tienes cuenta? Inicia sesión"
                : "¿No tienes cuenta? Regístrate"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
