# Control de Actividades

Estoy preparando un tablero personal para organizar tareas en Pendiente, En curso y Completadas. El comportamiento previsto está descrito en los [requisitos funcionales](docs/02-Requisitos/Requisitos-Funcionales.md); la aplicación todavía muestra una página inicial y las funciones del tablero están pendientes de implementación.

## Tecnologías

- Next.js 16 y React 19.
- TypeScript estricto y Tailwind CSS 4.
- ESLint y CLI de Supabase.
- Supabase para guardar las tareas durante el desarrollo; localStorage para todas las tareas de la versión final, sin inicio de sesión ni sincronización entre dispositivos.
- Amazon S3 privado para archivos y Vercel como destino previsto de despliegue.

Las dependencias y sus versiones se conservan en `package.json` y `package-lock.json`. Los clientes de Supabase y S3 todavía no están integrados en la aplicación.

## Desarrollo local

Necesitas Node.js 20.9 o superior y npm. Desde la carpeta del repositorio:

```bash
npm ci
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). La página inicial funciona sin credenciales ni servicios externos.

## Variables de entorno

`.env.example` conserva las variables previstas para Supabase y S3. Para configurar esos servicios, copia el archivo a `.env.local` y completa los valores del entorno elegido.

En PowerShell:

```powershell
Copy-Item .env.example .env.local
```

En macOS o Linux:

```bash
cp .env.example .env.local
```

Las claves administrativas y de AWS deben mantenerse en el servidor. Los archivos privados de entorno están excluidos de Git.

La configuración local de Supabase se conserva en `supabase/config.toml`. El repositorio no tiene una vinculación local a un proyecto remoto ni migraciones funcionales pendientes.

## Comprobaciones

```bash
npm run lint
npm run typecheck
npm run build
```

`lint` revisa el código, `typecheck` comprueba los tipos y `build` genera la compilación de producción. Para ejecutar esa compilación:

```bash
npm run start
```

## Estructura

```text
app/                    Página inicial, layout y estilos globales.
docs/
  00-Inicio/            Problema y objetivo del sistema.
  01-Usuarios/          Actor y perfil del usuario.
  02-Requisitos/        Requisitos funcionales y no funcionales.
  03-Alcance/           Funciones incluidas y límites de la primera entrega.
  04-Casos de Uso/      Historias de usuario y criterios de aceptación.
supabase/config.toml    Configuración local de Supabase.
```

## Documentación

- [Problema y objetivo](docs/00-Inicio/Problema-y-Objetivo.md).
- [Actores](docs/01-Usuarios/Actores.md).
- [Requisitos funcionales](docs/02-Requisitos/Requisitos-Funcionales.md).
- [Requisitos no funcionales](docs/02-Requisitos/Requisitos-No-Funcionales.md).
- [Alcance del MVP](docs/03-Alcance/Alcance-MVP.md).
- [Fuera de alcance](docs/03-Alcance/Fuera-de-Alcance.md).
- [Historias de usuario](docs/04-Casos%20de%20Uso/Historias-de-Usuario.md).
