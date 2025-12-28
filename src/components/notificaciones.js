import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from '../contexts/UserContext';
import Header from './Header';
import '../styles/Notificaciones.css';
import { url_backend } from '../Config';
const Notificaciones = () => {
    const { user } = useContext(UserContext);
    const [notificaciones, setNotificaciones] = useState([]); // Estado para almacenar notificaciones
    const [paginaActual, setPaginaActual] = useState(1); // Estado para la página actual
    const notificacionesPorPagina = 4; // Número máximo de notificaciones por página

    useEffect(() => {
        const fetchNotificaciones = async () => {
            if (user && user.id) { // Verificar que el usuario y su id están disponibles
                try {
                    const response = await fetch(`${url_backend}/notificaciones/${user.id}`);

                    if (!response.ok) {
                        throw new Error(`Error al obtener las notificaciones: ${response.statusText}`);
                    }

                    const data = await response.json();
                    console.log("Datos de notificaciones:", data.notificaciones); // Para depuración
                    setNotificaciones(data.notificaciones);
                } catch (error) {
                    console.error("Error en fetchNotificaciones:", error);
                }
            }
        };

        fetchNotificaciones();
    }, [user]); // Cambia a `user` para ejecutar el efecto cada vez que `user` cambie

    const handleLeido = async (notificacionId) => {
        try {
            const response = await fetch(`${url_backend}/notificaciones/${notificacionId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Error al actualizar la notificación: ${response.statusText}`);
            }

            // Actualiza el estado local si es necesario
            setNotificaciones((prevNotificaciones) =>
                prevNotificaciones.map((notificacion) =>
                    notificacion.id === notificacionId ? { ...notificacion, leido: 1 } : notificacion
                )
            );
            window.location.reload(); // Refresca la página
        } catch (error) {
            console.error("Error en handleLeido:", error);
        }
    };

    // Cálculo de las notificaciones para la página actual
    const indexUltimaNotificacion = paginaActual * notificacionesPorPagina;
    const indexPrimeraNotificacion = indexUltimaNotificacion - notificacionesPorPagina;
    const notificacionesPaginaActual = notificaciones.slice(indexPrimeraNotificacion, indexUltimaNotificacion);
    const totalPaginas = Math.ceil(notificaciones.length / notificacionesPorPagina);

    return (
        <div>
            <Header />
            <div className="notificaciones-container">
                <h1>Notificaciones</h1>
                {notificacionesPaginaActual.length > 0 ? (
                    <ul>
                        {notificacionesPaginaActual.map((notificacion) => (
                            <li key={notificacion.id} data-leido={notificacion.leido === 1 ? "true" : "false"}>
                                <h2>{notificacion.titulo}</h2>
                                <p>{notificacion.comentario}</p>
                                <p>{notificacion.fecha} {notificacion.hora}</p>
                                <p>{notificacion.leido === 1 ? "Leído" : "No leído"}</p>
                                {/* Muestra el botón solo si la notificación no está leída */}
                                {notificacion.leido === 0 && (
                                    <button onClick={() => handleLeido(notificacion.id)}>
                                        Marcar como leído
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No hay notificaciones.</p>
                )}
                
                {/* Navegación entre páginas */}
                {totalPaginas > 1 && (
                    <div className="pagination">
                        <button 
                            onClick={() => setPaginaActual(prev => Math.max(prev - 1, 1))}
                            disabled={paginaActual === 1}
                            className='boton-pag'
                        >
                            Anterior
                        </button>
                        <span>Página {paginaActual} de {totalPaginas}</span>
                        <button 
                            onClick={() => setPaginaActual(prev => Math.min(prev + 1, totalPaginas))}
                            disabled={paginaActual === totalPaginas}
                            className='boton-pag'
                        >
                            Siguiente
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notificaciones;
