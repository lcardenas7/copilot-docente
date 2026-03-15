"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { SUBJECTS, GRADES } from "@/lib/constants";
import { ArrowLeft, Palette, Users, Calendar, BookOpen } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const COLORS = [
  { name: "Azul", value: "#3B82F6" },
  { name: "Verde", value: "#10B981" },
  { name: "Morado", value: "#8B5CF6" },
  { name: "Naranja", value: "#F97316" },
  { name: "Rojo", value: "#EF4444" },
  { name: "Teal", value: "#14B8A6" },
  { name: "Rosa", value: "#EC4899" },
  { name: "Indigo", value: "#6366F1" },
];

const SHIFTS = [
  { value: "mañana", label: "Mañana" },
  { value: "tarde", label: "Tarde" },
  { value: "noche", label: "Noche" },
  { value: "sabatina", label: "Sabatina" },
  { value: "dominical", label: "Dominical" },
];

export default function NuevoCursoPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    grade: "",
    shift: "",
    academicYear: new Date().getFullYear().toString(),
    description: "",
    color: "#3B82F6",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/classrooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Curso creado exitosamente");
        router.push(`/dashboard/cursos/${result.classroom.id}`);
      } else {
        toast.error(result.error || "Error al crear el curso");
      }
    } catch (error) {
      console.error("Error creating classroom:", error);
      toast.error("Error al crear el curso");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/cursos">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Crear Nuevo Curso</h1>
          <p className="text-muted-foreground">
            Configura un nuevo curso para gestionar tus clases
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información Básica */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Información Básica
            </CardTitle>
            <CardDescription>
              Datos principales del curso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Curso *</Label>
                <Input
                  id="name"
                  placeholder="Ej: Matemáticas 8A"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Materia *</Label>
                <Select
                  value={formData.subject}
                  onValueChange={(value) => handleInputChange("subject", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona la materia" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBJECTS.map((subject) => (
                      <SelectItem key={subject.value} value={subject.value}>
                        {subject.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="grade">Grado *</Label>
                <Select
                  value={formData.grade}
                  onValueChange={(value) => handleInputChange("grade", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el grado" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADES.map((grade) => (
                      <SelectItem key={grade.value} value={grade.value}>
                        {grade.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="shift">Jornada</Label>
                <Select
                  value={formData.shift}
                  onValueChange={(value) => handleInputChange("shift", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona la jornada" />
                  </SelectTrigger>
                  <SelectContent>
                    {SHIFTS.map((shift) => (
                      <SelectItem key={shift.value} value={shift.value}>
                        {shift.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Textarea
                id="description"
                placeholder="Describe el curso, objetivos, metodología..."
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Configuración Adicional */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Configuración Adicional
            </CardTitle>
            <CardDescription>
              Personaliza la apariencia y configuración del curso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="academicYear">Año Lectivo</Label>
                <Input
                  id="academicYear"
                  type="number"
                  placeholder="2024"
                  value={formData.academicYear}
                  onChange={(e) => handleInputChange("academicYear", e.target.value)}
                  min="2020"
                  max="2030"
                />
              </div>
              <div className="space-y-2">
                <Label>Color del Curso</Label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        formData.color === color.value
                          ? "border-gray-900 scale-110"
                          : "border-gray-300"
                      }`}
                      style={{ backgroundColor: color.value }}
                      onClick={() => handleInputChange("color", color.value)}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="border rounded-lg p-4 bg-muted/50">
              <p className="text-sm font-medium mb-2">Vista Previa:</p>
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: formData.color }}
                />
                <span className="font-medium">
                  {formData.name || "Nombre del Curso"}
                </span>
                <span className="text-muted-foreground">
                  {formData.subject && formData.grade
                    ? `${formData.subject} - ${formData.grade}`
                    : "Materia - Grado"}
                </span>
                {formData.shift && (
                  <span className="text-sm text-muted-foreground">
                    ({formData.shift})
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Link href="/dashboard/cursos">
            <Button variant="outline" type="button">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creando..." : "Crear Curso"}
          </Button>
        </div>
      </form>
    </div>
  );
}
