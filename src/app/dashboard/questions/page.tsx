import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, HelpCircle, FolderOpen, Tags, Search } from "lucide-react";

export default function QuestionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Banco de Preguntas</h1>
          <p className="text-muted-foreground">
            Guarda y organiza tus preguntas para reutilizarlas
          </p>
        </div>
        <Button className="bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white shadow-lg shadow-blue-500/25 rounded-xl">
          <Plus className="mr-2 h-4 w-4" />
          Nueva Pregunta
        </Button>
      </div>

      <Card className="border shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50 p-6 mb-6">
            <HelpCircle className="h-12 w-12 text-sky-500" />
          </div>
          <h3 className="text-xl font-bold mb-2">Tu banco de preguntas está vacío</h3>
          <p className="text-muted-foreground text-center max-w-md mb-8">
            Guarda preguntas de tus exámenes generados o crea nuevas. Organízalas por materia, grado y tema para reutilizarlas.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mb-8">
            <div className="flex flex-col items-center text-center p-3">
              <FolderOpen className="h-5 w-5 text-sky-500 mb-2" />
              <span className="text-xs font-medium">Organiza por tema</span>
            </div>
            <div className="flex flex-col items-center text-center p-3">
              <Tags className="h-5 w-5 text-blue-500 mb-2" />
              <span className="text-xs font-medium">Etiquetas personalizadas</span>
            </div>
            <div className="flex flex-col items-center text-center p-3">
              <Search className="h-5 w-5 text-sky-400 mb-2" />
              <span className="text-xs font-medium">Búsqueda rápida</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button className="bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white shadow-lg shadow-blue-500/25 rounded-xl h-11 px-8">
              <Plus className="mr-2 h-4 w-4" />
              Agregar pregunta
            </Button>
            <Link href="/dashboard/exams/new">
              <Button variant="outline" className="rounded-xl h-11">
                Generar examen
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
