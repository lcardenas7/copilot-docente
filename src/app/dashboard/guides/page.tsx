import { auth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, BookOpen } from "lucide-react";

export default async function GuidesPage() {
  const session = await auth();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Guías de Clase</h1>
          <p className="text-muted-foreground">
            Crea y gestiona tus planeaciones de clase
          </p>
        </div>
        <Link href="/dashboard/guides/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Guía
          </Button>
        </Link>
      </div>

      {/* Empty State */}
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="rounded-full bg-muted p-4 mb-4">
            <BookOpen className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No tienes guías aún</h3>
          <p className="text-muted-foreground text-center max-w-sm mb-4">
            Crea tu primera guía de clase con IA. Solo necesitas el tema, grado y materia.
          </p>
          <Link href="/dashboard/guides/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Crear mi primera guía
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
