# Gestión de proyectos

Estoy desarrollando una aplicación para organizar actividades y dar seguimiento al trabajo de un equipo de arquitectos. El objetivo es centralizar la asignación de tareas, sus fechas límite y la colaboración entre supervisores y coordinadores.

## Estado del proyecto

Preparé la base con Next.js, TypeScript estricto y Tailwind CSS. La aplicación muestra una página inicial y cuenta con comandos para desarrollo, revisión de código, comprobación de tipos y compilación.

El login, las actividades y las conexiones con Supabase y S3 se incorporarán en las siguientes etapas.

## Tecnologías

- Next.js 16 y React 19.
- TypeScript y Tailwind CSS 4.
- ESLint con las reglas de Next.js y TypeScript.

Supabase está previsto para autenticación, base de datos y actualización de vistas en tiempo real; Amazon S3, para los archivos privados. Sus clientes se añadirán junto con los flujos que los utilicen.

## Desarrollo local

Necesitas Node.js 20.9 o superior y npm. El archivo `package-lock.json` fija las versiones instaladas.

```bash
git clone https://github.com/steveespinoza/GESTI-N-DE-PROYECTOS.git
cd GESTI-N-DE-PROYECTOS
npm ci
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). La página inicial funciona sin credenciales ni servicios externos.

## Variables de entorno

`.env.example` incluye las variables previstas para las próximas integraciones. Cuando configures esos servicios, copia el archivo a `.env.local` y completa los valores de tu entorno.

En PowerShell:

```powershell
Copy-Item .env.example .env.local
```

En macOS o Linux:

```bash
cp .env.example .env.local
```

| Variables | Uso previsto |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Conexión pública del cliente de Supabase. |
| `SUPABASE_SERVICE_ROLE_KEY` | Administración de cuentas desde el servidor. |
| `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET_NAME` | Acceso del servidor al bucket privado. |
| `S3_ALLOWED_ORIGINS` | Orígenes permitidos para las subidas; inicialmente `http://localhost:3000`. |
| `PERFORMANCE_LOGS` | Activación de los registros de rendimiento cuando se implemente la instrumentación. |

Las claves administrativas y de AWS deben mantenerse en el servidor. `.env.local` y los demás archivos de entorno privados están excluidos de Git; `.env.example` solo contiene nombres y valores de ejemplo.

## Comprobaciones

```bash
npm run lint
npm run typecheck
npm run build
```

- `lint` revisa el código con ESLint.
- `typecheck` genera los tipos de rutas de Next.js y ejecuta TypeScript sin emitir archivos JavaScript.
- `build` crea la compilación de producción.

Para ejecutar esa compilación localmente:

```bash
npm run start
```

## Estructura inicial

```text
app/
  globals.css    Estilos globales y entrada de Tailwind CSS.
  layout.tsx     Idioma, metadatos y estructura de la página.
  page.tsx       Página inicial.
```

## Alcance

La aplicación contempla un tablero de actividades, subtareas, comentarios, adjuntos, calendario y reportes. Los permisos dependerán del rol y las fechas de trabajo se manejarán según la zona horaria de Lima.
