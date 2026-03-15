"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  LogIn,
  Users,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";

interface ClassroomInfo {
  id: string;
  name: string;
  subject: string;
  grade: string;
  group?: string;
  color: string;
  teacherName: string;
  studentCount: number;
  isEnrolled: boolean;
}

export default function JoinClassroomPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const code = params.code as string;

  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [classroom, setClassroom] = useState<ClassroomInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (code) {
      fetchClassroomInfo();
    }
  }, [code, session]);

  const fetchClassroomInfo = async () => {
    try {
      const response = await fetch(`/api/join/${code}`);
      const data = await response.json();

      if (data.success) {
        setClassroom(data.classroom);
      } else {
        setError(data.error || "Curso no encontrado");
      }
    } catch (err) {
      setError("Error al buscar el curso");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!session) {
      signIn("google", { callbackUrl: `/join/${code}` });
      return;
    }

    setJoining(true);
    try {
      const response = await fetch(`/api/join/${code}`, {
        method: "POST",
      });
      const data = await response.json();

      if (data.success) {
        toast.success("¡Te has unido al curso!");
        router.push(`/classroom/${classroom?.id}`);
      } else {
        toast.error(data.error || "Error al unirse al curso");
      }
    } catch (err) {
      toast.error("Error al unirse al curso");
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-2 text-muted-foreground">Buscando curso...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Curso no encontrado</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <p className="text-sm text-muted-foreground">
              Código ingresado: <code className="bg-muted px-2 py-1 rounded">{code}</code>
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => router.push("/")}
            >
              Volver al inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!classroom) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div 
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: classroom.color }}
          >
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl">{classroom.name}</CardTitle>
          <CardDescription>
            {classroom.subject} · {classroom.grade}
            {classroom.group && ` · Grupo ${classroom.group}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Teacher info */}
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>Docente:</span>
            <span className="font-medium text-foreground">{classroom.teacherName}</span>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="font-semibold">{classroom.studentCount}</span>
              </div>
              <p className="text-xs text-muted-foreground">Estudiantes</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <BookOpen className="h-4 w-4 text-green-500" />
                <Badge variant="secondary">Activo</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Estado</p>
            </div>
          </div>

          {/* Action */}
          {classroom.isEnrolled ? (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Ya estás inscrito en este curso</span>
              </div>
              <Button 
                className="w-full"
                onClick={() => router.push(`/classroom/${classroom.id}`)}
              >
                Ir al aula virtual
              </Button>
            </div>
          ) : status === "authenticated" ? (
            <Button 
              className="w-full" 
              size="lg"
              onClick={handleJoin}
              disabled={joining}
            >
              {joining ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uniéndose...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Unirse al curso
                </>
              )}
            </Button>
          ) : (
            <div className="space-y-4">
              <p className="text-center text-sm text-muted-foreground">
                Inicia sesión para unirte a este curso
              </p>
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => signIn("google", { callbackUrl: `/join/${code}` })}
              >
                <LogIn className="h-4 w-4 mr-2" />
                Iniciar sesión con Google
              </Button>
            </div>
          )}

          {/* Code display */}
          <div className="text-center pt-4 border-t">
            <p className="text-xs text-muted-foreground">Código del curso</p>
            <code className="text-lg font-mono font-bold">{code}</code>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
