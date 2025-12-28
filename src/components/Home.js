import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../contexts/UserContext';
import { useNavigate ,  Link } from 'react-router-dom';
import '../styles/Home.css';
import Header from './Header';
import Curso from '../assets/curso.png';
import Editar from '../assets/editar.png';
import Agregar from '../assets/agregar.png';
import ig from '../assets/instagram.png';
import mail from '../assets/mail.png';
import linkedin from '../assets/linkedin.png';
import { url_backend } from '../Config';

const Home = () => {
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();
  const [cursos, setCursos] = useState([]);
  const [nombreCurso, setNombreCurso] = useState('');
  const [showAgregarCurso, setShowAgregarCurso] = useState(false);
  const [editCursoId, setEditCursoId] = useState(null);
  const [newCursoNombre, setNewCursoNombre] = useState('');

  useEffect(() => {
    if (user?.tipo === 3) {
      navigate('/admin');
    }
  }, [user, navigate]); // Runs when `user` or `navigate` changes

  // Function to fetch courses
  const fetchCursos = async () => {
    if (!user?.id) return; // User validation
    try {
      const response = await fetch(`${url_backend}/usuario/${user.id}/cursos`);
      if (response.ok) {
        const data = await response.json();
        setCursos(data);
      } else {
        console.error('Error fetching cursos:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching cursos:', error);
    }
  };

  useEffect(() => {
    fetchCursos();
  }, [user]); // Se ejecuta cuando el usuario cambia

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCursoClick = (cursoId) => {
    if (editCursoId === null) {
      navigate(`/curso-profesor/${cursoId}`);
    }
  };

  const toggleAgregarCurso = () => {
    setShowAgregarCurso((prev) => !prev);
    if (showAgregarCurso) {
      setNombreCurso('');
      setEditCursoId(null);
    }
  };

  const handleGuardarCurso = async () => {
    try {
      const response = await fetch(`${url_backend}/curso`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre_curso: nombreCurso, id_usuario: user.id }),
      });
      if (response.ok) {
        await fetchCursos();
        toggleAgregarCurso(); // Cierra el formulario
      } else {
        console.error('Error al crear el curso:', response.statusText);
      }
    } catch (error) {
      console.error('Error al crear el curso:', error);
    }
  };

  const handleEditarCurso = (cursoId) => {
    setEditCursoId(cursoId);
    const curso = cursos.find(curso => curso.id === cursoId);
    if (curso) {
      setNewCursoNombre(curso.nombre);
    }
  };

  const handleGuardarEdicion = async (cursoId) => {
    try {
      const response = await fetch(`${url_backend}/curso/${cursoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre_curso: newCursoNombre }),
      });
      if (response.ok) {
        await fetchCursos();
        setEditCursoId(null);
        setNewCursoNombre('');
      } else {
        console.error('Error al actualizar el curso:', response.statusText);
      }
    } catch (error) {
      console.error('Error al actualizar el curso:', error);
    }
  };

  const handleEliminarCurso = async (cursoId) => {
    const confirmDelete = window.confirm("¿Estás seguro de que quieres eliminar este curso?");
    if (confirmDelete) {
      try {
        const response = await fetch(`${url_backend}/curso/${cursoId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          await fetchCursos();
        } else {
          console.error('Error al borrar el curso:', response.statusText);
        }
      } catch (error) {
        console.error('Error al borrar el curso:', error);
      }
    }
  };

  const handleClickOutside = (event) => {
    if (editCursoId !== null && !event.target.closest('.edit-curso')) {
      setEditCursoId(null);
      setNewCursoNombre('');
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showAgregarCurso, editCursoId]);

  return (
    <div className="container-home">
      <Header />
      <div className='container-body'>
        <div className='titulopag'>
          <h2>Mis Cursos</h2>
          {user.tipo === 2 && (
            <div className="add-curso">
              <img 
                src={Agregar} 
                alt="Agregar curso" 
                className="agregar-icon" 
                onClick={toggleAgregarCurso} 
              />
              {showAgregarCurso && (
                <div className="agregar-curso-form">
                  <input
                    type="text"
                    value={nombreCurso}
                    onChange={(e) => setNombreCurso(e.target.value)}
                    placeholder="Nombre del curso"
                  />
                  <button className="btn-add-2" onClick={handleGuardarCurso}>Agregar Curso</button>
                </div>
              )}
            </div>
          )}
        </div>
        <ul className="curso-list">
          {cursos.map(curso => (
            <li key={curso.id} className={`curso-item ${editCursoId === curso.id ? 'curso-editing' : ''}`} onClick={() => handleCursoClick(curso.id)}>
              <div className="curso-card">
                <div className="curso-image">
                  <img src={Curso} alt="Imagen de curso" className="curso-image" />
                  {user.tipo === 2 && (
                    <div className="edit-icon" onClick={(e) => { e.stopPropagation(); handleEditarCurso(curso.id); }}>
                      <img src={Editar} alt="Editar curso"/>
                    </div>
                  )}
                </div>
                <div className="curso-content">
                  {curso.id === editCursoId ? (
                    <div className="edit-curso">
                      <input
                        type="text"
                        value={newCursoNombre}
                        onChange={(e) => setNewCursoNombre(e.target.value)}
                        placeholder="Nuevo nombre del curso"
                      />
                      <button className="btn-save1" onClick={() => handleGuardarEdicion(curso.id)}>Guardar</button>
                      <button className="btn-delete" onClick={() => handleEliminarCurso(curso.id)}>Eliminar</button>
                    </div>
                  ) : (
                    <div className="view-curso">
                      <span className="curso-name">{curso.nombre}</span>
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="footer-container home-mode">
        {/* Footer Minimizado: Ícono en la esquina */}
        <div className="footer-icon">
        <i className="fas fa-wrench"></i> {/* Ícono de llave inglesa */}
      </div>

      {/* Footer Expandido */}
      <footer className="secondary-footer">
        <p>Contacto a soporte:</p>
        <div className="social-icons">
          <a href="https://www.instagram.com/aiwant2teach/" target="_blank" rel="noopener noreferrer">
            <img src={ig} alt="Instagram" className="social-logo" />
          </a>
          <Link to="/reportedeerror">
            <img src={mail} alt="Email" className="social-logo" />
          </Link>
          <a href="https://www.linkedin.com/in/ai-want-2-teach" target="_blank" rel="noopener noreferrer">
            <img src={linkedin} alt="LinkedIn" className="social-logo" />
          </a>
        </div>
      </footer>
    </div>
    </div>
  );
};

export default Home;
