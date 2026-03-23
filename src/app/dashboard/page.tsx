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
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  const firstName = session?.user?.name?.split(" ")[0] || "Docente";

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-teal-600 to-emerald-700 p-8 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2230%22%20height%3D%2230%22%20viewBox%3D%220%200%2030%2030%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Ccircle%20cx%3D%221%22%20cy%3D%221%22%20r%3D%221%22%20fill%3D%22rgba(255,255,255,0.06)%22/%3E%3C/svg%3E')]" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-blue-200" />
            <span className="text-sm font-medium text-blue-200">Panel de control</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            ¡Hola, {firstName}!
          </h1>
          <p className="text-blue-100 mt-1 text-lg">
            ¿Qué quieres crear hoy con IA?
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <QuickActionCard
          href="/dashboard/guides/new"
          icon={BookOpen}
          title="Nueva Guía"
          description="Crear guía de clase con IA"
          gradient="from-blue-500 to-indigo-600"
        />
        <QuickActionCard
          href="/dashboard/exams/new"
          icon={FileText}
          title="Nuevo Examen"
          description="Generar examen con IA"
          gradient="from-emerald-500 to-teal-600"
        />
        <QuickActionCard
          href="/dashboard/questions"
          icon={HelpCircle}
          title="Banco de Preguntas"
          description="Agregar preguntas"
          gradient="from-teal-500 to-emerald-600"
        />
        <QuickActionCard
          href="/dashboard/copilot"
          icon={MessageSquare}
          title="Copilot IA"
          description="Pregunta lo que necesites"
          gradient="from-amber-500 to-orange-600"
        />
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Guías creadas"
          value="0"
          description="este mes"
          icon={BookOpen}
          color="text-blue-600 bg-blue-50"
        />
        <StatCard
          title="Exámenes creados"
          value="0"
          description="este mes"
          icon={FileText}
          color="text-emerald-600 bg-emerald-50"
        />
        <StatCard
          title="Preguntas guardadas"
          value="0"
          description="en tu banco"
          icon={HelpCircle}
          color="text-violet-600 bg-violet-50"
        />
        <StatCard
          title="Tiempo ahorrado"
          value="0h"
          description="estimado"
          icon={Clock}
          color="text-amber-600 bg-amber-50"
        />
      </div>

      {/* Recent Activity & Tips */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activity */}
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Actividad reciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-teal-50 p-5 mb-4">
                <Zap className="h-8 w-8 text-blue-400" />
              </div>
              <p className="text-muted-foreground font-medium">
                Aún no tienes actividad
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                ¡Crea tu primer examen o guía!
              </p>
              <Link href="/dashboard/exams/new">
                <Button className="mt-5 bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white rounded-xl shadow-lg shadow-blue-500/25">
                  <Plus className="mr-2 h-4 w-4" />
                  Crear examen
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-5 w-5 text-amber-500" />
              Consejos para empezar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              <TipItem
                number="1"
                title="Genera un examen"
                description="Selecciona materia, grado y tema. La IA crea todo automáticamente."
                gradient="from-blue-500 to-teal-600"
              />
              <TipItem
                number="2"
                title="Crea una guía de clase"
                description="Obtén planeaciones completas con objetivos y actividades."
                gradient="from-teal-500 to-emerald-600"
              />
              <TipItem
                number="3"
                title="Usa instrucciones específicas"
                description="Dile a la IA exactamente qué quieres: 'Incluir fracciones con problemas'."
                gradient="from-cyan-500 to-blue-600"
              />
              <TipItem
                number="4"
                title="Revisa y ajusta"
                description="El contenido generado es tu punto de partida. Personalízalo."
                gradient="from-amber-500 to-orange-600"
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
  gradient,
}: {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <Link href={href}>
      <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer h-full border hover:-translate-y-1">
        <CardContent className="pt-6">
          <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <h3 className="mt-4 font-bold">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
          <div className="flex items-center gap-1 mt-3 text-xs font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
            Crear ahora
            <ArrowRight className="h-3 w-3" />
          </div>
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
  color,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <Card className="border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`rounded-lg p-1.5 ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-extrabold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}

function TipItem({
  number,
  title,
  description,
  gradient,
}: {
  number: string;
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <li className="flex gap-3">
      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${gradient} text-white text-xs font-bold shadow-sm`}>
        {number}
      </div>
      <div>
        <p className="font-semibold text-sm">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
    </li>
  );
}
