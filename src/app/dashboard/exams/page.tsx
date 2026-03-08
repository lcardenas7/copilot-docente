import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, FileText } from "lucide-react";

export default function ExamsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Exámenes</h1>
          <p className="text-muted-foreground">
            Crea y gestiona tus evaluaciones
          </p>
        </div>
        <Link href="/dashboard/exams/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Examen
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="rounded-full bg-muted p-4 mb-4">
            <FileText className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No tienes exámenes aún</h3>
          <p className="text-muted-foreground text-center max-w-sm mb-4">
            Crea tu primer examen con IA. Genera preguntas automáticamente según el tema y dificultad.
          </p>
          <Link href="/dashboard/exams/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Crear mi primer examen
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
