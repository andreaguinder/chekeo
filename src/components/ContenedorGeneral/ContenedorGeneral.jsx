import styles from './ContenedorGeneral.module.scss';

const ContenedorGeneral = ({children}) => {


    return (

        <section className={styles.containerGeneral}>
            <div>{children}</div>
        </section>
    )

}

export { ContenedorGeneral };