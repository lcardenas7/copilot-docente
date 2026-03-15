"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  FileText,
  GraduationCap,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronRight,
  Calendar,
  User,
} from "lucide-react";
import Link from "next/link";

interface Classroom {
  id: string;
  name: string;
  subject: string;
  grade: string;
  group?: string;
  color: string;
  teacherName: string;
  units: Unit[];
  pendingExams: PendingExam[];
  completedExams: CompletedExam[];
}

interface Unit {
  id: string;
  name: string;
  description?: string;
  topics: Topic[];
}

interface Topic {
  id: string;
  name: string;
  hours: number;
  guides: { id: string; title: string }[];
  exams: { id: string; title: string; isPublished: boolean }[];
}

interface PendingExam {
  id: string;
  title: string;
  deadline?: string;
  timeLimit?: number;
}

interface CompletedExam {
  id: string;
  title: string;
  score: number;
  maxScore: number;
  completedAt: string;
}

export default function StudentClassroomPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const classroomId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [activeTab, setActiveTab] = useState("contenido");

  useEffect(() => {
    if (session) {
      fetchClassroom();
    }
  }, [classroomId, session]);

  const fetchClassroom = async () => {
    try {
      const response = await fetch(`/api/classroom/${classroomId}`);
      const data = await response.json();

      if (data.success) {
        setClassroom(data.classroom);
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("Error fetching classroom:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!classroom) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Aula no encontrada</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header 
        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-8 px-4"
        style={{ 
          background: `linear-gradient(135deg, ${classroom.color} 0%, ${classroom.color}dd 100%)` 
        }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <GraduationCap className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{classroom.name}</h1>
              <p className="opacity-90">
                {classroom.subject} · {classroom.grade}
                {classroom.group && ` · Grupo ${classroom.group}`}
              </p>
              <p className="text-sm opacity-75 flex items-center gap-1 mt-1">
                <User className="h-3 w-3" />
                {classroom.teacherName}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Pending exams alert */}
        {classroom.pendingExams.length > 0 && (
          <Card className="mb-6 border-orange-200 bg-orange-50 dark:bg-orange-950/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-orange-700 dark:text-orange-400">
                <AlertCircle className="h-5 w-5" />
                Evaluaciones pendientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {classroom.pendingExams.map((exam) => (
                  <div 
                    key={exam.id}
                    className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{exam.title}</p>
                      {exam.deadline && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Fecha límite: {new Date(exam.deadline).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <Link href={`/exam/${exam.id}`}>
                      <Button size="sm">
                        Presentar
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start">
            <TabsTrigger value="contenido">
              <BookOpen className="h-4 w-4 mr-2" />
              Contenido
            </TabsTrigger>
            <TabsTrigger value="evaluaciones">
              <FileText className="h-4 w-4 mr-2" />
              Evaluaciones
            </TabsTrigger>
            <TabsTrigger value="notas">
              <GraduationCap className="h-4 w-4 mr-2" />
              Mis Notas
            </TabsTrigger>
          </TabsList>

          {/* Tab: Contenido */}
          <TabsContent value="contenido" className="space-y-4 mt-4">
            {classroom.units.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    El docente aún no ha publicado contenido
                  </p>
                </CardContent>
              </Card>
            ) : (
              classroom.units.map((unit, unitIndex) => (
                <Card key={unit.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Badge variant="outline">{unitIndex + 1}</Badge>
                      {unit.name}
                    </CardTitle>
                    {unit.description && (
                      <CardDescription>{unit.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {unit.topics.map((topic, topicIndex) => (
                        <div
                          key={topic.id}
                          className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-muted-foreground">
                                {unitIndex + 1}.{topicIndex + 1}
                              </span>
                              <span className="font-medium">{topic.name}</span>
                              <Badge variant="secondary" className="text-xs">
                                {topic.hours}h
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              {topic.guides.length > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  {topic.guides.length} guías
                                </Badge>
                              )}
                              {topic.exams.filter(e => e.isPublished).length > 0 && (
                                <Badge className="text-xs bg-orange-500">
                                  {topic.exams.filter(e => e.isPublished).length} evaluación
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          {/* Resources for this topic */}
                          {(topic.guides.length > 0 || topic.exams.filter(e => e.isPublished).length > 0) && (
                            <div className="mt-3 pl-8 space-y-1">
                              {topic.guides.map((guide) => (
                                <Link 
                                  key={guide.id} 
                                  href={`/guide/${guide.id}`}
                                  className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                                >
                                  <BookOpen className="h-3 w-3" />
                                  {guide.title}
                                </Link>
                              ))}
                              {topic.exams.filter(e => e.isPublished).map((exam) => (
                                <Link 
                                  key={exam.id} 
                                  href={`/exam/${exam.id}`}
                                  className="flex items-center gap-2 text-sm text-orange-600 hover:underline"
                                >
                                  <FileText className="h-3 w-3" />
                                  {exam.title}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Tab: Evaluaciones */}
          <TabsContent value="evaluaciones" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Evaluaciones del curso</CardTitle>
              </CardHeader>
              <CardContent>
                {classroom.pendingExams.length === 0 && classroom.completedExams.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No hay evaluaciones disponibles
                  </p>
                ) : (
                  <div className="space-y-4">
                    {/* Pending */}
                    {classroom.pendingExams.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Clock className="h-4 w-4 text-orange-500" />
                          Pendientes
                        </h4>
                        <div className="space-y-2">
                          {classroom.pendingExams.map((exam) => (
                            <div 
                              key={exam.id}
                              className="flex items-center justify-between p-3 border rounded-lg"
                            >
                              <div>
                                <p className="font-medium">{exam.title}</p>
                                {exam.timeLimit && (
                                  <p className="text-sm text-muted-foreground">
                                    Duración: {exam.timeLimit} minutos
                                  </p>
                                )}
                              </div>
                              <Link href={`/exam/${exam.id}`}>
                                <Button size="sm">Presentar</Button>
                              </Link>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Completed */}
                    {classroom.completedExams.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          Completadas
                        </h4>
                        <div className="space-y-2">
                          {classroom.completedExams.map((exam) => (
                            <div 
                              key={exam.id}
                              className="flex items-center justify-between p-3 border rounded-lg"
                            >
                              <div>
                                <p className="font-medium">{exam.title}</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(exam.completedAt).toLocaleDateString()}
                                </p>
                              </div>
                              <Badge 
                                variant={exam.score >= exam.maxScore * 0.6 ? "default" : "destructive"}
                                className="text-lg px-3 py-1"
                              >
                                {exam.score}/{exam.maxScore}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Notas */}
          <TabsContent value="notas" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Mi rendimiento</CardTitle>
                <CardDescription>
                  Resumen de tus calificaciones en este curso
                </CardDescription>
              </CardHeader>
              <CardContent>
                {classroom.completedExams.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Aún no tienes calificaciones
                  </p>
                ) : (
                  <div className="space-y-4">
                    {/* Average */}
                    <div className="text-center p-6 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Promedio</p>
                      <p className="text-4xl font-bold">
                        {(
                          classroom.completedExams.reduce((acc, e) => acc + (e.score / e.maxScore) * 5, 0) /
                          classroom.completedExams.length
                        ).toFixed(1)}
                      </p>
                      <p className="text-sm text-muted-foreground">de 5.0</p>
                    </div>

                    {/* Individual grades */}
                    <div className="space-y-2">
                      {classroom.completedExams.map((exam) => {
                        const grade = (exam.score / exam.maxScore) * 5;
                        return (
                          <div 
                            key={exam.id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <span>{exam.title}</span>
                            <Badge 
                              variant={grade >= 3 ? "default" : "destructive"}
                            >
                              {grade.toFixed(1)}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
