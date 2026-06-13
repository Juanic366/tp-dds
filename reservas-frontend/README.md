# Reservas Frontend

Frontend React + Vite para el sistema de gestión de reservas de aulas (TP DDS 2026 - 3K1).

## Tecnologías

- **React 18** con hooks funcionales
- **Vite 5** como bundler
- **React Router v6** para navegación SPA
- **Axios** para todas las llamadas HTTP
- CSS personalizado (sin frameworks externos)

## Instalación y ejecución

```bash
# Instalar dependencias
npm install

# Desarrollo (con proxy a backend en :3000)
npm run dev

# Build producción
npm run build
```

El frontend corre en `http://localhost:5173` y hace proxy de `/api` al backend en `http://localhost:3000`.

## Rutas del frontend

| Ruta | Descripción | Protección |
|------|-------------|------------|
| `/login` | Inicio de sesión | Pública |
| `/register` | Registro de usuario | Pública |
| `/reservas` | Listado con filtros y paginación | Autenticado |
| `/reservas/nueva` | Formulario de alta | Autenticado |
| `/reservas/:id` | Detalle + historial + acciones | Autenticado |
| `/reservas/:id/editar` | Formulario de edición | Autenticado (propietario/admin) |
| `/resumen` | Panel administrativo | Solo admin |
| `*` | Página 404 | — |

## Usuarios de prueba (semilla backend)

| Email | Contraseña | Rol |
|-------|-----------|-----|
| admin@dds.com | admin123 | admin |
| usuario@dds.com | user123 | usuario |

## Estructura de carpetas

```
src/
├── components/       # Componentes reutilizables
│   ├── Alert.jsx          # Mensajes de error/éxito
│   ├── Historial.jsx      # Timeline de cambios
│   ├── Layout.jsx         # Shell con sidebar
│   ├── Pagination.jsx     # Paginación
│   ├── ReservasFilters.jsx # Barra de filtros
│   ├── ReservasTable.jsx  # Tabla con acciones
│   └── StatusBadge.jsx    # Badge de estado
├── context/
│   └── AuthContext.jsx    # JWT, usuario, rol — persiste en localStorage
├── hooks/
│   └── useReservas.js     # Hook para listar/paginar reservas
├── pages/
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── ReservasPage.jsx        # Listado principal
│   ├── ReservaDetallePage.jsx  # Detalle + historial
│   ├── ReservaFormPage.jsx     # Alta / edición
│   ├── ResumenPage.jsx         # Panel admin
│   └── NotFoundPage.jsx
├── router/
│   └── AppRouter.jsx      # Rutas protegidas, wildcard *
└── services/
    ├── api.js             # Instancia Axios + interceptors
    ├── authService.js     # register, login
    ├── aulasService.js    # listar aulas
    └── reservasService.js # CRUD completo de reservas
```

## Autenticación y JWT

- El token se obtiene en login/registro y se guarda en `localStorage`.
- `AuthContext` lo persiste entre recargas.
- El interceptor de Axios agrega `Authorization: Bearer <token>` en cada request.
- Las rutas protegidas redirigen a `/login` si no hay sesión activa.
- El panel `/resumen` redirige a `/reservas` si el rol no es `admin`.

## Validaciones en frontend

El formulario de reserva valida localmente **antes** de llamar a la API:

- Aula seleccionada (requerida)
- Fecha requerida, no en el pasado
- Hora inicio entre 08:00 y 22:00
- Hora fin > hora inicio y ≤ 22:00
- Cantidad de personas ≤ capacidad del aula seleccionado
- Motivo requerido

Estas validaciones anticipan errores pero **no reemplazan** la validación del backend.

## Manejo de errores de API

El interceptor en `api.js` normaliza todos los errores de Axios, extrayendo `error.response.data.error` o `.message`. Los componentes muestran mensajes comprensibles cerca de la acción que falló.

## Capa de servicios Axios

Todas las llamadas HTTP están en `src/services/`. Los componentes **nunca** llaman a Axios directamente:

```js
// ✓ Correcto — desde un componente
import { reservasService } from '../services/reservasService'
await reservasService.aprobar(id)

// ✗ Incorrecto — no hacer esto en componentes
import axios from 'axios'
await axios.patch(`/api/reservas/${id}/aprobar`)
```

## Permisos visibles según rol

| Acción | Usuario | Admin |
|--------|---------|-------|
| Ver reservas propias | ✓ | ✓ |
| Ver todas las reservas | — | ✓ |
| Crear reserva | ✓ | ✓ |
| Editar reserva propia (pendiente) | ✓ | ✓ |
| Editar cualquier reserva | — | ✓ |
| Cancelar propia (pendiente/aprobada) | ✓ | ✓ |
| Cancelar cualquier reserva | — | ✓ |
| Aprobar / Rechazar | — | ✓ |
| Panel resumen | — | ✓ |

## Limitaciones conocidas

- Tests de frontend no incluidos (el enunciado los marca como opcionales).
- Si el backend no responde, los errores de red muestran el mensaje de Axios genérico.
- El filtro de fecha no valida rangos (solo fecha exacta según endpoint del backend).
