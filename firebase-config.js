// ============================================================
//  CONFIGURACION DE FIREBASE (una por cliente)
//  Firebase Console > Configuracion del proyecto > Tus apps > Web
//  Pega aca los datos de tu proyecto. Mientras diga "PEGAR",
//  la pagina funciona igual pero sin contador ni galeria editable.
// ============================================================
export const firebaseConfig = {
  apiKey: "AIzaSyBjvUjaYzHTpfer4GItAvrm8FYUFSEzQJQ",
  authDomain: "rosas-eternas-af9ab.firebaseapp.com",
  databaseURL: "https://rosas-eternas-af9ab-default-rtdb.firebaseio.com",
  projectId: "rosas-eternas-af9ab",
  storageBucket: "rosas-eternas-af9ab.firebasestorage.app",
  messagingSenderId: "269199668290",
  appId: "1:269199668290:web:724fa44412c7ca721029db"
};

// Datos del negocio
export const negocio = {
  nombre: "Reina Dabi",
  whatsapp: "5491166504492"
};

export const firebaseListo = !Object.values(firebaseConfig).includes("PEGAR");
