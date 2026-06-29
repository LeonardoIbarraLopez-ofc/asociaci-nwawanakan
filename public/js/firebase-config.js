/**
 * Configuración de Firebase y Cloudinary — fuente única de credenciales.
 *
 * ── CÓMO ACTIVAR EL CMS ──────────────────────────────────────────────
 * 1. En la Consola de Firebase > Configuración del proyecto > Tus apps (App Web)
 *    copia el objeto `firebaseConfig` que te muestra y pega aquí sus valores
 *    en FIREBASE_CONFIG (reemplazando los "TU_...").
 * 2. (Cloudinary ya configurado: cloud name + upload preset unsigned + folder.)
 * 3. No se necesita nada más: el sitio y el panel /admin detectan
 *    automáticamente que la configuración está completa y se activan.
 *
 * HOSTING: el sitio se publica con GitHub Pages, no con Firebase Hosting.
 * Firebase se usa solo como base de datos (Firestore) y autenticación (Auth).
 *
 * NOTA DE SEGURIDAD: el firebaseConfig de web (apiKey incluida) es público por
 * diseño, no es un secreto. El acceso real lo controlan las reglas de Firestore
 * (ver firestore.rules) + Firebase Auth. Por eso es seguro versionar este archivo.
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
  cloudName: "diswqpy8v",
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
