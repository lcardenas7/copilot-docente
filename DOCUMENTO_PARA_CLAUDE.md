# Documento Técnico para Claude - Copilot del Docente

## 📋 Resumen del Proyecto

**Nombre:** Copilot del Docente  
**Descripción:** Plataforma SaaS de productividad docente potenciada por IA para LATAM  
**Stack:** Next.js 14, React 18, Tailwind CSS, shadcn/ui, Prisma, PostgreSQL (Supabase), NextAuth.js v5, Vercel  
**Modelo IA:** Groq Llama 3.3 70B Versatile  

---

## 🚀 Estado Actual del Proyecto

### ✅ Módulos Completados

#### 1. **MVP Core Funcional**
- ✅ Autenticación con Google OAuth
- ✅ Generación de guías de clase con IA
- ✅ Generación de exámenes con IA
- ✅ Dashboard principal
- ✅ Base de datos PostgreSQL con Prisma
- ✅ Deploy en Vercel

#### 2. **Mejoras Implementadas**
- ✅ **Guías mejoradas con contenido conceptual expandible**
  - Cada momento tiene sección "📚 Contenido para el Docente" con:
  - Conceptos clave, explicación profunda, errores comunes
  - Ejemplos del mundo real, ejemplos paso a paso
  - Ejercicios resueltos, preguntas de repaso
  - Conexión con próxima clase, representaciones visuales

- ✅ **Recursos mejorados**
  - Ya no genera URLs falsas
  - Usa términos de búsqueda para YouTube y plataformas
  - Links directos a búsquedas funcionales

- ✅ **Generador de exámenes avanzado**
  - 8 tipos de preguntas configurables:
    - MULTIPLE_CHOICE, MULTIPLE_ANSWER, TRUE_FALSE
    - FILL_BLANK, MATCHING, ORDERING
    - SHORT_ANSWER, OPEN
  - Selección múltiple de tipos
  - Instrucciones adicionales personalizables
  - Rúbricas para preguntas abiertas
  - Toggle para mostrar/ocultar respuestas

#### 3. **Infraestructura de IA**
- ✅ Sistema de caché para reducir costos
- ✅ Tracking de generaciones para analíticas
- ✅ Validación Zod para respuestas de IA
- ✅ Manejo robusto de errores

---

## 📁 Estructura de Archivos Clave

### `/src/lib/ai/`
```
├── service.ts          # Orquestador principal con caché y tracking
├── groq.ts            # Cliente Groq Llama 3.3
├── schemas.ts         # Validación Zod para respuestas
├── prompts/
│   ├── guide.ts       # Prompt mejorado para guías
│   └── exam.ts        # Prompt para 8 tipos de preguntas
```

### `/src/app/dashboard/`
```
├── guides/
│   └── new/page.tsx   # Generador de guías con contenido conceptual
├── exams/
│   └── new/page.tsx   # Generador de exámenes avanzado
└── layout.tsx         # Layout del dashboard
```

### `/src/lib/auth.ts`
Configuración NextAuth.js v5 con Google OAuth

---

## 🔧 Configuración Actual

### Variables de Entorno
```bash
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="https://copilot-docente.vercel.app"
NEXTAUTH_SECRET="..."

# Google OAuth
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# IA
GROQ_API_KEY="gsk_..."
```

### Google Cloud Console
- ✅ Orígenes JS: `http://localhost:3000`, `https://copilot-docente.vercel.app`
- ✅ Redirect URIs: `/api/auth/callback/google` para ambos dominios

---

## 🎯 Problemas Conocidos

### 1. **OAuth en Producción**
- **Estado:** Configuración correcta, pero usuario reporta `redirect_uri_mismatch`
- **Acción requerida:** Usuario debe esperar 2-5 minutos después de configurar Google Console

### 2. **Validación de IA**
- **Solución implementada:** Agregado Zod para validar respuestas
- **Archivos:** `schemas.ts`, actualizado `service.ts`

---

## 🔄 Flujo de Usuario Actual

### Generar Guía:
1. Docente ingresa datos (materia, grado, tema, duración)
2. Puede agregar contexto adicional y subir documento
3. IA genera guía completa con:
   - Objetivos, competencias, estándares
   - 4 momentos con guion detallado
   - **Contenido conceptual expandible** (nuevo)
   - Recursos con términos de búsqueda
   - Evaluación con rúbrica
   - Adaptaciones para diferentes estudiantes

### Generar Examen:
1. Docente selecciona parámetros
2. Elige múltiples tipos de preguntas
3. Agrega instrucciones adicionales
4. IA genera examen con:
   - 8 tipos de preguntas configurables
   - Rúbricas para preguntas abiertas
   - Evaluación completa
   - Opción de mostrar/ocultar respuestas

---

## 📊 Modelos de Datos Clave

### Prisma Schema (resumen)
```prisma
model User {
  id    String @id @default(cuid())
  email String @unique
  name  String
  role  Role   @default(STUDENT)
  plan  Plan   @default(FREE)
  // ... relaciones
}

model AIGeneration {
  id       String @id @default(cuid())
  userId   String
  type     String // GUIDE, EXAM, etc.
  prompt   String
  result   Json
  model    String
  cached   Boolean @default(false)
  // ...
}

model AICache {
  cacheKey  String @id
  result    Json
  expiresAt DateTime
  hits      Int    @default(0)
}
```

---

## 🎨 Componentes UI Importantes

### ConceptualContentSection
- Componente expandible para contenido teórico
- Colores distintivos por sección
- Animaciones suaves
- Responsive design

### ExamQuestionRenderer
- Renderiza 8 tipos de preguntas
- Soporta selección múltiple
- Toggle de respuestas
- Visualización rica

---

## 🚀 Próximos Pasos Planificados

### Inmediatos:
1. **Resolver OAuth** - Esperar confirmación del usuario
2. **Probar validación Zod** - Verificar que no genere contenido en blanco

### Futuro (Fase 2):
1. **Integración Examen → Aula Virtual**
   - Modelo Classroom, Assignment, Submission
   - Flujo de publicación
   - Calificación automática
   
2. **Configurar PWA**
   - Manifest.json
   - Service worker
   - Instalación como app

---

## 📈 Métricas y Analytics

### Tracking Implementado:
- Requests de IA por usuario/mes
- Guías y exámenes creados
- Cache hits/misses
- Costos de IA (aunque Groq es económico)

### Dashboard futuro:
- Uso por materia/grado
- Tiempos de generación
- Tasa de éxito/fallo

---

## 🛠️ Debugging y Troubleshooting

### Si la IA genera contenido en blanco:
1. **Verificar logs en Vercel**
2. **Revisar respuesta cruda de Groq**
3. **Validación Zod mostrará error específico**
4. **Probar con diferentes prompts**

### Si OAuth falla:
1. **Verificar NEXTAUTH_URL en Vercel**
2. **Confirmar URIs en Google Console**
3. **Esperar propagación (2-5 min)**
4. **Hacer redeploy**

---

## 📝 Notas para Claude

### Contexto del Usuario:
- Es docente en LATAM
- Necesita herramientas prácticas
- Valora contenido conceptual profundo
- Quiere integración con aula virtual

### Decisiones de Diseño:
- **Groq vs GPT-4o:** Más rápido y económico
- **Contenido expandible:** No sobrecargar guion principal
- **Términos de búsqueda:** Evitar URLs falsas
- **Validación Zod:** Robustez y debugging

### Prioridades Actuales:
1. Funcionalidad básica 100%
2. Experiencia del docente
3. Costos controlados
4. Preparar para monetización

---

## 🤝 Cómo Continuar

### Para Claude:
1. Revisa la validación Zod implementada
2. Sugiere mejoras al prompt si es necesario
3. Ayuda a diseñar el modelo de aula virtual
4. Optimiza prompts para reducir errores

### Para el Equipo:
1. Probar la validación Zod en producción
2. Recopilar feedback de docentes
3. Planificar integración aula virtual
4. Preparar documentación para usuarios

---

## 📞 Contacto y Soporte

- **Deploy:** https://copilot-docente.vercel.app
- **Repo:** GitHub (privado)
- **Issues:** Crear ticket en GitHub
- **Urgente:** Contactar directo al equipo

---

*Última actualización: 15 de marzo de 2026*
