import { initializeApp, getApps, getApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDw36UN-V0571yI-uh-7xsfWCuOBhVTs2w",
  authDomain: "dicolaic-app.firebaseapp.com",
  projectId: "dicolaic-app",
  storageBucket: "dicolaic-app.appspot.com",
  messagingSenderId: "897181552851",
  appId: "1:897181552851:web:630908fa18dc0e8482c426",
};

// Inicialización segura (previene múltiples inicializaciones)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Exporta storage inicializado
export const storage = getStorage(app);
