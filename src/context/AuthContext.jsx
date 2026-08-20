import { createContext, useContext, useEffect, useState } from 'react';
import { 
  signOut, 
  onAuthStateChanged, 
  signInWithRedirect, 
  signInWithPopup, 
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
    // Un solo listener: escucha login, logout y retornos de redirect
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
        setAuthLoading(false); // Destraba el spinner SIEMPRE
      }
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = (e) => {
    if (e && e.preventDefault) e.preventDefault();

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile) {
      signInWithRedirect(auth, provider).catch(err => console.error("Error redirect:", err));
    } else {
      signInWithPopup(auth, provider).catch((error) => {
        if (error.code === 'auth/popup-blocked') {
          // Si una extensión lo frena en desktop, manda redirect como auxilio
          signInWithRedirect(auth, provider);
        } else if (error.code !== 'auth/popup-closed-by-user') {
          console.error("Error popup:", error);
        }
      });
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