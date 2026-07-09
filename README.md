# Gestor de Tareas con Hooks y Persistencia

## Descripción del Proyecto

Esta aplicación es una lista de tareas (To-Do List) dinámica desarrollada con React y Vite. La aplicación permite gestionar tareas de forma eficiente, incluyendo funcionalidades para agregar, eliminar y alternar el estado de completado de cada una, además de filtrar las tareas en tiempo real mediante un buscador.

Este proyecto fue desarrollado para profundizar en el manejo avanzado de Hooks en React, implementando:

* Gestión de estado y efectos: Uso de useState y useEffect.

* Manipulación del DOM: Implementación de useRef para enfocar automáticamente el buscador al montar el componente.

* Optimización de rendimiento: Uso de useMemo para el filtrado inteligente de tareas.

* Lógica reutilizable: Creación de un Custom Hook (useLocalStorage) para manejar la persistencia de datos en el navegador de forma modular.

---

## Funcionalidades Implementadas

* Estado Persistente: Las tareas se guardan automáticamente en el localStorage mediante un hook personalizado.

* Optimización: El filtrado de tareas no se recalcula innecesariamente gracias a useMemo.

* UX (Experiencia de Usuario): El foco en el input de búsqueda es automático gracias a useRef.

* Feedback: La lista se divide automáticamente en "Pendientes" y "Completadas" con contadores dinámicos que se actualizan en tiempo real.

---

## Estructura de Archivos Principal

La aplicación está organizada para favorecer la escalabilidad y limpieza:

* src/components/: Contiene los componentes reutilizables (Navbar, Form, ContenedorTareas, Tarea, Footer).

* src/hooks/: Implementación del custom hook useLocalStorage.js.

* src/data/: Archivo de configuración inicial (mock.js).

* src/styles/: Estilos modulares (.module.scss) aplicados a cada componente.

---

## Instrucciones para Ejecutar el Proyecto Localmente

Para clonar, instalar las dependencias y ejecutar este proyecto en tu entorno local, seguí estos pasos desde tu terminal:

1. **Clonar el repositorio:**
   ```bash
   git clone <https://github.com/andreaguinder/react-181751-modulo-2-unidad-1-hooks-tarea-1-guinder-andrea.git>

2. **Ingresar a la carpeta del proyecto**
Luego moverse del directorio que se creó con el nombre del proyecto:
    ```bash
    cd react-18751-unidad-4-tarea-4-guinder-andrea

3. **Instalar las dependencias**
Instalar todos los paquetes necesarios especificados en el package.json (incluyendo React y las herramientas de desarrollo como SASS):
    ```bash
    npm install

4. **Ejecutar el servidor de desarrollo**
Iniciar el entorno de desarrollo local para ver la aplicación en el navegador:
    ```bash
    npm run dev

5. Abrir en el navegador
Una vez que la terminal te indique que el servidor está corriendo, abre tu navegador e ingresa la dirección que te figure ejemplo:

http://localhost:5173

---

##  Capturas de pantalla

En /src/proyecto adjunto capturas de pantalla de mobile y desktop de como se visualiza el proyecto en el navegador y también el pdf de la tarea.

---

##  Créditos del Autor

Estudiante: Andrea Guinder

Curso: React (Comisión 181751)

Módulo: 2 - Unidad 1: Hooks - Tarea 1

Institución: Universidad Tecnológica Nacional

---

##  Fuentes y Referencias

* Material de Clase: Material teórico y práctico proporcionado por la Universidad Tecnológica Nacional (UTN).

* Curso Profesional de React (CódigoFacilito): Dictado por Juan Ortiz del Toro.

* Curso de React JS (CoderHouse): Ejercicios prácticos y conceptos teóricos integrados durante el cursado actual.

* Asistencia de IA: Soporte técnico y resolución de dudas mediante Gemini.
