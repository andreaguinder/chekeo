import { useState, useEffect, useMemo } from "react";
import "./main.scss";
import { ContenedorGeneral } from "./components/ContenedorGeneral/ContenedorGeneral";
import { Navbar } from "./components/Navbar/Navbar";
import { Form } from "./components/Form/Form";
import { ContenedorTareas } from "./components/ContenedorTareas/ContenedorTareas";
import { Footer } from "./components/Footer/Footer";
import { tareas } from "./data/mock";
import { ModalSuccess } from './components/ModalSuccess/ModalSuccess';
import { UpdateToast } from './components/UpdateToast/UpdateToast';
import { ContainerLoading } from "./components/ContainerLoading/ContainerLoading";

import { useAuth } from "./context/AuthContext";
import { useFirebaseTasks } from "./hooks/useFirebaseTasks";

import logo from "./assets/logo-chekeo.png";

function App() {
  const { user, authLoading } = useAuth();

  const [listaTareas, setListaTareas] = useFirebaseTasks(tareas, user);

  const agregarTarea = (dataTareas) => {
    const nuevoId = listaTareas.length > 0 ? Math.max(...listaTareas.map(t => t.id)) + 1 : 1;
    setListaTareas([{ id: nuevoId, ...dataTareas }, ...listaTareas]);
  };

  const handleToggle = (id) => {
    setListaTareas(listaTareas.map(t =>
      t.id === id ? { ...t, status: !t.status } : t
    ));
  };

  const handleDelete = (id) => {
    setListaTareas(listaTareas.filter(t => t.id !== id));
  };

  const [busqueda, setBusqueda] = useState("");

  const tareasFiltradas = useMemo(() => {
    return listaTareas.filter(t =>
      t.title.toLowerCase().includes(busqueda.toLowerCase())
    );
  }, [listaTareas, busqueda]);

  const logoAlt = "Logo de Chekeo, tu App de tareas";
  const [mostrarModal, setMostrarModal] = useState(false);

  useEffect(() => {
    const handleAppInstalled = () => {
      setMostrarModal(true);
      if (typeof window.clarity === 'function') {
        window.clarity("event", "pwa_install");
      }
    };
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => window.removeEventListener('appinstalled', handleAppInstalled);
  }, []);

  // Si está resolviendo la autenticación inicial, mostramos el loader
  if (authLoading) {
    return <ContainerLoading />;
  }

  return (
    <>
      <ContenedorGeneral>
        <Navbar 
          imagen={logo} 
          alt={logoAlt} 
          onSearch={(valor) => setBusqueda(valor)}
        />
        
        <Form agregarTarea={agregarTarea} />
        <ContenedorTareas listaTareas={tareasFiltradas} handleToggle={handleToggle} handleDelete={handleDelete} />
        <Footer />
      </ContenedorGeneral>

      <ModalSuccess imagen={logo} alt={logoAlt} isOpen={mostrarModal} onClose={() => setMostrarModal(false)} />
      <UpdateToast />
    </>
  );
}

export default App;