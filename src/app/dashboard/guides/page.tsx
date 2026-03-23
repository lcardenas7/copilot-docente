import { auth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, BookOpen, Sparkles, Target, Clock } from "lucide-react";

export default async function GuidesPage() {
  const session = await auth();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Guías de Clase</h1>
          <p className="text-muted-foreground">
            Crea y gestiona tus planeaciones de clase
          </p>
        </div>
        <Link href="/dashboard/guides/new">
          <Button className="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white shadow-lg shadow-blue-500/25 rounded-xl">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Guía
          </Button>
        </Link>
      </div>

      {/* Empty State */}
      <Card className="border shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-teal-50 p-6 mb-6">
            <BookOpen className="h-12 w-12 text-blue-500" />
          </div>
          <h3 className="text-xl font-bold mb-2">Crea tu primera guía de clase</h3>
          <p className="text-muted-foreground text-center max-w-md mb-8">
            La IA genera planeaciones completas con objetivos, actividades, evaluación y recursos adaptados a tu currículo.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mb-8">
            <div className="flex flex-col items-center text-center p-3">
              <Sparkles className="h-5 w-5 text-teal-500 mb-2" />
              <span className="text-xs font-medium">Generación con IA</span>
            </div>
            <div className="flex flex-col items-center text-center p-3">
              <Target className="h-5 w-5 text-blue-500 mb-2" />
              <span className="text-xs font-medium">Objetivos claros</span>
            </div>
            <div className="flex flex-col items-center text-center p-3">
              <Clock className="h-5 w-5 text-emerald-500 mb-2" />
              <span className="text-xs font-medium">En 2 minutos</span>
            </div>
          </div>
          <Link href="/dashboard/guides/new">
            <Button className="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white shadow-lg shadow-blue-500/25 rounded-xl h-11 px-8">
              <Plus className="mr-2 h-4 w-4" />
              Crear mi primera guía
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
