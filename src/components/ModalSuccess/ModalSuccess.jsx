import styles from './ModalSuccess.module.scss';

const ModalSuccess = ({ isOpen, onClose, imagen, alt }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>&times;</button>
        
        <h2><img src={imagen} alt={alt} className={styles.logoTodoan} /></h2>
        <h3 className={styles.title}>¡Instalada con éxito!</h3>
        <p className={styles.text}>
          Ya podés cerrar la pestaña del navegador. Buscá el ícono de la app en la pantalla de inicio de tu celular para empezar a organizar tu día.
        </p>
      </div>
    </div>
  );
};

export { ModalSuccess };