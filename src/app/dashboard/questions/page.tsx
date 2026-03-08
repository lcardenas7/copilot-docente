import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, HelpCircle } from "lucide-react";

export default function QuestionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Banco de Preguntas</h1>
          <p className="text-muted-foreground">
            Guarda y organiza tus preguntas para reutilizarlas
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Pregunta
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="rounded-full bg-muted p-4 mb-4">
            <HelpCircle className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Tu banco está vacío</h3>
          <p className="text-muted-foreground text-center max-w-sm mb-4">
            Guarda preguntas de tus exámenes o crea nuevas. Organízalas por materia, grado y tema.
          </p>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Agregar primera pregunta
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
