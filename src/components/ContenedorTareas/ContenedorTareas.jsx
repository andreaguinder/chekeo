import { useState, useEffect } from "react";
import { tareas } from "../../data/mock"
import { Tarea } from "../Tarea/Tarea"
import styles from './ContenedorTareas.module.scss';

const ContenedorTareas = ({ listaTareas, handleToggle, handleDelete }) => {

    const pendientes = listaTareas.filter(t => !t.status);
    const completadas = listaTareas.filter(t => t.status);

    return (
        <>

        <section className={styles.containerTareas}>
            <div>
            <h2 className={styles.titlePendientes}>Tareas pendientes ({pendientes.length})</h2>
            <ul className={styles.containerListaDeTareas}>
                {pendientes.map(tarea => (
                    <li key={tarea.id}>
                        <Tarea task={tarea} onToggle={() => handleToggle(tarea.id)} onClick={() => handleDelete(tarea.id)} />
                    </li>
                ))}
            </ul>
</div>

<div>
            <h2>Tareas completadas ({completadas.length})</h2>
            <ul className={styles.containerListaDeTareas}>
                {completadas.map(tarea => (
                    <li key={tarea.id}>
                        <Tarea task={tarea} onToggle={() => handleToggle(tarea.id)} onClick={() => handleDelete(tarea.id)} />
                    </li>
                ))}
            </ul>
            </div>
        </section>
      </>
    )

}

export { ContenedorTareas };