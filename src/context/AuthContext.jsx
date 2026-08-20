import { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithRedirect,
  signOut 
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../config/firebase';

const AuthContext = createContext();

// Forzamos a que siempre pregunte qué cuenta usar
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
        // Escuchar el cambio de estado global del usuario
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
        await signInWithPopup(auth, googleProvider);
    } catch (error) {
        if (error.code === 'auth/popup-closed-by-user') {
            console.log("El usuario cerró la ventana emergente.");
            return;
        }

        // Si el navegador de la compu bloqueó el popup, caemos a redirect
        if (error.code === 'auth/popup-blocked') {
            console.warn("Popup bloqueado por el navegador. Intentando redirect...");
            await signInWithRedirect(auth, googleProvider);
            return;
        }

        console.error("Error en el inicio de sesión con Google:", error);
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