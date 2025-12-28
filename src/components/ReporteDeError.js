import React, { useState } from 'react';
import axios from 'axios';
import LogoEmpresa from '../assets/logo.png';
import '../styles/ReporteDeError.css';
import { url_backend } from '../Config';

const ReporteDeError = () => {
  const [nombre, setNombre] = useState('');
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [correo, setCorreo] = useState('');
  const [imagen, setImagen] = useState(null);
  const [loading, setLoading] = useState(false);
  const fechaHoraActual = new Date().toLocaleString();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('titulo', titulo);
    formData.append('descripcion', descripcion);
    formData.append('correo', correo);
    formData.append('fechaHora', fechaHoraActual);
    if (imagen) {
      formData.append('imagen', imagen);
    }

    setLoading(true);  // Activar el estado de carga

    try {
      const response = await axios.post(`${url_backend}/reportedeerror`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setLoading(false); // Desactivar la pantalla de carga
      
      // Usar un timeout corto para asegurar que el estado de carga se actualice en la UI
      setTimeout(() => {
        alert('Enviado correctamente, espere pronta respuesta a su correo.');
        
        // Redirigir después de la alerta
        window.location.href = correo ? '/' : '/login';
      }, 100);
    } catch (error) {
      console.error('Error al enviar el reporte:', error);
      setLoading(false); // Desactivar la pantalla de carga en caso de error
      alert('Error al enviar el reporte. Inténtelo de nuevo.');
    }
  };

  return (
    <div className="reporte-wrapper">
      <div className="reporte-container">
        <div className="reporte-left">
          <div className="logo-section">
            <img src={LogoEmpresa} alt="LogoEmpresa" className="reporte-logo" />
            <h2 className="brand-text">AI Want 2 Teach</h2>
          </div>
          <h1 className="welcome-text">¡Gracias por ayudarnos a mejorar!</h1>
          <p className="instructions">Describe el problema y lo revisaremos lo antes posible.</p>
        </div>
        <div className="reporte-right">
          <h1 className="reporte-title">Reporte de Error</h1>
          <form className="reporte-form" onSubmit={handleSubmit}>
            <label>Fecha y Hora:</label>
            <input type="text" value={fechaHoraActual} readOnly />
            <label>
              Nombre:
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </label>
            <label>Título del Incidente:</label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
            />
  
            <label>Descripción:</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              required
            />
  
            <label>Correo Electrónico:</label>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
              pattern="[^@]+@[^@]+\.[a-zA-Z]{2,6}"
            />
  
            <label>Adjuntar Imagen (opcional):</label>
            <input
              type="file"
              onChange={(e) => setImagen(e.target.files[0])}
              accept="image/*"
            />
  
            <div className="reporte-buttons">
              <button type="button" className="reporte-cancel" onClick={() => window.history.back()}>Cancelar</button>
              <button type="submit" className="reporte-submit" disabled={loading}>Enviar</button>
            </div>
          </form>

          {/* Pantalla de carga */}
          {loading && (
            <div className="loading-spinner">
              <div className="loading-ring"></div>
              <p className="loading-text">Enviando reporte de error...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReporteDeError;
