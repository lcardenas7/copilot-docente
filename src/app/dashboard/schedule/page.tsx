import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";

export default function SchedulePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Horario</h1>
        <p className="text-muted-foreground">
          Organiza tu semana de clases
        </p>
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="py-6">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-primary/10 p-2">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold">Próximamente</h4>
              <p className="text-sm text-muted-foreground">
                El horario estará disponible cuando crees tus aulas virtuales.
                Podrás organizar tus clases por día y hora.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
