import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import '../styles/Login.css';
import Logo from '../assets/logo.png';
import LogoEmpresa from '../assets/logo-empresa.png';
import ig from '../assets/instagram.png';
import mail from '../assets/mail.png';
import linkedin from '../assets/linkedin.png';
import { url_backend } from '../Config';
const Login = () => {
    const [correo, setCorreo] = useState('');
    const [clave, setClave] = useState('');
    const [mensaje, setMensaje] = useState('');
    const { login } = useContext(UserContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensaje(''); // Reinicia el mensaje al enviar el formulario

        try {
            await login(correo, clave);
            navigate('/'); // Redirigir a la página principal
        } catch (error) {
            console.log('Error de inicio de sesión:', error); // Para depuración
            setMensaje('Correo o contraseña incorrectos'); // Muestra un mensaje en caso de error
        }
    };

    return (
        <div className="login-background">
        <div className="login-container">
            <div className="login-left">
                <div class="login-header">
                <img src={Logo} alt="Logo" className="login-logo" />
                <h2 class="login-title-text">AI Want 2 Teach</h2>
            </div>
                <h1 className="welcome-text">¡Que gusto tenerte de vuelta!</h1>
            </div>
            <div className="login-right">
                <form className="login-form" onSubmit={handleSubmit}>
                    <h2 className="login-title">Sign In</h2>
                    <div class="form-group">
                    <label for="email">Usuario</label>
                    <input
                        type="email"
                        placeholder="Correo electrónico"
                        value={correo}
                        onChange={(e) => setCorreo(e.target.value)}
                        required
                        aria-label="Correo electrónico"
                    />
                    </div>
                    <div class="form-group">
                    <label for="password">Contraseña</label>
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={clave}
                        onChange={(e) => setClave(e.target.value)}
                        required
                        aria-label="Contraseña"
                    />
                    </div>
                    <Link to="/forgot-password" className="forgot-password">¿Olvidaste tu contraseña?</Link>
                    <button type="submit">Iniciar Sesión</button>
                    {mensaje && <p className="login-message">{mensaje}</p>} {/* Aquí se muestra el mensaje */}
                    <Link to="/registro" className="registro">
                        ¿No tienes cuenta? ¡Regístrate!
                    </Link>
                </form>
            </div>
        </div>
        <div class="footer">
            <img src={LogoEmpresa} alt="LogoEmpresa" class="footer-logo" />
            <p class="footer-text">created by Gohan & Lili's Code</p>
        </div>
        <footer class="secondary-footer">
        <p>Contacto a soporte:</p>
        <div class="social-icons">
            <a href="https://www.instagram.com/aiwant2teach/" target="_blank" rel="noopener noreferrer">
                <img src={ig} alt="Instagram" class="social-logo" />
            </a>
            <Link to="/reportedeerror">
            <img src={mail} alt="Email" className="social-logo" />
            </Link>
            <a href="https://www.linkedin.com/in/ai-want-2-teach" target="_blank" rel="noopener noreferrer">
                <img src={linkedin} alt="LinkedIn" class="social-logo" />
            </a>
        </div>
        </footer>
        </div>
        
    );
};

export default Login;
