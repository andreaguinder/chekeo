import { useState } from "react";
import styles from './Form.module.scss';

const Form = (task) => {

  const [title, setTitle] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [estaCompletada, setEstaCompletada] = useState(false)

  const [error, setError] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()

    if (title.trim() === "") {
      setError("El nombre de la tarea no puede estar vacío");
      return;
    }

    task.agregarTarea({ title: title, descripcion: descripcion, status: estaCompletada })

    setTitle("");
    setDescripcion("");
    setEstaCompletada(false);
    setError("");
  }

  const handleTitle = (e) => {

    setTitle(e.target.value)

    if (e.target.value.trim() !== "") {
      setError("");
    }
    }

  const handleDescripcion = (e) => {
    setDescripcion(e.target.value)
  }

  const handleEstaCompletada = (e) => {
    setEstaCompletada(e.target.value === "true")
  }


  return (
    <section className={styles.containerForm}>
      <h2>Agregar tarea nueva:</h2>
      <form onSubmit={handleSubmit}>

<div className={styles.general}>
        <div className={styles.info}>
          <div>
            <label htmlFor="title">Nombre de la tarea:</label>
            <input type="text"
              placeholder="Escribe el nombre de la tarea"
              onChange={(e) => handleTitle(e)}
              value={title} />
              {error && <span className={styles.errorTitle}>{error}</span>}
          </div>
          <div>
            <label htmlFor="title">Descripción de la tarea:</label>
            <textarea
              name="descripcion"
              id=""
              placeholder="Describe la tarea"
              onChange={(e) => handleDescripcion(e)}
              value={descripcion}
            />
          </div>
        </div>
        <div className={styles.completada}>
          <p>¿Está completada?</p>
          <label>
            <input type="radio"
              name="opcion"
              defaultValue="si"
              onChange={(e) => handleEstaCompletada(e)}
              checked={estaCompletada === true} />
            Si
          </label>
          <label>
            <input type="radio"
              name="opcion"
              defaultValue="no"
              onChange={(e) => handleEstaCompletada(e)}
              checked={estaCompletada === false} />
            No
          </label>
        </div>
</div>
<div>
        <button type="submit">Agregar tarea</button>
        </div>
      </form>
    </section>
  )

}

export { Form };

