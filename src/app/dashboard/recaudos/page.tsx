"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Users,
  FileText,
  Download,
} from "lucide-react";

interface Recaudo {
  id: string;
  title: string;
  description?: string;
  fields: Field[];
  deadline: string;
  status: "active" | "closed" | "draft";
  classroom: {
    id: string;
    name: string;
    subject: string;
  };
  _count: {
    responses: number;
  };
}

interface Field {
  id: string;
  name: string;
  type: "text" | "textarea" | "select" | "checkbox" | "radio" | "file" | "number" | "date";
  required: boolean;
  options?: string[];
  placeholder?: string;
}

interface Classroom {
  id: string;
  name: string;
  subject: string;
}

export default function RecaudosPage() {
  const [loading, setLoading] = useState(true);
  const [recaudos, setRecaudos] = useState<Recaudo[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingRecaudo, setEditingRecaudo] = useState<Recaudo | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    classroomId: "",
    deadline: "",
    status: "active" as "active" | "closed" | "draft",
  });
  const [fields, setFields] = useState<Field[]>([
    { id: "1", name: "", type: "text", required: false, placeholder: "" },
  ]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [recaudosRes, classroomsRes] = await Promise.all([
        fetch("/api/recaudos"),
        fetch("/api/classrooms"),
      ]);

      if (!recaudosRes.ok || !classroomsRes.ok) throw new Error("Error");

      const [recaudosData, classroomsData] = await Promise.all([
        recaudosRes.json(),
        classroomsRes.json(),
      ]);

      setRecaudos(Array.isArray(recaudosData) ? recaudosData : []);
      setClassrooms(classroomsData?.classrooms || classroomsData || []);
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  const addField = () => {
    const newField: Field = {
      id: Date.now().toString(),
      name: "",
      type: "text",
      required: false,
      placeholder: "",
    };
    setFields([...fields, newField]);
  };

  const updateField = (index: number, field: Partial<Field>) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], ...field };
    setFields(updated);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.classroomId || !formData.deadline) {
      toast.error("Complete los campos requeridos");
      return;
    }

    const validFields = fields.filter(f => f.name.trim());
    if (validFields.length === 0) {
      toast.error("Agregue al menos un campo");
      return;
    }

    try {
      const url = editingRecaudo 
        ? `/api/recaudos/${editingRecaudo.id}`
        : "/api/recaudos";
      const method = editingRecaudo ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          fields: validFields,
        }),
      });

      if (!response.ok) throw new Error("Error");

      toast.success(editingRecaudo ? "Recaudo actualizado" : "Recaudo creado");
      setShowDialog(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      classroomId: "",
      deadline: "",
      status: "active" as "active" | "closed" | "draft",
    });
    setFields([{ id: "1", name: "", type: "text", required: false, placeholder: "" }]);
    setEditingRecaudo(null);
  };

  const handleEdit = (recaudo: Recaudo) => {
    setEditingRecaudo(recaudo);
    setFormData({
      title: recaudo.title,
      description: recaudo.description || "",
      classroomId: recaudo.classroom.id,
      deadline: recaudo.deadline.split("T")[0],
      status: recaudo.status as "active" | "closed" | "draft",
    });
    setFields(recaudo.fields);
    setShowDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este recaudo y todas sus respuestas?")) return;

    try {
      const response = await fetch(`/api/recaudos/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Error");

      toast.success("Recaudo eliminado");
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Error al eliminar");
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive"; label: string }> = {
      active: { variant: "default", label: "Activo" },
      closed: { variant: "secondary", label: "Cerrado" },
      draft: { variant: "destructive", label: "Borrador" },
    };
    const config = variants[status] || variants.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getFieldTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      text: "Texto corto",
      textarea: "Texto largo",
      select: "Selección",
      checkbox: "Casilla",
      radio: "Opción única",
      file: "Archivo",
      number: "Número",
      date: "Fecha",
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="grid gap-4">
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[200px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Recaudos</h1>
          <p className="text-muted-foreground">
            Formularios para recolectar información de estudiantes
          </p>
        </div>
        
        <Dialog open={showDialog} onOpenChange={(open) => {
          setShowDialog(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo recaudo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingRecaudo ? "Editar recaudo" : "Crear nuevo recaudo"}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Título *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ej: Autorización de salida"
                  />
                </div>
                <div>
                  <Label>Curso *</Label>
                  <Select
                    value={formData.classroomId}
                    onValueChange={(v) => setFormData({ ...formData, classroomId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar curso" />
                    </SelectTrigger>
                    <SelectContent>
                      {classrooms.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name} - {c.subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Descripción</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Instrucciones para los estudiantes..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Fecha límite *</Label>
                  <Input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Estado</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(v: "active" | "closed" | "draft") => 
                      setFormData({ ...formData, status: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Activo</SelectItem>
                      <SelectItem value="draft">Borrador</SelectItem>
                      <SelectItem value="closed">Cerrado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Fields */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Campos del formulario</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addField}>
                    <Plus className="h-4 w-4 mr-1" />
                    Agregar campo
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <Card key={field.id} className="p-3">
                      <div className="grid grid-cols-12 gap-2 items-start">
                        <div className="col-span-4">
                          <Input
                            placeholder="Nombre del campo"
                            value={field.name}
                            onChange={(e) => updateField(index, { name: e.target.value })}
                          />
                        </div>
                        <div className="col-span-3">
                          <Select
                            value={field.type}
                            onValueChange={(v: Field["type"]) => updateField(index, { type: v })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Texto corto</SelectItem>
                              <SelectItem value="textarea">Texto largo</SelectItem>
                              <SelectItem value="number">Número</SelectItem>
                              <SelectItem value="date">Fecha</SelectItem>
                              <SelectItem value="select">Selección</SelectItem>
                              <SelectItem value="radio">Opción única</SelectItem>
                              <SelectItem value="checkbox">Casilla</SelectItem>
                              <SelectItem value="file">Archivo</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-3">
                          <Input
                            placeholder="Placeholder (opcional)"
                            value={field.placeholder || ""}
                            onChange={(e) => updateField(index, { placeholder: e.target.value })}
                          />
                        </div>
                        <div className="col-span-2 flex items-center gap-2">
                          <label className="flex items-center gap-1 text-sm">
                            <input
                              type="checkbox"
                              checked={field.required}
                              onChange={(e) => updateField(index, { required: e.target.checked })}
                            />
                            Requerido
                          </label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeField(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Options for select/radio */}
                      {(field.type === "select" || field.type === "radio") && (
                        <div className="mt-2">
                          <Input
                            placeholder="Opciones separadas por coma"
                            value={field.options?.join(", ") || ""}
                            onChange={(e) => updateField(index, { 
                              options: e.target.value.split(",").map(o => o.trim()).filter(Boolean)
                            })}
                          />
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingRecaudo ? "Actualizar" : "Crear"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Recaudos List */}
      <div className="grid gap-4">
        {recaudos.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay recaudos</h3>
              <p className="text-muted-foreground mb-4">
                Crea tu primer formulario para recolectar información de los estudiantes
              </p>
              <Button onClick={() => setShowDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Crear recaudo
              </Button>
            </CardContent>
          </Card>
        ) : (
          recaudos.map((recaudo) => (
            <Card key={recaudo.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{recaudo.title}</h3>
                    <p className="text-muted-foreground text-sm">
                      {recaudo.classroom.name} - {recaudo.classroom.subject}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(recaudo.status)}
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(recaudo)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(recaudo.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {recaudo.description && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {recaudo.description}
                  </p>
                )}
                
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Límite: {new Date(recaudo.deadline).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{recaudo._count.responses} respuestas</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>{recaudo.fields.length} campos</span>
                  </div>
                </div>

                {/* Field types preview */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {recaudo.fields.slice(0, 5).map((field) => (
                    <Badge key={field.id} variant="outline" className="text-xs">
                      {getFieldTypeLabel(field.type)}
                    </Badge>
                  ))}
                  {recaudo.fields.length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{recaudo.fields.length - 5} más
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
