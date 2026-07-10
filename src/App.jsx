import { useState, useEffect, useMemo } from "react";
import "./main.scss";
import { ContenedorGeneral } from "./components/ContenedorGeneral/ContenedorGeneral";
import { Navbar } from "./components/Navbar/Navbar";
import { Form } from "./components/Form/Form"
import { ContenedorTareas } from "./components/ContenedorTareas/ContenedorTareas";
import { Footer } from "./components/Footer/Footer";
import { tareas } from "./data/mock"
import { useLocalStorage } from "./hooks/useLocalStorage";

function App() {

  const [listaTareas, setListaTareas] = useLocalStorage("misTareas", tareas);

  const agregarTarea = (dataTareas) => {

    setListaTareas([{ id: listaTareas.length + 1, ...dataTareas }, ...listaTareas])
  }

  const handleToggle = (id) => {
    setListaTareas(prev => prev.map(t =>
      t.id === id ? { ...t, status: !t.status } : t
    ));
  };

  const handleDelete = (id) => {
    setListaTareas(prev => prev.filter(t => t.id !== id));
  };

  const [busqueda, setBusqueda] = useState("")



  const tareasFiltradas = useMemo(() => {

    return listaTareas.filter(t =>
      t.title.toLowerCase().includes(busqueda.toLowerCase())
    );
  }, [listaTareas, busqueda]);


  return (
    <>

      <ContenedorGeneral>

        <Navbar onSearch={(valor) => setBusqueda(valor)} />
        <Form agregarTarea={agregarTarea} />
        <ContenedorTareas listaTareas={tareasFiltradas} handleToggle={handleToggle} handleDelete={handleDelete} />
        <Footer />
      </ContenedorGeneral>

    </>
  );
}

export default App;
