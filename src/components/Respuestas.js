import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Header from './Header';
import '../styles/Respuestas.css'; // Archivo de estilos CSS para el header
import DescargarIcono from '../assets/descargar-icono.webp';
import { url_backend } from '../Config';
const Respuestas = () => {
  const { actividadId } = useParams();
  const [respuestas, setRespuestas] = useState([]);
  const [cursoId, setCursoId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estado para manejar la edición de feedback de múltiples respuestas
  const [editandoRespuestaId, setEditandoRespuestaId] = useState(null); // ID de la respuesta que se está editando
  // Asegúrate de inicializar feedbackEditado como un string
  const [feedbackEditado, setFeedbackEditado] = useState(''); 


  useEffect(() => {
    const fetchRespuestas = async () => {
      try {
        const response = await axios.get(`${url_backend}/actividad/${actividadId}/respuestas`);
        setRespuestas(response.data.respuestas || []);
        const idCurso = response.data.curso_id;
        setCursoId(idCurso);
      } catch (error) {
        console.error('Error fetching respuestas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRespuestas();
  }, [actividadId]);

  const toggleRespuesta = (respuestaId) => {
    setRespuestas(prevRespuestas =>
      prevRespuestas.map(respuesta =>
        respuesta.id === respuestaId ? { ...respuesta, expanded: !respuesta.expanded } : respuesta
      )
    );
  };

  const processFeedback = (feedback) => {
    const cleanedFeedback = feedback.replace(/【\d+:\d+†source】/g, '');
    return cleanedFeedback.split('\n').map((line, index) => (
      <p key={index}>{line}</p>
    ));
  };

  const handleEditarClick = (respuestaId, feedbackActual) => {
    setEditandoRespuestaId(respuestaId);
    setFeedbackEditado(feedbackActual ? String(feedbackActual) : ''); // Forzamos feedbackActual a ser string
  };
  

  // Cambiar handleGuardarClick para actualizar la UI inmediatamente
  const handleGuardarClick = async (respuestaId) => {
    try {
      console.log("Enviando feedback:", feedbackEditado); // Verifica lo que estás enviando
      const response = await axios.put(`${url_backend}/respuestas/${respuestaId}`, {
        feedback: feedbackEditado
      });
  
      if (response.status === 200) {
        setRespuestas(prevRespuestas =>
          prevRespuestas.map(respuesta =>
            respuesta.id === respuestaId ? { ...respuesta, feedback: feedbackEditado } : respuesta
          )
        );
        setEditandoRespuestaId(null);
      }
    } catch (error) {
      console.error('Error updating feedback:', error);
    }
  };
  
  const handleDescargarRespuesta = async (respuestaId) => {
    try {
      const response = await axios.get(`${url_backend}/descargarrespuesta/${respuestaId}`, {
        responseType: 'blob'
      });
  
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `respuesta_${respuestaId}.tar`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error al descargar la respuesta:', error);
    }
  };
  

  return (
    <div className="container-respuesta">
      <Header />
      <div className='volver'>
        {!loading && cursoId && (
          <Link to={`/curso-profesor/${cursoId}`} className="link-back">← Volver</Link>
        )}
      </div>
      <div className='container-body-respuesta'>
        <div className="Principal">
          <p>Respuestas de la actividad</p>
        </div>
        <ul className="respuesta-list">
          {respuestas.map(respuesta => (
            <li key={respuesta.id} className="respuesta-item">
              <div className="respuesta-card">
                <div className="respuesta-line"></div>
                <div className="respuesta-content">
                  <div className='nombre-usuario'>
                    <p>{respuesta.nombre_usuario || 'Usuario Desconocido'}</p>
                    <img
                      src={DescargarIcono}
                      alt="Descargar Respuesta"
                      className="btn-descargar"
                      onClick={() => handleDescargarRespuesta(respuesta.id)}
                    />
                    <span className="btn-expandir" onClick={() => toggleRespuesta(respuesta.id)}>
                      {respuesta.expanded ? 'Colapsar' : 'Expandir'}
                    </span>
                  </div>
                  {respuesta.expanded && (
                    <div className="respuesta-detalle">
                      <hr/>
                      <p><b>Archivo:</b> {respuesta.archivo}</p>
                      <p><b>Fecha:</b> {respuesta.fecha}</p>
                      <p><b>Feedback:</b></p>
                      {editandoRespuestaId === respuesta.id ? (
                        <>
                          <textarea
                            className="feedback-editor"
                            value={String(feedbackEditado)} // Asegúrate de que siempre sea un string
                            onChange={(e) => setFeedbackEditado(e.target.value)}
                            rows={Math.max(3, String(feedbackEditado).split("\n").length)} // Convertimos a string y luego usamos split
                            style={{ width: '100%' }} // Ancho total del contenedor
                          />


                          <div className="botones-editar">
                            <button onClick={() => handleGuardarClick(respuesta.id)} className="btn-guardar">
                              Guardar Cambios
                            </button>
                            <button onClick={() => setEditandoRespuestaId(null)} className="btn-cancelar">
                              Cancelar
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>{processFeedback(respuesta.feedback)}</div> {/* Mostramos el feedback actualizado */}
                          <button onClick={() => handleEditarClick(respuesta.id, respuesta.feedback)} className="btn-editar">
                            Editar Feedback
                          </button>
                        </>
                      )}

                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
        {loading && <p>Cargando respuestas...</p>}
        {!loading && respuestas.length === 0 && (
          <p>No se encontraron respuestas para esta actividad.</p>
        )}
      </div>
    </div>
  );
};

export default Respuestas;
