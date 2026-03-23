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
import { SUBJECTS, GRADES, DIFFICULTIES, QUESTION_TYPES } from "@/lib/constants";
import { 
  Loader2, Sparkles, ArrowLeft, CheckCircle, XCircle, Clock, Target,
  FileText, ChevronDown, ChevronUp, Eye, EyeOff, Send, GraduationCap,
  CircleDot, CheckSquare, ToggleLeft, TextCursor, GitMerge, ListOrdered,
  MessageSquare, AlertCircle
} from "lucide-react";
import Link from "next/link";
import SmartVisual from "@/components/visuals/SmartVisual";

const QUESTION_TYPE_ICONS: Record<string, any> = {
  MULTIPLE_CHOICE: CircleDot,
  MULTIPLE_ANSWER: CheckSquare,
  TRUE_FALSE: ToggleLeft,
  FILL_BLANK: TextCursor,
  MATCHING: GitMerge,
  ORDERING: ListOrdered,
  SHORT_ANSWER: MessageSquare,
  OPEN: FileText,
};

const QUESTION_TYPE_COLORS: Record<string, string> = {
  MULTIPLE_CHOICE: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  MULTIPLE_ANSWER: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
  TRUE_FALSE: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  FILL_BLANK: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  MATCHING: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  ORDERING: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
  SHORT_ANSWER: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
  OPEN: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300",
};

const QUESTION_TYPE_LABELS: Record<string, string> = {
  MULTIPLE_CHOICE: "Selección múltiple",
  MULTIPLE_ANSWER: "Respuesta múltiple",
  TRUE_FALSE: "Verdadero/Falso",
  FILL_BLANK: "Completar",
  MATCHING: "Relacionar",
  ORDERING: "Ordenar",
  SHORT_ANSWER: "Respuesta corta",
  OPEN: "Desarrollo",
};

export default function NewExamPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedExam, setGeneratedExam] = useState<any>(null);
  const [showAnswers, setShowAnswers] = useState(true);
  const [exam, setExam] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [includeVisuals, setIncludeVisuals] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    grade: "",
    topic: "",
    questionCount: "10",
    difficulty: "MEDIUM",
    questionTypes: ["MULTIPLE_CHOICE", "TRUE_FALSE"],
    additionalInstructions: "",
  });

  const toggleQuestionType = (type: string) => {
    const current = formData.questionTypes;
    if (current.includes(type)) {
      if (current.length > 1) {
        setFormData({ ...formData, questionTypes: current.filter(t => t !== type) });
      }
    } else {
      setFormData({ ...formData, questionTypes: [...current, type] });
    }
  };

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
        body: JSON.stringify({
          ...formData,
          includeVisuals,
        }),
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

  // Render different question types
  const renderQuestion = (q: any, i: number) => {
    const TypeIcon = QUESTION_TYPE_ICONS[q.type] || CircleDot;
    const typeColor = QUESTION_TYPE_COLORS[q.type] || QUESTION_TYPE_COLORS.MULTIPLE_CHOICE;
    const typeLabel = QUESTION_TYPE_LABELS[q.type] || q.type;

    return (
      <Card key={i} className="overflow-hidden">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
              {q.number}
            </div>
            <div className="flex-1 min-w-0">
              {/* Question Header */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${typeColor}`}>
                  <TypeIcon className="h-3 w-3" />
                  {typeLabel}
                </span>
                <span className="text-xs bg-muted px-2 py-1 rounded">{q.points} pts</span>
              </div>

              {/* Visual (si existe y está habilitado) */}
              {q.visual && includeVisuals && (
                <div className="mb-4">
                  <SmartVisual visual={q.visual} />
                </div>
              )}

              {/* Question Text */}
              <p className="font-medium mb-4 text-base">{q.question}</p>

              {/* MULTIPLE_CHOICE */}
              {q.type === "MULTIPLE_CHOICE" && q.options && (
                <div className="space-y-2 mb-4">
                  {q.options.map((opt: any) => (
                    <div
                      key={opt.letter}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                        showAnswers && opt.letter === q.correctAnswer
                          ? "bg-green-50 border-green-300 dark:bg-green-900/20 dark:border-green-700"
                          : "bg-muted/30 border-transparent"
                      }`}
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted font-medium text-sm">
                        {opt.letter}
                      </span>
                      <span className="flex-1">{opt.text}</span>
                      {showAnswers && opt.letter === q.correctAnswer && (
                        <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* MULTIPLE_ANSWER */}
              {q.type === "MULTIPLE_ANSWER" && q.options && (
                <div className="space-y-2 mb-4">
                  {q.options.map((opt: any) => (
                    <div
                      key={opt.letter}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                        showAnswers && opt.isCorrect
                          ? "bg-green-50 border-green-300 dark:bg-green-900/20 dark:border-green-700"
                          : "bg-muted/30 border-transparent"
                      }`}
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted font-medium text-sm">
                        {opt.letter}
                      </span>
                      <span className="flex-1">{opt.text}</span>
                      {showAnswers && opt.isCorrect && (
                        <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* TRUE_FALSE */}
              {q.type === "TRUE_FALSE" && (
                <div className="flex gap-3 mb-4">
                  <div className={`flex-1 p-3 rounded-lg border text-center ${
                    showAnswers && q.correctAnswer === true
                      ? "bg-green-50 border-green-300 dark:bg-green-900/20"
                      : "bg-muted/30 border-transparent"
                  }`}>
                    <span className="font-medium">Verdadero</span>
                    {showAnswers && q.correctAnswer === true && (
                      <CheckCircle className="h-4 w-4 text-green-600 inline ml-2" />
                    )}
                  </div>
                  <div className={`flex-1 p-3 rounded-lg border text-center ${
                    showAnswers && q.correctAnswer === false
                      ? "bg-green-50 border-green-300 dark:bg-green-900/20"
                      : "bg-muted/30 border-transparent"
                  }`}>
                    <span className="font-medium">Falso</span>
                    {showAnswers && q.correctAnswer === false && (
                      <CheckCircle className="h-4 w-4 text-green-600 inline ml-2" />
                    )}
                  </div>
                </div>
              )}

              {/* FILL_BLANK */}
              {q.type === "FILL_BLANK" && showAnswers && q.blanks && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 mb-4">
                  <p className="text-sm font-medium text-green-800 dark:text-green-300 mb-1">Respuestas:</p>
                  <div className="flex flex-wrap gap-2">
                    {q.blanks.map((blank: string, j: number) => (
                      <span key={j} className="bg-green-200 dark:bg-green-800 px-2 py-1 rounded text-sm">
                        {j + 1}. {blank}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* MATCHING */}
              {q.type === "MATCHING" && (
                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Columna A</p>
                    <div className="space-y-2">
                      {q.columnA?.map((item: string, j: number) => (
                        <div key={j} className="bg-muted/50 p-2 rounded text-sm flex items-center gap-2">
                          <span className="font-bold">{j + 1}.</span> {item}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Columna B</p>
                    <div className="space-y-2">
                      {q.columnB?.map((item: string, j: number) => (
                        <div key={j} className="bg-muted/50 p-2 rounded text-sm flex items-center gap-2">
                          <span className="font-bold">{String.fromCharCode(65 + j)}.</span> {item}
                        </div>
                      ))}
                    </div>
                  </div>
                  {showAnswers && q.correctMatches && (
                    <div className="sm:col-span-2 bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                      <p className="text-sm font-medium text-green-800 dark:text-green-300 mb-1">Respuestas:</p>
                      <p className="text-sm">
                        {Object.entries(q.correctMatches).map(([a, b]: [string, any]) => (
                          <span key={a} className="mr-3">{parseInt(a) + 1} → {String.fromCharCode(65 + parseInt(b))}</span>
                        ))}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ORDERING */}
              {q.type === "ORDERING" && (
                <div className="mb-4">
                  <div className="space-y-2 mb-3">
                    {q.items?.map((item: string, j: number) => (
                      <div key={j} className="bg-muted/50 p-2 rounded text-sm flex items-center gap-2">
                        <span className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                          {j + 1}
                        </span>
                        {item}
                      </div>
                    ))}
                  </div>
                  {showAnswers && q.correctOrder && (
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                      <p className="text-sm font-medium text-green-800 dark:text-green-300 mb-1">Orden correcto:</p>
                      <p className="text-sm">{q.correctOrder.map((idx: number) => idx + 1).join(" → ")}</p>
                    </div>
                  )}
                </div>
              )}

              {/* SHORT_ANSWER */}
              {q.type === "SHORT_ANSWER" && showAnswers && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 mb-4">
                  <p className="text-sm font-medium text-green-800 dark:text-green-300 mb-1">Respuestas aceptables:</p>
                  {q.acceptableAnswers?.map((ans: string, j: number) => (
                    <p key={j} className="text-sm">• {ans}</p>
                  ))}
                  {q.keywords && (
                    <div className="mt-2">
                      <p className="text-xs text-green-700 dark:text-green-400">Palabras clave: {q.keywords.join(", ")}</p>
                    </div>
                  )}
                </div>
              )}

              {/* OPEN */}
              {q.type === "OPEN" && showAnswers && (
                <div className="space-y-3 mb-4">
                  {q.rubric && (
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-3">
                      <p className="text-sm font-medium text-indigo-800 dark:text-indigo-300 mb-2">Rúbrica de evaluación:</p>
                      <div className="space-y-1">
                        {q.rubric.map((r: any, j: number) => (
                          <div key={j} className="flex justify-between text-sm">
                            <span>{typeof r === "string" ? r : r.criterion}</span>
                            {typeof r !== "string" && <span className="font-medium">{r.points} pts</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {q.sampleAnswer && (
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                      <p className="text-sm font-medium text-green-800 dark:text-green-300 mb-1">Respuesta modelo:</p>
                      <p className="text-sm">{q.sampleAnswer}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Competency & Bloom Level */}
              {showAnswers && (q.competency || q.bloomLevel) && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {q.competency && (
                    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      <Target className="h-3 w-3" />
                      {q.competency}
                    </span>
                  )}
                  {q.bloomLevel && (
                    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                      <GraduationCap className="h-3 w-3" />
                      Bloom: {q.bloomLevel}
                    </span>
                  )}
                </div>
              )}

              {/* Explanation */}
              {showAnswers && q.explanation && (
                <div className="border-l-4 border-blue-300 pl-3 py-2 bg-blue-50/50 rounded-r">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Explicación:</strong> {q.explanation}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // ========================
  // RESULTADO DEL EXAMEN
  // ========================
  if (generatedExam) {
    return (
      <div className="space-y-6 pb-10">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <Button variant="ghost" size="icon" className="mt-1 shrink-0" onClick={() => setGeneratedExam(null)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{generatedExam.title}</h1>
              {generatedExam.subtitle && (
                <p className="text-muted-foreground">{generatedExam.subtitle}</p>
              )}
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  {generatedExam.questions?.length} preguntas
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {generatedExam.estimatedTime} min
                </span>
                <span className="flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  {generatedExam.totalPoints} pts
                </span>
                {generatedExam.passingScore && (
                  <span className="flex items-center gap-1">
                    <GraduationCap className="h-4 w-4" />
                    Aprueba: {generatedExam.passingScore}%
                  </span>
                )}
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAnswers(!showAnswers)}
            className="shrink-0"
          >
            {showAnswers ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showAnswers ? "Ocultar respuestas" : "Mostrar respuestas"}
          </Button>
        </div>

        {/* Instructions */}
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Instrucciones</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{generatedExam.instructions}</p>
          </CardContent>
        </Card>

        {/* Questions */}
        {!generatedExam || !generatedExam.questions || generatedExam.questions.length === 0 ? (
          <Card className="border-red-200 dark:border-red-800">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                  Error generando examen
                </h3>
                <p className="text-red-600 dark:text-red-400">
                  No se pudieron cargar las preguntas del examen.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {generatedExam.questions.map((q: any, i: number) => renderQuestion(q, i))}
          </div>
        )}

        {/* Grading Notes */}
        {generatedExam.gradingNotes && (
          <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2 text-amber-800 dark:text-amber-200">
                <AlertCircle className="h-5 w-5" />
                Notas para calificación
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-amber-900 dark:text-amber-100">{generatedExam.gradingNotes}</p>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-3">
              <Button className="flex-1 sm:flex-none">
                Guardar examen
              </Button>
              <Button variant="outline" className="flex-1 sm:flex-none">
                Exportar PDF
              </Button>
              <Button variant="outline" className="flex-1 sm:flex-none" disabled>
                <Send className="h-4 w-4 mr-2" />
                Publicar en Aula Virtual
                <span className="ml-2 text-xs bg-primary/20 px-1.5 py-0.5 rounded">Próximamente</span>
              </Button>
              <Button variant="ghost" onClick={() => setGeneratedExam(null)}>
                Generar otro
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ========================
  // FORMULARIO
  // ========================
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
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

      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="rounded-lg bg-gradient-to-br from-blue-500 to-sky-500 p-1.5">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            Generar con IA
          </CardTitle>
          <CardDescription>
            Configura el examen y la IA creará preguntas variadas con respuestas y explicaciones
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Topic */}
          <div className="space-y-2">
            <Label htmlFor="topic">
              Tema del examen <span className="text-red-500">*</span>
            </Label>
            <Input
              id="topic"
              placeholder="Ej: Fracciones equivalentes, La célula eucariota, Revolución francesa..."
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">Sé específico para obtener mejores preguntas</p>
          </div>

          {/* Subject & Grade */}
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

          {/* Question Count & Difficulty */}
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
                      {diff.label} - {diff.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Question Types */}
          <div className="space-y-3">
            <Label>Tipos de preguntas a incluir</Label>
            <p className="text-xs text-muted-foreground">Selecciona uno o más tipos. La IA distribuirá las preguntas entre los tipos seleccionados.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {QUESTION_TYPES.map((type) => {
                const TypeIcon = QUESTION_TYPE_ICONS[type.value] || CircleDot;
                const isSelected = formData.questionTypes.includes(type.value);
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => toggleQuestionType(type.value)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                        : "border-muted hover:border-primary/50"
                    }`}
                  >
                    <TypeIcon className={`h-5 w-5 mb-1 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                    <p className="text-sm font-medium">{type.label}</p>
                    <p className="text-xs text-muted-foreground">{type.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Advanced Toggle */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors border border-dashed rounded-xl hover:border-blue-300 hover:bg-blue-50/50"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {showAdvanced ? "Ocultar opciones avanzadas" : "Opciones avanzadas"}
          </button>

          {showAdvanced && (
            <div className="space-y-4 border rounded-xl p-5 bg-gradient-to-br from-blue-50/30 to-sky-50/20">
              {/* Visuals Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="includeVisuals" className="font-medium">Incluir recursos visuales</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Gráficos, tablas y esquemas cuando aporten comprensión</p>
                </div>
                <input
                  type="checkbox"
                  id="includeVisuals"
                  checked={includeVisuals}
                  onChange={(e) => setIncludeVisuals(e.target.checked)}
                  className="rounded h-4 w-4"
                />
              </div>

              {/* Additional Instructions */}
              <div className="space-y-2">
                <Label>Instrucciones adicionales (opcional)</Label>
                <Textarea
                  placeholder="Ej: Incluir preguntas sobre el capítulo 5 del libro. Evitar preguntas de fechas. Enfocar en comprensión conceptual. Usar contexto de la región caribe..."
                  value={formData.additionalInstructions}
                  onChange={(e) => setFormData({ ...formData, additionalInstructions: e.target.value })}
                  rows={3}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">Dale instrucciones específicas a la IA para personalizar el examen</p>
              </div>
            </div>
          )}

          {/* Generate Button */}
          <Button
            className="w-full bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white shadow-lg shadow-blue-500/25 rounded-xl h-12"
            size="lg"
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generando examen...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Generar Examen con IA
              </>
            )}
          </Button>

          {isGenerating && (
            <div className="text-center space-y-2">
              <div className="flex justify-center gap-1">
                <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <p className="text-sm text-muted-foreground">
                Creando {formData.questionCount} preguntas con respuestas y explicaciones...
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
