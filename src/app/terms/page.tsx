import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-muted/50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/login" className="text-primary hover:underline mb-8 inline-block">
          ← Volver
        </Link>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Términos de Servicio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Aceptación de los Términos</h2>
              <p className="text-muted-foreground">
                Al usar Copilot del Docente, aceptas estos términos y condiciones.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">2. Descripción del Servicio</h2>
              <p className="text-muted-foreground">
                Copilot del Docente es una plataforma de productividad docente que utiliza IA para ayudar a crear contenido educativo.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">3. Uso Aceptable</h2>
              <p className="text-muted-foreground">
                El servicio debe utilizarse únicamente para fines educativos legítimos.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">4. Propiedad Intelectual</h2>
              <p className="text-muted-foreground">
                El contenido generado pertenece al usuario docente que lo crea.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">5. Limitación de Responsabilidad</h2>
              <p className="text-muted-foreground">
                No nos hacemos responsables del contenido generado por la IA.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">6. Modificaciones</h2>
              <p className="text-muted-foreground">
                Nos reservamos el derecho de modificar estos términos en cualquier momento.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">7. Contacto</h2>
              <p className="text-muted-foreground">
                Para preguntas sobre estos términos, contáctanos en support@copilotdocente.com
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
