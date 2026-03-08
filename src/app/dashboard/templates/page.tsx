import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderOpen, Plus } from "lucide-react";

export default function TemplatesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mis Plantillas</h1>
          <p className="text-muted-foreground">
            Tu biblioteca de recursos reutilizables
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="rounded-full bg-muted p-4 mb-4">
            <FolderOpen className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No tienes plantillas guardadas</h3>
          <p className="text-muted-foreground text-center max-w-sm mb-4">
            Cuando generes guías o exámenes, podrás guardarlos como plantillas para reutilizarlos después.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <a href="/dashboard/guides/new">Crear guía</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/dashboard/exams/new">Crear examen</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
