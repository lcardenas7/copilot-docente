// Subjects available in the platform
export const SUBJECTS = [
  { value: "matematicas", label: "Matemáticas" },
  { value: "lenguaje", label: "Lenguaje" },
  { value: "ciencias_naturales", label: "Ciencias Naturales" },
  { value: "ciencias_sociales", label: "Ciencias Sociales" },
  { value: "ingles", label: "Inglés" },
  { value: "tecnologia", label: "Tecnología e Informática" },
  { value: "educacion_fisica", label: "Educación Física" },
  { value: "artes", label: "Artes" },
  { value: "etica", label: "Ética y Valores" },
  { value: "religion", label: "Religión" },
  { value: "filosofia", label: "Filosofía" },
  { value: "quimica", label: "Química" },
  { value: "fisica", label: "Física" },
  { value: "biologia", label: "Biología" },
] as const;

// Grades available
export const GRADES = [
  { value: "preescolar", label: "Preescolar" },
  { value: "1", label: "1° Primaria" },
  { value: "2", label: "2° Primaria" },
  { value: "3", label: "3° Primaria" },
  { value: "4", label: "4° Primaria" },
  { value: "5", label: "5° Primaria" },
  { value: "6", label: "6° Secundaria" },
  { value: "7", label: "7° Secundaria" },
  { value: "8", label: "8° Secundaria" },
  { value: "9", label: "9° Secundaria" },
  { value: "10", label: "10° Media" },
  { value: "11", label: "11° Media" },
  { value: "universidad", label: "Universidad" },
] as const;

// Methodologies
export const METHODOLOGIES = [
  { value: "TRADITIONAL", label: "Tradicional", description: "Clase magistral con explicación directa" },
  { value: "PBL", label: "ABP (Aprendizaje Basado en Proyectos)", description: "Proyectos prácticos y colaborativos" },
  { value: "FLIPPED", label: "Aula Invertida", description: "Estudio en casa, práctica en clase" },
  { value: "COLLABORATIVE", label: "Aprendizaje Colaborativo", description: "Trabajo en equipos" },
  { value: "GAMIFICATION", label: "Gamificación", description: "Elementos de juego y competencia" },
] as const;

// Bloom's Taxonomy levels
export const BLOOM_LEVELS = [
  { value: "REMEMBER", label: "Recordar", description: "Memorizar y reconocer información", verbs: ["definir", "listar", "nombrar", "identificar"] },
  { value: "UNDERSTAND", label: "Comprender", description: "Explicar ideas y conceptos", verbs: ["explicar", "describir", "resumir", "interpretar"] },
  { value: "APPLY", label: "Aplicar", description: "Usar información en situaciones nuevas", verbs: ["aplicar", "resolver", "usar", "demostrar"] },
  { value: "ANALYZE", label: "Analizar", description: "Descomponer información en partes", verbs: ["analizar", "comparar", "contrastar", "examinar"] },
  { value: "EVALUATE", label: "Evaluar", description: "Justificar decisiones o juicios", verbs: ["evaluar", "juzgar", "criticar", "argumentar"] },
  { value: "CREATE", label: "Crear", description: "Producir trabajo original", verbs: ["crear", "diseñar", "construir", "proponer"] },
] as const;

// Difficulty levels
export const DIFFICULTIES = [
  { value: "EASY", label: "Fácil", description: "Nivel básico" },
  { value: "MEDIUM", label: "Medio", description: "Nivel intermedio" },
  { value: "HARD", label: "Difícil", description: "Nivel avanzado" },
] as const;

// Question types
export const QUESTION_TYPES = [
  { value: "MULTIPLE_CHOICE", label: "Selección múltiple", description: "4 opciones, 1 correcta" },
  { value: "TRUE_FALSE", label: "Verdadero/Falso", description: "Afirmación a validar" },
  { value: "OPEN", label: "Respuesta abierta", description: "Respuesta libre" },
  { value: "FILL_BLANK", label: "Completar espacios", description: "Llenar espacios en blanco" },
] as const;

// Plan limits
export const PLAN_LIMITS = {
  FREE: {
    guidesPerMonth: 5,
    examsPerMonth: 2,
    aiRequestsPerMonth: 20,
    questionsTotal: 50,
    classrooms: 1,
    studentsPerClassroom: 10,
    templates: 5,
    copilotMessagesPerDay: 5,
  },
  PRO: {
    guidesPerMonth: -1, // unlimited
    examsPerMonth: -1,
    aiRequestsPerMonth: -1,
    questionsTotal: -1,
    classrooms: -1,
    studentsPerClassroom: 50,
    templates: -1,
    copilotMessagesPerDay: -1,
  },
  SCHOOL: {
    guidesPerMonth: -1,
    examsPerMonth: -1,
    aiRequestsPerMonth: -1,
    questionsTotal: -1,
    classrooms: -1,
    studentsPerClassroom: -1,
    templates: -1,
    copilotMessagesPerDay: -1,
  },
} as const;

// Countries
export const COUNTRIES = [
  { value: "Colombia", label: "Colombia" },
  { value: "México", label: "México" },
  { value: "Argentina", label: "Argentina" },
  { value: "Chile", label: "Chile" },
  { value: "Perú", label: "Perú" },
  { value: "Ecuador", label: "Ecuador" },
  { value: "Venezuela", label: "Venezuela" },
  { value: "República Dominicana", label: "República Dominicana" },
  { value: "Panamá", label: "Panamá" },
  { value: "Costa Rica", label: "Costa Rica" },
] as const;

// Duration options for classes (in minutes)
export const DURATIONS = [
  { value: 30, label: "30 minutos" },
  { value: 45, label: "45 minutos" },
  { value: 60, label: "1 hora" },
  { value: 90, label: "1 hora 30 min" },
  { value: 120, label: "2 horas" },
] as const;
