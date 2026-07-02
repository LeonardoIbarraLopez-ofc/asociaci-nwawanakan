/**
 * Inicialización compartida del SDK de Firebase (versión modular vía CDN).
 *
 * Reexporta la app, Firestore y Auth ya inicializados para que tanto el sitio
 * público como el panel /admin usen una única instancia. Si las credenciales
 * todavía no están configuradas, `db` y `auth` quedan en null y los módulos
 * que dependan de ellos deben degradar con elegancia.
 */
import { FIREBASE_CONFIG, isFirebaseConfigured } from "./firebase-config.js";

const SDK_VERSION = "10.12.2";
const BASE = `https://www.gstatic.com/firebasejs/${SDK_VERSION}`;

let appPromise = null;

/**
 * Inicializa Firebase una sola vez (lazy). Devuelve { app, db, auth, fs, authApi }
 * donde `fs` y `authApi` exponen las funciones del SDK modular ya importadas.
 * Devuelve null si las credenciales aún son los placeholders.
 */
export function initFirebase() {
  if (!isFirebaseConfigured()) return Promise.resolve(null);
  if (appPromise) return appPromise;

  appPromise = (async () => {
    const [{ initializeApp }, fs, authApi] = await Promise.all([
      import(`${BASE}/firebase-app.js`),
      import(`${BASE}/firebase-firestore.js`),
      import(`${BASE}/firebase-auth.js`)
    ]);

    const app = initializeApp(FIREBASE_CONFIG);
    const db = fs.getFirestore(app);
    const auth = authApi.getAuth(app);

    return { app, db, auth, fs, authApi };
  })();

  return appPromise;
}
