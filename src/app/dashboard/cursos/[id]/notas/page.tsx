"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  ArrowLeft,
  Download,
  Plus,
  Save,
  Trash2,
  Filter,
  Users,
} from "lucide-react";

interface Student {
  id: string;
  name: string;
  email: string;
}

interface GradeColumn {
  id: string;
  name: string;
  category: string;
  maxScore: number;
  period: string;
  examId?: string;
}

interface GradeEntry {
  id?: string;
  studentId: string;
  columnId: string;
  score: number | null;
}

interface Classroom {
  id: string;
  name: string;
  subject: string;
}

export default function GradeBookPage() {
  const params = useParams();
  const router = useRouter();
  const classroomId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [columns, setColumns] = useState<GradeColumn[]>([]);
  const [grades, setGrades] = useState<Map<string, number | null>>(new Map());
  const [editedGrades, setEditedGrades] = useState<Map<string, number | null>>(new Map());
  const [hasChanges, setHasChanges] = useState(false);
  
  // Filters
  const [periodFilter, setPeriodFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  
  // New column dialog
  const [showNewColumn, setShowNewColumn] = useState(false);
  const [newColumn, setNewColumn] = useState({
    name: "",
    category: "homework",
    maxScore: 5,
    period: "Q1",
  });

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(`/api/gradebook/${classroomId}`);
      if (!response.ok) throw new Error("Error al cargar datos");
      
      const data = await response.json();
      setClassroom(data.classroom);
      setStudents(data.students);
      setColumns(data.columns);
      
      // Build grades map
      const gradesMap = new Map<string, number | null>();
      data.grades.forEach((g: { studentId: string; columnId: string; score: number | null }) => {
        gradesMap.set(`${g.studentId}-${g.columnId}`, g.score);
      });
      setGrades(gradesMap);
      setEditedGrades(new Map(gradesMap));
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar el libro de notas");
    } finally {
      setLoading(false);
    }
  }, [classroomId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleGradeChange = (studentId: string, columnId: string, value: string) => {
    const key = `${studentId}-${columnId}`;
    const numValue = value === "" ? null : parseFloat(value);
    
    const newEdited = new Map(editedGrades);
    newEdited.set(key, numValue);
    setEditedGrades(newEdited);
    
    // Check if there are changes
    const originalValue = grades.get(key);
    setHasChanges(numValue !== originalValue || editedGrades.size !== grades.size);
  };

  const saveGrades = async () => {
    setSaving(true);
    try {
      // Find changed grades
      const changes: { studentId: string; columnId: string; score: number | null }[] = [];
      
      editedGrades.forEach((score, key) => {
        const originalScore = grades.get(key);
        if (score !== originalScore) {
          const [studentId, columnId] = key.split("-");
          changes.push({ studentId, columnId, score });
        }
      });

      if (changes.length === 0) {
        toast.info("No hay cambios para guardar");
        return;
      }

      const response = await fetch(`/api/gradebook/${classroomId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grades: changes }),
      });

      if (!response.ok) throw new Error("Error al guardar");

      setGrades(new Map(editedGrades));
      setHasChanges(false);
      toast.success(`${changes.length} notas guardadas`);
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar las notas");
    } finally {
      setSaving(false);
    }
  };

  const addColumn = async () => {
    if (!newColumn.name.trim()) {
      toast.error("El nombre es requerido");
      return;
    }

    try {
      const response = await fetch(`/api/gradebook/${classroomId}/columns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newColumn),
      });

      if (!response.ok) throw new Error("Error al crear columna");

      const data = await response.json();
      setColumns([...columns, data.column]);
      setShowNewColumn(false);
      setNewColumn({ name: "", category: "homework", maxScore: 5, period: "Q1" });
      toast.success("Columna agregada");
    } catch (error) {
      console.error(error);
      toast.error("Error al agregar columna");
    }
  };

  const deleteColumn = async (columnId: string) => {
    if (!confirm("¿Eliminar esta columna y todas sus notas?")) return;

    try {
      const response = await fetch(`/api/gradebook/${classroomId}/columns/${columnId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Error al eliminar");

      setColumns(columns.filter(c => c.id !== columnId));
      toast.success("Columna eliminada");
    } catch (error) {
      console.error(error);
      toast.error("Error al eliminar columna");
    }
  };

  const exportToExcel = async () => {
    try {
      const response = await fetch(`/api/gradebook/${classroomId}/export`);
      if (!response.ok) throw new Error("Error al exportar");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `notas_${classroom?.name || "curso"}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success("Archivo exportado");
    } catch (error) {
      console.error(error);
      toast.error("Error al exportar");
    }
  };

  const filteredColumns = columns.filter(col => {
    if (periodFilter !== "all" && col.period !== periodFilter) return false;
    if (categoryFilter !== "all" && col.category !== categoryFilter) return false;
    return true;
  });

  const calculateAverage = (studentId: string): string => {
    let total = 0;
    let count = 0;
    let maxTotal = 0;

    filteredColumns.forEach(col => {
      const score = editedGrades.get(`${studentId}-${col.id}`);
      if (score !== null && score !== undefined) {
        total += score;
        maxTotal += col.maxScore;
        count++;
      }
    });

    if (count === 0) return "-";
    const percentage = (total / maxTotal) * 100;
    return `${percentage.toFixed(1)}%`;
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      exam: "Examen",
      homework: "Tarea",
      participation: "Participación",
      project: "Proyecto",
      quiz: "Quiz",
      other: "Otro",
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      exam: "bg-red-100 text-red-800",
      homework: "bg-blue-100 text-blue-800",
      participation: "bg-green-100 text-green-800",
      project: "bg-purple-100 text-purple-800",
      quiz: "bg-yellow-100 text-yellow-800",
      other: "bg-gray-100 text-gray-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <Skeleton className="h-8 w-64 mb-6" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Libro de Notas</h1>
            <p className="text-muted-foreground">
              {classroom?.name} - {classroom?.subject}
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {hasChanges && (
            <Button onClick={saveGrades} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Guardando..." : "Guardar cambios"}
            </Button>
          )}
          <Button variant="outline" onClick={exportToExcel}>
            <Download className="h-4 w-4 mr-2" />
            Exportar Excel
          </Button>
          <Dialog open={showNewColumn} onOpenChange={setShowNewColumn}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nueva columna
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agregar columna de notas</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Nombre</Label>
                  <Input
                    value={newColumn.name}
                    onChange={(e) => setNewColumn({ ...newColumn, name: e.target.value })}
                    placeholder="Ej: Tarea 1, Quiz Semana 3"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Categoría</Label>
                    <Select
                      value={newColumn.category}
                      onValueChange={(v) => setNewColumn({ ...newColumn, category: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="homework">Tarea</SelectItem>
                        <SelectItem value="quiz">Quiz</SelectItem>
                        <SelectItem value="exam">Examen</SelectItem>
                        <SelectItem value="project">Proyecto</SelectItem>
                        <SelectItem value="participation">Participación</SelectItem>
                        <SelectItem value="other">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Período</Label>
                    <Select
                      value={newColumn.period}
                      onValueChange={(v) => setNewColumn({ ...newColumn, period: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Q1">Período 1</SelectItem>
                        <SelectItem value="Q2">Período 2</SelectItem>
                        <SelectItem value="Q3">Período 3</SelectItem>
                        <SelectItem value="Q4">Período 4</SelectItem>
                        <SelectItem value="Final">Final</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Nota máxima</Label>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={newColumn.maxScore}
                    onChange={(e) => setNewColumn({ ...newColumn, maxScore: parseFloat(e.target.value) || 5 })}
                  />
                </div>
                <Button onClick={addColumn} className="w-full">
                  Agregar columna
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4 items-center">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <Label className="text-sm">Período:</Label>
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Q1">Período 1</SelectItem>
                  <SelectItem value="Q2">Período 2</SelectItem>
                  <SelectItem value="Q3">Período 3</SelectItem>
                  <SelectItem value="Q4">Período 4</SelectItem>
                  <SelectItem value="Final">Final</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm">Categoría:</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="exam">Exámenes</SelectItem>
                  <SelectItem value="homework">Tareas</SelectItem>
                  <SelectItem value="quiz">Quizzes</SelectItem>
                  <SelectItem value="project">Proyectos</SelectItem>
                  <SelectItem value="participation">Participación</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              {students.length} estudiantes
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grade Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 bg-background z-10 min-w-[200px]">
                    Estudiante
                  </TableHead>
                  {filteredColumns.map((col) => (
                    <TableHead key={col.id} className="text-center min-w-[100px]">
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-medium">{col.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${getCategoryColor(col.category)}`}>
                          {getCategoryLabel(col.category)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          /{col.maxScore}
                        </span>
                        {!col.examId && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => deleteColumn(col.id)}
                          >
                            <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                          </Button>
                        )}
                      </div>
                    </TableHead>
                  ))}
                  <TableHead className="text-center min-w-[80px]">Promedio</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={filteredColumns.length + 2} className="text-center py-8 text-muted-foreground">
                      No hay estudiantes inscritos en este curso
                    </TableCell>
                  </TableRow>
                ) : (
                  students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="sticky left-0 bg-background z-10 font-medium">
                        {student.name}
                      </TableCell>
                      {filteredColumns.map((col) => {
                        const key = `${student.id}-${col.id}`;
                        const value = editedGrades.get(key);
                        const isEdited = value !== grades.get(key);
                        
                        return (
                          <TableCell key={col.id} className="text-center p-1">
                            <Input
                              type="number"
                              min="0"
                              max={col.maxScore}
                              step="0.1"
                              value={value ?? ""}
                              onChange={(e) => handleGradeChange(student.id, col.id, e.target.value)}
                              className={`w-16 mx-auto text-center ${isEdited ? "border-yellow-500 bg-yellow-50" : ""}`}
                            />
                          </TableCell>
                        );
                      })}
                      <TableCell className="text-center font-semibold">
                        {calculateAverage(student.id)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      {students.length > 0 && filteredColumns.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Columnas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{filteredColumns.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Notas registradas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {Array.from(editedGrades.values()).filter(v => v !== null).length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Notas pendientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-yellow-600">
                {students.length * filteredColumns.length - Array.from(editedGrades.values()).filter(v => v !== null).length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Promedio general
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">
                {(() => {
                  let total = 0;
                  let maxTotal = 0;
                  editedGrades.forEach((score, key) => {
                    if (score !== null) {
                      const [, columnId] = key.split("-");
                      const col = filteredColumns.find(c => c.id === columnId);
                      if (col) {
                        total += score;
                        maxTotal += col.maxScore;
                      }
                    }
                  });
                  return maxTotal > 0 ? `${((total / maxTotal) * 100).toFixed(1)}%` : "-";
                })()}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
