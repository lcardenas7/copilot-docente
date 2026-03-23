import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, FileText, Sparkles, CheckCircle, Layers } from "lucide-react";

export default function ExamsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Exámenes</h1>
          <p className="text-muted-foreground">
            Crea y gestiona tus evaluaciones
          </p>
        </div>
        <Link href="/dashboard/exams/new">
          <Button className="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white shadow-lg shadow-blue-500/25 rounded-xl">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Examen
          </Button>
        </Link>
      </div>

      <Card className="border shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 p-6 mb-6">
            <FileText className="h-12 w-12 text-emerald-500" />
          </div>
          <h3 className="text-xl font-bold mb-2">Genera tu primer examen con IA</h3>
          <p className="text-muted-foreground text-center max-w-md mb-8">
            Selección múltiple, verdadero/falso, completar, relacionar y más. Con respuestas y explicaciones automáticas.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mb-8">
            <div className="flex flex-col items-center text-center p-3">
              <Sparkles className="h-5 w-5 text-teal-500 mb-2" />
              <span className="text-xs font-medium">8 tipos de pregunta</span>
            </div>
            <div className="flex flex-col items-center text-center p-3">
              <CheckCircle className="h-5 w-5 text-emerald-500 mb-2" />
              <span className="text-xs font-medium">Respuestas incluidas</span>
            </div>
            <div className="flex flex-col items-center text-center p-3">
              <Layers className="h-5 w-5 text-blue-500 mb-2" />
              <span className="text-xs font-medium">3 niveles de dificultad</span>
            </div>
          </div>
          <Link href="/dashboard/exams/new">
            <Button className="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white shadow-lg shadow-blue-500/25 rounded-xl h-11 px-8">
              <Plus className="mr-2 h-4 w-4" />
              Crear mi primer examen
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
