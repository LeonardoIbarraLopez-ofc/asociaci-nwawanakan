/** Acceso a Firestore para el panel /admin (lectura y escritura). */
import { initFirebase } from "../../js/firebase-app.js";

async function ctx() {
  const fb = await initFirebase();
  if (!fb) throw new Error("Firebase no está configurado.");
  return fb;
}

/** Lee un documento. `path` es un arreglo, p. ej. ["sitio", "config"]. */
export async function getDocData(path) {
  const { db, fs } = await ctx();
  const snap = await fs.getDoc(fs.doc(db, ...path));
  return snap.exists() ? snap.data() : null;
}

/** Crea o actualiza un documento (merge). */
export async function setDocData(path, data) {
  const { db, fs } = await ctx();
  await fs.setDoc(fs.doc(db, ...path), data, { merge: true });
}

/** Sobrescribe por completo un documento (sin merge). */
export async function replaceDocData(path, data) {
  const { db, fs } = await ctx();
  await fs.setDoc(fs.doc(db, ...path), data);
}

/** Lee todos los documentos de una colección como [{ id, ...data }]. */
export async function getCollectionData(name) {
  const { db, fs } = await ctx();
  const snap = await fs.getDocs(fs.collection(db, name));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/** Crea o reemplaza un documento de colección por id. */
export async function setCollectionDoc(name, id, data) {
  const { db, fs } = await ctx();
  await fs.setDoc(fs.doc(db, name, id), data);
}

/** Elimina un documento de colección por id. */
export async function deleteCollectionDoc(name, id) {
  const { db, fs } = await ctx();
  await fs.deleteDoc(fs.doc(db, name, id));
}
