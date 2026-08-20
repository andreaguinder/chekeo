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
      console.error("Error en Firestore:", error);
    }
  };

  useEffect(() => {
    // 1. Intentamos capturar si volvemos de un redirect sin bloquear la app
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          syncUserToFirestore(result.user);
        }
      })
      .catch((err) => {
        console.warn("Aviso en resultado de redirect:", err);
      });

    // 2. Suscripción global de sesión
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await syncUserToFirestore(currentUser);
      } else {
        setUser(null);
      }
      setAuthLoading(false); // Liberar el spinner SIEMPRE
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      // Intentamos con Popup primero
      await signInWithPopup(auth, provider);
    } catch (error) {
      // Si el navegador o extensión bloquea el Popup, pasamos automáticamente a Redirect
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
        console.warn("Popup bloqueado o cerrado. Pasando a login por redirección...");
        try {
          await signInWithRedirect(auth, provider);
        } catch (redirectError) {
          console.error("Error en redirect:", redirectError);
        }
      } else {
        console.error("Error en login:", error);
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
  return useContext(AuthContext);
}