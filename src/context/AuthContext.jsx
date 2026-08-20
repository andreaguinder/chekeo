import { createContext, useContext, useEffect, useState } from 'react';
import { 
  signOut, 
  onAuthStateChanged, 
  signInWithRedirect, 
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
    // Escuchador único: Firebase maneja la sesión automáticamente tras el redirect
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          setUser(currentUser);
          await syncUserToFirestore(currentUser);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Error en AuthState:", err);
      } finally {
        // Garantiza que el spinner se apague SIEMPRE
        setAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = (e) => {
    if (e && e.preventDefault) e.preventDefault();

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    // Cero Regex, cero Popups. Redirección limpia universal:
    signInWithRedirect(auth, provider).catch((error) => {
      console.error("Error al redirigir:", error);
    });
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