# ROADMAP DE OPTIMIZACIÓN PROFESIONAL
## Asociación Wawanakan Kusisinapa — Sitio Web Institucional

> **Estado general:** Fases 1–3 completadas. Este documento guía el trabajo restante para alcanzar estándares de producción profesional y preparar la integración con Firebase.

---

## Progreso general

| Fase | Descripción | Estado |
|------|-------------|--------|
| Fase 1 | Refactorización estructural (CSS, DRY HTML, JSON) | ✅ Completada |
| Fase 2 | Accesibilidad y normalización de texto | ✅ Completada |
| Fase 3 | Rendimiento y calidad de código | ✅ Completada |
| **Fase 0** | **Reorganización profesional de archivos** | ⏳ Pendiente |
| **Fase 4** | **Calidad de datos y contenido** | ⏳ Pendiente |
| **Fase 5** | **SEO y metadatos** | ⏳ Pendiente |
| **Fase 6** | **Accesibilidad WCAG profunda** | ⏳ Pendiente |
| **Fase 7** | **Arquitectura CSS** | ⏳ Pendiente |
| **Fase 8** | **Integración Firebase** | ⏳ Pendiente |

> **Nota:** La Fase 0 es prerequisito obligatorio antes de cualquier otra fase. Define la estructura de carpetas escalable sobre la que se construirá la integración Firebase.

---

## Fase 0 — Reorganización profesional de archivos

**Objetivo:** Establecer una arquitectura de proyecto escalable, limpia y compatible con Firebase Hosting antes de continuar cualquier optimización.

### Estructura objetivo

```
asociaci-nwawanakan/
│
├── public/                          ← Raíz pública (Firebase Hosting root)
│   │
│   ├── index.html                   ← Página de inicio
│   ├── centros.html
│   ├── contactos.html
│   ├── nosotros.html
│   ├── nuestro-equipo.html
│   ├── pasantia.html
│   ├── quienes-somos.html
│   ├── valores.html
│   └── voluntariado.html
│   │
│   ├── assets/
│   │   ├── hero/                    ← Imágenes de portada (hero1-5.jpg, hero7.jpg)
│   │   ├── mision/                  ← Carrusel de misión (mision1-4.jpg)
│   │   ├── vision/                  ← Carrusel de visión (vision1-3.jpg)
│   │   ├── equipo/                  ← Fotos del directorio (presidenta1.png, etc.)
│   │   ├── centros/                 ← Fotos de centros infantiles (ya existe)
│   │   ├── institucional/           ← Logotipo, aliados (logotipo.png, aliado1.png)
│   │   └── contenido/               ← Resto de imágenes de secciones
│   │
│   ├── css/
│   │   └── style.css
│   │
│   ├── js/
│   │   ├── components.js            ← Header/footer compartidos
│   │   ├── main.js                  ← Lógica principal (renombrado de script.js)
│   │   └── firebase.js              ← [Reservado para Firebase SDK — Fase 8]
│   │
│   └── data/
│       ├── centers.json
│       └── config.json
│
├── docs/                            ← Documentación interna (no se publica)
│   ├── AUDIT_REPORT.md
│   └── ROADMAP.md                   ← Este archivo
│
├── firebase.json                    ← Configuración Firebase Hosting + rewrites
├── firestore.rules                  ← [Reservado — Fase 8]
├── .firebaserc                      ← Alias del proyecto Firebase
├── .gitignore
└── README.md
```

### Lista de tareas

#### 0.1 — Preparación de estructura base
- [ ] Crear carpeta `public/`
- [ ] Crear carpeta `public/assets/hero/`
- [ ] Crear carpeta `public/assets/mision/`
- [ ] Crear carpeta `public/assets/vision/`
- [ ] Crear carpeta `public/assets/equipo/`
- [ ] Crear carpeta `public/assets/institucional/`
- [ ] Crear carpeta `public/assets/contenido/`
- [ ] Crear carpeta `public/css/`
- [ ] Crear carpeta `public/js/`
- [ ] Crear carpeta `public/data/`
- [ ] Crear carpeta `docs/`

#### 0.2 — Mover y renombrar archivos HTML
- [ ] Mover los 9 archivos `.html` → `public/`
- [ ] Mover `style.css` → `public/css/style.css`
- [ ] Mover `script.js` → `public/js/main.js`
- [ ] Mover `js/components.js` → `public/js/components.js`
- [ ] Mover `data/centers.json` → `public/data/centers.json`
- [ ] Mover `data/config.json` → `public/data/config.json`

#### 0.3 — Organizar imágenes por categoría
- [ ] Mover a `public/assets/hero/`: `hero1.jpg`, `hero2.jpg`, `hero3.jpg`, `hero4.jpg`, `hero5.jpg`, `hero7.jpg`
- [ ] Mover a `public/assets/mision/`: `mision1.jpg`, `mision2.jpg`, `mision3.jpg`, `mision4.jpg`
- [ ] Mover a `public/assets/vision/`: `vision1.jpg`, `vision2.jpg`, `vision3.jpg`
- [ ] Mover a `public/assets/equipo/`: `presidenta1.png`, `vicepresidenta.png`, `actas1.png`, `nacional.png`, `tesoreria.png`, `internacional.png`, `equipo.png`
- [ ] Mover a `public/assets/institucional/`: `logotipo.png`, `aliado1.png`
- [ ] Mover a `public/assets/contenido/`: `objetivo.jpg`, `quienes-somos.jpg`, `voluntariado.png`, `voluntariado2.jpg`, `fondo pasan.jpg`, `fondo contactos.jpg`, `fondo equipo.jpg`, `fondo inicio.jpeg`, `pasantia foto.jpg`, `pasantia.png`
- [ ] Mover `assets/centros/` → `public/assets/centros/` (mantener estructura interna)

#### 0.4 — Renombrar archivos con espacios a kebab-case
> Los espacios en nombres de archivo son una mala práctica — causan problemas en URLs y servidores.

- [ ] `"actividad don donbosquito.jpg"` → `actividad-donbosquito.jpg`
- [ ] `"fondo contactos.jpg"` → `fondo-contactos.jpg`
- [ ] `"fondo equipo.jpg"` → `fondo-equipo.jpg`
- [ ] `"fondo inicio.jpeg"` → `fondo-inicio.jpg` *(también normalizar extensión)*
- [ ] `"fondo pasan.jpg"` → `fondo-pasantia-proceso.jpg`
- [ ] `"fondo pasantia.jpg"` → `fondo-pasantia.jpg`
- [ ] `"logotipo don bosquito.jpg"` → `logotipo-donbosquito.jpg`
- [ ] `"pasantia foto.jpg"` → `foto-pasantia.jpg`

#### 0.5 — Actualizar todas las referencias de rutas
- [ ] Actualizar rutas en los 9 archivos HTML (`src="assets/..."` → rutas nuevas)
- [ ] Actualizar rutas en `public/js/components.js` (logo en header y footer)
- [ ] Actualizar rutas en `public/js/main.js` (template literals de `openCenter`, `getCenterProfile`)
- [ ] Actualizar rutas en `public/data/centers.json` (si hay referencias a imágenes)
- [ ] Actualizar `href="style.css"` → `href="css/style.css"` en los 9 HTML
- [ ] Actualizar `src="script.js"` → `src="js/main.js"` en los 9 HTML
- [ ] Actualizar `src="js/components.js"` → `src="js/components.js"` (sin cambio si permanece en js/)
- [ ] Actualizar `fetch("data/centers.json")` → `fetch("data/centers.json")` en `main.js` (verificar rutas relativas)

#### 0.6 — Limpiar archivos obsoletos
- [ ] Eliminar `style.backup.css` (no debe estar en producción; el historial de git es el backup)
- [ ] Auditar y eliminar imágenes huérfanas no referenciadas: `hero6.jpg`, `mision.jpg`, `vision.jpg`, `vision4.jpg`, `fondo inicio.jpeg`, `pasantia.png`
- [ ] Mover `AUDIT_REPORT.md` → `docs/AUDIT_REPORT.md`
- [ ] Mover `ROADMAP.md` → `docs/ROADMAP.md`

#### 0.7 — Archivos de configuración del proyecto
- [ ] Crear `.gitignore` con reglas estándar:
  ```
  node_modules/
  .firebase/
  .env
  .env.local
  *.log
  .DS_Store
  Thumbs.db
  ```
- [ ] Crear `firebase.json` base:
  ```json
  {
    "hosting": {
      "public": "public",
      "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
      "rewrites": [
        { "source": "**", "destination": "/index.html" }
      ]
    }
  }
  ```
- [ ] Crear `.firebaserc` base:
  ```json
  {
    "projects": {
      "default": "wawanakan-web"
    }
  }
  ```

#### 0.8 — Verificación
- [ ] Levantar servidor local desde `public/` y verificar que todas las páginas cargan
- [ ] Verificar que los carruseles funcionan (hero, misión, visión)
- [ ] Verificar que `centros.html` carga los distritos desde `data/centers.json`
- [ ] Verificar que el formulario de contacto responde (modo online)
- [ ] Confirmar que no hay ninguna referencia a rutas antiguas en consola del navegador

---

## Fase 4 — Calidad de datos y contenido

**Objetivo:** Corregir todos los errores de contenido visible para el usuario — tildes faltantes en datos JSON y configuración con valores placeholder.

**Impacto:** Directo sobre el texto que el usuario lee en el modal de centros y en los links sociales.

### Lista de tareas

#### 4.1 — Corrección de `data/centers.json`
- [ ] `"Sagrado Corazon de Jesus"` → `"Sagrado Corazón de Jesús"` (nombre de centro + key del objeto)
- [ ] `subtitulo` Don Bosquito: `"acompanamiento"` → `"acompañamiento"`, `"formacion"` → `"formación"`
- [ ] `subtitulo` María Auxiliadora: `"acompanamiento"` → `"acompañamiento"`, `"formacion"` → `"formación"`
- [ ] `address` María Auxiliadora: `"Raul Salmon"` → `"Raúl Salmón"`
- [ ] `address` San Francisco de Asís: `"Rio"` → `"Río"`
- [ ] `subtitulo` Cristo del Consuelo: `"proteccion"` → `"protección"`, `"ninas"` → `"niñas"`, `"ninos"` → `"niños"`
- [ ] `subtitulo` Palliri: `"formacion"` → `"formación"`
- [ ] `address` Palliri: `"Perez"` → `"Pérez"`, `"Heroes"` → `"Héroes"`
- [ ] `subtitulo` Virgen de la Fuensanta: `"acompanamiento"` → `"acompañamiento"`
- [ ] `subtitulo` Sagrado Corazón: `"participacion"` → `"participación"`
- [ ] `subtitulo` Burgosmarka: `"ninez"` → `"niñez"`
- [ ] `subtitulo` Nueva Marka: `"acompanamiento"` → `"acompañamiento"`, `"proteccion"` → `"protección"`
- [ ] `address` Nueva Marka: `"modulo"` → `"módulo"`
- [ ] `subtitulo` Mi Rinconcito: `"calido"` → `"cálido"`
- [ ] `address` Mi Rinconcito: `"Potosi"` → `"Potosí"`
- [ ] `activities[1]`: `"Acompanamiento"` → `"Acompañamiento"`
- [ ] `activities[2]`: `"Nutricion"` → `"Nutrición"`
- [ ] `activities[5]`: `"Participacion"` → `"Participación"`
- [ ] `impactDescriptions[0]`: `"participacion"` → `"participación"`, `"ninas"` → `"niñas"`, `"ninos"` → `"niños"`
- [ ] `impactDescriptions[2]`: `"ninez"` → `"niñez"`

#### 4.2 — Corrección de `data/config.json`
- [ ] `facebookLink`: reemplazar `"https://www.facebook.com/"` con la URL real de la página institucional (`https://www.facebook.com/profile.php?id=61590971327508`)
- [ ] `whatsappLink`: reemplazar `"https://wa.me/591XXXXXXXX"` con el número real (`https://wa.me/59179164334`)

#### 4.3 — Corrección de `public/js/main.js`
- [ ] Línea ~89 — fallback subtitle: `"Centro infantil con acompanamiento, cuidado y formacion integral"` → `"Centro infantil con acompañamiento, cuidado y formación integral"`

#### 4.4 — Verificación
- [ ] Abrir `centros.html` → clic en cada centro → verificar textos correctos en el modal
- [ ] Verificar que los links de Facebook y WhatsApp en el modal apuntan a la página real
- [ ] Verificar que `"Sagrado Corazón de Jesús"` aparece correctamente en la grilla de distritos

---

## Fase 5 — SEO y metadatos

**Objetivo:** Hacer que el sitio sea indexable por buscadores y compártible en redes sociales con vista previa correcta.

**Impacto:** Visibilidad en Google, WhatsApp, Facebook, LinkedIn. Actualmente 8 de 9 páginas no tienen meta description.

### Lista de tareas

#### 5.1 — Favicon
- [ ] Crear o designar un favicon (`.ico` / `.png` 32×32 y 180×180 para Apple)
- [ ] Añadir en el `<head>` de los 9 archivos HTML (via `components.js` si se centraliza):
  ```html
  <link rel="icon" href="assets/institucional/favicon.ico" type="image/x-icon">
  <link rel="apple-touch-icon" href="assets/institucional/favicon-180.png">
  ```

#### 5.2 — Meta descriptions únicas por página
Añadir `<meta name="description">` en los 8 archivos que la tienen ausente:
- [ ] `centros.html` — "Conoce los 12 Centros Infantiles Wawanakan distribuidos en 6 distritos de El Alto. Atención integral, cuidado y formación para la primera infancia."
- [ ] `contactos.html` — "Comunícate con la Asociación Wawanakan Kusisinapa. Encuentra nuestra ubicación, teléfono, correo y formulario de contacto directo."
- [ ] `nosotros.html` — "Conoce al equipo, el programa de voluntariado y las pasantías de la Asociación Wawanakan Kusisinapa al servicio de la niñez boliviana."
- [ ] `nuestro-equipo.html` — "El directorio institucional de la Asociación Wawanakan Kusisinapa: las personas que lideran el trabajo por la primera infancia en El Alto."
- [ ] `pasantia.html` — "Programa de pasantías de Wawanakan: formación con propósito para estudiantes universitarios que desean contribuir al bienestar infantil."
- [ ] `quienes-somos.html` — "Somos una institución dependiente de la Diócesis de El Alto que trabaja por el bienestar y desarrollo integral de la primera infancia desde 2008."
- [ ] `valores.html` — "Los principios que guían el trabajo diario de la Asociación Wawanakan Kusisinapa: equidad, solidaridad, respeto, trabajo en equipo y honestidad."
- [ ] `voluntariado.html` — "Únete al voluntariado de Wawanakan. Tu tiempo puede transformar la vida de niños y niñas en El Alto. Conoce el proceso de postulación."

#### 5.3 — Open Graph (social sharing)
Añadir en el `<head>` de cada página los tags `og:` para WhatsApp, Facebook y LinkedIn:
- [ ] `index.html` — og:title, og:description, og:image (hero institucional), og:url, og:type
- [ ] `centros.html` — og:title "Centros Infantiles | Wawanakan", og:image (foto de centro representativo)
- [ ] `contactos.html` — og:title, og:description, og:image (logo institucional)
- [ ] `nosotros.html` — og:title, og:image
- [ ] `nuestro-equipo.html` — og:title, og:image (foto de equipo)
- [ ] `pasantia.html` — og:title, og:image
- [ ] `quienes-somos.html` — og:title, og:image
- [ ] `valores.html` — og:title, og:image
- [ ] `voluntariado.html` — og:title, og:image

#### 5.4 — Consistencia de títulos
Estandarizar el formato `[Página] | Asociación Wawanakan Kusisinapa` en todos los `<title>`:
- [ ] `centros.html`: "Centros Infantiles | Asociación Wawanakan Kusisinapa"
- [ ] `contactos.html`: "Contactos | Asociación Wawanakan Kusisinapa"
- [ ] `nosotros.html`: "Nosotros | Asociación Wawanakan Kusisinapa"
- [ ] `nuestro-equipo.html`: "Nuestro Equipo | Asociación Wawanakan Kusisinapa"
- [ ] `pasantia.html`: "Pasantías | Asociación Wawanakan Kusisinapa"
- [ ] `quienes-somos.html`: "Quiénes Somos | Asociación Wawanakan Kusisinapa"
- [ ] `valores.html`: "Valores | Asociación Wawanakan Kusisinapa"
- [ ] `voluntariado.html`: "Voluntariado | Asociación Wawanakan Kusisinapa"

#### 5.5 — Canonical links
- [ ] Añadir `<link rel="canonical" href="https://[dominio]/[pagina].html">` en cada página una vez definido el dominio final de Firebase Hosting

#### 5.6 — Verificación
- [ ] Validar con [og:debugger de Facebook](https://developers.facebook.com/tools/debug/) que las vistas previas se generan correctamente
- [ ] Verificar con Google Search Console o [Rich Results Test](https://search.google.com/test/rich-results) que el SEO básico es correcto
- [ ] Confirmar que el favicon aparece en la pestaña del navegador

---

## Fase 6 — Accesibilidad WCAG profunda

**Objetivo:** Alcanzar conformidad WCAG 2.1 nivel AA — el estándar mínimo para sitios gubernamentales e instituciones sin fines de lucro.

### Lista de tareas

#### 6.1 — Jerarquía de encabezados
- [ ] `nosotros.html`: Añadir `<h2>` como wrapper semántico antes de las 3 quick-cards (Nuestro Equipo, Voluntariado, Pasantía)
- [ ] `valores.html`: Añadir `<h2>` sección antes de los 5 `<h3>` de valores
- [ ] `nuestro-equipo.html`: Añadir `<h2>Directorio institucional</h2>` entre `<h1>` y las tarjetas de directores
- [ ] `index.html` — sección `#mision-vision`: Añadir `<h2 class="sr-only">Misión y Visión</h2>` (visualmente oculto con clase screen-reader-only, resuelve la jerarquía sin cambiar diseño)

#### 6.2 — Estilos de foco para teclado
- [ ] Añadir en `style.css` una sección `:focus-visible` global como base:
  ```css
  :focus-visible {
    outline: 3px solid var(--gold);
    outline-offset: 3px;
    border-radius: 4px;
  }
  ```
- [ ] Verificar y ajustar foco en: botones de navegación, `.btn`, botones de carrusel, tarjetas con `tabindex`, links del footer, inputs del formulario

#### 6.3 — `prefers-reduced-motion` completo
- [ ] Extender la regla existente para cubrir los 7 `@keyframes` restantes:
  - `sparkleFloat`, `waveDrift`, `frequencyPulse`, `objectiveTitleIn`, `missionSparkle`, `zoomPostular`, `center-impact-scroll`
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
  ```

#### 6.4 — Dimensiones de imágenes (CLS — Core Web Vitals)
- [ ] Añadir atributos `width` y `height` a las 28 imágenes estáticas del sitio
- [ ] Priorizar: logos en header/footer, imágenes de directores, foto objetivo, foto aliados
- [ ] Los carruseles (hero, misión, visión) requieren `width`/`height` en cada `<img>` con las dimensiones reales del archivo

#### 6.5 — Verificación
- [ ] Ejecutar auditoría Lighthouse (F12 → Lighthouse → Accessibility) — objetivo: score ≥ 90
- [ ] Verificar navegación completa por teclado (Tab, Enter, Escape)
- [ ] Verificar con Chrome DevTools → Rendering → "Emulate CSS media feature prefers-reduced-motion: reduce"

---

## Fase 7 — Arquitectura CSS

**Objetivo:** Eliminar la deuda técnica estructural del CSS: los 800 `!important`, los 20 breakpoints no estándar y las variables CSS definidas pero no aplicadas.

> ⚠️ **Esta es la fase de mayor riesgo visual.** Requiere testing exhaustivo en múltiples dispositivos después de cada cambio. Se recomienda abordarla en sub-fases incrementales.

### Lista de tareas

#### 7.1 — Aplicar variables CSS existentes
Las variables fueron definidas en Fase 1 pero nunca se aplicaron al código existente:
- [ ] Reemplazar valores hardcodeados de `box-shadow` con `var(--shadow-card)` y `var(--shadow-strong)`
- [ ] Reemplazar `border-radius: 24px` → `var(--radius-md)`, `32px` → `var(--radius-lg)`, `12px` → `var(--radius-sm)`, `999px` → `var(--radius-pill)` (234 instancias estimadas)
- [ ] Reemplazar `180ms ease` → `var(--transition-fast)`, `220ms ease` → `var(--transition-normal)`, `300ms ease` → `var(--transition-slow)` (46 instancias estimadas)

#### 7.2 — Normalizar breakpoints
Consolidar de 20 valores únicos a 6 estándar:
```
360px → eliminar o fusionar con 576px
420px → fusionar con 576px
480px → fusionar con 576px
560px, 576px → mantener 576px (sm)
600px, 620px, 640px → fusionar con 576px o 768px
680px, 700px → fusionar con 768px
768px → mantener (md)
820px, 840px, 900px → fusionar con 992px
980px, 992px → mantener 992px (lg)
1024px, 1100px, 1180px → fusionar con 1200px
1200px → mantener (xl)
```
- [ ] Mapear cada breakpoint no estándar al más cercano estándar
- [ ] Aplicar cambios página por página (voluntariado, pasantía, centros, equipo) verificando visualmente
- [ ] Añadir las variables de breakpoint al `:root` como referencia documental

#### 7.3 — Reducir `!important`
- [ ] Auditar cada `!important` e identificar si es por conflicto de especificidad o por necesidad real
- [ ] Refactorizar selectores para aumentar especificidad en lugar de usar `!important`
- [ ] Mantener únicamente los `!important` en media queries que sobreescriben estilos base (caso legítimo)
- [ ] Objetivo: reducir de 800 a menos de 50 `!important` justificados

#### 7.4 — Normalizar espaciado
- [ ] Identificar los valores de padding/margin más frecuentes que no corresponden a la escala modular (10px, 14px, 18px, 22px, 26px, 28px)
- [ ] Redondear al valor de la escala más cercano: `--space-sm` (8px), `--space-md` (16px), `--space-lg` (24px)
- [ ] Aplicar con cautela — priorizar componentes con más repetición

#### 7.5 — Verificación
- [ ] Comparar screenshots antes/después de cada cambio masivo
- [ ] Verificar en mobile (360px), tablet (768px) y desktop (1200px+)
- [ ] Ejecutar Lighthouse → Performance — objetivo: score ≥ 85

---

## Fase 8 — Integración Firebase

**Objetivo:** Conectar el sitio con Firebase para: hosting profesional, formulario de contacto persistente en Firestore, y base para futuras funcionalidades dinámicas.

> ⚠️ **Prerequisito absoluto:** Fase 0 debe estar completamente terminada antes de iniciar esta fase.

### Lista de tareas

#### 8.1 — Setup de Firebase Hosting
- [ ] Instalar Firebase CLI: `npm install -g firebase-tools`
- [ ] Login: `firebase login`
- [ ] Inicializar proyecto: `firebase init hosting`
- [ ] Configurar `firebase.json` con `"public": "public"` y headers de caché para assets
- [ ] Deploy de prueba: `firebase deploy --only hosting`
- [ ] Verificar URL de producción y SSL automático

#### 8.2 — Firestore para formulario de contacto
- [ ] Habilitar Firestore en la consola Firebase
- [ ] Definir colección `mensajes` con campos: `nombre`, `correo`, `mensaje`, `fecha`, `leido`
- [ ] Crear `public/js/firebase.js` con inicialización del SDK y función `enviarMensaje()`
- [ ] Actualizar `public/js/main.js` para usar Firestore en lugar de (o además de) formsubmit.co:
  - Guardar el mensaje en Firestore
  - Mantener el email como notificación secundaria
- [ ] Configurar `firestore.rules` para solo escritura pública, sin lectura pública:
  ```
  allow write: if true;
  allow read: if false;
  ```
- [ ] Crear panel básico de revisión de mensajes (o usar la consola Firebase directamente)

#### 8.3 — Variables de entorno y configuración
- [ ] Crear `public/js/firebase-config.js` con la configuración del proyecto Firebase (apiKey, etc.)
- [ ] Añadir `firebase-config.js` al `.gitignore` si contiene datos sensibles, o usar Firebase App Check
- [ ] Documentar en `README.md` cómo configurar el entorno local con credenciales propias

#### 8.4 — Firebase Analytics (opcional)
- [ ] Habilitar Google Analytics en el proyecto Firebase
- [ ] Añadir el snippet de Analytics al `<head>` vía `components.js`
- [ ] Configurar eventos básicos: página vista, clic en centros, envío de formulario

#### 8.5 — Optimizaciones de Firebase Hosting
- [ ] Configurar headers de caché en `firebase.json`:
  ```json
  "headers": [
    { "source": "/assets/**", "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000" }] },
    { "source": "/**/*.html", "headers": [{ "key": "Cache-Control", "value": "public, max-age=3600" }] }
  ]
  ```
- [ ] Configurar redirects para rutas sin extensión (opcional, mejora URLs)

#### 8.6 — Verificación final
- [ ] Formulario de contacto: enviar mensaje real → verificar en Firestore console
- [ ] Verificar velocidad de carga con Lighthouse en URL de producción Firebase
- [ ] Verificar que todos los assets cargan con HTTPS
- [ ] Verificar headers de seguridad y caché con DevTools → Network

---

## Métricas de éxito por fase

| Fase | Métrica | Objetivo |
|------|---------|---------|
| 0 | Archivos en `public/`, sin referencias rotas | 0 errores en consola |
| 4 | Tildes en datos JSON | 0 palabras sin tilde |
| 5 | Lighthouse SEO score | ≥ 90 |
| 6 | Lighthouse Accessibility score | ≥ 90 |
| 7 | `!important` en CSS | < 50 |
| 7 | Breakpoints únicos | ≤ 6 |
| 8 | Mensajes del formulario en Firestore | 100% persistidos |
| 8 | Lighthouse Performance (producción) | ≥ 85 |

---

## Registro de fases completadas

### Fase 1 — Refactorización estructural ✅
- CSS reducido de 15.008 → 11.876 líneas (−21%)
- Header/footer DRY via `js/components.js`
- Datos externalizados a `data/centers.json` y `data/config.json`
- Variables CSS añadidas al `:root`
- Separadores de sección en `style.css`

### Fase 2 — Accesibilidad y normalización de texto ✅
- 6 alt texts vacíos corregidos (hero × 5 + pasantía × 1)
- 4 aria-labels normalizados en `js/components.js`
- Entidades HTML eliminadas: `index.html` (−352 chars), `contactos.html` (−91 chars)
- Tildes corregidas en `quienes-somos.html`, `nosotros.html`, `valores.html`, `index.html`, `script.js`
- Formulario: `AbortController` (10s timeout), `aria-busy` en botón, `aria-atomic` en status

### Fase 3 — Rendimiento y calidad de código ✅
- 3 funciones `stopCarousel`, `stopMissionCarousel`, `stopVisionCarousel` añadidas
- 3 `IntersectionObserver` para pausa/reanudación de carruseles
- 8 imágenes con `loading="lazy"` (directores, voluntariado, pasantía)
- Comentarios en `showSlide()` (doble rAF) y `openCenter()` (DOM surgery)
- Texto sin tilde corregido en template literals de `openCenter`
- `README.md` creado

---

*Última actualización: 2026-06-29 | Responsable: Leonardo Ibarra*
