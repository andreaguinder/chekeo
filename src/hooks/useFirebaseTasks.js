import { useState, useEffect } from "react";
import { db, auth } from "../config/firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export const useFirebaseTasks = (initialValue = []) => {
  const [tasks, setTasks] = useState(initialValue);
  const [user, setUser] = useState(null);

  // 1. Escuchar Auth
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      
      if (!currentUser) {
        // Fallback: Si no hay usuario, cargamos desde localStorage
        const local = localStorage.getItem("tareas");
        setTasks(local ? JSON.parse(local) : initialValue);
      }
    });
    return () => unsubscribeAuth();
  }, [initialValue]);

  // 2. Escuchar Firestore en tiempo real (usando user.uid)
  useEffect(() => {
    if (!user) return;

    // Usamos el UID único que da Firebase Auth
    const docRef = doc(db, "chekeo_tasks", user.uid);

    const unsubscribeSnapshot = onSnapshot(docRef, async (docSnap) => {
      if (docSnap.exists()) {
        setTasks(docSnap.data().lista || []);
      } else {
        // Si es la primera vez que se loguea este usuario,
        // migramos las tareas que tenía guardadas localmente en el celu a la nube:
        const local = localStorage.getItem("tareas");
        const localTasks = local ? JSON.parse(local) : [];
        
        if (localTasks.length > 0) {
          await setDoc(docRef, { lista: localTasks }, { merge: true });
          setTasks(localTasks);
        } else {
          setTasks([]);
        }
      }
    });

    return () => unsubscribeSnapshot();
  }, [user]);

  // 3. Función para guardar
  const saveTasks = async (newTasks) => {
    setTasks(newTasks);

    if (user) {
      try {
        const docRef = doc(db, "chekeo_tasks", user.uid);
        await setDoc(docRef, { lista: newTasks }, { merge: true });
      } catch (error) {
        console.error("Error al guardar en Firestore:", error);
      }
    } else {
      localStorage.setItem("tareas", JSON.stringify(newTasks));
    }
  };

  return [tasks, saveTasks, user];
};