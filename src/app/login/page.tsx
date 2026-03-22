"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function LoginContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam && errorParam !== "Configuration") {
      console.error("OAuth error from URL:", errorParam);
      setError(getErrorMessage(errorParam));
    }
  }, [searchParams]);

  const getErrorMessage = (error: string): string => {
    switch (error) {
      case "Configuration":
        return "Error de configuración del servidor. Contacta al administrador.";
      case "AccessDenied":
        return "Acceso denegado. No tienes permiso para iniciar sesión.";
      case "Verification":
        return "El enlace de verificación ha expirado o ya fue usado.";
      case "OAuthSignin":
        return "Error al iniciar el proceso de autenticación con Google.";
      case "OAuthCallback":
        return "Error en la respuesta de Google. Verifica la configuración OAuth.";
      case "OAuthCreateAccount":
        return "No se pudo crear la cuenta. Intenta de nuevo.";
      case "EmailCreateAccount":
        return "No se pudo crear la cuenta con ese email.";
      case "Callback":
        return "Error en el callback de autenticación.";
      case "OAuthAccountNotLinked":
        return "Este email ya está asociado a otra cuenta.";
      case "SessionRequired":
        return "Debes iniciar sesión para acceder.";
      default:
        return `Error de autenticación: ${error}`;
    }
  };

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    setError(null);
    signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="flex items-center justify-center space-x-2 mb-4">
            <GraduationCap className="h-10 w-10 text-primary" />
          </Link>
          <CardTitle className="text-2xl">Bienvenido a Copilot del Docente</CardTitle>
          <CardDescription>
            Inicia sesión para acceder a tus herramientas de IA
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <Button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full h-11"
            size="lg"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
            ) : (
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            {isLoading ? "Conectando..." : "Continuar con Google"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Al continuar, aceptas nuestros{" "}
            <Link href="/terms" className="underline hover:text-primary">
              Términos de servicio
            </Link>{" "}
            y{" "}
            <Link href="/privacy" className="underline hover:text-primary">
              Política de privacidad
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-muted/50">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
