# API Integration Test Guide

## Configuración Inicial

1. **Verificar que el backend esté ejecutándose:**
   ```bash
   cd projects_back
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Verificar que el frontend esté ejecutándose:**
   ```bash
   cd projects_front
   npm run dev
   ```

## Pruebas de Autenticación

### 1. Registro de Usuario
- Ir a: http://localhost:3000/register
- Llenar el formulario:
  - Nombre: Test User
  - Email: test@example.com
  - Contraseña: password123
  - Confirmar contraseña: password123
- Click en "Crear Cuenta"
- Verificar redirección a login

### 2. Login
- Ir a: http://localhost:3000/login
- Credenciales:
  - Email: test@example.com
  - Contraseña: password123
- Click en "Iniciar Sesión"
- Verificar redirección al dashboard

### 3. Logout
- Click en el botón "Salir" en el header
- Verificar redirección al login

## Pruebas de API

### 1. Verificar Endpoints Disponibles
```bash
# Health check
curl -X GET "http://localhost:8000/health"

# Login endpoint
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: multipart/form-data" \
  -F "username=admin@example.com" \
  -F "password=admin123"
```

### 2. Test de Colaboradores
```bash
# Get colaboradores (requires authentication)
curl -X GET "http://localhost:8000/api/v1/colaboradores" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Create colaborador
curl -X POST "http://localhost:8000/api/v1/colaboradores" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "cargo": "Desarrollador",
    "salario_por_hora": 15000
  }'
```

## Archivos Creados

### Servicios API
- `lib/api.ts` - Configuración base de Axios
- `services/auth.ts` - Servicio de autenticación
- `services/colaboradores.ts` - Servicio de colaboradores
- `services/clientes.ts` - Servicio de clientes
- `services/proyectos.ts` - Servicio de proyectos
- `services/cotizaciones.ts` - Servicio de cotizaciones
- `services/costos-rigidos.ts` - Servicio de costos rígidos
- `services/reportes.ts` - Servicio de reportes

### Hooks React Query
- `hooks/use-colaboradores.ts` - Hooks para colaboradores
- `hooks/use-clientes.ts` - Hooks para clientes
- `hooks/use-proyectos.ts` - Hooks para proyectos
- `hooks/use-cotizaciones.ts` - Hooks para cotizaciones
- `hooks/use-costos-rigidos.ts` - Hooks para costos rígidos
- `hooks/use-reportes.ts` - Hooks para reportes

### Contextos y Providers
- `contexts/auth-context.tsx` - Contexto de autenticación
- `providers/query-provider.tsx` - Provider de React Query

### Páginas
- `app/login/page.tsx` - Página de login
- `app/register/page.tsx` - Página de registro
- `app/page.tsx` - Página principal (redirección)

### Componentes
- `components/auth-layout.tsx` - Layout para autenticación
- `components/header.tsx` - Header actualizado con logout

### Configuración
- `.env.local` - Variables de entorno
- `middleware.ts` - Middleware de protección de rutas

## Funcionalidades Implementadas

✅ **Autenticación completa:**
- Login con email/password
- Registro de nuevos usuarios
- Logout
- Protección de rutas
- Manejo de tokens JWT

✅ **Integración API completa:**
- Todos los endpoints del backend integrados
- Servicios tipados con TypeScript
- Manejo de errores
- Interceptores para tokens

✅ **React Query:**
- Hooks para todas las entidades
- Cache y invalidación automática
- Mutations para operaciones CRUD
- Loading y error states

✅ **UI/UX:**
- Páginas de login/registro responsivas
- Header con información de usuario
- Redirecciones automáticas
- Loading states

## Próximos Pasos

1. Implementar páginas para cada módulo usando los hooks creados
2. Agregar validación de formularios con react-hook-form
3. Implementar notificaciones toast para feedback
4. Agregar manejo de errores más granular
5. Implementar refresh de tokens automático
