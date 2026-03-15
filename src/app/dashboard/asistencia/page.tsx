"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  Save,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

interface Classroom {
  id: string;
  name: string;
  subject: string;
  grade: string;
  color: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
}

interface AttendanceRecord {
  studentId: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
  note?: string;
}

const STATUS_CONFIG = {
  PRESENT: { label: "Presente", icon: CheckCircle2, color: "text-green-600 bg-green-100" },
  ABSENT: { label: "Ausente", icon: XCircle, color: "text-red-600 bg-red-100" },
  LATE: { label: "Tardanza", icon: Clock, color: "text-yellow-600 bg-yellow-100" },
  EXCUSED: { label: "Excusa", icon: AlertCircle, color: "text-blue-600 bg-blue-100" },
};

export default function AsistenciaPage() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceRecord>>({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchClassrooms();
  }, []);

  useEffect(() => {
    if (selectedClassroom) {
      fetchStudentsAndAttendance();
    }
  }, [selectedClassroom, selectedDate]);

  const fetchClassrooms = async () => {
    try {
      const response = await fetch("/api/classrooms");
      const data = await response.json();
      if (data.success) {
        setClassrooms(data.classrooms);
        if (data.classrooms.length > 0) {
          setSelectedClassroom(data.classrooms[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching classrooms:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsAndAttendance = async () => {
    try {
      // Fetch students
      const studentsRes = await fetch(`/api/classrooms/${selectedClassroom}/students`);
      const studentsData = await studentsRes.json();
      if (studentsData.success) {
        setStudents(studentsData.students);
      }

      // Fetch attendance for date
      const attendanceRes = await fetch(
        `/api/attendance?classroomId=${selectedClassroom}&date=${selectedDate}`
      );
      const attendanceData = await attendanceRes.json();
      if (attendanceData.success) {
        const attendanceMap: Record<string, AttendanceRecord> = {};
        attendanceData.records.forEach((record: any) => {
          attendanceMap[record.studentId] = {
            studentId: record.studentId,
            status: record.status,
            note: record.note,
          };
        });
        setAttendance(attendanceMap);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const setStudentStatus = (studentId: string, status: AttendanceRecord["status"]) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: { studentId, status },
    }));
  };

  const markAllPresent = () => {
    const newAttendance: Record<string, AttendanceRecord> = {};
    students.forEach((student) => {
      newAttendance[student.id] = { studentId: student.id, status: "PRESENT" };
    });
    setAttendance(newAttendance);
  };

  const saveAttendance = async () => {
    setSaving(true);
    try {
      const records = Object.values(attendance);
      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classroomId: selectedClassroom,
          date: selectedDate,
          records,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Asistencia guardada");
      } else {
        toast.error(data.error || "Error al guardar");
      }
    } catch (error) {
      toast.error("Error al guardar asistencia");
    } finally {
      setSaving(false);
    }
  };

  const changeDate = (days: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split("T")[0]);
  };

  const stats = {
    present: Object.values(attendance).filter((a) => a.status === "PRESENT").length,
    absent: Object.values(attendance).filter((a) => a.status === "ABSENT").length,
    late: Object.values(attendance).filter((a) => a.status === "LATE").length,
    excused: Object.values(attendance).filter((a) => a.status === "EXCUSED").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            Control de Asistencia
          </h1>
          <p className="text-muted-foreground">
            Registra la asistencia diaria de tus estudiantes
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <Select value={selectedClassroom} onValueChange={setSelectedClassroom}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Selecciona un curso" />
          </SelectTrigger>
          <SelectContent>
            {classrooms.map((classroom) => (
              <SelectItem key={classroom.id} value={classroom.id}>
                {classroom.name} - {classroom.grade}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => changeDate(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 px-3 py-2 border rounded-md">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent outline-none"
            />
          </div>
          <Button variant="outline" size="icon" onClick={() => changeDate(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Presentes</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.present}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-muted-foreground">Ausentes</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.absent}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <span className="text-sm text-muted-foreground">Tardanzas</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.late}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">Excusas</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.excused}</p>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Lista de Estudiantes</CardTitle>
            <CardDescription>
              {students.length} estudiantes · {new Date(selectedDate).toLocaleDateString("es", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={markAllPresent}>
              Marcar todos presentes
            </Button>
            <Button onClick={saveAttendance} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Guardar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay estudiantes inscritos en este curso
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead>Estudiante</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student, index) => {
                  const record = attendance[student.id];
                  const status = record?.status;

                  return (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-muted-foreground">{student.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-1">
                          {(Object.keys(STATUS_CONFIG) as Array<keyof typeof STATUS_CONFIG>).map((statusKey) => {
                            const config = STATUS_CONFIG[statusKey];
                            const Icon = config.icon;
                            const isSelected = status === statusKey;

                            return (
                              <Button
                                key={statusKey}
                                variant="ghost"
                                size="sm"
                                className={`${isSelected ? config.color : "opacity-40 hover:opacity-100"}`}
                                onClick={() => setStudentStatus(student.id, statusKey)}
                                title={config.label}
                              >
                                <Icon className="h-5 w-5" />
                              </Button>
                            );
                          })}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
