# Asociación Wawanakan Kusisinapa — Sitio Web Institucional

Landing page estática de la Asociación Wawanakan Kusisinapa, institución dependiente de la Diócesis de El Alto que trabaja por el bienestar y desarrollo integral de la primera infancia en Bolivia.

## Tecnología

HTML5 / CSS3 / JavaScript vanilla — sin frameworks ni herramientas de build.

## Estructura del proyecto

```
asociaci-nwawanakan/
├── public/                    ← Raíz pública (servir desde aquí)
│   ├── *.html                 — 9 páginas del sitio
│   ├── assets/
│   │   ├── hero/              — Imágenes de portada (hero1-7.jpg)
│   │   ├── mision/            — Carrusel de misión (mision1-4.jpg)
│   │   ├── vision/            — Carrusel de visión (vision1-3.jpg)
│   │   ├── equipo/            — Fotos del directorio institucional
│   │   ├── centros/           — Fotos de los 12 centros infantiles
│   │   ├── institucional/     — Logotipo y aliados
│   │   └── contenido/         — Resto de imágenes de secciones
│   ├── css/style.css          — Hoja de estilos principal
│   ├── js/
│   │   ├── components.js      — Header y footer compartidos (DRY)
│   │   ├── main.js            — Lógica principal (carruseles, mapa, formulario)
│   │   ├── firebase-config.js — Credenciales de Firebase y Cloudinary (CMS)
│   │   ├── firebase-app.js    — Inicialización del SDK de Firebase
│   │   ├── content-defaults.js— Contenido por defecto (fallback + semilla)
│   │   └── firebase-content.js— Carga e hidrata el contenido desde Firestore
│   ├── admin/                 — Panel de administración (CMS, ruta /admin)
│   │   ├── index.html         — Login + dashboard
│   │   ├── admin.css          — Estilos del panel
│   │   └── js/                — auth, store, cloudinary, schema, form-builder, app
│   └── data/
│       ├── centers.json       — Datos de los 12 centros infantiles (fallback)
│       └── config.json        — URLs de formularios, redes sociales y WhatsApp (fallback)
├── docs/
│   ├── AUDIT_REPORT.md        — Reporte de auditoría técnica
│   ├── ROADMAP.md             — Plan de optimización por fases
│   ├── DEUDA_TECNICA.md       — Backlog de deuda técnica pendiente
│   └── FIREBASE_CMS_PLAN.md   — Plan e implementación del CMS
├── firebase.json              — Configuración de Firebase Hosting + Firestore
├── firestore.rules            — Reglas de seguridad de Firestore
├── .firebaserc
├── .gitignore
└── README.md
```

## Panel de administración (CMS)

El sitio incluye un CMS opcional basado en **Firebase** (Auth + Firestore) y
**Cloudinary** (imágenes), accesible solo escribiendo la ruta `/admin` (no está
enlazado desde el sitio). Permite editar casi todo el contenido sin tocar código.

**Estado:** el código está completo; solo falta colocar las credenciales reales.

Para activarlo:
1. Crea un proyecto en Firebase (plan Spark) con Authentication (email/password) y
   Firestore, y una cuenta en Cloudinary (upload preset *unsigned*).
2. Pega las credenciales en `public/js/firebase-config.js`.
3. Abre `/admin`, inicia sesión y pulsa **“Inicializar contenido”** para sembrar
   Firestore con el contenido actual.

Mientras no se configure, el sitio funciona normalmente con el contenido del HTML
(degradación elegante). Detalles completos en `docs/FIREBASE_CMS_PLAN.md`.

## Cómo ejecutar localmente

El sitio requiere un servidor HTTP porque usa `fetch()` para cargar `data/centers.json` y `data/config.json`. Los archivos están en `public/`.

**Opción 1 — Python:**
```bash
cd public
python -m http.server 8080
```
Luego abrir `http://localhost:8080` en el navegador.

**Opción 2 — VS Code Live Server:**
Instalar la extensión [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer), hacer clic derecho en `public/index.html` y seleccionar "Open with Live Server".

**Opción 3 — Node.js:**
```bash
npx serve public
```

## Páginas

| Archivo | Página |
|---------|--------|
| `index.html` | Inicio |
| `quienes-somos.html` | Quiénes Somos |
| `nosotros.html` | Nosotros |
| `nuestro-equipo.html` | Nuestro Equipo |
| `voluntariado.html` | Voluntariado |
| `pasantia.html` | Pasantías |
| `centros.html` | Centros Infantiles |
| `contactos.html` | Contactos |
| `valores.html` | Valores |

## Datos de centros

Los datos de los 12 centros infantiles están en `public/data/centers.json`. Para actualizar nombre, dirección o actividades de un centro, editar ese archivo sin tocar `main.js`.

Los URLs de formularios, WhatsApp y redes sociales están centralizados en `public/data/config.json`.

## Contacto del equipo

- Correo: presidencia.wawanakan@gmail.com
- WhatsApp: (+591) 79164334
- Rama principal: `main`
