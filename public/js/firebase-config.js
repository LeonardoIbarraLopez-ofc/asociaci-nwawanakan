/**
 * Configuración de Firebase y Cloudinary — fuente única de credenciales.
 *
 * ── CÓMO ACTIVAR EL CMS ──────────────────────────────────────────────
 * 1. Reemplaza los valores "TU_..." con las credenciales reales:
 *      - Firebase: Consola > Configuración del proyecto > Tus apps (App Web)
 *      - Cloudinary: Dashboard (cloud name) + Settings > Upload preset (unsigned)
 * 2. No se necesita nada más: el sitio y el panel /admin detectan
 *    automáticamente que la configuración está completa y se activan.
 *
 * NOTA DE SEGURIDAD: la apiKey de Firebase para web es pública por diseño
 * (no es un secreto). El acceso real lo controlan las reglas de Firestore
 * (ver firestore.rules). Por eso es seguro versionar este archivo.
 * ─────────────────────────────────────────────────────────────────────
 */

export const FIREBASE_CONFIG = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  projectId: "TU_PROYECTO",
  storageBucket: "TU_PROYECTO.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};

export const CLOUDINARY = {
  cloudName: "TU_CLOUD_NAME",
  uploadPreset: "wawanakan_cms",
  folder: "wawanakan"
};

/** Devuelve true solo cuando las credenciales reales ya fueron colocadas. */
export function isFirebaseConfigured() {
  return Boolean(FIREBASE_CONFIG.apiKey) && !FIREBASE_CONFIG.apiKey.startsWith("TU_");
}

/** Devuelve true cuando Cloudinary está listo para subir imágenes. */
export function isCloudinaryConfigured() {
  return Boolean(CLOUDINARY.cloudName) && !CLOUDINARY.cloudName.startsWith("TU_");
}
