import React, { useState, useEffect } from 'react';
import Header from './Header';
import '../styles/Admin.css'; // Archivo de estilos CSS para el header
import { Modal, Button } from 'react-bootstrap';
import { url_backend } from '../Config';
const Admin = () => {
  const [activeTab, setActiveTab] = useState('usuarios'); // Estado para controlar la pestaña activa
  const [usuarios, setUsuarios] = useState([]); // Estado para los usuarios
  const [selectedUser, setSelectedUser] = useState(null); // Usuario seleccionado para el modal
  const [showModal, setShowModal] = useState(false); // Control del estado de visibilidad del modal
  const [showEditModal, setShowEditModal] = useState(false); // Control del modal de edición
  const [mostrarModal, setMostrarModal] = useState(false);
  const [cursoIdSeleccionado, setCursoIdSeleccionado] = useState(null);
  const [usuariosCurso, setUsuariosCurso] = useState([]); // Nuevo estado para usuarios del curso
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editedUser, setEditedUser] = useState({
    nombre: '',
    tipo: 1,
    correo: '',
    direccion: '',
    numero_cel: '',
  }); // Estado para almacenar los datos del usuario a editar
  const [editUserId, setEditUserId] = useState(null); // Estado para almacenar el ID del usuario a editar
// Obtener usuarios al cargar el componente
useEffect(() => {
  const fetchUsuarios = async () => {
    try {
      const response = await fetch(`${url_backend}/usuarios-cursos`); // Llamada al backend
      const data = await response.json();
      console.log(data);  // Verifica qué se recibe
      setUsuarios(data);
    } catch (error) {
      console.error('Error al obtener los usuarios:', error);
    }
  };

  fetchUsuarios();
  fetchAvailableCourses();
}, []); // Solo se ejecuta al cargar el componente

// Obtener los cursos disponibles una sola vez al cargar el componente
const [availableCourses, setAvailableCourses] = useState([]);

  const fetchAvailableCourses = async () => {
    try {
      const response = await fetch(`${url_backend}/cursos`); // Cambia con tu endpoint
      const data = await response.json();
      console.log('Datos recibidos:', data); // Imprime los datos recibidos de la API
      setAvailableCourses(data);
    } catch (error) {
      console.error('Error al obtener los cursos disponibles:', error);
    }
  };

  // Llamar a la función cuando el componente se carga o se hace algo específico
  const handleFetchCourses = () => {
    fetchAvailableCourses();
  };

  const handleModalOpen = () => {
    setShowAvailableCoursesModal(true); // Abre el modal
    fetchAvailableCourses(); // Carga los cursos al abrir el modal
  };

// Asegúrate de que showAvailableCoursesModal esté correctamente inicializado
const [showAvailableCoursesModal, setShowAvailableCoursesModal] = useState(false);

// Si el modal se muestra y no hay cursos disponibles, entonces realizamos la llamada
useEffect(() => {
  if (showAvailableCoursesModal && availableCourses.length === 0) {
    fetchAvailableCourses();
  }
}, [showAvailableCoursesModal, availableCourses.length]); // Las dependencias están correctamente configuradas

  

  // Función para abrir el modal con los cursos del usuario seleccionado
  const openModal = (user) => {
    setSelectedUser(user);
    setShowModal(true); // Mostrar el modal
  };

  // Función para cerrar el modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  // Función para abrir el modal de edición con los datos del usuario
  const openEditModal = (user) => {
    setEditUserId(user.id); // Guardar el ID del usuario a editar
    setEditedUser({
      nombre: user.nombre,
      tipo: user.tipo,
      correo: user.correo,
      direccion: user.direccion || '',
      numero_cel: user.numero_cel || '',
    });
    setShowEditModal(true);
  };

  // Función para cerrar el modal de edición
  const closeEditModal = () => {
    setShowEditModal(false);
  };

  // Función para manejar los cambios en los campos de edición
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  // Función para manejar la actualización del usuario
  const handleEditSubmit = async (e) => {
    e.preventDefault();
  
    // Verificar si editUserId está definido
    if (!editUserId) {
      alert('No se ha seleccionado ningún usuario para editar');
      return;
    }
  
    const response = await fetch(`${url_backend}/editar_usuario/${editUserId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(editedUser),  // editedUser debe ser el objeto con los datos editados
    });
  
    if (response.ok) {
      // Recargar la página para obtener los datos actualizados
      window.location.reload();
  
      setShowEditModal(false);
      alert('Usuario actualizado exitosamente');
    } else {
      alert('Error al actualizar el usuario');
    }
  };

  // Función para manejar la eliminación de un usuario
  const handleDeleteUser = async (userId) => {
    // Mostrar una alerta de confirmación
    const isConfirmed = window.confirm('¿Estás seguro de que quieres eliminar este usuario?');
    if (!isConfirmed) return;

    try {
      const response = await fetch(`${url_backend}/perfil/${userId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Recargar la lista de usuarios después de la eliminación
        setUsuarios(usuarios.filter(user => user.id !== userId));
        alert('Usuario eliminado exitosamente');
      } else {
        alert('Error al eliminar el usuario');
      }
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      alert('Hubo un error al eliminar el usuario');
    }
  };

  // Función para obtener el nombre del tipo de usuario
  const getTipoUsuario = (tipo) => {
    switch (tipo) {
      case 1:
        return 'Alumno';
      case 2:
        return 'Profesor';
      case 3:
        return 'Administrador';
      default:
        return 'Desconocido';
    }
  };

  const handleCreateUserSubmit = async (e, newUser) => {
    e.preventDefault();
  
    // Validación básica
    if (!newUser.nombre || !newUser.clave || !newUser.correo) {
      alert("Por favor, complete todos los campos obligatorios.");
      return;
    }
  
    const userData = {
      nombre: newUser.nombre,
      clave: newUser.clave,
      correo: newUser.correo,
      direccion: newUser.direccion || '',
      numero_cel: newUser.numero_cel || '',
    };
  
    try {
      const response = await fetch(`${url_backend}/registro`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
  
      if (!response.ok) {
        throw new Error("Error al crear el usuario.");
      }
  
      const data = await response.json();
      alert(data.message || "Usuario creado exitosamente");
      closeCreateModal(); // Cerrar modal al crear usuario

      // Recargar la página para ver los cambios
      window.location.reload();
  
    } catch (error) {
      console.error("Error al crear el usuario:", error);
      alert("Hubo un error al crear el usuario. Intenta nuevamente.");
    }
};

  

const [isModalOpen, setIsModalOpen] = useState(false);

// Estado para almacenar los datos del nuevo usuario
const [newUser, setNewUser] = useState({
  nombre: '',
  clave: '',
  correo: '',
  direccion: '',
  numero_cel: '',
});

// Función para abrir el modal
const openCreateModal = () => {
  setIsModalOpen(true);
};

// Función para cerrar el modal
const closeCreateModal = () => {
  setIsModalOpen(false);
};

const [selectedCourse, setSelectedCourse] = useState(null); // Estado para el curso seleccionado

// Función para manejar la selección de un curso
const handleCourseSelect = (courseId) => {
  setSelectedCourse(courseId); // Guardar el curso seleccionado
};

const handleInscribirCurso = async (cursoId, usuarioId) => {
  if (!cursoId || !usuarioId) { // Verifica que ambos IDs estén presentes
    alert('Por favor, selecciona un curso para inscribir al usuario.');
    return;
  }

  // Imprimir los valores de los IDs antes de enviarlos
  console.log('Enviando los siguientes datos:');
  console.log('Curso ID:', cursoId);
  console.log('Usuario ID:', usuarioId);

  try {
    const response = await fetch(`${url_backend}/inscribir-curso`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id_usuario: usuarioId, // Cambiar el nombre a "id_usuario"
        id_curso: cursoId,     // Cambiar el nombre a "id_curso"
      }),
    });

    if (response.ok) {
      const data = await response.json();
      alert('Usuario inscrito en el curso con éxito');
      setShowAvailableCoursesModal(false); // Cerrar modal

      // Recargar la página para reflejar los cambios
      window.location.reload(); // Recargar la página
    } else {
      alert('Hubo un error al inscribir al usuario.');
    }
  } catch (error) {
    console.error('Error al inscribir al usuario:', error);
    alert('Error al inscribir al usuario, por favor inténtalo nuevamente.');
  }
};

const handleDesinscribirCurso = async (cursoId, usuarioId) => {
  if (!cursoId || !usuarioId) {
    alert('Por favor, selecciona un curso y usuario para desinscribir.');
    return;
  }

  try {
    // Realizamos la solicitud DELETE para eliminar la relación entre el usuario y el curso
    const response = await fetch(`${url_backend}/desinscribir-curso/${usuarioId}/${cursoId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      const data = await response.json();
      alert('Usuario desinscrito del curso con éxito');
      
      // Recarga la página para obtener la lista actualizada de cursos del usuario
      window.location.reload(); // Recarga la página
    } else {
      alert('Hubo un error al desinscribir al usuario del curso.');
    }
  } catch (error) {
    console.error('Error al desinscribir al usuario del curso:', error);
    alert('Error al desinscribir del curso, por favor inténtalo nuevamente.');
  }
};

const handleEliminarCurso = async (cursoId) => {
  if (window.confirm('¿Estás seguro de que deseas eliminar este curso?')) {
    // Eliminamos el curso de la lista de forma inmediata
    setAvailableCourses(prevCourses => 
      prevCourses.filter(course => course.curso_id !== cursoId)
    );

    try {
      // Realizamos la solicitud DELETE para eliminar el curso
      await fetch(`${url_backend}/curso/${cursoId}`, {
        method: 'DELETE',
      });
      // Recargamos la página después de completar la solicitud exitosamente
      window.location.reload();
    } catch (error) {
      console.error('Error al eliminar el curso:', error);
      // Si ocurre un error, también recargamos la página para reflejar el estado actual
      window.location.reload();
    }
  }
};




const [isEditing, setIsEditing] = useState(null); // Estado para saber cuál curso estamos editando
const [newNombre, setNewNombre] = useState(""); // Estado para el nuevo nombre del curso

// Función para manejar la edición del nombre del curso
const handleEditarCurso = (cursoId, currentNombre) => {
  setIsEditing(cursoId); // Activar el modo de edición para este curso
  setNewNombre(currentNombre); // Establecer el nombre actual en el input de edición
};

// Función para guardar el nuevo nombre del curso
const handleSaveCurso = async (cursoId) => {
  try {
    const response = await fetch(`${url_backend}/curso/${cursoId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nombre_curso: newNombre,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      alert(data.message); // Muestra el mensaje de éxito
      // Actualiza la lista de cursos si es necesario
      setAvailableCourses(prevCourses => 
        prevCourses.map(course =>
          course.curso_id === cursoId ? { ...course, nombre: newNombre } : course
        )
      );
      setIsEditing(null); // Desactivar el modo de edición
      window.location.reload();
    } else {
      const errorData = await response.json();
      alert(`Error al actualizar el curso: ${errorData.detail}`);
    }
  } catch (error) {
    console.error('Error al actualizar el curso:', error);
    alert('Error al actualizar el curso, por favor inténtalo nuevamente.');
  }
};

// Función para cancelar la edición
const handleCancelEdit = () => {
  setIsEditing(null); // Desactivar el modo de edición
  setNewNombre(""); // Limpiar el campo de nombre
};


const handleVerUsuarios = async (cursoId) => {
  setCursoIdSeleccionado(cursoId); // Establecer el curso seleccionado
  setMostrarModal(true); // Mostrar el modal
  setLoading(true);
  setError(null);

  try {
    const response = await fetch(`${url_backend}/curso/${cursoId}/usuarios`);
    
    if (!response.ok) {
      throw new Error('Error al obtener los usuarios.');
    }
    
    const data = await response.json();
    setUsuariosCurso(data); // Usar el nuevo estado usuariosCurso
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  

  return (
    <div className="admin-container">
      <Header />
      <div className="admin-content">
  <div className="admin-tabs">
    <button 
      className={`admin-tabs__tab ${activeTab === 'usuarios' ? 'admin-tabs__tab--active' : ''}`} 
      onClick={() => setActiveTab('usuarios')}
    >
      Usuarios
    </button>
    <button 
      className={`admin-tabs__tab ${activeTab === 'cursos' ? 'admin-tabs__tab--active' : ''}`} 
      onClick={() => setActiveTab('cursos')}
    >
      Cursos
    </button>
  </div>
  
  <div className="admin-tab-content">
    {activeTab === 'usuarios' && (
      <div className="admin-usuarios">
        <h2 className="admin-usuarios__title">Gestión de Usuarios</h2>
        <button onClick={openCreateModal} className="admin-usuarios__create-button">Crear Usuario</button>

        <table className="admin-usuarios__table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Tipo de Usuario</th>
              <th>Dirección</th>
              <th>Número</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.id}>
                <td>{usuario.id}</td>
                <td>{usuario.nombre}</td>
                <td>{usuario.correo}</td>
                <td>{getTipoUsuario(usuario.tipo)}</td>
                <td>{usuario.direccion}</td>
                <td>{usuario.numero_cel}</td>
                <td>
                  <button 
                    className="admin-usuarios__action-button admin-usuarios__action-button--view" 
                    onClick={() => openModal(usuario)}
                  >
                    Cursos
                  </button>
                  <button 
                    className="admin-usuarios__action-button admin-usuarios__action-button--edit" 
                    onClick={() => openEditModal(usuario)}
                  >
                    Editar Usuario
                  </button>
                  <button 
                    className="admin-usuarios__action-button admin-usuarios__action-button--delete" 
                    onClick={() => handleDeleteUser(usuario.id)}
                  >
                    Eliminar Usuario
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
    
    {activeTab === 'cursos' && (
      <div className="admin-cursos">
        <h2 className="admin-cursos__title">Gestión de Cursos</h2>
        
        {availableCourses.length > 0 ? (
          <table className="admin-cursos__table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Curso</th>
                <th>Accion</th>
              </tr>
            </thead>
            <tbody>
              {availableCourses.map((course) => (
                <tr key={course.curso_id}>
                  <td>{course.curso_id}</td>
                  <td>
                    {isEditing === course.curso_id ? (
                      <input
                        type="text"
                        value={newNombre}
                        onChange={(e) => setNewNombre(e.target.value)}
                        className="admin-cursos__edit-input"
                      />
                    ) : (
                      course.nombre
                    )}
                  </td>
                  <td>
                    {isEditing === course.curso_id ? (
                      <>
                        <button
                          className="admin-cursos__action-button admin-cursos__action-button--accept"
                          onClick={() => handleSaveCurso(course.curso_id)}
                        >
                          Aceptar
                        </button>
                        <button
                          className="admin-cursos__action-button admin-cursos__action-button--cancel"
                          onClick={handleCancelEdit}
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="admin-cursos__action-button admin-cursos__action-button--view"
                          onClick={() => handleVerUsuarios(course.curso_id)}
                        >
                          Ver Usuarios Inscritos
                        </button>
                        <button
                          className="admin-cursos__action-button admin-cursos__action-button--edit"
                          onClick={() => handleEditarCurso(course.curso_id, course.nombre)}
                        >
                          Editar Curso
                        </button>
                        <button
                          className="admin-cursos__action-button admin-cursos__action-button--delete"
                          onClick={() => handleEliminarCurso(course.curso_id)}
                        >
                          Eliminar Curso
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="admin-cursos__no-courses">No hay cursos disponibles.</p>
        )}
      </div>
    )}
  </div>
</div>

{/* Modal para mostrar los cursos del usuario */}
{showModal && selectedUser && (
  <div 
    className="admin-modal admin-modal__fade admin-modal--custom" 
    id="modalCursosUsuario" 
    tabIndex="-1" 
    aria-labelledby="modalCursosUsuarioLabel" 
    aria-hidden="false"
    style={{ display: 'block' }} 
  >
    <div className="admin-modal__dialog admin-modal__dialog--custom">
      <div className="admin-modal__content admin-modal__content--custom">
        <div className="admin-modal__header admin-modal__header--custom">
          <h5 className="admin-modal__title" id="modalCursosUsuarioLabel">Cursos de {selectedUser.nombre}</h5>
          <button 
            type="button" 
            className="btn-close admin-modal__close" 
            onClick={closeModal} 
            aria-label="Close"
          ></button>
        </div>
        <div className="admin-modal__body admin-modal__body--custom">
          {selectedUser.cursos.length > 0 ? (
            <ul>
              {selectedUser.cursos.map((course) => (
                <li key={course.curso_id} className="admin-modal__course-item">
                  <b>{course.curso_id}.</b> {course.curso_nombre}
                  {/* Botón para desinscribir el curso */}
                  <button 
                    type="button" 
                    className="btn btn-danger btn-sm ms-2 admin-modal__desinscribir-btn" 
                    onClick={() => handleDesinscribirCurso(course.curso_id, selectedUser.id)} 
                  >
                    Desinscribir
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No hay cursos asignados a este usuario.</p>
          )}
          {/* Botón para abrir el modal de inscribir curso */}
          <button 
            type="button" 
            className="btn btn-primary admin-modal__inscribir-btn" 
            onClick={handleModalOpen} 
          >
            Inscribir Curso
          </button>
        </div>
      </div>
    </div>
  </div>
)}




      {/* Modal para editar usuario */}
{showEditModal && (
  <div className="admin-modal admin-modal__fade show admin-modal--edit" tabIndex="-1" aria-hidden="false" style={{ display: 'block' }}>
    <div className="admin-modal__dialog admin-modal__dialog--edit">
      <div className="admin-modal__content admin-modal__content--edit">
        <div className="admin-modal__header admin-modal__header--edit">
          <h5 className="admin-modal__title admin-modal__title--edit">Editar Usuario</h5>
          <button 
            type="button" 
            className="btn-close admin-modal__close--edit" 
            onClick={closeEditModal} 
            aria-label="Close"
          ></button>
        </div>
        <div className="admin-modal__body admin-modal__body--edit">
          <form onSubmit={handleEditSubmit}>
            <div className="form-group admin-modal__form-group">
              <label htmlFor="nombre" className="admin-modal__label">Nombre</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={editedUser.nombre}
                onChange={handleInputChange}
                required
                className="admin-modal__input"
              />
            </div>
            <div className="form-group admin-modal__form-group">
              <label htmlFor="tipo" className="admin-modal__label">Tipo de Usuario</label>
              <select
                id="tipo"
                name="tipo"
                value={editedUser.tipo}
                onChange={handleInputChange}
                className="admin-modal__input"
              >
                <option value={1}>Alumno</option>
                <option value={2}>Profesor</option>
                <option value={3}>Administrador</option>
              </select>
            </div>
            <div className="form-group admin-modal__form-group">
              <label htmlFor="correo" className="admin-modal__label">Correo</label>
              <input
                type="email"
                id="correo"
                name="correo"
                value={editedUser.correo}
                onChange={handleInputChange}
                required
                className="admin-modal__input"
              />
            </div>
            <div className="form-group admin-modal__form-group">
              <label htmlFor="direccion" className="admin-modal__label">Dirección</label>
              <input
                type="text"
                id="direccion"
                name="direccion"
                value={editedUser.direccion}
                onChange={handleInputChange}
                className="admin-modal__input"
              />
            </div>
            <div className="form-group admin-modal__form-group">
              <label htmlFor="numero_cel" className="admin-modal__label">Número de Celular</label>
              <input
                type="tel"
                id="numero_cel"
                name="numero_cel"
                value={editedUser.numero_cel}
                onChange={handleInputChange}
                className="admin-modal__input"
              />
            </div>
            <button type="submit" className="admin-modal__submit-btn">Guardar Cambios</button>
          </form>
        </div>
      </div>
    </div>
  </div>
)}


{/* Modal para crear usuario */}
{isModalOpen && (
  <div 
    className="admin-modal admin-modal__fade show admin-modal--create" 
    tabIndex="-1" 
    aria-labelledby="modalCrearUsuarioLabel" 
    aria-hidden="false" 
    style={{ display: 'block' }}
  >
    <div className="admin-modal__dialog admin-modal__dialog--create">
      <div className="admin-modal__content admin-modal__content--create">
        <div className="admin-modal__header admin-modal__header--create">
          <h5 className="admin-modal__title admin-modal__title--create" id="modalCrearUsuarioLabel">Crear Usuario</h5>
          <button 
            type="button" 
            className="btn-close admin-modal__close--create" 
            onClick={closeCreateModal} 
            aria-label="Close"
          ></button>
        </div>
        <div className="admin-modal__body admin-modal__body--create">
          <form onSubmit={(e) => handleCreateUserSubmit(e, newUser)}>
            <div className="form-group admin-modal__form-group">
              <label htmlFor="nombre" className="admin-modal__label">Nombre</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={newUser.nombre}
                onChange={(e) => setNewUser({...newUser, nombre: e.target.value})}
                required
                className="admin-modal__input"
              />
            </div>
            <div className="form-group admin-modal__form-group">
              <label htmlFor="clave" className="admin-modal__label">Clave</label>
              <input
                type="password"
                id="clave"
                name="clave"
                value={newUser.clave}
                onChange={(e) => setNewUser({...newUser, clave: e.target.value})}
                required
                className="admin-modal__input"
              />
            </div>
            <div className="form-group admin-modal__form-group">
              <label htmlFor="correo" className="admin-modal__label">Correo</label>
              <input
                type="email"
                id="correo"
                name="correo"
                value={newUser.correo}
                onChange={(e) => setNewUser({...newUser, correo: e.target.value})}
                required
                className="admin-modal__input"
              />
            </div>
            <div className="form-group admin-modal__form-group">
              <label htmlFor="direccion" className="admin-modal__label">Dirección</label>
              <input
                type="text"
                id="direccion"
                name="direccion"
                value={newUser.direccion}
                onChange={(e) => setNewUser({...newUser, direccion: e.target.value})}
                className="admin-modal__input"
              />
            </div>
            <div className="form-group admin-modal__form-group">
              <label htmlFor="numero_cel" className="admin-modal__label">Número de Celular</label>
              <input
                type="tel"
                id="numero_cel"
                name="numero_cel"
                value={newUser.numero_cel}
                onChange={(e) => setNewUser({...newUser, numero_cel: e.target.value})}
                className="admin-modal__input"
              />
            </div>
            <button type="submit" className="admin-modal__submit-btn">Crear Usuario</button>
          </form>
        </div>
      </div>
    </div>
  </div>
)}


{/* Modal para inscribir un curso */}
{showAvailableCoursesModal && (
  <div 
    className="admin-modal admin-modal__fade show" 
    id="modalCursosDisponibles" 
    tabIndex="-1" 
    aria-labelledby="modalCursosDisponiblesLabel" 
    aria-hidden="false"
    style={{ display: 'block' }} 
  >
    <div className="admin-modal__dialog">
      <div className="admin-modal__content">
        <div className="admin-modal__header">
          <h5 className="admin-modal__title" id="modalCursosDisponiblesLabel">Cursos Disponibles</h5>
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setShowAvailableCoursesModal(false)} // Cerrar modal
            aria-label="Close"
          ></button>
        </div>
        <div className="admin-modal__body">
          {availableCourses.length > 0 ? (
            // Filtrar cursos que el usuario no tiene
            availableCourses
              .filter(course => !selectedUser.cursos.some(userCourse => userCourse.curso_id === course.curso_id))
              .length > 0 ? (
                <ul>
                  {availableCourses
                    .filter(course => !selectedUser.cursos.some(userCourse => userCourse.curso_id === course.curso_id))
                    .map((course) => (
                      <li key={course.curso_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {/* Muestra el nombre del curso y el ID */}
                        <span><b>{course.curso_id}.</b> {course.nombre}</span>
                        {/* Botón para inscribir al usuario en este curso */}
                        <button 
                          className="btn-inscribir-curso" 
                          onClick={() => handleInscribirCurso(course.curso_id, selectedUser.id)} // Llamada al handle con ID del curso y usuario
                        >
                          Inscribir Curso
                        </button>
                      </li>
                    ))}
                </ul>
              ) : (
                <p>No hay cursos disponibles.</p> // Mostrar mensaje si no hay cursos disponibles
              )
          ) : (
            <p>No hay cursos disponibles.</p> // Mostrar mensaje si la lista de cursos está vacía
          )}
        </div>
      </div>
    </div>
  </div>
)}




{/* Modal de usuarios inscritos */}
<Modal show={mostrarModal} onHide={() => setMostrarModal(false)} className="usuarios-modal">
  <Modal.Header closeButton className="usuarios-modal__header">
    <Modal.Title>Usuarios Inscritos</Modal.Title>
  </Modal.Header>
  <Modal.Body className="usuarios-modal__body">
    {loading && <p className="usuarios-modal__loading">Cargando usuarios...</p>}
    {error && <p className="usuarios-modal__error">{error}</p>}
    {!loading && !error && usuariosCurso.length > 0 ? (
      <ul className="usuarios-modal__list">
        {usuariosCurso.map((usuario) => (
          <li key={usuario.usuario_id} className="usuarios-modal__list-item">
            {usuario.usuario_nombre} ({getTipoUsuario(usuario.tipo)}) - {usuario.correo}
          </li>
        ))}
      </ul>
    ) : (
      !loading && !error && <p className="usuarios-modal__no-users">No hay usuarios inscritos en este curso.</p>
    )}
  </Modal.Body>
  <Modal.Footer className="usuarios-modal__footer">
    <Button variant="secondary" onClick={() => setMostrarModal(false)} className="usuarios-modal__close-button">
      Cerrar
    </Button>
  </Modal.Footer>
</Modal>



    </div>
  );
};

export default Admin;
