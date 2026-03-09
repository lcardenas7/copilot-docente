"use client";

import { useState, useRef } from "react";
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
import { SUBJECTS, GRADES, METHODOLOGIES, BLOOM_LEVELS, DURATIONS, COUNTRIES } from "@/lib/constants";
import {
  Loader2, Sparkles, ArrowLeft, Rocket, Search, PenLine, CheckCircle2,
  Target, BookOpen, Users, GraduationCap, Clock, Lightbulb, FileText,
  Upload, X, ChevronDown, ChevronUp, MessageSquare, Home, Star,
  AlertTriangle, Globe, ClipboardList
} from "lucide-react";
import Link from "next/link";

const PHASE_ICONS: Record<string, any> = {
  rocket: Rocket,
  search: Search,
  pencil: PenLine,
  check: CheckCircle2,
};

const PHASE_COLORS = [
  "border-blue-500 bg-blue-50 dark:bg-blue-950/30",
  "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30",
  "border-amber-500 bg-amber-50 dark:bg-amber-950/30",
  "border-purple-500 bg-purple-50 dark:bg-purple-950/30",
];

const PHASE_BADGE_COLORS = [
  "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
];

export default function NewGuidePage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedGuide, setGeneratedGuide] = useState<any>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [expandedPhases, setExpandedPhases] = useState<Record<number, boolean>>({});
  const [documentText, setDocumentText] = useState("");
  const [documentName, setDocumentName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    subject: "",
    grade: "",
    topic: "",
    duration: "60",
    methodology: "TRADITIONAL",
    bloomLevel: "UNDERSTAND",
    country: "Colombia",
    additionalContext: "",
    documentContent: "",
  });

  const togglePhase = (index: number) => {
    setExpandedPhases(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDocumentName(file.name);

    if (file.type === "text/plain" || file.name.endsWith(".txt") || file.name.endsWith(".md")) {
      const text = await file.text();
      const trimmed = text.slice(0, 4000);
      setDocumentText(trimmed);
      setFormData(prev => ({ ...prev, documentContent: trimmed }));
    } else if (file.type === "application/pdf") {
      setDocumentText("(PDF cargado - se extraerá el texto disponible)");
      const text = await file.text();
      const cleaned = text.replace(/[^\x20-\x7E\xA0-\xFF\u0100-\u017F\n]/g, " ").slice(0, 4000);
      setFormData(prev => ({ ...prev, documentContent: cleaned }));
    } else {
      const text = await file.text();
      const trimmed = text.slice(0, 4000);
      setDocumentText(trimmed.slice(0, 200) + "...");
      setFormData(prev => ({ ...prev, documentContent: trimmed }));
    }
  };

  const removeDocument = () => {
    setDocumentName("");
    setDocumentText("");
    setFormData(prev => ({ ...prev, documentContent: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

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
        setExpandedPhases({ 0: true, 1: true, 2: true, 3: true });
      } else {
        alert(data.error || "Error al generar la guía");
      }
    } catch (error) {
      alert("Error de conexión");
    } finally {
      setIsGenerating(false);
    }
  };

  // ========================
  // RESULTADO DE LA GUÍA
  // ========================
  if (generatedGuide) {
    const guide = generatedGuide;
    return (
      <div className="space-y-6 pb-10">
        {/* Header */}
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" className="mt-1 shrink-0" onClick={() => setGeneratedGuide(null)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-primary">{guide.title}</h1>
            {guide.subtitle && (
              <p className="text-muted-foreground italic mt-1">&ldquo;{guide.subtitle}&rdquo;</p>
            )}
          </div>
        </div>

        {/* Essential Question Banner */}
        {guide.essentialQuestion && (
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
            <Lightbulb className="h-6 w-6 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm text-primary">Pregunta Esencial</p>
              <p className="text-foreground font-medium">{guide.essentialQuestion}</p>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* ===== MAIN CONTENT ===== */}
          <div className="lg:col-span-2 space-y-6">

            {/* Objectives */}
            <Card className="border-l-4 border-l-primary">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="h-5 w-5 text-primary" />
                  Objetivos de Aprendizaje
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-primary/5 rounded-lg p-3">
                  <p className="font-medium text-sm text-primary mb-1">Objetivo General</p>
                  <p>{guide.objectives?.general}</p>
                </div>
                <div>
                  <p className="font-medium text-sm text-muted-foreground mb-2">Objetivos Específicos</p>
                  <div className="space-y-2">
                    {guide.objectives?.specific?.map((obj: string, i: number) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 shrink-0" />
                        <p className="text-sm">{obj}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Prerequisites */}
            {guide.prerequisites && guide.prerequisites.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <ClipboardList className="h-5 w-5 text-orange-500" />
                    Conocimientos Previos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {guide.prerequisites.map((p: string, i: number) => (
                      <span key={i} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200">
                        {p}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ===== ACTIVITIES TIMELINE ===== */}
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Desarrollo de la Clase
              </h2>
              <div className="space-y-4">
                {guide.activities?.map((activity: any, i: number) => {
                  const PhaseIcon = PHASE_ICONS[activity.icon] || Rocket;
                  const isExpanded = expandedPhases[i] !== false;
                  return (
                    <Card key={i} className={`border-l-4 ${PHASE_COLORS[i] || PHASE_COLORS[0]} overflow-hidden`}>
                      {/* Phase Header - Always Visible */}
                      <div
                        className="p-4 cursor-pointer flex items-center justify-between"
                        onClick={() => togglePhase(i)}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${PHASE_BADGE_COLORS[i] || PHASE_BADGE_COLORS[0]}`}>
                            <PhaseIcon className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-sm md:text-base">{activity.phase}</h3>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{activity.duration} minutos</span>
                              {activity.objective && (
                                <>
                                  <span className="hidden sm:inline">•</span>
                                  <span className="hidden sm:inline truncate">{activity.objective}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        {isExpanded ? <ChevronUp className="h-5 w-5 shrink-0" /> : <ChevronDown className="h-5 w-5 shrink-0" />}
                      </div>

                      {/* Phase Content - Expandable */}
                      {isExpanded && (
                        <div className="px-4 pb-4 space-y-4">
                          {/* Description */}
                          <p className="text-sm text-muted-foreground">{activity.description}</p>

                          {/* Teacher Script */}
                          {activity.teacherScript && activity.teacherScript.length > 0 && (
                            <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border">
                              <p className="font-semibold text-sm flex items-center gap-2 mb-2 text-primary">
                                <GraduationCap className="h-4 w-4" />
                                Guión del Docente
                              </p>
                              <div className="space-y-2">
                                {activity.teacherScript.map((step: string, j: number) => (
                                  <div key={j} className="flex items-start gap-2 text-sm">
                                    <span className="bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shrink-0 mt-0.5">
                                      {j + 1}
                                    </span>
                                    <p>{step}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Student Actions */}
                          {activity.studentActions && activity.studentActions.length > 0 && (
                            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3">
                              <p className="font-semibold text-sm flex items-center gap-2 mb-2 text-blue-700 dark:text-blue-300">
                                <Users className="h-4 w-4" />
                                Los Estudiantes
                              </p>
                              <ul className="space-y-1">
                                {activity.studentActions.map((a: string, j: number) => (
                                  <li key={j} className="text-sm flex items-start gap-2">
                                    <span className="text-blue-500 mt-1">•</span>
                                    <span>{a}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Examples */}
                          {activity.examples && activity.examples.length > 0 && (
                            <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-3">
                              <p className="font-semibold text-sm flex items-center gap-2 mb-2 text-green-700 dark:text-green-300">
                                <Star className="h-4 w-4" />
                                Ejemplos para usar en clase
                              </p>
                              {activity.examples.map((ex: string, j: number) => (
                                <div key={j} className="text-sm bg-white dark:bg-gray-900 rounded p-2 mb-1 border border-green-200 dark:border-green-800">
                                  {ex}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Guiding Questions */}
                          {activity.guidingQuestions && activity.guidingQuestions.length > 0 && (
                            <div className="bg-violet-50 dark:bg-violet-950/20 rounded-lg p-3">
                              <p className="font-semibold text-sm flex items-center gap-2 mb-2 text-violet-700 dark:text-violet-300">
                                <MessageSquare className="h-4 w-4" />
                                Preguntas Orientadoras
                              </p>
                              {activity.guidingQuestions.map((q: string, j: number) => (
                                <p key={j} className="text-sm italic mb-1">&ldquo;{q}&rdquo;</p>
                              ))}
                            </div>
                          )}

                          {/* Worksheet */}
                          {activity.worksheet && (
                            <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-3 border border-amber-200 dark:border-amber-800">
                              <p className="font-semibold text-sm flex items-center gap-2 mb-1 text-amber-700 dark:text-amber-300">
                                <FileText className="h-4 w-4" />
                                {activity.worksheet.title || "Taller / Actividad Práctica"}
                              </p>
                              {activity.worksheet.instructions && (
                                <p className="text-sm text-muted-foreground mb-2">{activity.worksheet.instructions}</p>
                              )}
                              {activity.worksheet.exercises && (
                                <div className="space-y-1">
                                  {activity.worksheet.exercises.map((ex: string, j: number) => (
                                    <div key={j} className="text-sm flex items-start gap-2 bg-white dark:bg-gray-900 rounded p-2">
                                      <span className="font-bold text-amber-600">{j + 1}.</span>
                                      <span>{ex}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Exit Ticket */}
                          {activity.exitTicket && (
                            <div className="bg-rose-50 dark:bg-rose-950/20 rounded-lg p-3 border border-rose-200 dark:border-rose-800">
                              <p className="font-semibold text-sm flex items-center gap-2 mb-1 text-rose-700 dark:text-rose-300">
                                <FileText className="h-4 w-4" />
                                Ticket de Salida
                              </p>
                              <p className="text-sm">{activity.exitTicket}</p>
                            </div>
                          )}

                          {/* Tips */}
                          {activity.tips && (
                            <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-2">
                              <Lightbulb className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
                              <p><strong>Tip:</strong> {activity.tips}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Evaluation */}
            {guide.evaluation && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <ClipboardList className="h-5 w-5 text-indigo-500" />
                    Evaluación
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Rubric */}
                  {guide.evaluation.criteria && Array.isArray(guide.evaluation.criteria) && guide.evaluation.criteria.length > 0 && (
                    <div>
                      <p className="font-medium text-sm mb-2">Rúbrica de Evaluación</p>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border rounded-lg overflow-hidden">
                          <thead>
                            <tr className="bg-muted">
                              <th className="text-left p-2 font-medium">Criterio</th>
                              <th className="text-left p-2 font-medium text-green-600">Excelente</th>
                              <th className="text-left p-2 font-medium text-yellow-600">Bueno</th>
                              <th className="text-left p-2 font-medium text-red-600">Por Mejorar</th>
                            </tr>
                          </thead>
                          <tbody>
                            {guide.evaluation.criteria.map((c: any, i: number) => (
                              <tr key={i} className="border-t">
                                <td className="p-2 font-medium">{typeof c === "string" ? c : c.criterion}</td>
                                <td className="p-2 text-green-700 dark:text-green-400">{typeof c === "string" ? "" : c.excellent}</td>
                                <td className="p-2 text-yellow-700 dark:text-yellow-400">{typeof c === "string" ? "" : c.good}</td>
                                <td className="p-2 text-red-700 dark:text-red-400">{typeof c === "string" ? "" : c.needsWork}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Indicators */}
                  {guide.evaluation.indicators && (
                    <div>
                      <p className="font-medium text-sm mb-2">Indicadores de Logro</p>
                      <div className="space-y-1">
                        {guide.evaluation.indicators.map((ind: string, i: number) => (
                          <div key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                            <span>{ind}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Formative Assessment */}
                  {guide.evaluation.formativeAssessment && (
                    <div className="bg-indigo-50 dark:bg-indigo-950/20 rounded-lg p-3">
                      <p className="font-semibold text-sm text-indigo-700 dark:text-indigo-300 mb-1">Evaluación Formativa (durante la clase)</p>
                      <p className="text-sm">{guide.evaluation.formativeAssessment}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Homework */}
            {guide.homework && guide.homework.description && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Home className="h-5 w-5 text-teal-500" />
                    Tarea para Casa
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-1">{guide.homework.description}</p>
                  {guide.homework.objective && (
                    <p className="text-xs text-muted-foreground italic">Objetivo: {guide.homework.objective}</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Teacher Notes */}
            {guide.teacherNotes && (
              <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm text-yellow-800 dark:text-yellow-200">Notas para el Docente</p>
                  <p className="text-sm text-yellow-900 dark:text-yellow-100">{guide.teacherNotes}</p>
                </div>
              </div>
            )}
          </div>

          {/* ===== SIDEBAR ===== */}
          <div className="space-y-4">
            {/* Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Acciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" size="sm">Guardar guía</Button>
                <Button variant="outline" className="w-full" size="sm">Exportar PDF</Button>
                <Button variant="outline" className="w-full" size="sm">Exportar Word</Button>
                <Button variant="ghost" className="w-full" size="sm" onClick={() => setGeneratedGuide(null)}>
                  Generar otra
                </Button>
              </CardContent>
            </Card>

            {/* Materials */}
            {guide.materials && guide.materials.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <BookOpen className="h-4 w-4" />
                    Materiales
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {guide.materials.map((m: any, i: number) => (
                      <div key={i} className="text-sm flex items-start gap-2">
                        <span className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                          (m.type === "digital" || m.type === "Digital") ? "bg-blue-500" : "bg-green-500"
                        }`} />
                        <div>
                          <p className="font-medium">{typeof m === "string" ? m : m.name}</p>
                          {m.details && <p className="text-xs text-muted-foreground">{m.details}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500" /> Físico</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500" /> Digital</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Competencies & Standards */}
            {(guide.competencies || guide.standards) && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <GraduationCap className="h-4 w-4" />
                    Alineación Curricular
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {guide.competencies && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">COMPETENCIAS</p>
                      {guide.competencies.map((c: string, i: number) => (
                        <p key={i} className="text-sm mb-1">• {c}</p>
                      ))}
                    </div>
                  )}
                  {guide.standards && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">ESTÁNDARES</p>
                      {guide.standards.map((s: string, i: number) => (
                        <p key={i} className="text-sm mb-1">• {s}</p>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Adaptations */}
            {guide.adaptations && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Users className="h-4 w-4" />
                    Adaptaciones
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {guide.adaptations.advanced && (
                    <div>
                      <p className="text-xs font-semibold text-green-600 mb-1">ESTUDIANTES AVANZADOS</p>
                      {Array.isArray(guide.adaptations.advanced) 
                        ? guide.adaptations.advanced.map((a: string, i: number) => (
                            <p key={i} className="text-sm mb-1">• {a}</p>
                          ))
                        : <p className="text-sm">{guide.adaptations.advanced}</p>
                      }
                    </div>
                  )}
                  {guide.adaptations.support && (
                    <div>
                      <p className="text-xs font-semibold text-amber-600 mb-1">ESTUDIANTES CON DIFICULTADES</p>
                      {Array.isArray(guide.adaptations.support)
                        ? guide.adaptations.support.map((a: string, i: number) => (
                            <p key={i} className="text-sm mb-1">• {a}</p>
                          ))
                        : <p className="text-sm">{guide.adaptations.support}</p>
                      }
                    </div>
                  )}
                  {guide.adaptations.inclusive && (
                    <div>
                      <p className="text-xs font-semibold text-blue-600 mb-1">INCLUSIÓN</p>
                      <p className="text-sm">{guide.adaptations.inclusive}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Resources */}
            {guide.resources && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Globe className="h-4 w-4" />
                    Recursos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {guide.resources.videos && guide.resources.videos.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">VIDEOS SUGERIDOS</p>
                      {guide.resources.videos.map((v: any, i: number) => (
                        <div key={i} className="text-sm mb-2 bg-muted/50 rounded p-2">
                          {typeof v === "string" ? v : (
                            <>
                              <p className="font-medium">{v.title}</p>
                              {v.channel && <p className="text-xs text-muted-foreground">Canal: {v.channel}</p>}
                              {v.searchTerm && (
                                <a 
                                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(v.searchTerm)}`}
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                                >
                                  Buscar en YouTube: &quot;{v.searchTerm}&quot;
                                </a>
                              )}
                              {v.duration && <p className="text-xs text-muted-foreground">{v.duration}</p>}
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {guide.resources.links && guide.resources.links.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">RECURSOS DIGITALES</p>
                      {guide.resources.links.map((l: any, i: number) => (
                        <div key={i} className="text-sm mb-2 bg-muted/50 rounded p-2">
                          {typeof l === "string" ? l : (
                            <>
                              <p className="font-medium">{l.title}</p>
                              {l.platform && <p className="text-xs text-primary">{l.platform}</p>}
                              {l.searchTerm && <p className="text-xs text-muted-foreground">Buscar: &quot;{l.searchTerm}&quot;</p>}
                              {l.description && <p className="text-xs text-muted-foreground">{l.description}</p>}
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {guide.resources.bibliography && guide.resources.bibliography.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">BIBLIOGRAFÍA</p>
                      {guide.resources.bibliography.map((b: string, i: number) => (
                        <p key={i} className="text-sm mb-1 text-muted-foreground">{b}</p>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ========================
  // FORMULARIO
  // ========================
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/guides">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Nueva Guía de Clase</h1>
          <p className="text-muted-foreground">
            Completa los datos y la IA generará tu planeación completa
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
            La IA creará una guía detallada con script del docente, actividades y evaluación
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
            <p className="text-xs text-muted-foreground">Sé específico: &quot;Suma de fracciones con diferente denominador&quot; es mejor que solo &quot;Fracciones&quot;</p>
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

          {/* Bloom Level & Country */}
          <div className="grid gap-4 sm:grid-cols-2">
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

            <div className="space-y-2">
              <Label>País (estándares curriculares)</Label>
              <Select
                value={formData.country}
                onValueChange={(value) => setFormData({ ...formData, country: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country.value} value={country.value}>
                      {country.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Advanced Toggle */}
          <Button
            type="button"
            variant="ghost"
            className="w-full text-muted-foreground"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? <ChevronUp className="mr-2 h-4 w-4" /> : <ChevronDown className="mr-2 h-4 w-4" />}
            {showAdvanced ? "Ocultar opciones avanzadas" : "Opciones avanzadas (documento, instrucciones)"}
          </Button>

          {showAdvanced && (
            <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
              {/* Document Upload */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Documento de referencia (opcional)
                </Label>
                <p className="text-xs text-muted-foreground">
                  Sube el libro, guía curricular o documento en el que quieres basar la clase (.txt, .md)
                </p>
                
                {documentName ? (
                  <div className="flex items-center gap-2 bg-primary/10 rounded-lg p-3">
                    <FileText className="h-5 w-5 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{documentName}</p>
                      <p className="text-xs text-muted-foreground">{documentText.slice(0, 100)}...</p>
                    </div>
                    <Button variant="ghost" size="icon" className="shrink-0" onClick={removeDocument}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Haz clic para subir un archivo
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">.txt, .md (máx 4000 caracteres)</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.md,.pdf"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>

              {/* Additional Context */}
              <div className="space-y-2">
                <Label>Instrucciones especiales (opcional)</Label>
                <Textarea
                  placeholder="Ej: Los estudiantes ya vieron las fracciones básicas la clase pasada. Quiero incluir un juego con dados. El salón tiene proyector pero no computadores para los estudiantes..."
                  value={formData.additionalContext}
                  onChange={(e) => setFormData({ ...formData, additionalContext: e.target.value })}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Agrega contexto específico de tu clase, recursos disponibles o instrucciones especiales
                </p>
              </div>
            </div>
          )}

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
                Generando guía detallada...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Generar Guía con IA
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
                Creando tu guía con script docente, actividades, evaluación y recursos...
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
