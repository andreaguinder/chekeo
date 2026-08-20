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
        // 1. Procesar el resultado del redirect
        getRedirectResult(auth)
            .then(async (result) => {
                if (result?.user) {
                    await syncUserToFirestore(result.user);
                    setUser(result.user);
                }
            })
            .catch((error) => {
                console.error("Error al procesar redirect:", error);
            });

        // 2. Escuchar la sesión de Firebase
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                await syncUserToFirestore(currentUser);
            }
            setUser(currentUser);
            setAuthLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const loginWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            if (result?.user) {
                await syncUserToFirestore(result.user);
            }
        } catch (error) {
            if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
                console.warn("Popup bloqueado, redirigiendo...");
                await signInWithRedirect(auth, googleProvider);
            } else {
                console.error("Error al iniciar sesión con Google:", error);
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