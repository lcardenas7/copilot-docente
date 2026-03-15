"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  FileText,
  HelpCircle,
  LayoutDashboard,
  MessageSquare,
  School,
  Settings,
  FolderOpen,
  BarChart3,
  Calendar,
  Users,
  GraduationCap,
  Notebook,
  Clock,
  PenTool,
} from "lucide-react";

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Guías de Clase",
    href: "/dashboard/guides",
    icon: BookOpen,
  },
  {
    title: "Exámenes",
    href: "/dashboard/exams",
    icon: FileText,
  },
  {
    title: "Cursos",
    href: "/dashboard/cursos",
    icon: GraduationCap,
  },
  {
    title: "Aula Virtual",
    href: "/dashboard/classrooms",
    icon: School,
  },
  {
    title: "Libro de Notas",
    href: "/dashboard/notas",
    icon: Notebook,
  },
  {
    title: "Asistencia",
    href: "/dashboard/asistencia",
    icon: Users,
  },
  {
    title: "Horario",
    href: "/dashboard/horario",
    icon: Clock,
  },
  {
    title: "Calendario",
    href: "/dashboard/calendario",
    icon: Calendar,
  },
  {
    title: "Bitácora",
    href: "/dashboard/bitacora",
    icon: PenTool,
  },
  {
    title: "Banco de Preguntas",
    href: "/dashboard/questions",
    icon: HelpCircle,
  },
  {
    title: "Copilot IA",
    href: "/dashboard/copilot",
    icon: MessageSquare,
  },
  {
    title: "Mis Plantillas",
    href: "/dashboard/templates",
    icon: FolderOpen,
  },
  {
    title: "Analítica",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    title: "Configuración",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-muted/40">
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid gap-1 px-2">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="border-t p-4">
        <div className="rounded-lg bg-primary/10 p-3">
          <p className="text-xs font-medium text-primary">Plan Gratuito</p>
          <p className="text-xs text-muted-foreground mt-1">
            5 guías restantes este mes
          </p>
          <Link
            href="/pricing"
            className="mt-2 inline-block text-xs font-medium text-primary hover:underline"
          >
            Actualizar a Pro →
          </Link>
        </div>
      </div>
    </aside>
  );
}
