import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-muted/50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/login" className="text-primary hover:underline mb-8 inline-block">
          ← Volver
        </Link>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Política de Privacidad</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Información que Recopilamos</h2>
              <p className="text-muted-foreground">
                Recopilamos información necesaria para proporcionar nuestros servicios educativos.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">2. Uso de la Información</h2>
              <p className="text-muted-foreground">
                Utilizamos tu información para mejorar nuestros servicios y personalizar tu experiencia.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">3. Contenido Generado</h2>
              <p className="text-muted-foreground">
                El contenido que creas es tuyo. No lo compartimos con terceros sin tu consentimiento.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">4. Seguridad</h2>
              <p className="text-muted-foreground">
                Implementamos medidas de seguridad para proteger tu información.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">5. Proveedores de IA</h2>
              <p className="text-muted-foreground">
                Utilizamos servicios de IA de terceros para generar contenido educativo.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">6. Retención de Datos</h2>
              <p className="text-muted-foreground">
                Conservamos tu información solo mientras sea necesario para nuestros servicios.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">7. Derechos del Usuario</h2>
              <p className="text-muted-foreground">
                Tienes derecho a acceder, modificar o eliminar tu información personal.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">8. Cambios a esta Política</h2>
              <p className="text-muted-foreground">
                Notificaremos cualquier cambio significativo a nuestra política de privacidad.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3">9. Contacto</h2>
              <p className="text-muted-foreground">
                Para preguntas de privacidad, contáctanos en privacy@copilotdocente.com
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
