/** Subida de imágenes a Cloudinary mediante el Upload Widget oficial. */
import { CLOUDINARY, isCloudinaryConfigured } from "../../js/firebase-config.js";

const WIDGET_SCRIPT = "https://upload-widget.cloudinary.com/global/all.js";
let scriptPromise = null;

function ensureScript() {
  if (window.cloudinary) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = WIDGET_SCRIPT;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("No se pudo cargar el widget de Cloudinary."));
    document.head.appendChild(s);
  });
  return scriptPromise;
}

export { isCloudinaryConfigured };

/**
 * Abre el widget de Cloudinary y resuelve con la URL segura de la imagen subida.
 * `folder` es una subcarpeta dentro de la carpeta raíz configurada.
 */
export async function pickImage(folder = "general") {
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary no está configurado. Edita public/js/firebase-config.js.");
  }
  await ensureScript();

  return new Promise((resolve, reject) => {
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: CLOUDINARY.cloudName,
        uploadPreset: CLOUDINARY.uploadPreset,
        folder: `${CLOUDINARY.folder}/${folder}`,
        sources: ["local", "url", "camera"],
        multiple: false,
        maxFiles: 1,
        language: "es",
        text: { es: { menu: { files: "Mis archivos" } } }
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        if (result && result.event === "success") {
          resolve(result.info.secure_url);
        }
      }
    );
    widget.open();
  });
}
