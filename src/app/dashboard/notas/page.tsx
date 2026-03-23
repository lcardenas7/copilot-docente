import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Notebook, Calculator, TrendingUp, FileSpreadsheet } from "lucide-react";

export default function NotasPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Libro de Notas</h1>
          <p className="text-muted-foreground">
            Registra y gestiona las calificaciones de tus estudiantes
          </p>
        </div>
      </div>

      <Card className="border shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 p-6 mb-6">
            <Notebook className="h-12 w-12 text-blue-500" />
          </div>
          <h3 className="text-xl font-bold mb-2">Libro de Notas</h3>
          <p className="text-muted-foreground text-center max-w-md mb-8">
            Para empezar a registrar calificaciones, primero necesitas crear un curso con estudiantes inscritos.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mb-8">
            <div className="flex flex-col items-center text-center p-3">
              <Calculator className="h-5 w-5 text-blue-500 mb-2" />
              <span className="text-xs font-medium">Cálculo automático</span>
            </div>
            <div className="flex flex-col items-center text-center p-3">
              <TrendingUp className="h-5 w-5 text-sky-500 mb-2" />
              <span className="text-xs font-medium">Seguimiento de progreso</span>
            </div>
            <div className="flex flex-col items-center text-center p-3">
              <FileSpreadsheet className="h-5 w-5 text-sky-400 mb-2" />
              <span className="text-xs font-medium">Exportar a Excel</span>
            </div>
          </div>
          <Link href="/dashboard/cursos/nuevo">
            <Button className="bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white shadow-lg shadow-blue-500/25 rounded-xl h-11 px-8">
              Crear mi primer curso
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
