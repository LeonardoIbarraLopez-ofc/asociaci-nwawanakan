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
  // Validar que override sea un objeto plano (no array, null, etc.)
  if (!isPlainObject(override) || !isPlainObject(base)) {
    // Si override es un array válido, aceptarlo como está
    if (Array.isArray(override)) return override;
    return override;
  }
  const out = { ...base };
  for (const key of Object.keys(override)) {
    out[key] = deepMerge(base[key], override[key]);
  }
  return out;
}

function validateContent(content) {
  // Validar que las rutas críticas tengan los tipos correctos
  const validations = [
    { path: "heroSlides.slides", type: "array" },
    { path: "misionSlides.slides", type: "array" },
    { path: "visionSlides.slides", type: "array" },
    { path: "valores", type: "array" },
    { path: "directorio", type: "array" },
    { path: "pasantia.requisitos", type: "array" },
    { path: "voluntariado.beneficios", type: "array" },
    { path: "voluntariado.formasAyuda", type: "array" },
    { path: "voluntariado.pasos", type: "array" },
  ];

  let errors = 0;
  validations.forEach(({ path, type }) => {
    const value = get(content, path);
    if (type === "array" && !Array.isArray(value)) {
      console.warn(`[CMS] Validación: ${path} debería ser array, pero es ${typeof value}`);
      errors++;
    }
  });

  if (errors > 0) {
    console.warn(`[CMS] ${errors} validaciones fallaron`);
  }

  return errors === 0;
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
    // Cargar documentos de "sitio" con timeout para evitar bloqueos indefinidos
    const docSnapsPromise = Promise.all(
      SITE_DOCS.map((id) =>
        getDoc(doc(db, "sitio", id)).catch((err) => {
          console.warn(`[CMS] No se pudo leer sitio/${id}:`, err.code);
          return null;
        })
      )
    );

    const docSnaps = await Promise.race([
      docSnapsPromise,
      new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout loading site docs")), 5000))
    ]);

    docSnaps.forEach((snap, i) => {
      if (snap && snap.exists()) {
        const key = SITE_DOCS[i];
        content[key] = deepMerge(content[key], snap.data());
      }
    });

    // Cargar colecciones
    const collectionPromise = Promise.all([
      getDocs(collection(db, "valores")).catch((err) => {
        console.warn("[CMS] No se pudo leer colección valores:", err.code);
        return { empty: true, docs: [] };
      }),
      getDocs(collection(db, "directorio")).catch((err) => {
        console.warn("[CMS] No se pudo leer colección directorio:", err.code);
        return { empty: true, docs: [] };
      })
    ]);

    const [valSnap, dirSnap] = await Promise.race([
      collectionPromise,
      new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout loading collections")), 5000))
    ]);

    if (valSnap && !valSnap.empty) {
      content.valores = valSnap.docs.map((d) => ({ id: d.id, ...d.data() })).sort(byOrden);
    }
    if (dirSnap && !dirSnap.empty) {
      content.directorio = dirSnap.docs.map((d) => ({ id: d.id, ...d.data() })).sort(byOrden);
    }
  } catch (error) {
    const errorMsg = error.message || error.code || "unknown error";
    console.warn(`[CMS] No se pudo leer todo el contenido de Firestore (${errorMsg}), se usan valores por defecto`);
  }

  // Validar que el contenido tiene la estructura correcta
  validateContent(content);

  return content;
}

/**
 * Convierte el formato de Firestore (objetos) al formato que espera main.js
 * (arrays de arrays para districts.centers y activities).
 * Firestore no permite arrays anidados, por eso se almacenan como objetos.
 */
function normalizeCenters(data) {
  if (!data) return null;
  return {
    ...data,
    districts: (data.districts || []).map((d) => ({
      ...d,
      centers: (d.centers || []).map((c) => Array.isArray(c) ? c : [c.name, c.image])
    })),
    activities: (data.activities || []).map((a) => Array.isArray(a) ? a : [a.icon, a.label])
  };
}

/** Devuelve el documento de centros (sitio/centros) o null si no existe/CMS off.
 *  Convierte el formato de Firestore al formato que espera main.js. */
export async function loadCenters() {
  const fb = await initFirebase();
  if (!fb) return null;
  try {
    const snap = await fb.fs.getDoc(fb.fs.doc(fb.db, "sitio", "centros"));
    return snap.exists() ? normalizeCenters(snap.data()) : null;
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
  let textUpdates = 0, srcUpdates = 0, hrefUpdates = 0;
  const allElements = document.querySelectorAll("[data-cms-text]");

  console.log(`[CMS] Iniciando hidratación. Elementos encontrados: ${allElements.length}`);

  // PASO 1: Detectar arrays iterando sobre TODOS los elementos con data-cms-text
  // Identificar paths que apunten a índices (ej. "valores.0", "directorio.1", etc.)
  const arrayPaths = new Map(); // path → { indices: Set, minIndex, maxIndex }

  allElements.forEach((el) => {
    const path = el.dataset.cmsText;
    const match = path.match(/^(.+)\.(\d+)(?:\..*)?$/); // Extrae "root.0.field" → ["root", "0"]
    if (!match) return; // No es un array indexado

    const rootPath = match[1];
    const index = parseInt(match[2], 10);

    if (!arrayPaths.has(rootPath)) {
      arrayPaths.set(rootPath, { indices: new Set(), minIndex: index, maxIndex: index });
    }
    const info = arrayPaths.get(rootPath);
    info.indices.add(index);
    info.minIndex = Math.min(info.minIndex, index);
    info.maxIndex = Math.max(info.maxIndex, index);
  });

  const processedArrays = new Set();

  // PASO 2: Regenerar arrays si el tamaño en Firestore es diferente
  arrayPaths.forEach((info, rootPath) => {
    const value = get(content, rootPath);
    if (!Array.isArray(value)) return;

    const currentSize = info.indices.size;
    const newSize = value.length;

    if (currentSize === newSize) {
      console.log(`[CMS] ✓ Array ${rootPath}: tamaño igual (${currentSize})`);
    } else {
      console.log(`[CMS] ✅ REGENERANDO array ${rootPath}: ${currentSize} → ${newSize} elementos`);

      // Encontrar todos los elementos que pertenecen a este array
      const selector = `[data-cms-text^="${rootPath}."]`;
      const elementsToReplace = document.querySelectorAll(selector);

      if (elementsToReplace.length) {
        // Agrupar por índice para regenerar en el mismo lugar
        const byIndex = new Map();
        elementsToReplace.forEach((el) => {
          // Extraer el índice del path (ej. "pasantia.requisitos.0" o "pasantia.requisitos.0.titulo" → 0)
          if (el.dataset.cmsText.startsWith(rootPath + ".")) {
            const suffix = el.dataset.cmsText.slice((rootPath + ".").length);
            const firstPart = suffix.split(".")[0];
            const idx = parseInt(firstPart, 10);
            if (!isNaN(idx)) {
              if (!byIndex.has(idx)) byIndex.set(idx, []);
              byIndex.get(idx).push(el);
            }
          }
        });

        // Para cada índice original, actualizar el elemento correspondiente
        // Si hay más índices de los que hay elementos en el array, generar nuevos
        let lastReplacedEl = null;
        for (let i = 0; i < newSize; i++) {
          const newItemContent = value[i];
          if (typeof newItemContent === "string") {
            // Array de strings: reemplazar/crear elemento simple
            const oldEls = byIndex.get(i);
            if (oldEls && oldEls[0]) {
              oldEls[0].textContent = newItemContent;
              lastReplacedEl = oldEls[0];
            } else if (lastReplacedEl) {
              // Crear nuevo elemento basado en el anterior
              const newEl = document.createElement(lastReplacedEl.tagName);
              newEl.dataset.cmsText = `${rootPath}.${i}`;
              newEl.textContent = newItemContent;
              lastReplacedEl.parentElement?.insertBefore(newEl, lastReplacedEl.nextSibling);
              lastReplacedEl = newEl;
            }
          } else {
            // Array de objetos: actualizar todos los campos de este índice
            const oldEls = byIndex.get(i);
            if (oldEls) {
              oldEls.forEach((el) => {
                const fieldMatch = el.dataset.cmsText.match(/^[^.]+\.\d+\.(.+)$/);
                if (fieldMatch) {
                  const fieldName = fieldMatch[1];
                  const fieldValue = newItemContent[fieldName];
                  if (fieldValue != null) {
                    if (el.dataset.cmsSrc || el.tagName === "IMG") {
                      el.setAttribute("src", fieldValue);
                    } else {
                      el.textContent = fieldValue;
                    }
                  }
                }
              });
              lastReplacedEl = oldEls[oldEls.length - 1];
            }
          }
        }

        // Eliminar elementos sobrantes si el array se redujo
        if (currentSize > newSize) {
          for (let i = newSize; i <= info.maxIndex; i++) {
            const oldEls = byIndex.get(i);
            if (oldEls) oldEls.forEach((el) => {
              // Eliminar elemento o contenedor padre si es apropiado
              const parent = el.closest("article, .card, .item, li, div[class*='card'], div[class*='item']");
              (parent || el).remove();
            });
          }
        }
      }
    }

    processedArrays.add(rootPath);
    textUpdates++;
  });

  // PASO 3: Actualizar elementos escalares (no son índices de arrays)
  allElements.forEach((el) => {
    const path = el.dataset.cmsText;

    // Saltar si ya se procesó como parte de un array
    const isArrayIndex = Array.from(processedArrays).some((ap) => path.startsWith(ap + "."));
    if (isArrayIndex && path.match(/\.\d+$/)) return; // Es un índice de array procesado

    const value = get(content, path);
    if (value != null && !Array.isArray(value)) {
      el.textContent = value;
      if (!processedArrays.has(path)) {
        textUpdates++;
      }
    }
  });

  document.querySelectorAll("[data-cms-src]").forEach((el) => {
    const value = get(content, el.dataset.cmsSrc);
    if (value != null && value !== "") {
      el.setAttribute("src", value);
      srcUpdates++;
    }
  });

  document.querySelectorAll("[data-cms-alt]").forEach((el) => {
    const value = get(content, el.dataset.cmsAlt);
    if (value != null) el.setAttribute("alt", value);
  });

  document.querySelectorAll("[data-cms-href]").forEach((el) => {
    const value = get(content, el.dataset.cmsHref);
    if (value != null && value !== "") {
      el.setAttribute("href", value);
      hrefUpdates++;
    }
  });

  console.log(`[CMS] ✅ Hidratación completada: ${textUpdates} text, ${srcUpdates} src, ${hrefUpdates} href. Arrays procesados: ${processedArrays.size}`);
}

/* ── Listeners en tiempo real ────────────────────────────────────────── */

let unsubscribeFunctions = []; // Para desuscribirse de listeners

async function startRealtimeListeners() {
  const fb = await initFirebase();
  if (!fb) {
    console.log("[CMS] No hay Firebase configurado, listeners deshabilitados.");
    return;
  }

  // Evitar múltiples listeners si se llama más de una vez
  if (unsubscribeFunctions.length > 0) {
    console.log("[CMS] Listeners ya activos, skipping...");
    return;
  }

  const { db, fs } = fb;
  let lastContent = null;
  let updateTimeout;
  let changeCount = 0;

  // Actualizar contenido (con debounce para evitar múltiples actualizaciones)
  const updateContent = () => {
    changeCount++;
    console.log(`[CMS] Cambio detectado #${changeCount}, iniciando debounce...`);
    clearTimeout(updateTimeout);
    updateTimeout = setTimeout(async () => {
      try {
        const content = await loadContent();
        const contentStr = JSON.stringify(content);
        const lastStr = JSON.stringify(lastContent);
        const changed = contentStr !== lastStr;
        console.log(`[CMS] Verificación de cambio: ${changed ? "SÍ cambió" : "no cambió"}`);

        if (changed) {
          lastContent = structuredClone(content);
          console.log("[CMS] Iniciando hidratación...");
          hydrate(content);
          console.log("[CMS] Contenido actualizado en tiempo real.");
          document.dispatchEvent(new CustomEvent("wawa:content-updated", { detail: content }));
        }
      } catch (error) {
        console.error("[CMS] Error al actualizar en tiempo real:", error);
      }
    }, 200); // Debounce 200ms
  };

  try {
    console.log("[CMS] Iniciando listeners en tiempo real...");
    // Escuchar cambios en TODOS los documentos de "sitio"
    const unsubSitio = fs.onSnapshot(fs.collection(db, "sitio"), (snap) => {
      console.log(`[CMS] onSnapshot(sitio): ${snap.docs.length} docs`);
      updateContent();
    });
    unsubscribeFunctions.push(unsubSitio);

    // Escuchar cambios en las colecciones
    const unsubValores = fs.onSnapshot(fs.collection(db, "valores"), (snap) => {
      console.log(`[CMS] onSnapshot(valores): ${snap.docs.length} docs`);
      updateContent();
    });
    unsubscribeFunctions.push(unsubValores);

    const unsubDirectorio = fs.onSnapshot(fs.collection(db, "directorio"), (snap) => {
      console.log(`[CMS] onSnapshot(directorio): ${snap.docs.length} docs`);
      updateContent();
    });
    unsubscribeFunctions.push(unsubDirectorio);

    const unsubNoticias = fs.onSnapshot(fs.collection(db, "noticias"), (snap) => {
      console.log(`[CMS] onSnapshot(noticias): ${snap.docs.length} docs`);
      updateContent();
    });
    unsubscribeFunctions.push(unsubNoticias);

    console.log("[CMS] Listeners establecidos correctamente.");
  } catch (error) {
    console.error("[CMS] No se pudieron establecer listeners en tiempo real:", error);
  }
}

// Limpiar listeners al descargar la página (evitar memory leaks)
window.addEventListener("beforeunload", () => {
  console.log("[CMS] Limpiando listeners...");
  unsubscribeFunctions.forEach((unsub) => unsub());
  unsubscribeFunctions = [];
});

/* ── Auto-ejecución ──────────────────────────────────────────────────── */

async function run() {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  console.log(`[CMS] ===== INICIALIZANDO EN: ${currentPage} =====`);
  try {
    const content = await loadContent();
    console.log(`[CMS] Contenido cargado:`, {
      keys: Object.keys(content),
      requis: content.pasantia?.requisitos,
      heroSlides: content.heroSlides?.slides?.length || 0
    });
    hydrate(content);
    console.log(`[CMS] Hidratación completada para ${currentPage}`);
    document.dispatchEvent(new CustomEvent("wawa:content-ready", { detail: content }));
    await startRealtimeListeners();
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
