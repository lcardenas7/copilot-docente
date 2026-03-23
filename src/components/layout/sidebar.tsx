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
    <aside className="hidden md:flex w-64 flex-col border-r bg-white/50">
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid gap-0.5 px-3">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-md shadow-blue-500/20"
                    : "text-muted-foreground hover:bg-blue-50/80 hover:text-foreground"
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
        <div className="rounded-xl bg-gradient-to-br from-blue-50 to-sky-50 p-3 border border-sky-100">
          <p className="text-xs font-semibold text-blue-700">Plan Gratuito</p>
          <p className="text-xs text-muted-foreground mt-1">
            5 guías restantes este mes
          </p>
          <Link
            href="/pricing"
            className="mt-2 inline-block text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            Actualizar a Pro →
          </Link>
        </div>
      </div>
    </aside>
  );
}
