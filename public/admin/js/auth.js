/** Autenticación del panel /admin (Firebase Auth, email/password). */
import { initFirebase } from "../../js/firebase-app.js";

async function ctx() {
  const fb = await initFirebase();
  if (!fb) throw new Error("Firebase no está configurado.");
  return fb;
}

export async function login(email, password) {
  const { auth, authApi } = await ctx();
  await authApi.signInWithEmailAndPassword(auth, email, password);
}

export async function logout() {
  const { auth, authApi } = await ctx();
  await authApi.signOut(auth);
}

/** Registra un observador del estado de sesión. cb recibe el user (o null). */
export async function onAuthChanged(cb) {
  const { auth, authApi } = await ctx();
  authApi.onAuthStateChanged(auth, cb);
}

/** Traduce los códigos de error de Firebase Auth a mensajes en español. */
export function authErrorMessage(error) {
  const code = error && error.code ? error.code : "";
  const map = {
    "auth/invalid-email": "El correo electrónico no es válido.",
    "auth/user-disabled": "Esta cuenta está deshabilitada.",
    "auth/user-not-found": "No existe una cuenta con ese correo.",
    "auth/wrong-password": "Contraseña incorrecta.",
    "auth/invalid-credential": "Credenciales incorrectas.",
    "auth/too-many-requests": "Demasiados intentos. Intenta más tarde."
  };
  return map[code] || "No se pudo iniciar sesión. Verifica tus credenciales.";
}
