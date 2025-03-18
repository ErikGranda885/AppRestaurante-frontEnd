import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDw36UN-V0571yI-uh-7xsfWCuOBhVTs2w",
  authDomain: "dicolaic-app.firebaseapp.com",
  projectId: "dicolaic-app",
  storageBucket: "dicolaic-app.appspot.com",
  messagingSenderId: "897181552851",
  appId: "1:897181552851:web:630908fa18dc0e8482c426",
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Obtén el Storage y expórtalo
export const storage = getStorage(app);
