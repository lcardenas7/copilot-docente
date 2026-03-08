import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/session-provider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Copilot del Docente | IA para preparar tus clases",
  description: "El asistente de IA que prepara tus clases en minutos. Genera guías, exámenes, rúbricas y actividades con inteligencia artificial.",
  keywords: ["educación", "docente", "IA", "inteligencia artificial", "planeación de clases", "exámenes", "Colombia", "Latinoamérica"],
  authors: [{ name: "Copilot del Docente" }],
  openGraph: {
    title: "Copilot del Docente | IA para preparar tus clases",
    description: "El asistente de IA que prepara tus clases en minutos.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <SessionProvider>
          {children}
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
