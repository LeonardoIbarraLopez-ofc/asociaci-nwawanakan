/**
 * Capa de contenido del sitio público.
 *
 * - Carga el contenido editable desde Firestore y lo fusiona sobre el
 *   contenido por defecto (content-defaults.js). Si el CMS no está configurado
 *   o Firestore falla, el sitio sigue funcionando con los valores por defecto
 *   (que son idénticos al HTML original).
 * - Hidrata el DOM a través de atributos declarativos:
 *      data-cms-text="ruta"   → textContent
 *      data-cms-src="ruta"    → atributo src (imágenes)
 *      data-cms-alt="ruta"    → atributo alt
 *      data-cms-href="ruta"   → atributo href (enlaces)
 *   La "ruta" es una ruta con puntos al objeto de contenido, admitiendo
 *   índices de arreglo, p. ej. "valores.0.titulo" o "heroSlides.slides.1.src".
 *
 * Se auto-ejecuta al cargar la página. También exporta helpers que main.js usa
 * para los centros y la configuración.
 */
import { initFirebase } from "./firebase-app.js";
import { DEFAULT_CONTENT } from "./content-defaults.js";

/* ── Utilidades ──────────────────────────────────────────────────────── */

function get(obj, path) {
  return String(path)
    .split(".")
    .reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/** Fusión profunda: los objetos se combinan recursivamente; arreglos y
 *  primitivos del override reemplazan por completo al valor base. */
function deepMerge(base, override) {
  if (!isPlainObject(override) || !isPlainObject(base)) return override;
  const out = { ...base };
  for (const key of Object.keys(override)) {
    out[key] = deepMerge(base[key], override[key]);
  }
  return out;
}

const byOrden = (a, b) => (a.orden ?? 0) - (b.orden ?? 0);

/* ── Carga de contenido ──────────────────────────────────────────────── */

// Documentos únicos bajo la colección "sitio" (clave de contenido = id de doc).
const SITE_DOCS = [
  "config", "footer", "home", "heroSlides", "misionSlides",
  "visionSlides", "equipo", "voluntariado", "pasantia", "quienesSomos"
];

/** Carga todo el contenido editable, fusionado sobre los valores por defecto. */
export async function loadContent() {
  const content = structuredClone(DEFAULT_CONTENT);

  const fb = await initFirebase();
  if (!fb) return content; // CMS no configurado → solo defaults

  const { db, fs } = fb;
  const { doc, getDoc, collection, getDocs } = fs;

  try {
    const docSnaps = await Promise.all(
      SITE_DOCS.map((id) => getDoc(doc(db, "sitio", id)))
    );
    docSnaps.forEach((snap, i) => {
      if (snap.exists()) {
        const key = SITE_DOCS[i];
        content[key] = deepMerge(content[key], snap.data());
      }
    });

    const [valSnap, dirSnap] = await Promise.all([
      getDocs(collection(db, "valores")),
      getDocs(collection(db, "directorio"))
    ]);
    if (!valSnap.empty) {
      content.valores = valSnap.docs.map((d) => ({ id: d.id, ...d.data() })).sort(byOrden);
    }
    if (!dirSnap.empty) {
      content.directorio = dirSnap.docs.map((d) => ({ id: d.id, ...d.data() })).sort(byOrden);
    }
  } catch (error) {
    console.warn("[CMS] No se pudo leer todo el contenido de Firestore, se usan valores por defecto:", error);
  }

  return content;
}

/** Devuelve el documento de centros (sitio/centros) o null si no existe/CMS off.
 *  Conserva el mismo formato que data/centers.json. */
export async function loadCenters() {
  const fb = await initFirebase();
  if (!fb) return null;
  try {
    const snap = await fb.fs.getDoc(fb.fs.doc(fb.db, "sitio", "centros"));
    return snap.exists() ? snap.data() : null;
  } catch (error) {
    console.warn("[CMS] No se pudieron leer los centros desde Firestore:", error);
    return null;
  }
}

/** Devuelve la configuración (sitio/config) fusionada sobre defaults, o null si
 *  el CMS no está configurado. */
export async function loadSiteConfig() {
  const fb = await initFirebase();
  if (!fb) return null;
  try {
    const snap = await fb.fs.getDoc(fb.fs.doc(fb.db, "sitio", "config"));
    const base = structuredClone(DEFAULT_CONTENT.config);
    return snap.exists() ? deepMerge(base, snap.data()) : base;
  } catch (error) {
    console.warn("[CMS] No se pudo leer la configuración desde Firestore:", error);
    return null;
  }
}

/* ── Hidratación del DOM ─────────────────────────────────────────────── */

export function hydrate(content) {
  document.querySelectorAll("[data-cms-text]").forEach((el) => {
    const value = get(content, el.dataset.cmsText);
    if (value != null) el.textContent = value;
  });
  document.querySelectorAll("[data-cms-src]").forEach((el) => {
    const value = get(content, el.dataset.cmsSrc);
    if (value != null && value !== "") el.setAttribute("src", value);
  });
  document.querySelectorAll("[data-cms-alt]").forEach((el) => {
    const value = get(content, el.dataset.cmsAlt);
    if (value != null) el.setAttribute("alt", value);
  });
  document.querySelectorAll("[data-cms-href]").forEach((el) => {
    const value = get(content, el.dataset.cmsHref);
    if (value != null && value !== "") el.setAttribute("href", value);
  });
}

/* ── Auto-ejecución ──────────────────────────────────────────────────── */

async function run() {
  try {
    const content = await loadContent();
    hydrate(content);
    document.dispatchEvent(new CustomEvent("wawa:content-ready", { detail: content }));
  } catch (error) {
    console.warn("[CMS] Hidratación omitida:", error);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", run, { once: true });
} else {
  run();
}

window.WawaContent = { loadContent, hydrate, loadCenters, loadSiteConfig };
