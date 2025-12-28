import profileImage from '../assets/profile.png'; // Ruta a tu imagen de perfil
import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../contexts/UserContext';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Header.css'; // Archivo de estilos CSS para el header
import Logo from '../assets/logo.png';
import Logout from '../assets/logout.png';
import { url_backend } from '../Config';
const Header = () => {
    const { user, logout } = useContext(UserContext);
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);
    const [tieneNotificacionesNoLeidas, setTieneNotificacionesNoLeidas] = useState(false);

    useEffect(() => {
        const fetchNotificacionesNoLeidas = async () => {
            try {
                const response = await fetch(`${url_backend}/notificaciones/tiene-no-leidas/${user.id}`);
                const data = await response.json();
                setTieneNotificacionesNoLeidas(data.tiene_no_leidas);
            } catch (error) {
                console.error("Error al verificar notificaciones no leídas:", error);
            }
        };

        if (user?.id) { // Asegúrate de que el usuario tenga un ID
            fetchNotificacionesNoLeidas();
        }
    }, [user]);

    const handleLogout = async () => {
        await logout(); // Espera a que logout complete
        navigate('/login'); // Luego redirige
    };

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };

    
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const currentMode = localStorage.getItem('darkMode');
        if (currentMode === 'enabled') {
            document.body.classList.add('dark-mode');
            setIsDarkMode(true);
        }
    }, []);

    const toggleDarkMode = () => {
        if (isDarkMode) {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('darkMode', 'disabled');
        } else {
            document.body.classList.add('dark-mode');
            localStorage.setItem('darkMode', 'enabled');
        }
        setIsDarkMode(!isDarkMode);
    };

    return (
        <header className="header">
            <div className="header-left">
                <Link to="/" className='logo-link'>
                    <img src={Logo} alt="LOGO" className="logo-image" />
                    <span className="header-title">AI Want 2 Teach</span>
                </Link>
            </div>

            <div className="header-right">
                {/* Si el usuario no es de tipo 3, mostrar las opciones de "Mis Cursos" y notificaciones */}
                {user?.tipo !== 3 && (
                    <>
                        <div className="menu">
                            <Link to="/" className='mis-cursos'>
                                <div className="header-menu">Mis Cursos</div>
                            </Link>
                        </div>
                        <div className="separator-line"></div> {/* Línea de separación */}
                        {/* Icono de campana para notificaciones, siempre visible */}
                        <div className="notification-bell">
                            <Link to="/notificaciones">
                                <i className="fas fa-bell"></i> {/* Icono de campana siempre visible */}
                                {tieneNotificacionesNoLeidas && <span className="notification-dot"></span>} {/* Solo se muestra el punto rojo si hay notificaciones no leídas */}
                            </Link>
                        </div>
                        <div className="separator-line"></div> {/* Línea de separación */}
                    </>
                )}

                {/* Icono de perfil y dropdown */}
                <div className="profile-info" onClick={toggleDropdown}>
                    <div className="profile-image-container">
                        <i className="fas fa-user profile-image"></i> {/* Cambia img por un icono */}
                        <div className="arrow-down"></div> {/* Flecha al lado derecho del icono */}
                    </div>
                    <p className="profile-name">{user?.nombre}</p> {/* Nombre debajo */}
                </div>
                {showDropdown && (
                    <div className="dropdown-menu show">
                        {/* Condición para no mostrar "Mi Perfil" si el usuario es de tipo 3 */}
                        {user?.tipo !== 3 && (
                            <Link to="/perfil" className="dropdown-item">Mi Perfil</Link>
                        )}

                        {/* Condición para no mostrar "Calendario" si el usuario es de tipo 3 */}
                        {user?.tipo !== 3 && (
                            <Link to="/calendario" className="dropdown-item">Calendario</Link>
                        )}

                        <div className="dropdown-item dark-mode-switch-container">
                            <span>Modo Oscuro</span>
                            <label className="switch">
                                <input type="checkbox" checked={isDarkMode} onChange={toggleDarkMode} />
                                <span className="slider"></span>
                            </label>
                        </div>

                        <div onClick={handleLogout} className="dropdown-item">Cerrar Sesión</div>
                    </div>
                )}


            </div>
        </header>
    );
};

export default Header;
