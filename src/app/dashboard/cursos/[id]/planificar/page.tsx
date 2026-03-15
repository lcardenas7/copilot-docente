"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Sparkles,
  Loader2,
  CheckCircle2,
  BookOpen,
  Clock,
  Edit,
  Plus,
  Trash2,
  Save,
  Wand2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface PlanUnit {
  name: string;
  description?: string;
  weeks: number;
  topics: PlanTopic[];
  evaluation?: string;
}

interface PlanTopic {
  name: string;
  hours: number;
  description?: string;
}

interface GeneratedPlan {
  period: string;
  weeks: number;
  hoursPerWeek: number;
  totalHours: number;
  units: PlanUnit[];
  standards?: string[];
}

interface Classroom {
  id: string;
  name: string;
  subject: string;
  grade: string;
}

export default function PlanificarPage() {
  const params = useParams();
  const router = useRouter();
  const classroomId = params.id as string;

  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    periodName: "Período 1",
    weeks: 10,
    hoursPerWeek: 4,
    country: "Colombia",
    topics: "",
    additionalContext: "",
  });

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
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!classroom) return;

    setGenerating(true);
    try {
      const response = await fetch("/api/ai/plan-period", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classroomId,
          subject: classroom.subject,
          grade: classroom.grade,
          periodName: formData.periodName,
          weeks: formData.weeks,
          hoursPerWeek: formData.hoursPerWeek,
          country: formData.country,
          suggestedTopics: formData.topics,
          additionalContext: formData.additionalContext,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setGeneratedPlan(result.data);
        toast.success("Plan generado exitosamente");
      } else {
        toast.error(result.error || "Error al generar el plan");
      }
    } catch (error) {
      console.error("Error generating plan:", error);
      toast.error("Error al generar el plan");
    } finally {
      setGenerating(false);
    }
  };

  const handleSavePlan = async () => {
    if (!generatedPlan) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/classrooms/${classroomId}/apply-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: generatedPlan,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Plan aplicado al curso");
        router.push(`/dashboard/cursos/${classroomId}`);
      } else {
        toast.error(result.error || "Error al aplicar el plan");
      }
    } catch (error) {
      console.error("Error saving plan:", error);
      toast.error("Error al aplicar el plan");
    } finally {
      setSaving(false);
    }
  };

  const updateUnit = (index: number, field: string, value: any) => {
    if (!generatedPlan) return;
    const newUnits = [...generatedPlan.units];
    newUnits[index] = { ...newUnits[index], [field]: value };
    setGeneratedPlan({ ...generatedPlan, units: newUnits });
  };

  const updateTopic = (unitIndex: number, topicIndex: number, field: string, value: any) => {
    if (!generatedPlan) return;
    const newUnits = [...generatedPlan.units];
    const newTopics = [...newUnits[unitIndex].topics];
    newTopics[topicIndex] = { ...newTopics[topicIndex], [field]: value };
    newUnits[unitIndex] = { ...newUnits[unitIndex], topics: newTopics };
    setGeneratedPlan({ ...generatedPlan, units: newUnits });
  };

  const addTopic = (unitIndex: number) => {
    if (!generatedPlan) return;
    const newUnits = [...generatedPlan.units];
    newUnits[unitIndex].topics.push({ name: "Nuevo tema", hours: 2 });
    setGeneratedPlan({ ...generatedPlan, units: newUnits });
  };

  const removeTopic = (unitIndex: number, topicIndex: number) => {
    if (!generatedPlan) return;
    const newUnits = [...generatedPlan.units];
    newUnits[unitIndex].topics.splice(topicIndex, 1);
    setGeneratedPlan({ ...generatedPlan, units: newUnits });
  };

  const addUnit = () => {
    if (!generatedPlan) return;
    const newUnits = [...generatedPlan.units];
    newUnits.push({
      name: `Unidad ${newUnits.length + 1}`,
      weeks: 2,
      topics: [{ name: "Nuevo tema", hours: 2 }],
    });
    setGeneratedPlan({ ...generatedPlan, units: newUnits });
  };

  const removeUnit = (index: number) => {
    if (!generatedPlan) return;
    const newUnits = [...generatedPlan.units];
    newUnits.splice(index, 1);
    setGeneratedPlan({ ...generatedPlan, units: newUnits });
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
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/cursos/${classroomId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wand2 className="h-6 w-6 text-purple-500" />
            Planificación con IA
          </h1>
          <p className="text-muted-foreground">
            {classroom.name} · {classroom.subject} · {classroom.grade}
          </p>
        </div>
      </div>

      {!generatedPlan ? (
        /* Form to generate plan */
        <Card>
          <CardHeader>
            <CardTitle>Configurar Planificación</CardTitle>
            <CardDescription>
              La IA generará un plan completo de unidades y temas basado en el currículo colombiano
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="periodName">Nombre del período</Label>
                <Input
                  id="periodName"
                  value={formData.periodName}
                  onChange={(e) => setFormData({ ...formData, periodName: e.target.value })}
                  placeholder="Ej: Período 1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">País/Currículo</Label>
                <Select
                  value={formData.country}
                  onValueChange={(value) => setFormData({ ...formData, country: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Colombia">Colombia (DBA/MEN)</SelectItem>
                    <SelectItem value="México">México (SEP)</SelectItem>
                    <SelectItem value="Argentina">Argentina</SelectItem>
                    <SelectItem value="Chile">Chile</SelectItem>
                    <SelectItem value="Perú">Perú</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weeks">Duración (semanas)</Label>
                <Input
                  id="weeks"
                  type="number"
                  min={4}
                  max={20}
                  value={formData.weeks}
                  onChange={(e) => setFormData({ ...formData, weeks: parseInt(e.target.value) || 10 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hoursPerWeek">Horas por semana</Label>
                <Input
                  id="hoursPerWeek"
                  type="number"
                  min={1}
                  max={10}
                  value={formData.hoursPerWeek}
                  onChange={(e) => setFormData({ ...formData, hoursPerWeek: parseInt(e.target.value) || 4 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="topics">Temas que quieres cubrir (opcional)</Label>
              <Textarea
                id="topics"
                placeholder="Ej: fracciones, decimales, porcentajes, proporciones..."
                value={formData.topics}
                onChange={(e) => setFormData({ ...formData, topics: e.target.value })}
                rows={2}
              />
              <p className="text-xs text-muted-foreground">
                Si no especificas, la IA seleccionará temas según el currículo oficial
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="context">Contexto adicional (opcional)</Label>
              <Textarea
                id="context"
                placeholder="Ej: El grupo tiene dificultades con operaciones básicas, preferimos actividades prácticas..."
                value={formData.additionalContext}
                onChange={(e) => setFormData({ ...formData, additionalContext: e.target.value })}
                rows={2}
              />
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-medium mb-2">Resumen</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Materia:</span>
                  <p className="font-medium">{classroom.subject}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Grado:</span>
                  <p className="font-medium">{classroom.grade}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Duración:</span>
                  <p className="font-medium">{formData.weeks} semanas</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Total horas:</span>
                  <p className="font-medium">{formData.weeks * formData.hoursPerWeek}h</p>
                </div>
              </div>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={handleGenerate}
              disabled={generating}
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generando plan...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generar Plan con IA
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Generated plan - editable */
        <div className="space-y-6">
          {/* Plan header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    Plan Generado
                  </CardTitle>
                  <CardDescription>
                    {generatedPlan.period} · {generatedPlan.weeks} semanas · {generatedPlan.totalHours} horas totales
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setGeneratedPlan(null)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Regenerar
                  </Button>
                  <Button onClick={handleSavePlan} disabled={saving}>
                    {saving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Aplicar al Curso
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Standards */}
          {generatedPlan.standards && generatedPlan.standards.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Estándares Curriculares (DBA)</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm">
                  {generatedPlan.standards.map((standard, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      {standard}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Units */}
          <div className="space-y-4">
            {generatedPlan.units.map((unit, unitIndex) => (
              <Card key={unitIndex}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{unitIndex + 1}</Badge>
                        <Input
                          value={unit.name}
                          onChange={(e) => updateUnit(unitIndex, "name", e.target.value)}
                          className="font-semibold text-base h-8"
                        />
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {unit.weeks} semanas
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          {unit.topics.length} temas
                        </span>
                        <span>
                          {unit.topics.reduce((acc, t) => acc + t.hours, 0)} horas
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => removeUnit(unitIndex)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {unit.topics.map((topic, topicIndex) => (
                      <div
                        key={topicIndex}
                        className="flex items-center gap-2 p-2 rounded-lg bg-muted/50"
                      >
                        <span className="text-sm text-muted-foreground w-8">
                          {unitIndex + 1}.{topicIndex + 1}
                        </span>
                        <Input
                          value={topic.name}
                          onChange={(e) => updateTopic(unitIndex, topicIndex, "name", e.target.value)}
                          className="flex-1 h-8"
                        />
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            min={1}
                            max={10}
                            value={topic.hours}
                            onChange={(e) => updateTopic(unitIndex, topicIndex, "hours", parseInt(e.target.value) || 2)}
                            className="w-16 h-8 text-center"
                          />
                          <span className="text-sm text-muted-foreground">h</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => removeTopic(unitIndex, topicIndex)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2"
                      onClick={() => addTopic(unitIndex)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Agregar tema
                    </Button>
                  </div>
                  {unit.evaluation && (
                    <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                      <p className="text-sm">
                        <strong>Evaluación:</strong> {unit.evaluation}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            <Button variant="outline" className="w-full" onClick={addUnit}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Unidad
            </Button>
          </div>

          {/* Summary */}
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">{generatedPlan.units.length}</p>
                  <p className="text-sm text-muted-foreground">Unidades</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {generatedPlan.units.reduce((acc, u) => acc + u.topics.length, 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Temas</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{generatedPlan.weeks}</p>
                  <p className="text-sm text-muted-foreground">Semanas</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {generatedPlan.units.reduce(
                      (acc, u) => acc + u.topics.reduce((t, topic) => t + topic.hours, 0),
                      0
                    )}h
                  </p>
                  <p className="text-sm text-muted-foreground">Horas totales</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => setGeneratedPlan(null)}>
              Cancelar
            </Button>
            <Button size="lg" onClick={handleSavePlan} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Aplicando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Aplicar Plan al Curso
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
