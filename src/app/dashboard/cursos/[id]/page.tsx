"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  BookOpen,
  Users,
  GraduationCap,
  FileText,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Calendar,
  Clock,
  Sparkles,
  ChevronRight,
  Copy,
  CheckCircle2,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface Classroom {
  id: string;
  name: string;
  subject: string;
  grade: string;
  group?: string;
  shift?: string;
  academicYear: string;
  code: string;
  color: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  units: Unit[];
  students: Student[];
}

interface Unit {
  id: string;
  name: string;
  description?: string;
  order: number;
  topics: Topic[];
}

interface Topic {
  id: string;
  name: string;
  description?: string;
  order: number;
  hours: number;
  guides: any[];
  exams: any[];
}

interface Student {
  id: string;
  name: string;
  email: string;
  image?: string;
  joinedAt: string;
  roles?: string[];
}

export default function CursoDetailPage() {
  const params = useParams();
  const classroomId = params.id as string;
  
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("contenido");
  const [codeCopied, setCodeCopied] = useState(false);
  
  // Dialog states
  const [showAddUnit, setShowAddUnit] = useState(false);
  const [showAddTopic, setShowAddTopic] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  
  // Form states
  const [newUnitName, setNewUnitName] = useState("");
  const [newUnitDescription, setNewUnitDescription] = useState("");
  const [newTopicName, setNewTopicName] = useState("");
  const [newTopicHours, setNewTopicHours] = useState(2);
  const [newStudentEmail, setNewStudentEmail] = useState("");

  useEffect(() => {
    fetchClassroom();
  }, [classroomId]);

  const fetchClassroom = async () => {
    try {
      const response = await fetch(`/api/classrooms/${classroomId}`);
      if (response.ok) {
        const data = await response.json();
        setClassroom(data.classroom);
      }
    } catch (error) {
      console.error("Error fetching classroom:", error);
      toast.error("Error al cargar el curso");
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    if (classroom?.code) {
      navigator.clipboard.writeText(classroom.code);
      setCodeCopied(true);
      toast.success("Código copiado");
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  const handleAddUnit = async () => {
    if (!newUnitName.trim()) return;
    
    try {
      const response = await fetch(`/api/classrooms/${classroomId}/units`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newUnitName,
          description: newUnitDescription,
        }),
      });
      
      if (response.ok) {
        toast.success("Unidad creada");
        setNewUnitName("");
        setNewUnitDescription("");
        setShowAddUnit(false);
        fetchClassroom();
      }
    } catch (error) {
      toast.error("Error al crear unidad");
    }
  };

  const handleAddTopic = async () => {
    if (!newTopicName.trim() || !selectedUnit) return;
    
    try {
      const response = await fetch(`/api/units/${selectedUnit.id}/topics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newTopicName,
          hours: newTopicHours,
        }),
      });
      
      if (response.ok) {
        toast.success("Tema creado");
        setNewTopicName("");
        setNewTopicHours(2);
        setShowAddTopic(false);
        setSelectedUnit(null);
        fetchClassroom();
      }
    } catch (error) {
      toast.error("Error al crear tema");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!classroom) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Curso no encontrado</p>
        <Link href="/dashboard/cursos">
          <Button variant="link">Volver a cursos</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex items-start gap-4">
          <Link href="/dashboard/cursos">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: classroom.color }}
              />
              <h1 className="text-2xl font-bold">{classroom.name}</h1>
              {classroom.isActive && (
                <Badge variant="default" className="bg-green-500">Activo</Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1">
              {classroom.subject} · {classroom.grade}
              {classroom.group && ` · Grupo ${classroom.group}`}
              {classroom.shift && ` · ${classroom.shift}`}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Código de acceso */}
          <Button
            variant="outline"
            className="font-mono"
            onClick={copyCode}
          >
            {codeCopied ? (
              <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
            ) : (
              <Copy className="h-4 w-4 mr-2" />
            )}
            {classroom.code}
          </Button>
          
          <Link href={`/dashboard/cursos/${classroomId}/planificar`}>
            <Button>
              <Sparkles className="h-4 w-4 mr-2" />
              Planificar con IA
            </Button>
          </Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/cursos/${classroomId}/editar`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar curso
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/cursos/${classroomId}/asistencia`}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Asistencia
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Archivar curso
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">Unidades</span>
            </div>
            <p className="text-2xl font-bold mt-1">{classroom.units?.length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Temas</span>
            </div>
            <p className="text-2xl font-bold mt-1">
              {classroom.units?.reduce((acc, u) => acc + (u.topics?.length || 0), 0) || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-500" />
              <span className="text-sm text-muted-foreground">Estudiantes</span>
            </div>
            <p className="text-2xl font-bold mt-1">{classroom.students?.length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <span className="text-sm text-muted-foreground">Horas totales</span>
            </div>
            <p className="text-2xl font-bold mt-1">
              {classroom.units?.reduce(
                (acc, u) => acc + (u.topics?.reduce((t, topic) => t + (topic.hours || 0), 0) || 0),
                0
              ) || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="contenido">
            <BookOpen className="h-4 w-4 mr-2" />
            Contenido
          </TabsTrigger>
          <TabsTrigger value="estudiantes">
            <Users className="h-4 w-4 mr-2" />
            Estudiantes
          </TabsTrigger>
          <TabsTrigger value="notas">
            <GraduationCap className="h-4 w-4 mr-2" />
            Notas
          </TabsTrigger>
        </TabsList>

        {/* Tab: Contenido */}
        <TabsContent value="contenido" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Unidades y Temas</h2>
            <Dialog open={showAddUnit} onOpenChange={setShowAddUnit}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Unidad
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear Nueva Unidad</DialogTitle>
                  <DialogDescription>
                    Agrega una unidad para organizar los temas del curso
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="unitName">Nombre de la unidad</Label>
                    <Input
                      id="unitName"
                      placeholder="Ej: Unidad 1: Fracciones"
                      value={newUnitName}
                      onChange={(e) => setNewUnitName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unitDesc">Descripción (opcional)</Label>
                    <Textarea
                      id="unitDesc"
                      placeholder="Describe los objetivos de esta unidad..."
                      value={newUnitDescription}
                      onChange={(e) => setNewUnitDescription(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddUnit(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddUnit}>Crear Unidad</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {classroom.units?.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Sin unidades</h3>
                <p className="text-muted-foreground mb-4">
                  Crea tu primera unidad o usa la planificación con IA
                </p>
                <div className="flex justify-center gap-2">
                  <Button variant="outline" onClick={() => setShowAddUnit(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear manualmente
                  </Button>
                  <Link href={`/dashboard/cursos/${classroomId}/planificar`}>
                    <Button>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Planificar con IA
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {classroom.units?.map((unit, index) => (
                <Card key={unit.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Badge variant="outline">{index + 1}</Badge>
                          {unit.name}
                        </CardTitle>
                        {unit.description && (
                          <CardDescription className="mt-1">
                            {unit.description}
                          </CardDescription>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUnit(unit);
                            setShowAddTopic(true);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Tema
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  {unit.topics?.length > 0 && (
                    <CardContent>
                      <div className="space-y-2">
                        {unit.topics.map((topic, tIndex) => (
                          <div
                            key={topic.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-muted-foreground">
                                {index + 1}.{tIndex + 1}
                              </span>
                              <span className="font-medium">{topic.name}</span>
                              <Badge variant="secondary" className="text-xs">
                                {topic.hours}h
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              {topic.guides?.length > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  {topic.guides.length} guías
                                </Badge>
                              )}
                              {topic.exams?.length > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  {topic.exams.length} exámenes
                                </Badge>
                              )}
                              <Link href={`/dashboard/guides/new?topicId=${topic.id}`}>
                                <Button variant="ghost" size="sm">
                                  <Sparkles className="h-4 w-4 mr-1" />
                                  Generar
                                </Button>
                              </Link>
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab: Estudiantes */}
        <TabsContent value="estudiantes" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">
              Estudiantes ({classroom.students?.length || 0})
            </h2>
            <div className="flex gap-2">
              <Button variant="outline">
                Importar CSV
              </Button>
              <Dialog open={showAddStudent} onOpenChange={setShowAddStudent}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Estudiante
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Agregar Estudiante</DialogTitle>
                    <DialogDescription>
                      Invita a un estudiante por email o comparte el código: {classroom.code}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="studentEmail">Email del estudiante</Label>
                      <Input
                        id="studentEmail"
                        type="email"
                        placeholder="estudiante@email.com"
                        value={newStudentEmail}
                        onChange={(e) => setNewStudentEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAddStudent(false)}>
                      Cancelar
                    </Button>
                    <Button>Enviar Invitación</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {classroom.students?.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Sin estudiantes</h3>
                <p className="text-muted-foreground mb-4">
                  Comparte el código <strong>{classroom.code}</strong> con tus estudiantes
                </p>
                <Button onClick={copyCode}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar código
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Estudiante</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Ingresó</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classroom.students?.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        {student.name}
                      </TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>
                        {student.roles?.map((role) => (
                          <Badge key={role} variant="secondary" className="mr-1">
                            {role}
                          </Badge>
                        ))}
                      </TableCell>
                      <TableCell>
                        {new Date(student.joinedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Ver perfil</DropdownMenuItem>
                            <DropdownMenuItem>Asignar rol</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              Remover del curso
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        {/* Tab: Notas */}
        <TabsContent value="notas" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Libro de Notas</h2>
            <div className="flex gap-2">
              <Button variant="outline">
                Exportar Excel
              </Button>
              <Button variant="outline">
                Exportar PDF
              </Button>
            </div>
          </div>

          <Card className="text-center py-12">
            <CardContent>
              <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Libro de notas vacío</h3>
              <p className="text-muted-foreground mb-4">
                Las notas aparecerán aquí cuando los estudiantes completen evaluaciones
              </p>
              <Link href={`/dashboard/cursos/${classroomId}/notas`}>
                <Button variant="outline">
                  Ver libro completo
                </Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog: Add Topic */}
      <Dialog open={showAddTopic} onOpenChange={setShowAddTopic}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Tema</DialogTitle>
            <DialogDescription>
              Agrega un tema a la unidad: {selectedUnit?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="topicName">Nombre del tema</Label>
              <Input
                id="topicName"
                placeholder="Ej: Suma de fracciones"
                value={newTopicName}
                onChange={(e) => setNewTopicName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="topicHours">Horas estimadas</Label>
              <Input
                id="topicHours"
                type="number"
                min={1}
                max={20}
                value={newTopicHours}
                onChange={(e) => setNewTopicHours(parseInt(e.target.value) || 2)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddTopic(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddTopic}>Crear Tema</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
