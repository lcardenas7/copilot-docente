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
import { SUBJECTS, GRADES, METHODOLOGIES, BLOOM_LEVELS, DURATIONS } from "@/lib/constants";
import { Loader2, Sparkles, BookOpen, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewGuidePage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedGuide, setGeneratedGuide] = useState<any>(null);
  const [formData, setFormData] = useState({
    subject: "",
    grade: "",
    topic: "",
    duration: "60",
    methodology: "TRADITIONAL",
    bloomLevel: "UNDERSTAND",
  });

  const handleGenerate = async () => {
    if (!formData.subject || !formData.grade || !formData.topic) {
      alert("Por favor completa los campos obligatorios");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/ai/generate-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        setGeneratedGuide(data.data);
      } else {
        alert(data.error || "Error al generar la guía");
      }
    } catch (error) {
      alert("Error de conexión");
    } finally {
      setIsGenerating(false);
    }
  };

  if (generatedGuide) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setGeneratedGuide(null)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{generatedGuide.title}</h1>
            <p className="text-muted-foreground">Guía generada con IA</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Objectives */}
            <Card>
              <CardHeader>
                <CardTitle>Objetivos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Objetivo General</h4>
                  <p className="text-muted-foreground">{generatedGuide.objectives?.general}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Objetivos Específicos</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {generatedGuide.objectives?.specific?.map((obj: string, i: number) => (
                      <li key={i}>{obj}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Activities */}
            <Card>
              <CardHeader>
                <CardTitle>Actividades</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {generatedGuide.activities?.map((activity: any, i: number) => (
                  <div key={i} className="border-l-4 border-primary pl-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">{activity.phase}</span>
                      <span className="text-sm text-muted-foreground">
                        ({activity.duration} min)
                      </span>
                    </div>
                    <p className="text-muted-foreground mb-2">{activity.description}</p>
                    {activity.teacherActions && (
                      <div className="text-sm">
                        <span className="font-medium">Docente: </span>
                        {activity.teacherActions.join(", ")}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Evaluation */}
            {generatedGuide.evaluation && (
              <Card>
                <CardHeader>
                  <CardTitle>Evaluación</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Criterios</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      {generatedGuide.evaluation.criteria?.map((c: string, i: number) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Indicadores de Logro</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      {generatedGuide.evaluation.indicators?.map((ind: string, i: number) => (
                        <li key={i}>{ind}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Acciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full">Guardar guía</Button>
                <Button variant="outline" className="w-full">
                  Exportar PDF
                </Button>
                <Button variant="outline" className="w-full">
                  Exportar Word
                </Button>
                <Button variant="ghost" className="w-full" onClick={() => setGeneratedGuide(null)}>
                  Generar otra
                </Button>
              </CardContent>
            </Card>

            {/* Materials */}
            {generatedGuide.materials && (
              <Card>
                <CardHeader>
                  <CardTitle>Materiales</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {generatedGuide.materials.map((m: string, i: number) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Competencies */}
            {generatedGuide.competencies && (
              <Card>
                <CardHeader>
                  <CardTitle>Competencias</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {generatedGuide.competencies.map((c: string, i: number) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/guides">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Nueva Guía de Clase</h1>
          <p className="text-muted-foreground">
            Completa los datos y la IA generará tu planeación
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            Generar con IA
          </CardTitle>
          <CardDescription>
            Describe tu clase y la IA creará una planeación completa
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Topic */}
          <div className="space-y-2">
            <Label htmlFor="topic">
              Tema de la clase <span className="text-red-500">*</span>
            </Label>
            <Input
              id="topic"
              placeholder="Ej: Fracciones equivalentes, La célula, El texto narrativo..."
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
            />
          </div>

          {/* Subject & Grade */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>
                Materia <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.subject}
                onValueChange={(value) => setFormData({ ...formData, subject: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona materia" />
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

            <div className="space-y-2">
              <Label>
                Grado <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.grade}
                onValueChange={(value) => setFormData({ ...formData, grade: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona grado" />
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
          </div>

          {/* Duration & Methodology */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Duración</Label>
              <Select
                value={formData.duration}
                onValueChange={(value) => setFormData({ ...formData, duration: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DURATIONS.map((duration) => (
                    <SelectItem key={duration.value} value={duration.value.toString()}>
                      {duration.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Metodología</Label>
              <Select
                value={formData.methodology}
                onValueChange={(value) => setFormData({ ...formData, methodology: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {METHODOLOGIES.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bloom Level */}
          <div className="space-y-2">
            <Label>Nivel de Bloom</Label>
            <Select
              value={formData.bloomLevel}
              onValueChange={(value) => setFormData({ ...formData, bloomLevel: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BLOOM_LEVELS.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label} - {level.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Generate Button */}
          <Button
            className="w-full"
            size="lg"
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generando con IA...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Generar Guía con IA
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
