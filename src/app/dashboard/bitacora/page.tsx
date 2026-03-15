"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PenTool,
  Plus,
  Search,
  Calendar,
  User,
  Tag,
  Loader2,
  Lock,
  Unlock,
  MoreVertical,
  Edit,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface Classroom {
  id: string;
  name: string;
}

interface Student {
  id: string;
  name: string;
}

interface LogEntry {
  id: string;
  title?: string;
  content: string;
  tags?: string[];
  isPrivate: boolean;
  createdAt: string;
  classroomId?: string;
  classroomName?: string;
  studentId?: string;
  studentName?: string;
}

const SUGGESTED_TAGS = [
  "observación",
  "logro",
  "dificultad",
  "comportamiento",
  "participación",
  "reunión",
  "seguimiento",
  "nota",
];

export default function BitacoraPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddLog, setShowAddLog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClassroom, setFilterClassroom] = useState<string>("all");

  // Form state
  const [newLog, setNewLog] = useState({
    title: "",
    content: "",
    tags: [] as string[],
    isPrivate: true,
    classroomId: "",
    studentId: "",
  });
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (newLog.classroomId) {
      fetchStudents(newLog.classroomId);
    } else {
      setStudents([]);
    }
  }, [newLog.classroomId]);

  const fetchData = async () => {
    try {
      const [logsRes, classroomsRes] = await Promise.all([
        fetch("/api/teacher-logs"),
        fetch("/api/classrooms"),
      ]);

      const logsData = await logsRes.json();
      const classroomsData = await classroomsRes.json();

      if (logsData.success) setLogs(logsData.logs);
      if (classroomsData.success) setClassrooms(classroomsData.classrooms);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async (classroomId: string) => {
    try {
      const response = await fetch(`/api/classrooms/${classroomId}/students`);
      const data = await response.json();
      if (data.success) {
        setStudents(data.students);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !newLog.tags.includes(tagInput.trim())) {
      setNewLog({ ...newLog, tags: [...newLog.tags, tagInput.trim()] });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setNewLog({ ...newLog, tags: newLog.tags.filter((t) => t !== tag) });
  };

  const handleAddLog = async () => {
    if (!newLog.content.trim()) {
      toast.error("El contenido es requerido");
      return;
    }

    try {
      const response = await fetch("/api/teacher-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLog),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Entrada guardada");
        setShowAddLog(false);
        setNewLog({
          title: "",
          content: "",
          tags: [],
          isPrivate: true,
          classroomId: "",
          studentId: "",
        });
        fetchData();
      } else {
        toast.error(data.error || "Error al guardar");
      }
    } catch (error) {
      toast.error("Error al guardar entrada");
    }
  };

  const handleDeleteLog = async (id: string) => {
    try {
      const response = await fetch(`/api/teacher-logs/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Entrada eliminada");
        setLogs(logs.filter((log) => log.id !== id));
      }
    } catch (error) {
      toast.error("Error al eliminar");
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.tags?.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesClassroom =
      filterClassroom === "all" || log.classroomId === filterClassroom;

    return matchesSearch && matchesClassroom;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <PenTool className="h-6 w-6" />
            Bitácora del Docente
          </h1>
          <p className="text-muted-foreground">
            Registra observaciones, logros y seguimiento de estudiantes
          </p>
        </div>

        <Dialog open={showAddLog} onOpenChange={setShowAddLog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Entrada
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nueva Entrada de Bitácora</DialogTitle>
              <DialogDescription>
                Registra una observación, logro o nota importante
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título (opcional)</Label>
                <Input
                  id="title"
                  value={newLog.title}
                  onChange={(e) => setNewLog({ ...newLog, title: e.target.value })}
                  placeholder="Título breve de la entrada"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Curso (opcional)</Label>
                  <Select
                    value={newLog.classroomId}
                    onValueChange={(value) => setNewLog({ ...newLog, classroomId: value, studentId: "" })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar curso" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Sin curso específico</SelectItem>
                      {classrooms.map((classroom) => (
                        <SelectItem key={classroom.id} value={classroom.id}>
                          {classroom.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Estudiante (opcional)</Label>
                  <Select
                    value={newLog.studentId}
                    onValueChange={(value) => setNewLog({ ...newLog, studentId: value })}
                    disabled={!newLog.classroomId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estudiante" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Sin estudiante específico</SelectItem>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Contenido *</Label>
                <Textarea
                  id="content"
                  value={newLog.content}
                  onChange={(e) => setNewLog({ ...newLog, content: e.target.value })}
                  placeholder="Escribe tu observación, nota o registro..."
                  rows={5}
                />
              </div>

              <div className="space-y-2">
                <Label>Etiquetas</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {newLog.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Agregar etiqueta"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                  />
                  <Button type="button" variant="outline" onClick={handleAddTag}>
                    <Tag className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {SUGGESTED_TAGS.filter((t) => !newLog.tags.includes(t)).map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="cursor-pointer hover:bg-muted"
                      onClick={() => setNewLog({ ...newLog, tags: [...newLog.tags, tag] })}
                    >
                      + {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant={newLog.isPrivate ? "default" : "outline"}
                  size="sm"
                  onClick={() => setNewLog({ ...newLog, isPrivate: true })}
                >
                  <Lock className="h-4 w-4 mr-1" />
                  Privado
                </Button>
                <Button
                  type="button"
                  variant={!newLog.isPrivate ? "default" : "outline"}
                  size="sm"
                  onClick={() => setNewLog({ ...newLog, isPrivate: false })}
                >
                  <Unlock className="h-4 w-4 mr-1" />
                  Visible
                </Button>
                <span className="text-sm text-muted-foreground ml-2">
                  {newLog.isPrivate
                    ? "Solo tú puedes ver esta entrada"
                    : "Visible para otros docentes del colegio"}
                </span>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddLog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddLog}>Guardar Entrada</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar en bitácora..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterClassroom} onValueChange={setFilterClassroom}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por curso" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los cursos</SelectItem>
            {classrooms.map((classroom) => (
              <SelectItem key={classroom.id} value={classroom.id}>
                {classroom.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Logs */}
      {filteredLogs.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <PenTool className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Sin entradas</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || filterClassroom !== "all"
                ? "No se encontraron entradas con los filtros aplicados"
                : "Comienza a registrar observaciones y notas importantes"}
            </p>
            <Button onClick={() => setShowAddLog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Entrada
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredLogs.map((log) => (
            <Card key={log.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    {log.title && (
                      <CardTitle className="text-base">{log.title}</CardTitle>
                    )}
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(log.createdAt).toLocaleDateString("es", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {log.classroomName && (
                        <>
                          <span>·</span>
                          <span>{log.classroomName}</span>
                        </>
                      )}
                      {log.studentName && (
                        <>
                          <span>·</span>
                          <User className="h-3 w-3" />
                          <span>{log.studentName}</span>
                        </>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {log.isPrivate ? (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Unlock className="h-4 w-4 text-muted-foreground" />
                    )}
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
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeleteLog(log.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{log.content}</p>
                {log.tags && log.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {log.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
