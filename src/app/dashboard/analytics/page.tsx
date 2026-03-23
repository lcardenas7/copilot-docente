import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, TrendingUp, PieChart, Users } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Analítica</h1>
        <p className="text-muted-foreground">
          Visualiza el progreso de tus estudiantes
        </p>
      </div>

      <Card className="border shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 p-6 mb-6">
            <BarChart3 className="h-12 w-12 text-amber-500" />
          </div>
          <h3 className="text-xl font-bold mb-2">Analítica educativa</h3>
          <p className="text-muted-foreground text-center max-w-md mb-8">
            Visualiza el rendimiento de tus estudiantes, identifica áreas de mejora y toma decisiones con datos reales.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mb-8">
            <div className="flex flex-col items-center text-center p-3">
              <TrendingUp className="h-5 w-5 text-blue-500 mb-2" />
              <span className="text-xs font-medium">Tendencias de rendimiento</span>
            </div>
            <div className="flex flex-col items-center text-center p-3">
              <PieChart className="h-5 w-5 text-teal-500 mb-2" />
              <span className="text-xs font-medium">Distribución de notas</span>
            </div>
            <div className="flex flex-col items-center text-center p-3">
              <Users className="h-5 w-5 text-amber-500 mb-2" />
              <span className="text-xs font-medium">Estudiantes en riesgo</span>
            </div>
          </div>
          <div className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700">
            Disponible cuando tengas cursos con estudiantes inscritos
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
