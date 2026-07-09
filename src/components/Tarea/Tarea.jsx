import styles from './Tarea.module.scss';

const Tarea = ({ task, onToggle, onClick }) => {

    const { id, title, descripcion, status } = task;

    return (
        <div className={`${styles.tarea} ${status ? styles.completada : ""}`}>
            <h3>{title}</h3>
            <div className={styles.descripcionYestado}>
                <p>{descripcion}</p>
                <p>Estado: {status ? "Completada" : "Pendiente"}</p>
            </div>

<div className={styles.containerBotones}>
            <button onClick={onToggle} className={styles.buttonTarea}>
                Marcar como {status ? "Pendiente" : "Completada"}
            </button>

            <button onClick={onClick} className={styles.buttonTarea}>
                Eliminar tarea
            </button>
            </div>
        </div>
    )

}

export { Tarea };
