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
        // 1. Procesar resultado de redirect (si vino de mobile o un redirect explícito)
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
        // Detección simple para saber si es mobile/tablet
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        if (isMobile) {
            // En celulares usamos redirect que es más estable para vistas webview / PWA
            await signInWithRedirect(auth, googleProvider);
        } else {
            // En desktop forzamos SIEMPRE Popup sin fallback a redirect
            try {
                const result = await signInWithPopup(auth, googleProvider);
                if (result?.user) {
                    await syncUserToFirestore(result.user);
                }
            } catch (error) {
                // Si el usuario cierra el popup a propósito, simplemente ignoramos el error
                if (error.code === 'auth/popup-closed-by-user') {
                    console.log("El usuario cerró la ventana de login.");
                    return;
                }
                console.error("Error en login con popup:", error);
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