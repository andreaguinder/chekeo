import styles from './Tarea.module.scss';
import { Trash2, CheckCircle2, Clock } from 'lucide-react';

const Tarea = ({ task, onToggle, onClick }) => {

    const { id, title, descripcion, status } = task;

    return (
        <div className={`${styles.tarea} ${status ? styles.completada : ""}`}>

            <div className={styles.containerTitle}>
                <h3 className={styles.title}>{title}</h3>
                <div className={styles.containerBotones}>
                    {status ? (
                        <button onClick={onToggle} className={styles.btnPendiente} title="Marcar como Pendiente">
                            <Clock size={24} />
                        </button>
                    ) : (
                        <button onClick={onToggle} className={styles.btnCompletada} title="Marcar como Completada">
                            <CheckCircle2 size={24} />
                        </button>
                    )}

                    <button onClick={onClick} className={styles.btnEliminar}>
                        <Trash2 size={24} />
                    </button>
                </div>
            </div>



            <div className={styles.descripcionYestado}>
                <p>{descripcion}</p>
            </div>


        </div>
    )

}

export { Tarea };
