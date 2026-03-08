"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  FileText,
  HelpCircle,
  LayoutDashboard,
  Menu,
  MessageSquare,
  School,
  Settings,
  FolderOpen,
  GraduationCap,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Guías", href: "/dashboard/guides", icon: BookOpen },
  { title: "Exámenes", href: "/dashboard/exams", icon: FileText },
  { title: "Preguntas", href: "/dashboard/questions", icon: HelpCircle },
  { title: "Copilot", href: "/dashboard/copilot", icon: MessageSquare },
  { title: "Plantillas", href: "/dashboard/templates", icon: FolderOpen },
  { title: "Aulas", href: "/dashboard/classrooms", icon: School },
  { title: "Config", href: "/dashboard/settings", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/" className="flex items-center space-x-2" onClick={() => setOpen(false)}>
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="font-bold">Copilot del Docente</span>
          </Link>
        </div>
        <nav className="grid gap-1 p-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
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
      </SheetContent>
    </Sheet>
  );
}
