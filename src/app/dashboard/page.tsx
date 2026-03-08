import { auth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  BookOpen,
  FileText,
  HelpCircle,
  MessageSquare,
  Plus,
  TrendingUp,
  Clock,
  Zap,
} from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  const firstName = session?.user?.name?.split(" ")[0] || "Docente";

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          ¡Hola, {firstName}! 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          ¿Qué quieres crear hoy con IA?
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <QuickActionCard
          href="/dashboard/guides/new"
          icon={BookOpen}
          title="Nueva Guía"
          description="Crear guía de clase con IA"
          color="bg-blue-500"
        />
        <QuickActionCard
          href="/dashboard/exams/new"
          icon={FileText}
          title="Nuevo Examen"
          description="Generar examen con IA"
          color="bg-green-500"
        />
        <QuickActionCard
          href="/dashboard/questions"
          icon={HelpCircle}
          title="Banco de Preguntas"
          description="Agregar preguntas"
          color="bg-purple-500"
        />
        <QuickActionCard
          href="/dashboard/copilot"
          icon={MessageSquare}
          title="Copilot IA"
          description="Pregunta lo que necesites"
          color="bg-orange-500"
        />
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Guías creadas"
          value="0"
          description="este mes"
          icon={BookOpen}
        />
        <StatCard
          title="Exámenes creados"
          value="0"
          description="este mes"
          icon={FileText}
        />
        <StatCard
          title="Preguntas guardadas"
          value="0"
          description="en tu banco"
          icon={HelpCircle}
        />
        <StatCard
          title="Tiempo ahorrado"
          value="0h"
          description="estimado"
          icon={Clock}
        />
      </div>

      {/* Recent Activity & Tips */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Actividad reciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Zap className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">
                Aún no tienes actividad. ¡Crea tu primera guía!
              </p>
              <Link href="/dashboard/guides/new">
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Crear guía
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Consejos para empezar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              <TipItem
                number="1"
                title="Crea tu primera guía"
                description="Escribe el tema, grado y materia. La IA hará el resto."
              />
              <TipItem
                number="2"
                title="Guarda en tu biblioteca"
                description="Tus mejores recursos quedan guardados para reutilizar."
              />
              <TipItem
                number="3"
                title="Usa el Copilot"
                description="Pregunta cualquier duda pedagógica y recibe recomendaciones."
              />
              <TipItem
                number="4"
                title="Exporta a PDF"
                description="Descarga tus guías y exámenes listos para imprimir."
              />
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function QuickActionCard({
  href,
  icon: Icon,
  title,
  description,
  color,
}: {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <Link href={href}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardContent className="pt-6">
          <div className={`inline-flex p-3 rounded-lg ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <h3 className="mt-4 font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ElementType;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function TipItem({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <li className="flex gap-3">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
        {number}
      </div>
      <div>
        <p className="font-medium text-sm">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </li>
  );
}
