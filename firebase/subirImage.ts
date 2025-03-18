// src/firebase/uploadImage.ts
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/firebase/firebaseClient";

export async function uploadImage(file: File): Promise<string> {
  // Crea una referencia única para la imagen en la carpeta "productos"
  const storageRef = ref(storage, `productos/${file.name}-${Date.now()}`);
  // Sube el archivo
  const snapshot = await uploadBytes(storageRef, file);
  // Obtén y retorna la URL de descarga
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
}
