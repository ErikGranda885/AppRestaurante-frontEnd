import { getStorage, ref, deleteObject } from "firebase/storage";

export async function eliminarImagen(url: string): Promise<void> {
  try {
    const storage = getStorage();
    const pathDecoded = decodeURIComponent(url.split("/o/")[1].split("?")[0]); // usuarios/nombre-archivo.png
    const storageRef = ref(storage, pathDecoded);
    await deleteObject(storageRef);
  } catch (error) {
    console.error("Error al eliminar imagen de Firebase:", error);
  }
}
