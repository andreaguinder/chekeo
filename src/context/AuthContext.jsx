import { createContext, useContext, useEffect, useState } from 'react';
import { 
  signOut, 
  onAuthStateChanged, 
  signInWithRedirect, 
  signInWithPopup, 
  getRedirectResult,
  setPersistence,
  browserLocalPersistence,
  GoogleAuthProvider 
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

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
    const initAuth = async () => {
      try {
        // Forzar que Firebase use localStorage y no sessionStorage/cookies de 3ros
        await setPersistence(auth, browserLocalPersistence);

        // Procesar las credenciales al volver del redirect
        const redirectResult = await getRedirectResult(auth);
        if (redirectResult?.user) {
          await syncUserToFirestore(redirectResult.user);
          setUser(redirectResult.user);
        }
      } catch (error) {
        console.error("Error al procesar el resultado del redirect:", error);
      }
    };

    initAuth();

    // Escuchar el estado de autenticación
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
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile) {
      await signInWithRedirect(auth, provider);
    } else {
      try {
        await signInWithPopup(auth, provider);
      } catch (error) {
        if (error.code === 'auth/popup-blocked') {
          console.warn("Popup bloqueado. Reintentando con Redirect...");
          await signInWithRedirect(auth, provider);
        } else if (error.code === 'auth/popup-closed-by-user') {
          return;
        } else {
          console.error("Error en login:", error);
        }
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
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