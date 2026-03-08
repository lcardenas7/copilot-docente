# 🎓 Copilot del Docente

> **El asistente de IA que prepara tus clases en minutos.**

Plataforma SaaS de productividad docente potenciada por IA para Latinoamérica.

## 🚀 Características

- **Generador de Guías de Clase** - Planeaciones completas con objetivos, actividades y evaluación
- **Generador de Exámenes** - Preguntas automáticas con respuestas y explicaciones
- **Copilot Conversacional** - Asistente pedagógico para resolver dudas
- **Banco de Preguntas** - Organiza y reutiliza tus preguntas
- **Biblioteca de Plantillas** - Guarda y duplica tus mejores recursos
- **Aulas Virtuales** - Gestiona clases y estudiantes (próximamente)

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **UI:** Tailwind CSS + shadcn/ui
- **Base de datos:** PostgreSQL (Supabase)
- **Auth:** NextAuth.js v5 (Google OAuth)
- **IA:** OpenAI API (gpt-4o-mini)
- **Deploy:** Vercel

## 📦 Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/tu-usuario/copilot-docente.git
cd copilot-docente
```

2. Instala dependencias:
```bash
npm install
```

3. Configura las variables de entorno:
```bash
cp .env.example .env.local
```

4. Edita `.env.local` con tus credenciales:
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="tu-secret"
GOOGLE_CLIENT_ID="tu-client-id"
GOOGLE_CLIENT_SECRET="tu-client-secret"
OPENAI_API_KEY="sk-..."
```

5. Genera el cliente de Prisma:
```bash
npx prisma generate
```

6. Ejecuta las migraciones:
```bash
npx prisma db push
```

7. Inicia el servidor de desarrollo:
```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🔧 Configuración de Servicios

### Supabase (Base de datos)
1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Copia la URL de conexión a `DATABASE_URL`

### Google OAuth
1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un proyecto y habilita Google+ API
3. Configura OAuth consent screen
4. Crea credenciales OAuth 2.0
5. Agrega `http://localhost:3000/api/auth/callback/google` como redirect URI

### OpenAI
1. Crea una cuenta en [platform.openai.com](https://platform.openai.com)
2. Genera una API key
3. Agrega créditos ($5-10 para empezar)

## 📁 Estructura del Proyecto

```
src/
├── app/                    # Next.js App Router
│   ├── (landing)/          # Páginas públicas
│   ├── dashboard/          # Dashboard del docente
│   └── api/                # API Routes
├── components/             # Componentes React
│   ├── ui/                 # shadcn/ui
│   ├── layout/             # Navbar, Sidebar
│   └── auth/               # Autenticación
├── lib/                    # Utilidades
│   ├── ai/                 # Servicio de IA
│   │   ├── service.ts      # Funciones de generación
│   │   ├── prompts/        # Prompts de IA
│   │   └── openai.ts       # Cliente OpenAI
│   ├── auth.ts             # Configuración NextAuth
│   ├── db.ts               # Cliente Prisma
│   └── constants.ts        # Constantes (materias, grados)
└── types/                  # Tipos TypeScript
```

## 🚢 Deploy

### Vercel (Recomendado)
1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno
3. Deploy automático en cada push

## 📄 Licencia

MIT

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor abre un issue primero para discutir cambios importantes.
