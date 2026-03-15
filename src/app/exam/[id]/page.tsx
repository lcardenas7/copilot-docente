"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Send,
  Trophy,
} from "lucide-react";
import { toast } from "sonner";

interface Question {
  id: string;
  number: number;
  type: string;
  question: string;
  points: number;
  options?: { letter: string; text: string; isCorrect?: boolean }[];
  correctAnswer?: any;
  blanks?: string[];
  columnA?: string[];
  columnB?: string[];
  correctMatches?: Record<string, string>;
  items?: string[];
  correctOrder?: number[];
}

interface Exam {
  id: string;
  title: string;
  subtitle?: string;
  instructions: string;
  timeLimit?: number;
  totalPoints: number;
  questions: Question[];
}

interface Answer {
  questionId: string;
  answer: any;
}

export default function TakeExamPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const examId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [exam, setExam] = useState<Exam | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    maxScore: number;
    percentage: number;
    correctAnswers: number;
    totalQuestions: number;
    details: { questionId: string; correct: boolean; points: number }[];
  } | null>(null);

  useEffect(() => {
    fetchExam();
  }, [examId]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const fetchExam = async () => {
    try {
      const response = await fetch(`/api/exam/${examId}`);
      const data = await response.json();

      if (data.success) {
        setExam(data.exam);
        if (data.exam.timeLimit) {
          setTimeLeft(data.exam.timeLimit * 60);
        }
      } else {
        toast.error(data.error || "Error al cargar el examen");
        router.back();
      }
    } catch (error) {
      toast.error("Error al cargar el examen");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const setAnswer = (questionId: string, answer: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    if (!exam) return;

    setSubmitting(true);
    setShowSubmitDialog(false);

    try {
      const response = await fetch(`/api/exam/${examId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.result);
        toast.success("Examen enviado correctamente");
      } else {
        toast.error(data.error || "Error al enviar el examen");
      }
    } catch (error) {
      toast.error("Error al enviar el examen");
    } finally {
      setSubmitting(false);
    }
  };

  const answeredCount = Object.keys(answers).length;
  const progress = exam ? (answeredCount / exam.questions.length) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!exam) return null;

  // Show results
  if (result) {
    const passed = result.percentage >= 60;
    
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
                passed ? "bg-green-100 dark:bg-green-900" : "bg-red-100 dark:bg-red-900"
              }`}>
                {passed ? (
                  <Trophy className="h-10 w-10 text-green-600" />
                ) : (
                  <AlertCircle className="h-10 w-10 text-red-600" />
                )}
              </div>
              <CardTitle className="text-2xl">
                {passed ? "¡Felicitaciones!" : "Sigue practicando"}
              </CardTitle>
              <CardDescription>
                {exam.title}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Score */}
              <div className="text-center p-6 bg-muted rounded-lg">
                <p className="text-5xl font-bold">
                  {result.percentage.toFixed(0)}%
                </p>
                <p className="text-muted-foreground mt-2">
                  {result.score} de {result.maxScore} puntos
                </p>
                <p className="text-sm text-muted-foreground">
                  {result.correctAnswers} de {result.totalQuestions} respuestas correctas
                </p>
              </div>

              {/* Grade scale */}
              <div className="flex justify-center">
                <Badge 
                  variant={passed ? "default" : "destructive"}
                  className="text-lg px-4 py-2"
                >
                  Nota: {((result.percentage / 100) * 5).toFixed(1)} / 5.0
                </Badge>
              </div>

              {/* Question breakdown */}
              <div className="space-y-2">
                <h4 className="font-medium">Detalle por pregunta:</h4>
                <div className="grid grid-cols-5 gap-2">
                  {result.details.map((detail, i) => (
                    <div
                      key={detail.questionId}
                      className={`p-2 rounded text-center text-sm ${
                        detail.correct
                          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                          : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                      }`}
                    >
                      {i + 1}
                      {detail.correct ? (
                        <CheckCircle2 className="h-3 w-3 mx-auto mt-1" />
                      ) : (
                        <XCircle className="h-3 w-3 mx-auto mt-1" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <Button 
                className="w-full" 
                onClick={() => router.back()}
              >
                Volver al curso
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const question = exam.questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-semibold">{exam.title}</h1>
              <p className="text-sm text-muted-foreground">
                Pregunta {currentQuestion + 1} de {exam.questions.length}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {timeLeft !== null && (
                <Badge 
                  variant={timeLeft < 300 ? "destructive" : "secondary"}
                  className="text-lg px-3 py-1"
                >
                  <Clock className="h-4 w-4 mr-1" />
                  {formatTime(timeLeft)}
                </Badge>
              )}
              <Badge variant="outline">
                {answeredCount}/{exam.questions.length} respondidas
              </Badge>
            </div>
          </div>
          <Progress value={progress} className="mt-2 h-2" />
        </div>
      </header>

      {/* Question */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant="outline">
                {question.points} puntos
              </Badge>
              <Badge variant="secondary">
                {question.type.replace("_", " ")}
              </Badge>
            </div>
            <CardTitle className="text-lg mt-4">
              {question.number}. {question.question}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Multiple Choice */}
            {question.type === "MULTIPLE_CHOICE" && question.options && (
              <RadioGroup
                value={answers[question.id] || ""}
                onValueChange={(value) => setAnswer(question.id, value)}
              >
                <div className="space-y-3">
                  {question.options.map((option) => (
                    <div
                      key={option.letter}
                      className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                      onClick={() => setAnswer(question.id, option.letter)}
                    >
                      <RadioGroupItem value={option.letter} id={option.letter} />
                      <Label htmlFor={option.letter} className="flex-1 cursor-pointer">
                        <span className="font-medium mr-2">{option.letter}.</span>
                        {option.text}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            )}

            {/* Multiple Answer */}
            {question.type === "MULTIPLE_ANSWER" && question.options && (
              <div className="space-y-3">
                {question.options.map((option) => {
                  const selected = (answers[question.id] || []) as string[];
                  const isChecked = selected.includes(option.letter);
                  
                  return (
                    <div
                      key={option.letter}
                      className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                      onClick={() => {
                        const newSelected = isChecked
                          ? selected.filter((l) => l !== option.letter)
                          : [...selected, option.letter];
                        setAnswer(question.id, newSelected);
                      }}
                    >
                      <Checkbox checked={isChecked} />
                      <Label className="flex-1 cursor-pointer">
                        <span className="font-medium mr-2">{option.letter}.</span>
                        {option.text}
                      </Label>
                    </div>
                  );
                })}
              </div>
            )}

            {/* True/False */}
            {question.type === "TRUE_FALSE" && (
              <RadioGroup
                value={answers[question.id]?.toString() || ""}
                onValueChange={(value) => setAnswer(question.id, value === "true")}
              >
                <div className="flex gap-4">
                  <div
                    className="flex-1 flex items-center justify-center p-4 rounded-lg border hover:bg-muted/50 cursor-pointer"
                    onClick={() => setAnswer(question.id, true)}
                  >
                    <RadioGroupItem value="true" id="true" />
                    <Label htmlFor="true" className="ml-2 cursor-pointer font-medium">
                      Verdadero
                    </Label>
                  </div>
                  <div
                    className="flex-1 flex items-center justify-center p-4 rounded-lg border hover:bg-muted/50 cursor-pointer"
                    onClick={() => setAnswer(question.id, false)}
                  >
                    <RadioGroupItem value="false" id="false" />
                    <Label htmlFor="false" className="ml-2 cursor-pointer font-medium">
                      Falso
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            )}

            {/* Fill Blank */}
            {question.type === "FILL_BLANK" && (
              <div className="space-y-3">
                {(question.blanks || [""]).map((_, index) => (
                  <div key={index}>
                    <Label>Espacio {index + 1}</Label>
                    <Input
                      value={(answers[question.id] || [])[index] || ""}
                      onChange={(e) => {
                        const current = answers[question.id] || [];
                        const newAnswers = [...current];
                        newAnswers[index] = e.target.value;
                        setAnswer(question.id, newAnswers);
                      }}
                      placeholder="Tu respuesta..."
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Short Answer / Open */}
            {(question.type === "SHORT_ANSWER" || question.type === "OPEN") && (
              <Textarea
                value={answers[question.id] || ""}
                onChange={(e) => setAnswer(question.id, e.target.value)}
                placeholder="Escribe tu respuesta..."
                rows={question.type === "OPEN" ? 6 : 3}
              />
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>

          <div className="flex gap-2">
            {exam.questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentQuestion(i)}
                className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                  i === currentQuestion
                    ? "bg-blue-600 text-white"
                    : answers[exam.questions[i].id]
                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {currentQuestion < exam.questions.length - 1 ? (
            <Button
              onClick={() => setCurrentQuestion((prev) => prev + 1)}
            >
              Siguiente
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={() => setShowSubmitDialog(true)}
              disabled={submitting}
            >
              <Send className="h-4 w-4 mr-2" />
              Enviar examen
            </Button>
          )}
        </div>
      </main>

      {/* Submit Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Enviar examen?</AlertDialogTitle>
            <AlertDialogDescription>
              Has respondido {answeredCount} de {exam.questions.length} preguntas.
              {answeredCount < exam.questions.length && (
                <span className="block mt-2 text-orange-600">
                  ⚠️ Tienes {exam.questions.length - answeredCount} preguntas sin responder.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Revisar respuestas</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit}>
              Enviar examen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
