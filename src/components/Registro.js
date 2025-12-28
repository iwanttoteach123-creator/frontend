import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Registro.css';
import Logo from '../assets/logo.png';
import { url_backend } from '../Config';
const Registro = () => {
  const [nombre, setNombre] = useState('');
  const [clave, setClave] = useState('');
  const [correo, setCorreo] = useState('');
  const [direccion, setDireccion] = useState('');
  const [numero_cel, setNumero_cel] = useState('');
  const [mensaje, setMensaje] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${url_backend}/registro`, {
        nombre: nombre,
        clave: clave,
        correo: correo,
        direccion: direccion,
        numero_cel: numero_cel,
      });

      console.log('Respuesta del backend:', response.data);

      if (response.data.message === 'Usuario creado exitosamente') {
        // Mostrar mensaje de éxito
        setMensaje('Cuenta creada exitosamente');
        // Redirige a la página de login después de 2 segundos
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setMensaje('Error al crear la cuenta');
      }
    } catch (error) {
      console.error('Error al registrar:', error);
      setMensaje('Error al registrar la cuenta');
    }
  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleSubmit}>
        <img src={Logo} alt="Logo" className="register-logo" />
        <h2 className="register-title">Crea tu cuenta</h2>
        <input
          type="text"
          placeholder="Nombre completo"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Correo electrónico"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={clave}
          onChange={(e) => setClave(e.target.value)}
          required
        />
        <input
        type="text"
        placeholder="Dirección"
        value={direccion}
        onChange={(e) => setDireccion(e.target.value)}
        required
      />
        <input
          type="text"
          placeholder="Número de teléfono"
          value={numero_cel}
          onChange={(e) => setNumero_cel(e.target.value)}
          required
        />
        <button type="submit" className='button-registrarse'>Crear cuenta</button>
        {mensaje && <p className="register-message">{mensaje}</p>}
        <div className="register-login">
          <Link to="/login">¿Ya tienes una cuenta? Inicia sesión</Link>
        </div>
      </form>
    </div>
  );
};

export default Registro;
