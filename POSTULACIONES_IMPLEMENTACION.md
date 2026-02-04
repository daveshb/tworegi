# Sistema de Postulación de Planchas - Implementación Completada

## 📋 Resumen Ejecutivo

Se ha implementado un sistema completo de postulación de planchas para 3 tipos de elecciones: Junta Directiva, Control Social y Comité de Apelaciones. El sistema incluye validación en tiempo real, carga de documentos a Cloudinary, y almacenamiento en bases de datos MongoDB.

---

## 📁 Archivos Creados

### Base de Datos - Modelos Mongoose
```
/src/database/models/
├── archivoAdjunto.ts          # Schema para almacenar metadata de archivos
├── integrante.ts              # Schema para integrantes de planchas
├── postulacionJunta.ts        # Colección: postulaciones_junta_directiva (10 integrantes)
├── postulacionControl.ts      # Colección: postulaciones_control_social (6 integrantes)
└── postulacionApelaciones.ts  # Colección: postulaciones_comite_apelaciones (3 integrantes)
```

### Validación (Zod)
```
/src/lib/
└── validators/
    └── postulacionesSchemas.ts  # Schemas Zod compartidos frontend/backend
```

### Utilidades
```
/src/lib/
└── cloudinary.ts              # Funciones para firmar uploads a Cloudinary (server-side)
```

### API Routes (Next.js App Router)
```
/src/app/api/
├── asociados/
│   └── estado/route.ts         # GET: /api/asociados/estado?cedula=...
├── uploads/
│   └── signature/route.ts      # POST: /api/uploads/signature
└── postulaciones/
    ├── junta-directiva/
    │   ├── route.ts            # POST/GET
    │   └── [id]/route.ts       # PUT/POST (enviar)
    ├── control-social/
    │   ├── route.ts            # POST/GET
    │   └── [id]/route.ts       # PUT/POST (enviar)
    └── comite-apelaciones/
        ├── route.ts            # POST/GET
        └── [id]/route.ts       # PUT/POST (enviar)
```

### Componentes UI (React + React Hook Form)
```
/src/components/postulaciones/
├── index.ts                    # Exportaciones
├── file-upload.tsx             # Componente para upload a Cloudinary
├── cedula-validation.tsx       # Validación de cédula contra backend
├── lider-form.tsx              # Formulario del líder (paso 1)
├── integrantes-form.tsx        # Formulario de integrantes (paso 2)
└── declarations-form.tsx       # Declaraciones obligatorias (paso 3)
```

### Página Principal
```
/src/app/postulaciones/
└── nueva/page.tsx              # Página con flujo de 3 pasos
```

---

## ⚙️ Configuración Requerida

### Variables de Entorno (.env.local)

```env
# MongoDB
MONGODB_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net/dbname

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=tu_cloud_name
NEXT_PUBLIC_CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

### Instalaciones de NPM

Se han instalado:
```bash
npm install react-hook-form zod @hookform/resolvers
```

---

## 🔄 Flujo de Funcionamiento

### 1️⃣ Selección de Tipo de Postulación
- Usuario elige entre 3 opciones: Junta Directiva, Control Social, Comité de Apelaciones
- Cada tipo tiene restricciones específicas de integrantes

### 2️⃣ Paso 1: Datos del Líder
- Ingresa cédula
- Se consulta `/api/asociados/estado?cedula=...` para validar estado:
  - **HABIL**: Se habilita el formulario completo
  - **NO_REGISTRADO**: Se bloquea, solicita otra cédula
  - **INHABIL**: Se bloquea, muestra motivo
- Se completan campos personales y se cargan documentos

### 3️⃣ Paso 2: Integrantes
- Se agregan integrantes hasta completar el cupo:
  - **Junta Directiva**: 9 más (5 principales + 5 suplentes)
  - **Control Social**: 5 más (3 principales + 3 suplentes)
  - **Apelaciones**: 2 más (miembros, sin distinción)
- Mismo flujo de validación por cédula para cada integrante
- Carga de documentos específicos por tipo

### 4️⃣ Paso 3: Declaraciones Globales
- 3 checkboxes obligatorios (deben ser "Sí"):
  - Compromisos institucionales
  - Autorización de antecedentes
  - Responsabilidad del líder
- Resumen de la postulación
- Opción de enviar o guardar como borrador

### 5️⃣ Almacenamiento
- **Guardar Borrador**: `PUT/POST` a endpoint correspondiente con `estado: "DRAFT"`
- **Enviar Postulación**: `POST` a endpoint con validaciones server-side
  - Valida cupos exactos
  - Valida cédulas únicas
  - Valida que todas las declaraciones sean "Sí"
  - Cambia estado a "ENVIADA"

---

## 📋 Reglas de Negocio Implementadas

### Distribución de Integrantes
- **Junta Directiva**: 10 totales (1 líder + 5 principales + 4 suplentes) ❌ Error: Debe ser (1 líder + 5 principales + 5 suplentes)
  - Corrección: 10 totales = 1 líder + 9 integrantes = 5 principales + 5 suplentes
- **Control Social**: 6 totales (1 líder + 3 principales + 3 suplentes)
- **Apelaciones**: 3 totales (1 líder + 2 miembros)

### Documentos Requeridos

**Todos los tipos:**
- Cédula (PDF)

**Junta Directiva y Control Social:**
- Certificado de Economía Solidaria (PDF) **O**
- Compromiso Firmado (PDF)

**Solo Junta Directiva:**
- Soporte Formación Académica (PDF)

**Apelaciones:**
- Solo cédula (no requiere economía solidaria ni formación)

### Validaciones
- No permitir envío incompleto
- Cédulas únicas dentro de la misma plancha
- Emails válidos
- Celulares numéricos
- Documentos presentes según tipo
- Todas las declaraciones obligatorias deben ser "Sí" para enviar

---

## 🔐 Seguridad - Upload a Cloudinary

1. **Frontend**: Solicita firma a `/api/uploads/signature`
2. **Backend** (Server-only):
   - Genera timestamp
   - Crea firma SHA-1 con `CLOUDINARY_API_SECRET`
   - Retorna: `{ timestamp, signature, apiKey, cloudName, folder }`
3. **Frontend**: Usa firma para upload directo a Cloudinary
4. **Base de Datos**: Almacena solo metadata, no binarios

---

## 🎯 Características Principales

### ✅ Validación en Dos Capas
- **Frontend**: Zod + React Hook Form (UX inmediata)
- **Backend**: Mongoose + Zod (seguridad)

### ✅ Interfaz de Usuario
- Flujo multi-paso intuitivo
- Indicadores visuales de estado
- Mensajes de error detallados
- Accesibilidad (labels, aria-describedby, roles)

### ✅ Upload de Archivos
- Validación de tamaño (máximo 10MB)
- Tipos de archivo restringidos (PDF)
- Progreso visual
- Manejo de errores

### ✅ Persistencia
- Opción de guardar borradores
- Recuperación de postulaciones iniciadas
- Cambio de estado DRAFT → ENVIADA

---

## 🚀 Uso

### Para Acceder a la Página
```
http://localhost:3000/postulaciones/nueva
```

### Para Consultar Estado de Postulaciones (API)
```bash
# Obtener todas las postulaciones de Junta Directiva
curl http://localhost:3000/api/postulaciones/junta-directiva

# Obtener una postulación específica
curl "http://localhost:3000/api/postulaciones/junta-directiva?id=ID_AQUI"

# Validar cédula
curl "http://localhost:3000/api/asociados/estado?cedula=1234567890"
```

---

## ⚠️ Notas Importantes

1. **Cloudinary**: Asegúrate de que `CLOUDINARY_API_SECRET` solo esté en variables de entorno server-side (.env.local)

2. **MongoDB**: Verifica que MongoDB Atlas esté correctamente configurado y accesible desde el backend

3. **Mock Data**: Actualmente `/api/asociados/estado` devuelve datos mock:
   - Cédulas terminadas en "0" → INHABIL
   - Cédulas terminadas en "5" → NO_REGISTRADO
   - Otras → HABIL
   
   Debes conectar la colección real de asociados en producción.

4. **Validaciones Server-side**: Todos los schemas Zod se validan tanto en frontend como en backend para máxima seguridad.

---

## 📦 Dependencias Instaladas

```json
{
  "react-hook-form": "^7.x",
  "zod": "^3.x",
  "@hookform/resolvers": "^3.x",
  "mongoose": "^8.19.2",
  "cloudinary": "^2.8.0"
}
```

---

## 🔄 Proximos Pasos (Opcionales)

1. Conectar colección real de asociados
2. Implementar panel de administración para revisar postulaciones
3. Agregar notificaciones por email
4. Implementar autenticación para asociados
5. Agregar descarga de reportes

---

Implementación completada ✅
