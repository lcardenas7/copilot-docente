"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SUBJECTS, GRADES, DIFFICULTIES, QUESTION_TYPES } from "@/lib/constants";
import { Loader2, Sparkles, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function NewExamPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedExam, setGeneratedExam] = useState<any>(null);
  const [formData, setFormData] = useState({
    subject: "",
    grade: "",
    topic: "",
    questionCount: "10",
    difficulty: "MEDIUM",
    questionTypes: ["MULTIPLE_CHOICE"],
  });

  const handleGenerate = async () => {
    if (!formData.subject || !formData.grade || !formData.topic) {
      alert("Por favor completa los campos obligatorios");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/ai/generate-exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        setGeneratedExam(data.data);
      } else {
        alert(data.error || "Error al generar el examen");
      }
    } catch (error) {
      alert("Error de conexión");
    } finally {
      setIsGenerating(false);
    }
  };

  if (generatedExam) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setGeneratedExam(null)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{generatedExam.title}</h1>
            <p className="text-muted-foreground">
              {generatedExam.questions?.length} preguntas • {generatedExam.estimatedTime} min
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Instrucciones</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{generatedExam.instructions}</p>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {generatedExam.questions?.map((q: any, i: number) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    {q.number}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs bg-muted px-2 py-1 rounded">{q.type}</span>
                      <span className="text-xs text-muted-foreground">{q.points} pts</span>
                    </div>
                    <p className="font-medium mb-3">{q.question}</p>
                    
                    {q.options && (
                      <div className="space-y-2 mb-3">
                        {q.options.map((opt: any) => (
                          <div
                            key={opt.letter}
                            className={`flex items-center gap-2 p-2 rounded ${
                              opt.letter === q.correctAnswer
                                ? "bg-green-100 dark:bg-green-900/20"
                                : "bg-muted/50"
                            }`}
                          >
                            <span className="font-medium">{opt.letter}.</span>
                            <span>{opt.text}</span>
                            {opt.letter === q.correctAnswer && (
                              <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {q.explanation && (
                      <p className="text-sm text-muted-foreground border-l-2 pl-3">
                        <strong>Explicación:</strong> {q.explanation}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex gap-3">
          <Button>Guardar examen</Button>
          <Button variant="outline">Exportar PDF</Button>
          <Button variant="ghost" onClick={() => setGeneratedExam(null)}>
            Generar otro
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/exams">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Nuevo Examen</h1>
          <p className="text-muted-foreground">
            Genera preguntas automáticamente con IA
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
            Define el tema y la IA creará las preguntas con respuestas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="topic">
              Tema del examen <span className="text-red-500">*</span>
            </Label>
            <Input
              id="topic"
              placeholder="Ej: Fracciones, La célula, Revolución francesa..."
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Materia <span className="text-red-500">*</span></Label>
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
              <Label>Grado <span className="text-red-500">*</span></Label>
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

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Cantidad de preguntas</Label>
              <Select
                value={formData.questionCount}
                onValueChange={(value) => setFormData({ ...formData, questionCount: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 preguntas</SelectItem>
                  <SelectItem value="10">10 preguntas</SelectItem>
                  <SelectItem value="15">15 preguntas</SelectItem>
                  <SelectItem value="20">20 preguntas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Dificultad</Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTIES.map((diff) => (
                    <SelectItem key={diff.value} value={diff.value}>
                      {diff.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generando preguntas...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Generar Examen con IA
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
