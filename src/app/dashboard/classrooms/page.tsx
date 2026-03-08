import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { School, Plus } from "lucide-react";

export default function ClassroomsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Aulas Virtuales</h1>
          <p className="text-muted-foreground">
            Gestiona tus clases y estudiantes
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Aula
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="rounded-full bg-muted p-4 mb-4">
            <School className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No tienes aulas aún</h3>
          <p className="text-muted-foreground text-center max-w-sm mb-4">
            Crea un aula virtual para invitar estudiantes, asignar tareas y hacer seguimiento.
          </p>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Crear mi primera aula
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="py-6">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-primary/10 p-2">
              <School className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold">Próximamente</h4>
              <p className="text-sm text-muted-foreground">
                Las aulas virtuales estarán disponibles en la próxima actualización. 
                Por ahora, enfócate en crear guías y exámenes con IA.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
