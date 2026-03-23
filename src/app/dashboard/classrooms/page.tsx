import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { School, Video, Users, ClipboardList } from "lucide-react";

export default function ClassroomsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Aulas Virtuales</h1>
          <p className="text-muted-foreground">
            Gestiona tus clases y estudiantes en línea
          </p>
        </div>
      </div>

      <Card className="border shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50 p-6 mb-6">
            <School className="h-12 w-12 text-sky-500" />
          </div>
          <h3 className="text-xl font-bold mb-2">Aulas virtuales</h3>
          <p className="text-muted-foreground text-center max-w-md mb-8">
            Crea espacios virtuales para tus clases, invita estudiantes, asigna tareas y haz seguimiento del progreso.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mb-8">
            <div className="flex flex-col items-center text-center p-3">
              <Video className="h-5 w-5 text-sky-500 mb-2" />
              <span className="text-xs font-medium">Clases en línea</span>
            </div>
            <div className="flex flex-col items-center text-center p-3">
              <Users className="h-5 w-5 text-blue-500 mb-2" />
              <span className="text-xs font-medium">Invitar estudiantes</span>
            </div>
            <div className="flex flex-col items-center text-center p-3">
              <ClipboardList className="h-5 w-5 text-sky-400 mb-2" />
              <span className="text-xs font-medium">Asignar tareas</span>
            </div>
          </div>
          <div className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700">
            Próximamente — enfócate en crear guías y exámenes con IA
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
