import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  BookOpen,
  FileText,
  MessageSquare,
  Zap,
  Clock,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Shield,
  Users,
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-white/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-teal-500 shadow-lg shadow-blue-500/25">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">Copilot del Docente</span>
          </Link>
          <nav className="flex items-center space-x-3">
            <Link href="/login">
              <Button variant="ghost" className="text-sm font-medium">Iniciar sesión</Button>
            </Link>
            <Link href="/login">
              <Button className="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white shadow-lg shadow-blue-500/25 text-sm">
                Comenzar gratis
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-br from-blue-100 via-teal-50 to-emerald-50 rounded-full blur-3xl opacity-60" />
          <div className="absolute top-40 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-blue-100 to-transparent rounded-full blur-3xl opacity-40" />
          <div className="absolute top-60 left-0 w-[300px] h-[300px] bg-gradient-to-br from-cyan-100 to-transparent rounded-full blur-3xl opacity-40" />
        </div>
        
        <div className="container mx-auto flex flex-col items-center justify-center px-4 sm:px-6 py-20 sm:py-28 lg:py-36 text-center">
          <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700 mb-8 shadow-sm">
            <Sparkles className="mr-2 h-4 w-4" />
            Potenciado por Inteligencia Artificial
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl max-w-5xl leading-[1.1]">
            Tu copiloto inteligente para{" "}
            <span className="bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-500 bg-clip-text text-transparent">
              preparar clases
            </span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed">
            Genera exámenes, guías de clase y actividades pedagógicas en minutos.
            Diseñado por y para docentes de Latinoamérica.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link href="/login">
              <Button size="lg" className="text-base px-8 h-12 bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white shadow-xl shadow-blue-500/30 rounded-xl">
                Comenzar gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="text-base px-8 h-12 rounded-xl border-2">
                Ver características
              </Button>
            </Link>
          </div>
          <div className="mt-6 flex items-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Sin tarjeta de crédito
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Gratis para siempre
            </span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-24 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 mb-4 uppercase tracking-wider">
              Herramientas
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              Todo lo que necesitas en un solo lugar
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Herramientas de IA creadas para el contexto educativo latinoamericano
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={FileText}
              title="Exámenes inteligentes"
              description="Crea evaluaciones completas con preguntas variadas, situaciones problema reales y explicaciones pedagógicas automáticas."
              gradient="from-blue-500 to-cyan-600"
            />
            <FeatureCard
              icon={BookOpen}
              title="Guías de clase"
              description="Genera planeaciones estructuradas con objetivos, actividades, evaluación y recursos adaptados a tu currículo."
              gradient="from-teal-500 to-emerald-600"
            />
            <FeatureCard
              icon={MessageSquare}
              title="Asistente pedagógico"
              description="Consulta dudas pedagógicas y recibe recomendaciones personalizadas para tu contexto educativo."
              gradient="from-blue-500 to-teal-600"
            />
            <FeatureCard
              icon={Clock}
              title="Ahorra horas de trabajo"
              description="Lo que antes tomaba 2 horas, ahora lo haces en 5 minutos. Más tiempo para ti y tus estudiantes."
              gradient="from-amber-500 to-orange-600"
            />
            <FeatureCard
              icon={Shield}
              title="Contenido verificado"
              description="Cada respuesta es validada automáticamente para garantizar coherencia matemática y pedagógica."
              gradient="from-emerald-500 to-teal-600"
            />
            <FeatureCard
              icon={Users}
              title="Contexto LATAM"
              description="Nombres, lugares y situaciones reales de Latinoamérica. Tus estudiantes se ven reflejados en cada pregunta."
              gradient="from-cyan-500 to-blue-600"
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-blue-50/50 via-teal-50/30 to-transparent" />
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 mb-4 uppercase tracking-wider">
              Cómo funciona
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              Tres pasos y listo
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
            <StepCard
              number="1"
              title="Configura tu examen"
              description="Selecciona materia, grado, tema y nivel de dificultad. Agrega instrucciones si lo deseas."
            />
            <StepCard
              number="2"
              title="La IA genera todo"
              description="En segundos recibes un examen completo con preguntas, respuestas y explicaciones pedagógicas."
            />
            <StepCard
              number="3"
              title="Revisa y usa"
              description="Revisa el contenido generado, ajusta lo que necesites y úsalo directamente en clase."
            />
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-24 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 mb-4 uppercase tracking-wider">
              Planes
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              Empieza gratis, crece cuando quieras
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            <PricingCard
              name="Gratis"
              price="$0"
              description="Para explorar la plataforma"
              features={[
                "5 generaciones al mes",
                "Exámenes con IA",
                "Guías de clase",
                "Contexto LATAM",
              ]}
            />
            <PricingCard
              name="Pro"
              price="$7"
              period="/mes"
              description="Para docentes activos"
              features={[
                "Generaciones ilimitadas",
                "Asistente pedagógico",
                "Exportar PDF",
                "Historial completo",
                "Soporte prioritario",
              ]}
              highlighted
            />
            <PricingCard
              name="Colegio"
              price="Contactar"
              description="Para instituciones"
              features={[
                "Todo lo de Pro",
                "Docentes ilimitados",
                "Panel administrativo",
                "Soporte dedicado",
              ]}
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-600 via-teal-600 to-cyan-700" />
        <div className="absolute inset-0 -z-10 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2230%22%20height%3D%2230%22%20viewBox%3D%220%200%2030%2030%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Ccircle%20cx%3D%221%22%20cy%3D%221%22%20r%3D%221%22%20fill%3D%22rgba(255,255,255,0.07)%22/%3E%3C/svg%3E')]" />
        <div className="container mx-auto px-4 sm:px-6 text-center relative">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl text-white">
            ¿Listo para transformar tu forma de enseñar?
          </h2>
          <p className="mt-4 text-lg text-blue-100 max-w-2xl mx-auto">
            Cientos de docentes en Latinoamérica ya preparan sus clases con IA.
          </p>
          <Link href="/login">
            <Button size="lg" className="mt-10 text-base px-8 h-12 bg-white text-blue-700 hover:bg-blue-50 shadow-xl rounded-xl font-semibold">
              Comenzar gratis ahora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/50 py-12">
        <div className="container mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-teal-500">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-sm">Copilot del Docente</span>
          </div>
          <p className="text-sm text-muted-foreground">
            2025 Copilot del Docente. Todos los derechos reservados.
          </p>
          <nav className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacidad</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Términos</Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">Contacto</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  gradient,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <div className="group relative rounded-2xl border bg-card p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <h3 className="mt-5 text-lg font-bold">{title}</h3>
      <p className="mt-2 text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-teal-500 text-white text-2xl font-bold shadow-lg shadow-blue-500/30">
        {number}
      </div>
      <h3 className="mt-5 text-lg font-bold">{title}</h3>
      <p className="mt-2 text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function PricingCard({
  name,
  price,
  period,
  description,
  features,
  highlighted,
}: {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  highlighted?: boolean;
}) {
  return (
    <div
      className={`relative rounded-2xl border p-8 transition-all duration-300 ${
        highlighted
          ? "border-blue-300 bg-gradient-to-b from-blue-50 to-white shadow-xl shadow-blue-500/10 scale-105 ring-1 ring-blue-200"
          : "bg-card hover:shadow-lg hover:-translate-y-1"
      }`}
    >
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center rounded-full bg-gradient-to-r from-blue-600 to-teal-500 px-4 py-1 text-xs font-semibold text-white shadow-lg">
          Popular
        </div>
      )}
      <h3 className="text-lg font-bold">{name}</h3>
      <div className="mt-4">
        <span className="text-4xl font-extrabold">{price}</span>
        {period && <span className="text-muted-foreground ml-1">{period}</span>}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      <ul className="mt-8 space-y-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-center text-sm">
            <CheckCircle className="mr-3 h-4 w-4 text-blue-500 shrink-0" />
            {feature}
          </li>
        ))}
      </ul>
      <Link href="/login">
        <Button
          className={`mt-8 w-full rounded-xl h-11 ${
            highlighted
              ? "bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white shadow-lg shadow-blue-500/25"
              : ""
          }`}
          variant={highlighted ? "default" : "outline"}
        >
          {highlighted ? "Comenzar ahora" : "Seleccionar"}
        </Button>
      </Link>
    </div>
  );
}
