"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  AlertCircle,
  Calendar,
  Clock,
  FileText,
  Send,
  CheckCircle,
} from "lucide-react";

interface Field {
  id: string;
  name: string;
  type: "text" | "textarea" | "select" | "checkbox" | "radio" | "file" | "number" | "date";
  required: boolean;
  options?: string[];
  placeholder?: string;
}

interface Recaudo {
  id: string;
  title: string;
  description?: string;
  fields: Field[];
  deadline: string;
  status: "active" | "closed" | "draft";
  classroom: {
    name: string;
    subject: string;
  };
}

interface FormResponses {
  [fieldId: string]: string | string[] | boolean | File | null;
}

export default function RecaudoFormPage() {
  const params = useParams();
  const router = useRouter();
  const classroomId = params.id as string;
  const recaudoId = params.recaudoId as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [recaudo, setRecaudo] = useState<Recaudo | null>(null);
  const [responses, setResponses] = useState<FormResponses>({});
  const [submitted, setSubmitted] = useState(false);
  const [fileUploads, setFileUploads] = useState<{ [fieldId: string]: File }>({});

  useEffect(() => {
    fetchRecaudo();
  }, []);

  const fetchRecaudo = async () => {
    try {
      const response = await fetch(`/api/classroom/${classroomId}/recaudos/${recaudoId}`);
      if (!response.ok) {
        if (response.status === 404) {
          toast.error("Recaudo no encontrado o no está disponible");
          router.back();
          return;
        }
        throw new Error("Error al cargar recaudo");
      }

      const data = await response.json();
      setRecaudo(data);

      // Check if already submitted
      const checkResponse = await fetch(`/api/classroom/${classroomId}/recaudos/${recaudoId}/check`);
      if (checkResponse.ok) {
        const checkData = await checkResponse.json();
        if (checkData.submitted) {
          setSubmitted(true);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar el recaudo");
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (fieldId: string, value: string | string[] | boolean | File | null) => {
    setResponses(prev => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleFileChange = (fieldId: string, file: File) => {
    setFileUploads(prev => ({
      ...prev,
      [fieldId]: file,
    }));
    handleFieldChange(fieldId, file);
  };

  const validateForm = (): boolean => {
    if (!recaudo) return false;

    for (const field of recaudo.fields) {
      const response = responses[field.id];
      
      if (field.required) {
        if (field.type === "checkbox") {
          if (response !== true) {
            toast.error(`El campo "${field.name}" es requerido`);
            return false;
          }
        } else if (field.type === "file") {
          if (!fileUploads[field.id]) {
            toast.error(`El archivo "${field.name}" es requerido`);
            return false;
          }
        } else {
          if (!response || (typeof response === "string" && response.trim() === "")) {
            toast.error(`El campo "${field.name}" es requerido`);
            return false;
          }
        }
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      // Create FormData for file uploads
      const formData = new FormData();
      
      // Add responses
      Object.entries(responses).forEach(([fieldId, value]) => {
        if (value instanceof File) {
          formData.append(`file_${fieldId}`, value);
          formData.append(`response_${fieldId}`, JSON.stringify({
            type: "file",
            fileName: value.name,
            fileSize: value.size,
          }));
        } else {
          formData.append(`response_${fieldId}`, JSON.stringify({
            type: "value",
            value,
          }));
        }
      });

      const response = await fetch(`/api/classroom/${classroomId}/recaudos/${recaudoId}/submit`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Error al enviar");

      setSubmitted(true);
      toast.success("Respuesta enviada correctamente");
    } catch (error) {
      console.error(error);
      toast.error("Error al enviar la respuesta");
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: Field) => {
    const value = responses[field.id] ?? "";

    switch (field.type) {
      case "text":
        return (
          <Input
            placeholder={field.placeholder}
            value={value as string}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            required={field.required}
          />
        );

      case "textarea":
        return (
          <Textarea
            placeholder={field.placeholder}
            value={value as string}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            required={field.required}
            rows={4}
          />
        );

      case "number":
        return (
          <Input
            type="number"
            placeholder={field.placeholder}
            value={value as string}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            required={field.required}
          />
        );

      case "date":
        return (
          <Input
            type="date"
            value={value as string}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            required={field.required}
          />
        );

      case "select":
        return (
          <Select
            value={value as string}
            onValueChange={(v) => handleFieldChange(field.id, v)}
            required={field.required}
          >
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || "Seleccionar opción"} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "radio":
        return (
          <RadioGroup
            value={value as string}
            onValueChange={(v) => handleFieldChange(field.id, v)}
            required={field.required}
          >
            {field.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${field.id}-${option}`} />
                <Label htmlFor={`${field.id}-${option}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.id}
              checked={value as boolean || false}
              onCheckedChange={(checked: boolean) => handleFieldChange(field.id, checked)}
              required={field.required}
            />
            <Label htmlFor={field.id}>Acepto los términos</Label>
          </div>
        );

      case "file":
        return (
          <div>
            <Input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileChange(field.id, file);
              }}
              required={field.required}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            {fileUploads[field.id] && (
              <p className="text-sm text-muted-foreground mt-1">
                Archivo seleccionado: {fileUploads[field.id].name}
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const getProgress = () => {
    if (!recaudo) return 0;
    const total = recaudo.fields.length;
    const completed = recaudo.fields.filter(field => {
      const value = responses[field.id];
      if (field.type === "checkbox") return value === true;
      if (field.type === "file") return !!fileUploads[field.id];
      return value && value.toString().trim() !== "";
    }).length;
    return (completed / total) * 100;
  };

  const isExpired = recaudo && new Date(recaudo.deadline) < new Date();

  if (loading) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-2xl">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-4 w-48 mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-[100px] w-full" />
          <Skeleton className="h-[80px] w-full" />
        </div>
      </div>
    );
  }

  if (!recaudo) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-2xl text-center">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Recaudo no encontrado</h2>
        <p className="text-muted-foreground mb-4">
          Este formulario no está disponible o ha sido eliminado
        </p>
        <Button onClick={() => router.back()}>Volver</Button>
      </div>
    );
  }

  if (recaudo.status !== "active") {
    return (
      <div className="container mx-auto py-6 px-4 max-w-2xl text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Formulario no disponible</h2>
        <p className="text-muted-foreground mb-4">
          Este formulario está {recaudo.status === "draft" ? "en borrador" : "cerrado"}
        </p>
        <Button onClick={() => router.back()}>Volver</Button>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-2xl text-center">
        <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">¡Respuesta enviada!</h2>
        <p className="text-muted-foreground mb-6">
          Tu respuesta ha sido registrada correctamente
        </p>
        <Button onClick={() => router.back()}>Volver al aula</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{recaudo.title}</h1>
        <p className="text-muted-foreground mb-4">
          {recaudo.classroom.name} - {recaudo.classroom.subject}
        </p>
        
        {recaudo.description && (
          <p className="text-sm mb-4">{recaudo.description}</p>
        )}

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>Límite: {new Date(recaudo.deadline).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{recaudo.fields.length} campos</span>
          </div>
        </div>

        {isExpired && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">
              ⚠️ Este formulario ha expirado. La fecha límite fue {new Date(recaudo.deadline).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span>Progreso</span>
          <span>{Math.round(getProgress())}%</span>
        </div>
        <Progress value={getProgress()} />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Información requerida
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {recaudo.fields.map((field) => (
              <div key={field.id}>
                <Label className="text-base font-medium">
                  {field.name}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </Label>
                <div className="mt-2">
                  {renderField(field)}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={submitting || isExpired || false}
            className="min-w-[120px]"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Enviar respuesta
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
