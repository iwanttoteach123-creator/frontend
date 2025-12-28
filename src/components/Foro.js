import React, { useContext, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../contexts/UserContext';
import Header from './Header';
import Basura from '../assets/basura.png';
import Plus from '../assets/plus.png';
import '../styles/Foro.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal } from 'react-bootstrap';
import { url_backend } from '../Config';
const Foro = () => {
    const { unidadId } = useParams();
    const { user } = useContext(UserContext);
    const [cursoId, setCursoId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showCrearDiscusionForm, setShowCrearDiscusionForm] = useState(false);
    const [nuevaDiscusionTitulo, setNuevaDiscusionTitulo] = useState('');
    const [nuevaDiscusionDescripcion, setNuevaDiscusionDescripcion] = useState('');
    const [foro, setForo] = useState([]);
    const [successMessage, setSuccessMessage] = useState('');
    const [showDiscusionModal, setShowDiscusionModal] = useState(false);
    const [respuestas, setRespuestas] = useState({});
    const [respuestasVisible, setRespuestasVisible] = useState({});
    const [nuevoComentario, setNuevoComentario] = useState({}); // New state to handle new comments


    useEffect(() => {
        fetchForo();
    }, [unidadId]);

    const fetchForo = async () => {
        try {
            const response = await axios.get(`${url_backend}/unidad/${unidadId}/foro`);
            const foroWithExpanded = response.data.foro.map(discusion => ({
                ...discusion,
                expanded: false
            }));
            setForo(foroWithExpanded || []);
            const idCurso = response.data.curso_id;
            console.log(response.data)
            setCursoId(idCurso);
        } catch (error) {
            console.error('Error fetching foro:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleForo = (foroId) => {
      setForo(prevForos =>
          prevForos.map(f => {
              if (f.id === foroId) {
                  // Cuando se colapsa la discusión, ocultar las respuestas
                  setRespuestasVisible(prev => ({ ...prev, [foroId]: false }));
                  return { ...f, expanded: !f.expanded };
              }
              return f;
          })
      );
  };
  

    const formatDate = (date) => {
        if (date instanceof Date || typeof date === 'string') {
            const dateObj = typeof date === 'string' ? new Date(date) : date;
            const day = String(dateObj.getDate()).padStart(2, '0');
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const year = dateObj.getFullYear();
            return `${day}-${month}-${year}`;
        }
        return "Fecha no válida";
    };

    const handleCrearDiscusion = async (e) => {
        e.preventDefault();
        const nuevaDiscusion = {
            titulo: nuevaDiscusionTitulo,
            descripcion: nuevaDiscusionDescripcion,
            id_usuario: user.id,
            id_unidad: unidadId,
        };
        
        try {
            const response = await axios.post(`${url_backend}/unidad/${unidadId}/foro`, nuevaDiscusion);
            if (response.status === 201) {
                setSuccessMessage('Discusión creada exitosamente');
                setShowDiscusionModal(false); // Cierra el modal correctamente
                setNuevaDiscusionTitulo(''); // Limpia el título
                setNuevaDiscusionDescripcion(''); // Limpia la descripción
                fetchForo(); // Refresca el foro para mostrar la nueva discusión
            }
        } catch (error) {
            console.error('Error creando la discusión:', error);
        }
    };
    
    const openModalDisc = () => setShowDiscusionModal(true);
    const closeModalDisc = () => setShowDiscusionModal(false);

    const handleBorrarForo = async (foroId) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar esta discusión?")) {
            try {
                const response = await axios.delete(`${url_backend}/foro/${foroId}`);
                if (response.status === 200) {
                    alert(response.data.message);
                    fetchForo();
                }
            } catch (error) {
                console.error('Error al eliminar el foro:', error);
                alert('Ocurrió un error al intentar eliminar la discusión');
            }
        }
    };

    const fetchRespuestas = async (foroId) => {
        try {
            const response = await axios.get(`${url_backend}/foro/${foroId}/respuestas`);
            setRespuestas((prev) => ({ ...prev, [foroId]: response.data.respuestas }));
            setRespuestasVisible((prev) => ({ ...prev, [foroId]: !prev[foroId] })); // Toggle visibility
        } catch (error) {
            console.error('Error fetching respuestas:', error);
        }
    };

  const handleComentarioChange = (foroId, value) => {
      setNuevoComentario((prev) => ({ ...prev, [foroId]: value }));
  };

  const handleResponder = async (foroId) => {
    const comentario = nuevoComentario[foroId];
    const id_usuario = user.id;

    // Asegúrate de que estos valores sean válidos
    if (!comentario || !id_usuario) {
        alert('Por favor, completa el comentario.');
        return;
    }

    const respuesta = {
        comentario: comentario,
        id_usuario: id_usuario,
    };

    console.log(respuesta)

    try {
      const response = await axios.post(`${url_backend}/foro/${foroId}/respuesta`, respuesta);
        if (response.status === 201) {
            alert('Comentario agregado exitosamente');
            setNuevoComentario((prev) => ({ ...prev, [foroId]: '' })); // Limpiar la entrada
            fetchRespuestas(foroId); // Actualizar respuestas
        }
    } catch (error) {
        console.error('Error creando la respuesta:', error);
        alert('Error al agregar el comentario. Inténtalo de nuevo.');
    }
};


    return (
        <div className='container-corpus'>
        <div className="container-foro">
            <Header />
            <div className='volver'>
                {!loading && cursoId && (
                    <Link to={`/curso-profesor/${cursoId}`} className="link-back">← Volver</Link>
                )}
            </div>
            <div className='container-body-foro'>
                <div className="Principal">
                    <p>Foro de Consultas</p>
                    {!showCrearDiscusionForm ? (
                        
                        <button
                            type="button"
                            className="btn btn-agregar"
                            onClick={openModalDisc}
                        > <img src={Plus} alt="Ícono Más" className="icono-plus" />
                        Nueva Consulta
                        </button>
                    ) : (
                        <form style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
                            <label htmlFor="titulo">Titulo:</label>
                            <input
                                id="titulo"
                                name="titulo"
                                type="text"
                                value={nuevaDiscusionTitulo}
                                onChange={(e) => setNuevaDiscusionTitulo(e.target.value)}
                                placeholder="Título de la Discusión"
                                required
                            />
                            <label htmlFor="descripcion">Descripción:</label>
                            <textarea
                                id="descripcion"
                                name="descripcion"
                                value={nuevaDiscusionDescripcion}
                                onChange={(e) => setNuevaDiscusionDescripcion(e.target.value)}
                                placeholder="Descripción de la Discusión"
                                required
                            />
                            <div className="form-buttons">
                                <button type="submit" className="btn-agregar2" style={{ marginLeft: '10px' }}>Guardar</button>
                                <button type="button" className="btn-cancelar2" onClick={() => setShowCrearDiscusionForm(false)}>Cancelar</button>
                            </div>
                        </form>
                    )}
                </div>
                <div className="crear-corpus"></div>
                {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
                <table className="table">
                    <thead>
                        <tr>
                            <th className="left-align">Título</th>
                            <th>Usuario</th>
                            <th>Contenido</th>
                            <th>Fecha Consulta</th>
                            <th id="header-respuestas">Respuestas</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {foro.map(f => (
                            <React.Fragment key={f.id}>
                                <tr>
                                    <td id="titulo-respuesta">{f.titulo}</td>
                                    <td id="usuario-respuesta">{f.nombre_usuario}</td>
                                    <td id="descripcion-respuesta">{f.descripcion}</td>
                                    <td id="fecha-respuesta">{formatDate(f.fecha)}</td>
                                    <td id="cantidad-respuestas">{respuestas[f.id] ? respuestas[f.id].length : 0}</td> {/* Aquí se cuenta el número de respuestas */}
                                    <td>
                                        <div className='responder-eliminar'>
                                            <button className="btn-expandir" onClick={() => fetchRespuestas(f.id)}>
                                                Responder
                                            </button>
                                            {(user.tipo === 2 || f.id_usuario === user.id) && (
                                                <div className='eliminar-foro'
                                                    onClick={() => handleBorrarForo(f.id)}
                                                >
                                                    <img src={Basura} alt="Eliminar Foro" />
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                                {respuestasVisible[f.id] && (
                                    <tr>
                                        <td colSpan={6}>
                                            <div className="respuestas-container">
                                                <div>
                                                    <textarea
                                                        className="full-width"
                                                        value={nuevoComentario[f.id] || ''}
                                                        onChange={(e) => handleComentarioChange(f.id, e.target.value)}
                                                        placeholder="Escribe tu respuesta aquí..."
                                                    />
                                                    <button
                                                        className="btn btn-success"
                                                        onClick={() => handleResponder(f.id)}
                                                    >
                                                        Responder
                                                    </button>
                                                </div>
                                                {respuestas[f.id] && respuestas[f.id].length > 0 ? (
                                                    respuestas[f.id].map(respuesta => (
                                                        <div key={respuesta.id} className="respuesta">
                                                            {respuesta.tipo_usuario === 2 ? (
                                                                <p><b style={{ color: 'red' }}>{respuesta.nombre_usuario}:</b> {respuesta.comentario}</p>
                                                            ) : (
                                                                <p><b>{respuesta.nombre_usuario}:</b> {respuesta.comentario}</p>
                                                            )}
                                                            <p><small>{respuesta.fecha} {respuesta.hora}</small></p>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p>No hay respuestas para esta actividad.</p>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>


                    {/* {foro.map(f => (
                            <div className="corpus-card">
                                {f.tipo_usuario === 1 && <div className="respuesta-line"></div>}
                                {f.tipo_usuario === 2 && <div className="respuesta-line2"></div>}
                                <div className="respuesta-content">
                                    <div className="titulo-expandir">
                                        <div className="titulo-corpus">
                                                <tbody>
                                                    <tr>
                                                        <td id="titulo-respuesta">{f.titulo}</td>
                                                        <td id="usuario-respuesta">{f.nombre_usuario}</td>
                                                        <td id="descripcion-respuesta">{f.descripcion}</td>
                                                        <td id="fecha-respuesta">{formatDate(f.fecha)} {(f.hora)}</td>
                                                        <td id="cantidad-respuestas">0</td>
                                                    </tr>
                                                </tbody>
                                            
                                        </div>
                                        <span className="btn-expandir" onClick={() => toggleForo(f.id)}>
                                            {f.expanded ? 'Colapsar' : 'Expandir'}
                                        </span>
                                    </div>
                                    {f.expanded && (
                                        <div className="respuesta-detalle">
                                            <div className="descripcion">
                                                <hr />
                                                <p><b>Fecha:</b> {formatDate(f.fecha)} {(f.hora)}</p>
                                                <p><b>Descripción:</b> {f.descripcion}</p>
                                            </div>
                                            <div className='botones'>
                                                <button
                                                    className="btn btn-primary"
                                                    onClick={() => fetchRespuestas(f.id)} // Fetch respuestas on button click
                                                >
                                                    {respuestasVisible[f.id] ? 'Ocultar Respuestas' : 'Ver Respuestas'}
                                                </button>
                                                {(user.tipo === 2 || f.id_usuario === user.id) && (
                                                    <div>
                                                        <button
                                                            className="btn btn-danger"
                                                            onClick={() => handleBorrarForo(f.id)}
                                                        >
                                                            Eliminar Discusión
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                    )}
                                    {respuestasVisible[f.id] && (
                                        <div className="respuestas-container">
                                          <div>
                                            <textarea
                                              className="full-width"
                                              value={nuevoComentario[f.id] || ''}
                                              onChange={(e) => handleComentarioChange(f.id, e.target.value)}
                                              placeholder="Escribe tu respuesta aquí..."
                                          />

                                                <button
                                                    className="btn btn-success"
                                                    onClick={() => handleResponder(f.id)}
                                                >
                                                    Responder
                                                </button>
                                            </div>
                                            {respuestas[f.id] && respuestas[f.id].length > 0 ? (
                                                respuestas[f.id].map(respuesta => (
                                              <div>
                                                  {respuesta.tipo_usuario === 2 && (
                                                      <div key={respuesta.id} className="respuesta">
                                                          <p><b style={{ color: 'red' }}>{respuesta.nombre_usuario}:</b> {respuesta.comentario}</p>
                                                          <p><small>{respuesta.fecha} {respuesta.hora}</small></p>
                                                      </div>
                                                  )}

                                                  {respuesta.tipo_usuario === 1 && (
                                                      <div key={respuesta.id} className="respuesta">
                                                          <p><b>{respuesta.nombre_usuario}:</b> {respuesta.comentario}</p>
                                                          <p><small>{respuesta.fecha} {respuesta.hora}</small></p>
                                                      </div>
                                                  )}
                                              </div>
                                                ))
                                            ) : (
                                                <p>No hay respuestas para esta actividad.</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                    ))} */}
            </div>

            <Modal show={showDiscusionModal} onHide={closeModalDisc} id="crearDiscusionModal">
                <Modal.Header closeButton>
                    <Modal.Title>Crear Nueva Consulta</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={handleCrearDiscusion}>
                        <div className="mb-3">
                            <label htmlFor="titulo" className="form-label">Título:</label>
                            <input
                                type="text"
                                className="form-control"
                                id="titulo"
                                value={nuevaDiscusionTitulo}
                                onChange={(e) => setNuevaDiscusionTitulo(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="descripcion" className="form-label">Descripción:</label>
                            <textarea
                                className="form-control"
                                id="descripcion"
                                value={nuevaDiscusionDescripcion}
                                onChange={(e) => setNuevaDiscusionDescripcion(e.target.value)}
                                required
                            />
                        </div>
                        <div className="modal-buttons-foro">
                            <button type="submit" className="btn-agregar2">Guardar</button>
                            <button type="button" className="btn-cancelar2" onClick={closeModalDisc}>Cancelar</button>
                        </div>
                    </form>
                </Modal.Body>
            </Modal>
        </div>
        </div>
    );
};

export default Foro;
