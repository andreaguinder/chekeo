import { useState, useRef, useEffect } from "react";
import styles from './Navbar.module.scss';

const Navbar = ({ onSearch }) => {

    const [search, setSearch] = useState("")
    const inputRef = useRef(null);

    useEffect(() => {
        inputRef.current.focus();
    }, []);

    const handleSearch = (e) => {
        const valor = e.target.value;
        setSearch(valor);
        onSearch(valor);
    };

    return (

        <div className={styles.navbar}>
            <h1>Lista de tareas</h1>
            <input type="text"
                placeholder="Busca tu tarea..."
                ref={inputRef}
                onChange={handleSearch}
                value={search} />
        </div>
    )

}

export { Navbar };