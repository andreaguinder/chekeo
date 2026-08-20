import { createContext, useContext, useEffect, useState } from 'react';
import { 
  signOut, 
  onAuthStateChanged, 
  signInWithRedirect, 
  signInWithPopup, 
  getRedirectResult,
  GoogleAuthProvider 
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // 👤 Función para guardar o actualizar al usuario en Firestore
  const syncUserToFirestore = async (loggedUser) => {
    if (!loggedUser) return;
    try {
      const userRef = doc(db, 'users', loggedUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: loggedUser.uid,
          email: loggedUser.email,
          displayName: loggedUser.displayName,
          photoURL: loggedUser.photoURL,
          role: 'user',
          createdAt: serverTimestamp()
        }, { merge: true });
      }
    } catch (error) {
      console.error("Error al sincronizar usuario en Firestore:", error);
    }
  };

  useEffect(() => {
    // 1. Capturar el resultado del redirect al volver de Google (clave para que funcione en PROD)
    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          await syncUserToFirestore(result.user);
          setUser(result.user);
        }
      })
      .catch((error) => {
        console.error("Error al procesar el resultado del redirect:", error);
      });

    // 2. Escuchar cambios de estado en Auth
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        await syncUserToFirestore(currentUser);
      }

      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });

      const isDevelopment = typeof window !== 'undefined' && window.location.hostname === 'localhost';

      if (isDevelopment) {
        // En local usamos Popup para iterar rápido
        await signInWithPopup(auth, provider);
      } else {
        // En producción usás Redirect exactamente como en Zylos
        await signInWithRedirect(auth, provider);
      }
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, authLoading, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}