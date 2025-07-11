import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebaseClient";

export async function uploadImage(
  file: File,
  carpeta: string = "otros",
  nombrePersonalizado?: string,
): Promise<string> {
  try {
    const extension = file.name.split(".").pop();
    const nombreArchivo = nombrePersonalizado
      ? `${nombrePersonalizado}.${extension}`
      : file.name;

    const storageRef = ref(storage, `${carpeta}/${nombreArchivo}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error("Error al subir imagen a Firebase:", error);
    throw error;
  }
}
