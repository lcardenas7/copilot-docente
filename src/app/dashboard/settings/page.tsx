import { auth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, CreditCard, Bell, Shield } from "lucide-react";

export default async function SettingsPage() {
  const session = await auth();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground">
          Gestiona tu cuenta y preferencias
        </p>
      </div>

      {/* Profile */}
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="rounded-lg bg-blue-50 p-1.5 text-blue-600">
              <User className="h-4 w-4" />
            </div>
            Perfil
          </CardTitle>
          <CardDescription>Tu información personal</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            {session?.user?.image && (
              <img
                src={session.user.image}
                alt={session.user.name || ""}
                className="h-16 w-16 rounded-2xl shadow-md"
              />
            )}
            <div>
              <p className="font-bold">{session?.user?.name}</p>
              <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="rounded-lg bg-sky-50 p-1.5 text-sky-600">
              <CreditCard className="h-4 w-4" />
            </div>
            Suscripción
          </CardTitle>
          <CardDescription>Tu plan actual y uso</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Plan Gratuito</p>
              <p className="text-sm text-muted-foreground">
                5 guías y 2 exámenes por mes
              </p>
            </div>
            <Badge variant="secondary" className="rounded-lg">Gratis</Badge>
          </div>
          <Separator />
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Guías usadas este mes</span>
              <span className="font-medium">0 / 5</span>
            </div>
            <div className="h-2 bg-muted rounded-full">
              <div className="h-2 bg-gradient-to-r from-blue-500 to-sky-500 rounded-full w-0" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Exámenes usados este mes</span>
              <span className="font-medium">0 / 2</span>
            </div>
            <div className="h-2 bg-muted rounded-full">
              <div className="h-2 bg-gradient-to-r from-blue-500 to-sky-500 rounded-full w-0" />
            </div>
          </div>
          <Button className="w-full bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white shadow-lg shadow-blue-500/25 rounded-xl h-11">
            Actualizar a Pro - $7/mes
          </Button>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="rounded-lg bg-amber-50 p-1.5 text-amber-600">
              <Bell className="h-4 w-4" />
            </div>
            Notificaciones
          </CardTitle>
          <CardDescription>Configura cómo recibes alertas</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Las notificaciones estarán disponibles próximamente.
          </p>
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="rounded-lg bg-sky-50 p-1.5 text-sky-600">
              <Shield className="h-4 w-4" />
            </div>
            Seguridad
          </CardTitle>
          <CardDescription>Gestiona tu cuenta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Sesión activa</p>
              <p className="text-sm text-muted-foreground">
                Conectado con Google
              </p>
            </div>
            <Button variant="outline" size="sm" className="rounded-lg">
              Cerrar sesión
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
