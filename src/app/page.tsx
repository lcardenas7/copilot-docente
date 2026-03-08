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
  Star,
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl">Copilot del Docente</span>
          </Link>
          <nav className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost">Iniciar sesión</Button>
            </Link>
            <Link href="/login">
              <Button>Comenzar gratis</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container flex flex-col items-center justify-center py-24 text-center">
        <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium mb-6">
          <Zap className="mr-2 h-4 w-4 text-yellow-500" />
          Potenciado por IA
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl max-w-4xl">
          El asistente de IA que{" "}
          <span className="text-primary">prepara tus clases</span> en minutos
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl">
          Genera guías de clase, exámenes, rúbricas y actividades con inteligencia artificial.
          Ahorra horas de trabajo y enfócate en lo que importa: enseñar.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Link href="/login">
            <Button size="lg" className="text-lg px-8">
              Comenzar gratis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="#features">
            <Button size="lg" variant="outline" className="text-lg px-8">
              Ver características
            </Button>
          </Link>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Sin tarjeta de crédito • 5 guías gratis al mes
        </p>
      </section>

      {/* Features Section */}
      <section id="features" className="container py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Todo lo que necesitas para planear tus clases
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Herramientas de IA diseñadas específicamente para docentes latinoamericanos
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={BookOpen}
            title="Guías de Clase"
            description="Genera planeaciones completas con objetivos, actividades, evaluación y recursos. Alineadas con el currículo de tu país."
          />
          <FeatureCard
            icon={FileText}
            title="Exámenes con IA"
            description="Crea evaluaciones con preguntas de selección múltiple, verdadero/falso, abiertas y más. Con respuestas y explicaciones."
          />
          <FeatureCard
            icon={MessageSquare}
            title="Copilot Conversacional"
            description="Pregunta lo que necesites: '¿Cómo enseño fracciones a grado 6?' y recibe recomendaciones pedagógicas personalizadas."
          />
          <FeatureCard
            icon={Clock}
            title="Ahorra Tiempo"
            description="Lo que antes tomaba 2 horas, ahora lo haces en 5 minutos. Más tiempo para ti y tus estudiantes."
          />
          <FeatureCard
            icon={CheckCircle}
            title="Taxonomía de Bloom"
            description="Contenido estructurado según niveles cognitivos: recordar, comprender, aplicar, analizar, evaluar y crear."
          />
          <FeatureCard
            icon={Star}
            title="Biblioteca Reutilizable"
            description="Guarda tus mejores recursos y reutilízalos. Duplica plantillas para otros grupos con un clic."
          />
        </div>
      </section>

      {/* How it works */}
      <section className="bg-muted/50 py-24">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Así de fácil funciona
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <StepCard
              number="1"
              title="Describe tu clase"
              description="Escribe el tema, grado, materia y metodología que quieres usar."
            />
            <StepCard
              number="2"
              title="La IA genera todo"
              description="En segundos recibes una planeación completa con actividades, evaluación y recursos."
            />
            <StepCard
              number="3"
              title="Edita y exporta"
              description="Personaliza el contenido y exporta a PDF o Word listo para usar."
            />
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="container py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Empieza gratis, crece cuando quieras
          </h2>
        </div>
        <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
          <PricingCard
            name="Gratis"
            price="$0"
            description="Para probar la plataforma"
            features={[
              "5 guías de clase al mes",
              "2 exámenes al mes",
              "Banco de 50 preguntas",
              "1 aula virtual",
            ]}
          />
          <PricingCard
            name="Pro"
            price="$7"
            period="/mes"
            description="Para docentes activos"
            features={[
              "Guías ilimitadas",
              "Exámenes ilimitados",
              "Copilot conversacional",
              "Exportar PDF/Word",
              "Aulas ilimitadas",
              "Soporte prioritario",
            ]}
            highlighted
          />
          <PricingCard
            name="Colegio"
            price="Desde $50"
            period="/mes"
            description="Para instituciones"
            features={[
              "Todo lo de Pro",
              "Docentes ilimitados",
              "Analítica institucional",
              "Integración ERP",
              "Soporte dedicado",
            ]}
          />
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-primary-foreground py-24">
        <div className="container text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            ¿Listo para ahorrar horas de trabajo?
          </h2>
          <p className="mt-4 text-lg opacity-90 max-w-2xl mx-auto">
            Únete a miles de docentes que ya usan IA para preparar sus clases.
          </p>
          <Link href="/login">
            <Button size="lg" variant="secondary" className="mt-8 text-lg px-8">
              Comenzar gratis ahora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="font-bold">Copilot del Docente</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 Copilot del Docente. Todos los derechos reservados.
          </p>
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:underline">Privacidad</Link>
            <Link href="/terms" className="hover:underline">Términos</Link>
            <Link href="/contact" className="hover:underline">Contacto</Link>
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
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-muted-foreground">{description}</p>
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
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
        {number}
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-muted-foreground">{description}</p>
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
      className={`rounded-lg border p-6 ${
        highlighted ? "border-primary bg-primary/5 shadow-lg scale-105" : "bg-card"
      }`}
    >
      <h3 className="text-lg font-semibold">{name}</h3>
      <div className="mt-4">
        <span className="text-4xl font-bold">{price}</span>
        {period && <span className="text-muted-foreground">{period}</span>}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      <ul className="mt-6 space-y-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-center text-sm">
            <CheckCircle className="mr-2 h-4 w-4 text-primary" />
            {feature}
          </li>
        ))}
      </ul>
      <Link href="/login">
        <Button className="mt-6 w-full" variant={highlighted ? "default" : "outline"}>
          {highlighted ? "Comenzar ahora" : "Seleccionar"}
        </Button>
      </Link>
    </div>
  );
}
