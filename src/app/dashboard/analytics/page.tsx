import { Card, CardContent } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analítica</h1>
        <p className="text-muted-foreground">
          Visualiza el progreso de tus estudiantes
        </p>
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="py-6">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-primary/10 p-2">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold">Próximamente</h4>
              <p className="text-sm text-muted-foreground">
                La analítica estará disponible cuando tengas estudiantes en tus aulas virtuales.
                Podrás ver progreso, rendimiento y estudiantes en riesgo.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
