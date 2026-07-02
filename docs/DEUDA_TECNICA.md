# DEUDA TÉCNICA PENDIENTE
## Asociación Wawanakan Kusisinapa — Sitio Web Institucional

> Este documento registra todas las optimizaciones técnicas identificadas en la auditoría que aún no han sido implementadas. Sirve como backlog de referencia para futuras iteraciones de mejora. Ninguno de estos ítems bloquea el despliegue en producción — son mejoras de mantenibilidad, rendimiento y calidad.

---

## 1. CSS — Arquitectura y especificidad

### 1.1 — Declaraciones `!important` excesivas
- **Cantidad:** ~800 instancias en `public/css/style.css`
- **Problema:** Conflictos de especificidad resueltos con `!important` en lugar de selectores más precisos. Hace que overrides futuros sean difíciles y pueden causar comportamientos inesperados al añadir nuevas secciones.
- **Solución:** Auditar cada `!important` e identificar si es por conflicto de especificidad o necesidad real. Refactorizar selectores. Mantener solo los `!important` en media queries que sobreescriben estilos base (uso legítimo).
- **Objetivo:** < 50 `!important` justificados
- **Riesgo:** Alto — requiere testing visual exhaustivo en todos los breakpoints y páginas

### 1.2 — Breakpoints no estándar (20 valores únicos)
- **Problema:** El CSS usa 20 breakpoints distintos en lugar de un sistema coherente. Dificulta el mantenimiento y genera inconsistencias en el comportamiento responsive.
- **Valores no estándar a consolidar:**
  ```
  360px, 420px, 480px, 560px → fusionar con 576px (sm)
  600px, 620px, 640px, 680px, 700px → fusionar con 768px (md)
  820px, 840px, 900px, 980px → fusionar con 992px (lg)
  1024px, 1100px, 1180px → fusionar con 1200px (xl)
  ```
- **Solución:** Consolidar a 6 breakpoints estándar: 360px / 576px / 768px / 992px / 1200px / 1400px
- **Objetivo:** ≤ 6 breakpoints únicos
- **Riesgo:** Alto — requiere testing en dispositivos reales a cada breakpoint

### 1.3 — Espaciado fuera de la escala modular
- **Problema:** Existen valores de `padding`/`margin` como 10px, 14px, 18px, 22px, 26px, 28px que no pertenecen a la escala modular definida (`--space-xs` 4px / `--space-sm` 8px / `--space-md` 16px / `--space-lg` 24px / `--space-xl` 32px / `--space-2xl` 48px).
- **Solución:** Identificar los valores más frecuentes y redondear al valor de la escala más cercano. Aplicar con cautela, priorizando componentes con más repetición.
- **Riesgo:** Medio — puede producir cambios visuales sutiles en el espaciado

### 1.4 — Variables de `box-shadow` no aplicadas
- **Problema:** Se definieron `--shadow-card` y `--shadow-strong` en `:root` pero los valores de `box-shadow` en el CSS siguen hardcodeados.
- **Solución:** Buscar todos los `box-shadow` y reemplazar con las variables correspondientes.
- **Riesgo:** Bajo — sustitución semánticamente idéntica

---

## 2. Core Web Vitals

### 2.1 — Dimensiones de imagen ausentes (CLS)
- **Problema:** Las 28 imágenes estáticas del sitio no tienen atributos `width` y `height`. El navegador no puede reservar espacio antes de cargar la imagen, causando Cumulative Layout Shift (CLS) — el layout "salta" mientras carga.
- **Archivos afectados:** `index.html` (hero, objetivo, misión, visión, aliados), `nuestro-equipo.html` (equipo, 6 directores), `quienes-somos.html`, `voluntariado.html`, `pasantia.html`
- **Solución:** Añadir `width="X" height="Y"` a cada `<img>` con las dimensiones reales del archivo. Usar CSS `aspect-ratio` para las imágenes de carrusel que necesitan ser responsive.
- **Impacto:** Score de Lighthouse Performance
- **Riesgo:** Bajo — solo es una adición de atributos, no cambia el CSS

---

## 3. SEO y metadatos

### 3.1 — Favicon provisional
- **Problema:** Actualmente se usa `logotipo.png` como favicon via `<link rel="icon">`. Funciona, pero un `.ico` multi-resolución es el estándar para máxima compatibilidad entre navegadores.
- **Solución:**
  1. Crear `favicon.ico` (multi-resolución: 16×16, 32×32, 48×48) usando [favicon.io](https://favicon.io) o similar
  2. Crear `favicon-180.png` para Apple Touch Icon
  3. Guardar en `public/assets/institucional/`
  4. Actualizar los 9 HTML con:
     ```html
     <link rel="icon" href="assets/institucional/favicon.ico" sizes="any">
     <link rel="icon" href="assets/institucional/favicon.svg" type="image/svg+xml">
     <link rel="apple-touch-icon" href="assets/institucional/favicon-180.png">
     ```
- **Riesgo:** Nulo

### 3.2 — URLs de canonical y Open Graph provisionales
- **Problema:** Los tags `<link rel="canonical">` y `<meta property="og:url">` apuntan actualmente a `https://asociacionwawanakan-eng.github.io/asociaci-nwawanakan/` (URL de GitHub Pages). Al desplegar en un dominio definitivo, estas URLs deben actualizarse.
- **Solución:** Una vez definido el dominio final de producción, actualizar las 9 páginas HTML (o centralizar la URL base en `config.json`/Firestore para actualizarla desde un solo punto).
- **Riesgo:** Nulo — no afecta funcionalidad, solo SEO en buscadores

---

## 4. Accesibilidad

### 4.1 — Estados de foco en componentes específicos sin verificar
- **Problema:** Se añadió `:focus-visible` global, pero no se ha verificado visualmente en todos los elementos interactivos: botones del carrusel, tarjetas con `tabindex`, toggle del menú móvil, links del footer, inputs del formulario.
- **Solución:** Verificar con teclado (Tab, Shift+Tab, Enter, Escape) en todas las páginas que el anillo de foco dorado sea visible y no quede oculto por `overflow: hidden` u otros estilos.
- **Riesgo:** Nulo — solo verificación

---

## 5. Imágenes huérfanas

### 5.1 — Archivos de imagen no referenciados
- **Problema:** Existen imágenes en `public/assets/` que no son referenciadas en ningún HTML, CSS ni JS. Fueron conservadas por precaución pero deberían auditarse.
- **Candidatos a eliminar (verificar primero):**
  - `public/assets/hero/hero6.jpg` — hero6 no aparece en el carrusel de inicio
  - `public/assets/mision/mision.jpg` — solo `mision1-4.jpg` están en el carrusel
  - `public/assets/vision/vision.jpg` — solo `vision1-3.jpg` están en el carrusel
  - `public/assets/vision/vision4.jpg` — solo vision1-3 están en el carrusel
- **Solución:** Confirmar con el cliente si alguna es de uso futuro. Si no, eliminarlas para reducir el tamaño del repositorio.
- **Riesgo:** Bajo — siempre verificar antes de eliminar

---

## 6. Calidad de código

### 6.1 — Verificación de rutas en entorno de producción
- **Problema:** Las rutas de `fetch("data/centers.json")` son relativas. En GitHub Pages el subdirectorio del repo puede afectar las rutas. Con Firebase Hosting (raíz = `public/`) funciona correctamente.
- **Solución:** Verificar en el entorno de producción final que todas las llamadas `fetch()` resuelven correctamente.
- **Riesgo:** Bajo — solo es verificación

---

## Prioridad de implementación

| # | Ítem | Impacto usuario | Esfuerzo | Prioridad |
|---|------|----------------|---------|-----------|
| 2.1 | Dimensiones de imagen (CLS) | Alto (layout shift) | Bajo | 🔴 Alta |
| 3.1 | Favicon `.ico` oficial | Bajo (visual) | Muy bajo | 🟡 Media |
| 3.2 | URLs canonical definitivas | SEO | Muy bajo | 🟡 Media (al tener dominio) |
| 4.1 | Verificación de foco | Accesibilidad | Bajo | 🟡 Media |
| 1.4 | Variables box-shadow | Solo mantenibilidad | Bajo | 🟢 Baja |
| 1.1 | Eliminar !important | Solo mantenibilidad | Muy alto | 🟢 Baja |
| 1.2 | Normalizar breakpoints | Solo mantenibilidad | Alto | 🟢 Baja |
| 1.3 | Normalizar espaciado | Solo mantenibilidad | Medio | 🟢 Baja |
| 5.1 | Imágenes huérfanas | Tamaño repositorio | Muy bajo | 🟢 Baja |

---

*Última actualización: 2026-06-29 | Responsable: Leonardo Ibarra*
