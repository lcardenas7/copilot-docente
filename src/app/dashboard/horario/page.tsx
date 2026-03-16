"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar,
  Clock,
  MapPin,
  Users,
} from "lucide-react";

interface ScheduleItem {
  id: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // "08:00"
  endTime: string; // "09:30"
  classroom: {
    id: string;
    name: string;
    subject: string;
  };
  type: "class" | "meeting" | "office_hours";
  location?: string;
  notes?: string;
}

interface Classroom {
  id: string;
  name: string;
  subject: string;
}

const DAYS = [
  { id: 0, name: "Domingo", short: "Dom" },
  { id: 1, name: "Lunes", short: "Lun" },
  { id: 2, name: "Martes", short: "Mar" },
  { id: 3, name: "Miércoles", short: "Mié" },
  { id: 4, name: "Jueves", short: "Jue" },
  { id: 5, name: "Viernes", short: "Vie" },
  { id: 6, name: "Sábado", short: "Sáb" },
];

const TIME_SLOTS = [
  "07:00", "07:30", "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
  "19:00", "19:30", "20:00", "20:30", "21:00", "21:30",
];

const COLORS = {
  class: "bg-blue-500",
  meeting: "bg-green-500",
  office_hours: "bg-purple-500",
};

export default function SchedulePage() {
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [showDialog, setShowDialog] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{
    day: number;
    time: string;
  } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [scheduleRes, classroomsRes] = await Promise.all([
        fetch("/api/schedule"),
        fetch("/api/classrooms"),
      ]);

      if (!scheduleRes.ok || !classroomsRes.ok) throw new Error("Error");

      const [scheduleData, classroomsData] = await Promise.all([
        scheduleRes.json(),
        classroomsRes.json(),
      ]);

      setSchedule(scheduleData);
      setClassrooms(classroomsData);
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  const getWeekDates = () => {
    const week = [];
    const startOfWeek = new Date(currentWeek);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      week.push(date);
    }

    return week;
  };

  const navigateWeek = (direction: "prev" | "next") => {
    const newWeek = new Date(currentWeek);
    const days = direction === "prev" ? -7 : 7;
    newWeek.setDate(newWeek.getDate() + days);
    setCurrentWeek(newWeek);
  };

  const handleSlotClick = (day: number, time: string) => {
    setSelectedSlot({ day, time });
    setShowDialog(true);
  };

  const getScheduleForSlot = (day: number, time: string) => {
    return schedule.filter((item) => {
      if (item.dayOfWeek !== day) return false;
      
      const itemStart = item.startTime;
      const itemEnd = item.endTime;
      
      // Check if time is within the schedule item duration
      return time >= itemStart && time < itemEnd;
    });
  };

  const getItemColor = (type: string) => {
    return COLORS[type as keyof typeof COLORS] || "bg-gray-500";
  };

  const formatTime = (time: string) => {
    const [hour, minute] = time.split(":");
    const hourNum = parseInt(hour);
    const ampm = hourNum >= 12 ? "PM" : "AM";
    const displayHour = hourNum > 12 ? hourNum - 12 : hourNum;
    return `${displayHour}:${minute} ${ampm}`;
  };

  const weekDates = getWeekDates();
  const today = new Date();
  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="bg-white rounded-lg border p-4">
          <div className="grid grid-cols-8 gap-1">
            <Skeleton className="h-10 w-20" />
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-20" />
            ))}
            {Array.from({ length: 30 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-20" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Horario Semanal</h1>
          <p className="text-muted-foreground">
            Gestiona tu horario de clases y actividades
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigateWeek("prev")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm font-medium min-w-[150px] text-center">
            {weekDates[0].toLocaleDateString()} - {weekDates[6].toLocaleDateString()}
          </div>
          <Button variant="outline" size="sm" onClick={() => navigateWeek("next")}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => setCurrentWeek(new Date())}>
            Hoy
          </Button>
        </div>
      </div>

      {/* Schedule Grid */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Header */}
              <div className="grid grid-cols-8 border-b bg-gray-50">
                <div className="p-2 text-sm font-medium text-gray-600">
                  Hora
                </div>
                {DAYS.map((day, index) => (
                  <div
                    key={day.id}
                    className={`p-2 text-center border-l ${
                      isToday(weekDates[index]) ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="text-xs text-gray-500">{day.name}</div>
                    <div className="text-sm font-medium">
                      {weekDates[index].getDate()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Time Slots */}
              {TIME_SLOTS.map((time) => (
                <div key={time} className="grid grid-cols-8 border-b">
                  <div className="p-2 text-sm text-gray-600 bg-gray-50">
                    {formatTime(time)}
                  </div>
                  {DAYS.map((day) => {
                    const items = getScheduleForSlot(day.id, time);
                    const isFirstSlot = items.some(item => item.startTime === time);
                    
                    return (
                      <div
                        key={`${day.id}-${time}`}
                        className={`p-1 border-l min-h-[48px] cursor-pointer hover:bg-gray-50 ${
                          isToday(weekDates[day.id]) ? "bg-blue-50/50" : ""
                        }`}
                        onClick={() => handleSlotClick(day.id, time)}
                      >
                        {isFirstSlot && items.map((item) => {
                          const duration = calculateDuration(item.startTime, item.endTime);
                          const height = (duration / 30) * 48; // 30min slots, 48px height
                          
                          return (
                            <div
                              key={item.id}
                              className={`${getItemColor(item.type)} text-white p-1 rounded text-xs overflow-hidden`}
                              style={{ height: `${height}px` }}
                              onClick={(e) => {
                                e.stopPropagation();
                                // Handle item click (edit/delete)
                              }}
                            >
                              <div className="font-medium truncate">
                                {item.classroom.name}
                              </div>
                              <div className="text-xs opacity-90 truncate">
                                {item.classroom.subject}
                              </div>
                              {item.location && (
                                <div className="text-xs opacity-75 flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {item.location}
                                </div>
                              )}
                              <div className="text-xs opacity-75 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatTime(item.startTime)} - {formatTime(item.endTime)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de clases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {schedule.filter(item => item.type === "class").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Horas semanales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {calculateWeeklyHours()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cursos activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {new Set(schedule.map(item => item.classroom.id)).size}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Días con clases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {new Set(schedule.filter(item => item.type === "class").map(item => item.dayOfWeek)).size}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Dialog - Placeholder */}
      {showDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">
              Agregar al horario
            </h3>
            <p className="text-muted-foreground mb-4">
              {selectedSlot && 
                `${DAYS[selectedSlot.day].name} - ${formatTime(selectedSlot.time)}`
              }
            </p>
            <p className="text-sm text-muted-foreground">
              Funcionalidad de agregar/editar horario - próximamente
            </p>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  function calculateDuration(startTime: string, endTime: string): number {
    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    return endMinutes - startMinutes;
  }

  function calculateWeeklyHours(): string {
    let totalMinutes = 0;
    
    schedule.forEach(item => {
      if (item.type === "class") {
        totalMinutes += calculateDuration(item.startTime, item.endTime);
      }
    });
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
}
