import { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult, 
  signOut 
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../config/firebase';

const AuthContext = createContext();

googleProvider.setCustomParameters({ prompt: 'select_account' });

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    // Función para crear el registro en 'users' si es la primera vez que se loguea
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
                });
            }
        } catch (error) {
            console.error("Error al sincronizar usuario en Firestore:", error);
        }
    };

   useEffect(() => {
    // 1. Procesar la vuelta del redirect si ocurrió uno
    getRedirectResult(auth)
        .then(async (result) => {
            if (result?.user) {
                await syncUserToFirestore(result.user);
                setUser(result.user);
            }
        })
        .catch((error) => {
            console.error("Error procesando resultado de redirect:", error);
        });

    // 2. Escuchar cambios de estado en Auth
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
            await syncUserToFirestore(currentUser);
            setUser(currentUser);
        } else {
            setUser(null);
        }
        setAuthLoading(false);
    });

    return () => unsubscribe();
}, []);

const loginWithGoogle = async () => {
    try {
        // En la compu intentamos SIEMPRE con Pop-up primero
        const result = await signInWithPopup(auth, googleProvider);
        if (result?.user) {
            await syncUserToFirestore(result.user);
        }
    } catch (error) {
        console.error("Error en login con popup:", error);
        
        // Solo si el navegador bloquea el popup (común en celus), probamos con redirect
        if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
            console.warn("Popup bloqueado, intentando redirect...");
            await signInWithRedirect(auth, googleProvider);
        } else {
            throw error;
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