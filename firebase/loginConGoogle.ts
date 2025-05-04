// lib/firebase/loginConGoogle.ts
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "./firebaseClient";

export async function loginConGoogle() {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    return {
      nombre: user.displayName,
      correo: user.email,
      foto: user.photoURL,
      uid: user.uid,
    };
  } catch (error) {
    console.error("❌ Error al iniciar sesión con Google:", error);
    throw new Error("Falló el inicio de sesión con Google");
  }
}
