import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FolderOpen, BookOpen, FileText, Copy } from "lucide-react";

export default function TemplatesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Mis Plantillas</h1>
          <p className="text-muted-foreground">
            Tu biblioteca de recursos reutilizables
          </p>
        </div>
      </div>

      <Card className="border shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="rounded-2xl bg-gradient-to-br from-cyan-50 to-blue-50 p-6 mb-6">
            <FolderOpen className="h-12 w-12 text-cyan-500" />
          </div>
          <h3 className="text-xl font-bold mb-2">Tu biblioteca está vacía</h3>
          <p className="text-muted-foreground text-center max-w-md mb-8">
            Cuando generes guías o exámenes, podrás guardarlos como plantillas para reutilizarlos con otros grupos.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mb-8">
            <div className="flex flex-col items-center text-center p-3">
              <BookOpen className="h-5 w-5 text-blue-500 mb-2" />
              <span className="text-xs font-medium">Guías guardadas</span>
            </div>
            <div className="flex flex-col items-center text-center p-3">
              <FileText className="h-5 w-5 text-teal-500 mb-2" />
              <span className="text-xs font-medium">Exámenes guardados</span>
            </div>
            <div className="flex flex-col items-center text-center p-3">
              <Copy className="h-5 w-5 text-emerald-500 mb-2" />
              <span className="text-xs font-medium">Duplicar con 1 clic</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard/guides/new">
              <Button variant="outline" className="rounded-xl h-11">
                <BookOpen className="mr-2 h-4 w-4" /> Crear guía
              </Button>
            </Link>
            <Link href="/dashboard/exams/new">
              <Button className="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white shadow-lg shadow-blue-500/25 rounded-xl h-11">
                <FileText className="mr-2 h-4 w-4" /> Crear examen
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
