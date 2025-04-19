import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebaseClient";

export async function uploadImage(
  file: File,
  carpeta: string = "otros",
  nombrePersonalizado?: string,
): Promise<string> {
  try {
    const timestamp = Date.now();
    const extension = file.name.split(".").pop();
    const nombreArchivo = nombrePersonalizado
      ? `${nombrePersonalizado}-${timestamp}.${extension}`
      : `${file.name.split(".")[0]}-${timestamp}.${extension}`;

    const storageRef = ref(storage, `${carpeta}/${nombreArchivo}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error("Error al subir imagen a Firebase:", error);
    throw error;
  }
}
