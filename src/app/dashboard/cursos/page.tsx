"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Search, MoreVertical, Users, Calendar, BookOpen, Settings, Trash2, Edit } from "lucide-react";
import Link from "next/link";

interface Classroom {
  id: string;
  name: string;
  subject: string;
  grade: string;
  shift?: string;
  code: string;
  color: string;
  studentCount: number;
  isActive: boolean;
  createdAt: string;
}

export default function CursosPage() {
  const { data: session, status } = useSession();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      fetchClassrooms();
    }
  }, [status]);

  const fetchClassrooms = async () => {
    try {
      const response = await fetch("/api/classrooms");
      if (response.ok) {
        const data = await response.json();
        setClassrooms(data.classrooms || []);
      }
    } catch (error) {
      console.error("Error fetching classrooms:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClassrooms = classrooms.filter(
    (classroom) =>
      classroom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classroom.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classroom.grade.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeClassrooms = filteredClassrooms.filter(c => c.isActive);
  const inactiveClassrooms = filteredClassrooms.filter(c => !c.isActive);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Mis Cursos</h1>
          <p className="text-muted-foreground">
            Gestiona tus cursos y estudiantes
          </p>
        </div>
        <Link href="/dashboard/cursos/nuevo">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Curso
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar cursos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total Cursos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classrooms.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {activeClassrooms.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total Estudiantes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {classrooms.reduce((sum, c) => sum + c.studentCount, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Classrooms */}
      {activeClassrooms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Cursos Activos</CardTitle>
            <CardDescription>
              Cursos actualmente en desarrollo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Curso</TableHead>
                  <TableHead>Materia</TableHead>
                  <TableHead>Grado</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Estudiantes</TableHead>
                  <TableHead>Jornada</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeClassrooms.map((classroom) => (
                  <TableRow key={classroom.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: classroom.color }}
                        />
                        <Link
                          href={`/dashboard/cursos/${classroom.id}`}
                          className="font-medium hover:underline"
                        >
                          {classroom.name}
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{classroom.subject}</Badge>
                    </TableCell>
                    <TableCell>{classroom.grade}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{classroom.code}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {classroom.studentCount}
                      </div>
                    </TableCell>
                    <TableCell>
                      {classroom.shift && (
                        <Badge variant="outline">{classroom.shift}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/cursos/${classroom.id}`}>
                              <BookOpen className="h-4 w-4 mr-2" />
                              Ver Curso
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/cursos/${classroom.id}/editar`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/cursos/${classroom.id}/asistencia`}>
                              <Calendar className="h-4 w-4 mr-2" />
                              Asistencia
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/cursos/${classroom.id}/notas`}>
                              <Settings className="h-4 w-4 mr-2" />
                              Notas
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Archivar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Inactive Classrooms */}
      {inactiveClassrooms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Cursos Archivados</CardTitle>
            <CardDescription>
              Cursos que no están activos actualmente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Curso</TableHead>
                  <TableHead>Materia</TableHead>
                  <TableHead>Grado</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Estudiantes</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inactiveClassrooms.map((classroom) => (
                  <TableRow key={classroom.id} className="opacity-60">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: classroom.color }}
                        />
                        <span className="font-medium">{classroom.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{classroom.subject}</Badge>
                    </TableCell>
                    <TableCell>{classroom.grade}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{classroom.code}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {classroom.studentCount}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Activar Curso</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {classrooms.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="mx-auto w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-4">
              <BookOpen className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No tienes cursos</h3>
            <p className="text-muted-foreground mb-4">
              Crea tu primer curso para empezar a gestionar tus clases
            </p>
            <Link href="/dashboard/cursos/nuevo">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Curso
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
