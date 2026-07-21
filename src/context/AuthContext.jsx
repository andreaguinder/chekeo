import { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  getRedirectResult, 
  signOut 
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase'; 

const AuthContext = createContext();

googleProvider.setCustomParameters({ prompt: 'select_account' });

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

useEffect(() => {
  // getRedirectResult solo para atrapar errores de la redirección
  getRedirectResult(auth).catch((error) => {
    console.error("Error al procesar el resultado de redirección:", error);
  });

  // onAuthStateChanged se encarga 100% de setear el usuario y quitar el loading
  const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    setUser(currentUser);
    setAuthLoading(false);
  });

  return () => unsubscribe();
}, []);

    const loginWithGoogle = async () => {
  try {
    await signInWithPopup(auth, googleProvider);
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