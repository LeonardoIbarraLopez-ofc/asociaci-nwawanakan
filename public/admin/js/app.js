/**
 * Orquestador del panel /admin.
 * - Verifica que el CMS esté configurado.
 * - Controla el inicio/cierre de sesión (Firebase Auth).
 * - Renderiza el editor de cada sección a partir del esquema (schema.js).
 * - Incluye un editor dedicado para los centros y una utilidad para sembrar
 *   el contenido por defecto en Firestore (Fase I del plan).
 */
import { isFirebaseConfigured } from "../../js/firebase-config.js";
import { DEFAULT_CONTENT } from "../../js/content-defaults.js";
import { login, logout, onAuthChanged, authErrorMessage } from "./auth.js";
import {
  getDocData, setDocData, replaceDocData,
  getCollectionData, setCollectionDoc, deleteCollectionDoc
} from "./store.js";
import { SECTIONS, CENTROS_SECTION } from "./schema.js";
import { buildForm } from "./form-builder.js";

/* ── Referencias del DOM ─────────────────────────────────────────────── */
const $ = (id) => document.getElementById(id);
const loginScreen = $("login-screen");
const dashboard = $("dashboard");
const notConfigured = $("not-configured");
const loginForm = $("login-form");
const loginError = $("login-error");
const navList = $("nav-list");
const editorArea = $("editor-area");
const editorTitle = $("editor-title");
const toast = $("toast");

let currentKey = null;

/* ── Utilidades ──────────────────────────────────────────────────────── */
function slugify(text) {
  const s = (text || "")
    .toString().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return s || `item-${Date.now()}`;
}

function showToast(message, type = "ok") {
  toast.textContent = message;
  toast.className = `cms-toast cms-toast-${type} is-visible`;
  setTimeout(() => toast.classList.remove("is-visible"), 3200);
}

function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === "class") node.className = v;
    else if (k === "text") node.textContent = v;
    else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v);
  }
  (Array.isArray(children) ? children : [children]).forEach((c) => c && node.appendChild(typeof c === "string" ? document.createTextNode(c) : c));
  return node;
}

/* ── Navegación ──────────────────────────────────────────────────────── */
function buildNav() {
  navList.innerHTML = "";
  const allSections = [...SECTIONS, CENTROS_SECTION];
  allSections.forEach((section) => {
    const btn = el("button", {
      class: "cms-nav-btn", type: "button", "data-key": section.key, text: section.label,
      onclick: () => selectSection(section)
    });
    navList.appendChild(btn);
  });
}

function setActiveNav(key) {
  navList.querySelectorAll(".cms-nav-btn").forEach((b) => {
    b.classList.toggle("active", b.dataset.key === key);
  });
}

async function selectSection(section) {
  currentKey = section.key;
  setActiveNav(section.key);
  editorTitle.textContent = section.label;
  editorArea.innerHTML = "";
  editorArea.appendChild(el("p", { class: "cms-loading", text: "Cargando…" }));

  try {
    if (section.key === "centros") await renderCentros(section);
    else if (section.storage.type === "collection") await renderCollection(section);
    else await renderDoc(section);
  } catch (err) {
    editorArea.innerHTML = "";
    editorArea.appendChild(el("p", { class: "cms-error-msg", text: `Error: ${err.message}` }));
  }
}

/* ── Editor de documento único ───────────────────────────────────────── */
async function renderDoc(section) {
  const stored = await getDocData(section.storage.path);
  const data = { ...(DEFAULT_CONTENT[section.key] || {}), ...(stored || {}) };

  const form = buildForm(section.fields, data);
  editorArea.innerHTML = "";
  if (section.note) editorArea.appendChild(el("p", { class: "cms-hint", text: section.note }));
  editorArea.appendChild(form.node);

  const saveBtn = el("button", {
    class: "cms-btn cms-btn-primary", type: "button", text: "Guardar cambios",
    onclick: async () => {
      saveBtn.disabled = true;
      try {
        await setDocData(section.storage.path, form.collect());
        showToast("Cambios guardados correctamente.");
      } catch (err) {
        showToast(`No se pudo guardar: ${err.message}`, "error");
      } finally {
        saveBtn.disabled = false;
      }
    }
  });
  editorArea.appendChild(el("div", { class: "cms-actions" }, [saveBtn]));
}

/* ── Editor de colección ─────────────────────────────────────────────── */
async function renderCollection(section) {
  let items = await getCollectionData(section.storage.name);
  if (!items.length && Array.isArray(DEFAULT_CONTENT[section.key])) {
    items = structuredClone(DEFAULT_CONTENT[section.key]);
  }
  const originalIds = items.map((it) => it.id).filter(Boolean);

  editorArea.innerHTML = "";
  const list = el("div", { class: "cms-objlist" });

  const makeItem = (itemData) => {
    const form = buildForm(section.fields, itemData || {});
    const head = el("div", { class: "cms-objlist-head" }, [
      el("strong", { text: itemData && itemData[section.fields[0].key] ? itemData[section.fields[0].key] : (section.itemLabel || "Nuevo") }),
      el("button", { class: "cms-icon-btn cms-icon-danger", type: "button", text: "Eliminar", onclick: () => item.remove() })
    ]);
    const item = el("div", { class: "cms-objlist-item" }, [head, form.node]);
    item.__id = itemData && itemData.id ? itemData.id : null;
    item.__collect = () => form.collect();
    return item;
  };

  items.forEach((it) => list.appendChild(makeItem(it)));
  editorArea.appendChild(list);

  const addBtn = el("button", {
    class: "cms-btn cms-btn-soft", type: "button", text: `+ Añadir ${section.itemLabel || "elemento"}`,
    onclick: () => list.appendChild(makeItem({}))
  });

  const saveBtn = el("button", {
    class: "cms-btn cms-btn-primary", type: "button", text: "Guardar cambios",
    onclick: async () => {
      saveBtn.disabled = true;
      try {
        const used = new Set();
        const nodes = Array.from(list.querySelectorAll(":scope > .cms-objlist-item"));
        for (const node of nodes) {
          const values = node.__collect();
          let id = node.__id || slugify(values[section.storage.idFrom]);
          while (used.has(id)) id += "-2";
          used.add(id);
          await setCollectionDoc(section.storage.name, id, values);
        }
        for (const oid of originalIds) {
          if (!used.has(oid)) await deleteCollectionDoc(section.storage.name, oid);
        }
        showToast("Cambios guardados correctamente.");
        selectSection(section); // refrescar ids
      } catch (err) {
        showToast(`No se pudo guardar: ${err.message}`, "error");
      } finally {
        saveBtn.disabled = false;
      }
    }
  });

  editorArea.appendChild(el("div", { class: "cms-actions" }, [addBtn, saveBtn]));
}

/* ── Editor dedicado de centros ──────────────────────────────────────── */
async function renderCentros(section) {
  let doc = await getDocData(section.storage.path);
  if (!doc) {
    doc = await fetch("../data/centers.json").then((r) => r.json());
  }
  const details = doc.centerDetails || {};
  const keys = Object.keys(details);

  const centerFields = [
    { key: "name", label: "Nombre mostrado", type: "text" },
    { key: "subtitulo", label: "Subtítulo", type: "text" },
    { key: "address", label: "Dirección", type: "text" },
    { key: "image", label: "Imagen del centro", type: "image", folder: "centros" }
  ];

  editorArea.innerHTML = "";
  editorArea.appendChild(el("p", { class: "cms-hint", text: "Edita el nombre, subtítulo, dirección e imagen de cada centro infantil. La imagen puede ser un archivo subido a Cloudinary o el nombre del archivo en assets/centros/." }));

  const list = el("div", { class: "cms-objlist" });
  const controllers = [];

  keys.forEach((key) => {
    const data = { name: details[key].name || key, ...details[key] };
    const form = buildForm(centerFields, data);
    const item = el("div", { class: "cms-objlist-item" }, [
      el("div", { class: "cms-objlist-head" }, [el("strong", { text: key })]),
      form.node
    ]);
    list.appendChild(item);
    controllers.push({ key, collect: form.collect });
  });
  editorArea.appendChild(list);

  const saveBtn = el("button", {
    class: "cms-btn cms-btn-primary", type: "button", text: "Guardar cambios",
    onclick: async () => {
      saveBtn.disabled = true;
      try {
        const updated = structuredClone(doc);
        updated.centerDetails = updated.centerDetails || {};
        controllers.forEach(({ key, collect }) => {
          updated.centerDetails[key] = { ...updated.centerDetails[key], ...collect() };
        });
        await replaceDocData(section.storage.path, updated);
        showToast("Centros guardados correctamente.");
      } catch (err) {
        showToast(`No se pudo guardar: ${err.message}`, "error");
      } finally {
        saveBtn.disabled = false;
      }
    }
  });
  editorArea.appendChild(el("div", { class: "cms-actions" }, [saveBtn]));
}

/* ── Sembrado inicial de contenido (Fase I) ──────────────────────────── */
async function seedContent() {
  if (!confirm("Esto escribirá el contenido actual del sitio en Firestore como punto de partida. ¿Continuar?")) return;
  try {
    const siteDocs = ["config", "footer", "home", "heroSlides", "misionSlides", "visionSlides", "equipo", "voluntariado", "pasantia", "quienesSomos"];
    for (const key of siteDocs) {
      await setDocData(["sitio", key], DEFAULT_CONTENT[key]);
    }
    for (const v of DEFAULT_CONTENT.valores) {
      await setCollectionDoc("valores", v.id, { titulo: v.titulo, descripcion: v.descripcion, orden: v.orden });
    }
    for (const d of DEFAULT_CONTENT.directorio) {
      await setCollectionDoc("directorio", d.id, { nombre: d.nombre, cargo: d.cargo, descripcionCargo: d.descripcionCargo, foto: d.foto, orden: d.orden });
    }
    const centers = await fetch("../data/centers.json").then((r) => r.json());
    await replaceDocData(["sitio", "centros"], centers);
    showToast("Contenido inicial cargado en Firestore.");
  } catch (err) {
    showToast(`No se pudo inicializar: ${err.message}`, "error");
  }
}

/* ── Sesión ──────────────────────────────────────────────────────────── */
function showLogin() {
  loginScreen.hidden = false;
  dashboard.hidden = true;
  notConfigured.hidden = true;
}

function showDashboard() {
  loginScreen.hidden = true;
  dashboard.hidden = false;
  notConfigured.hidden = true;
  buildNav();
  if (SECTIONS.length) selectSection(SECTIONS[0]);
}

function showNotConfigured() {
  loginScreen.hidden = true;
  dashboard.hidden = true;
  notConfigured.hidden = false;
}

/* ── Arranque ────────────────────────────────────────────────────────── */
function init() {
  if (!isFirebaseConfigured()) {
    showNotConfigured();
    return;
  }

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    loginError.hidden = true;
    const btn = loginForm.querySelector("button[type=submit]");
    btn.disabled = true;
    try {
      await login($("admin-email").value, $("admin-password").value);
    } catch (err) {
      loginError.textContent = authErrorMessage(err);
      loginError.hidden = false;
    } finally {
      btn.disabled = false;
    }
  });

  $("logout-btn").addEventListener("click", () => logout());
  $("seed-btn").addEventListener("click", seedContent);

  onAuthChanged((user) => {
    if (user) showDashboard();
    else showLogin();
  });
}

init();
