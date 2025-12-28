import React, { useRef, useContext, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../contexts/UserContext';
import Header from './Header';
import Editar from '../assets/editar.png'; // Ruta a tu imagen de perfil
import Foro from '../assets/foro.png'; 
import Docs from '../assets/docs.png';
import logo from '../assets/logo.png';
import { Canvg } from "canvg";
import '../styles/CursoProfesor.css'; // Archivo de estilos CSS para el header
// Importa los estilos de Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button,Tabs, Tab, FormLabel } from 'react-bootstrap';
import autoTable from 'jspdf-autotable';
import { Document, Packer, Paragraph, TextRun, AlignmentType } from "docx";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import Agregar from '../assets/agregar.png';
import { useNavigate } from 'react-router-dom';
//import GeneradorPreguntas from "./components/GeneradorPreguntas";
import { url_backend } from '../Config';
import html2canvas from 'html2canvas';
import mermaid from 'mermaid';
// En tu componente React (CursoProfesor.js o donde generas el PDF)
import * as d3 from 'd3';
// En la parte superior de tu archivo, asegúrate de tener estos imports
import { jsPDF } from 'jspdf';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CursoProfesor = () => {
const { user, logout } = useContext(UserContext);
const { cursoId } = useParams();
const [nombreCurso, setNombreCurso] = useState('');
const [unidades, setUnidades] = useState([]);
const [selectedUnidad, setSelectedUnidad] = useState(null);
const [selectedUnidadNombre, setSelectedUnidadNombre] = useState(null);
const [selectedActividadTitulo, setSelectedActividadTitulo] = useState(null);
const [selectedActividadDescripcion, setSelectedActividadDescripcion] = useState(null);
const [selectedActividadEstado, setSelectedActividadEstado] = useState(null);
const [actividades, setActividades] = useState([]);
const [selectedActividad, setSelectedActividad] = useState(null);
const [evaluaciones, setEvaluaciones] = useState([]);
const [selectedEvaluacion, setSelectedEvaluacion] = useState(null);
const [nuevaUnidadNombre, setNuevaUnidadNombre] = useState('');
const [nuevaActividadTitulo, setNuevaActividadTitulo] = useState('');
const [nuevaActividadDescripcion, setNuevaActividadDescripcion] = useState('');
const [nuevaActividadEstado, setNuevaActividadEstado] = useState('');
const [nuevaActividadFechaInicio, setNuevaActividadFechaInicio] = useState('');
const [nuevaActividadFechaCierre, setNuevaActividadFechaCierre] = useState('');
const [nuevaActividadHoraInicio, setNuevaActividadHoraInicio] = useState('');
const [nuevaActividadHoraCierre, setNuevaActividadHoraCierre] = useState('');
const [agregarFechaCierre, setAgregarFechaCierre] = useState(false);
const [nuevaEvaluacionTitulo, setNuevaEvaluacionTitulo] = useState('');
const [nuevaEvaluacionDescripcion, setNuevaEvaluacionDescripcion] = useState('');
const [nuevaEvaluacionPregDesarrollo, setNuevaEvaluacionPregDesarrollo] = useState('');
const [nuevaEvaluacionPregAlternativas, setNuevaEvaluacionPregAlternativas] = useState('');
const [nuevaEvaluacionPregVF, setNuevaEvaluacionPregVF] = useState('');
const [nuevaEvaluacionPtje, setNuevaEvaluacionPtje] = useState('55');
const [nuevaEvaluacionversiones, setNuevaEvaluacionversiones] = useState('1');
const [nuevaEvaluacionthread, setNuevaEvaluacionthread] = useState ("")
const [showCrearUnidadForm, setShowCrearUnidadForm] = useState(false);
const [showCrearActividadForm, setShowCrearActividadForm] = useState(false);
const [showCrearEvaluacionForm, setShowCrearEvaluacionForm] = useState(false);
const [editandoUnidadId, setEditandoUnidadId] = useState(null);
const [editandoUnidadNombre, setEditandoUnidadNombre] = useState('');
const [editingActividadId, setEditingActividadId] = useState(null);
const [editingActividadTitulo, setEditingActividadTitulo] = useState('');
const [editingActividadDescripcion, setEditingActividadDescripcion] = useState('');
const [editingActividadEstado, setEditingActividadEstado] = useState('');
const [mostrarRespuesta, setMostrarRespuesta] = useState(false); // Estado para mostrar la respuesta
const [respuestaActividad, setRespuestaActividad] = useState(null); // Estado para almacenar la respuesta de la actividad
const [selectedFile, setSelectedFile] = useState(null);
const [showEditModal, setShowEditModal] = useState(false);
const [preguntaEditada, setPreguntaEditada] = useState(null);
const [editQuestionType, setEditQuestionType] = useState('');
const [nuevaEvaluacionDificultad, setNuevaEvaluacionDificultad] = useState('');
<ToastContainer position="top-right" autoClose={3000} />
// modales
const [showGenerarPreguntasModal, setShowGenerarPreguntasModal] = useState(false);
const [showActividadModal, setShowActividadModal] = useState(false);
const [showEditActModal, setShowEditActModal] = useState(false);
const [showEvaluacionModal, setShowEvaluacionModal] = useState(false);
const [showPreviewModal, setShowPreviewModal] = useState(false);
const [preguntasEvaluacion, setPreguntasEvaluacion] = useState({
    evaluacion: {
        titulo: "",
        descripcion: "",
        versiones: "",
        thread: ""
    },
    preguntas: {
        alternativas: [],
        vf: [],
        desarrollo: []
    },
});
//cositas tesis
const [cantidadPreguntas, setCantidadPreguntas] = useState(5);
const [tipoPreguntas, setTipoPreguntas] = useState({
    desarrollo: false,
    alternativas: false,
    verdaderoFalso: false,
});
const [dificultad, setDificultad] = useState("facil");
// Estados para controlar la vista del modal
const [mostrarFormulario, setMostrarFormulario] = useState(true);
const [preguntasGeneradas, setPreguntasGeneradas] = useState([]);
const VERCEL_TOKEN = 'Ud6TbuuBKyinlYSJWJ701xJY'; // Tu token real
const handleGenerarPreguntas = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setMostrarFormulario(false);

    try {
        const response = await axios.post(`${url_backend}/unidad/${selectedUnidad}/generar_preguntas`, {
            desarrollo: cantidadPreguntas.desarrollo,
            alternativas: cantidadPreguntas.alternativas,
            vf: cantidadPreguntas.verdaderoFalso,
            dificultad: dificultad
        });

        if (response.status === 200) {
            let data = response.data.preguntas;

            if (typeof data === "string") {
                data = data.split("\n\n").map(p => p.trim()).filter(p => p.length > 0);
            }

            setPreguntasGeneradas(data);
        } else {
            alert("Hubo un error al generar las preguntas.");
        }
    } catch (error) {
        console.error("Error generando preguntas:", error);
        alert("Error al conectar con el servidor.");
    } finally {
        setIsLoading(false);
    }
};



// ✅ Limpiar preguntas al cerrar el modal
const handleCloseModal = () => {
    setShowGenerarPreguntasModal(false);
    setPreguntasGeneradas([]);  // Reiniciar las preguntas cuando se cierra el modal
};

// ✅ Copiar preguntas al portapapeles
const handleCopyQuestions = () => {
    const texto = preguntasGeneradas.join("\n");
    navigator.clipboard.writeText(texto);
    alert("Preguntas copiadas al portapapeles");
};


const handleCopyQuestion = (pregunta) => {
    navigator.clipboard.writeText(pregunta);
    alert("Pregunta copiada al portapapeles");
};


const handleOpenGenerarPreguntas = () => {
    setPreguntasGeneradas([]);  // Limpiar preguntas anteriores
    setMostrarFormulario(true); // Volver a mostrar el formulario
    setIsLoading(false); // Asegurar que la pantalla de carga no se quede activada
    setShowGenerarPreguntasModal(true); // Asegurar que el modal se abre correctamente
};


//end cositas tesis
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////
////////////////////////////// estados para guion de clase 
//////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const [showGuionModal, setShowGuionModal] = useState(false);
const [nuevoGuionRA, setNuevoGuionRA] = useState("");
const [nuevoGuionContenido, setNuevoGuionContenido] = useState("");
const [nuevoGuionEstilo, setNuevoGuionEstilo] = useState("");
const [selectedGuionFile, setSelectedGuionFile] = useState(null);
const [descripcionEstilo, setDescripcionEstilo] = useState("");
const [nuevoGuionTitulo, setNuevoGuionTitulo] = useState("");
const [guiones, setGuiones] = useState([]);
// Agrega estos estados junto con los demás
const [nuevoGuionDuracion, setNuevoGuionDuracion] = useState("");
const [nuevoGuionSemana, setNuevoGuionSemana] = useState("");
const descripcionesClases = {
  expositiva: "Clase centrada en la transmisión directa de contenidos por parte del docente. Ideal para explicar conceptos teóricos.",
  gamificada: "Integra dinámicas de juego para motivar la participación y el aprendizaje activo del estudiante.",
  proyectos: "Basada en el desarrollo de proyectos prácticos que promueven la autonomía y la aplicación de conocimientos.",
  colaborativa: "Fomenta el trabajo en grupo y el aprendizaje compartido mediante la interacción entre estudiantes."
};

const fileInputRef = useRef(null);

const [selectedGuion, setSelectedGuion] = useState(null);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const [isLoading, setIsLoading] = useState(false);

useEffect(() => {
const fetchCursoNombre = async () => {
    try {
    const response = await axios.get(`${url_backend}/curso-profesor/${cursoId}/nombre`);
    setNombreCurso(response.data.nombre_curso);
    } catch (error) {
    console.error('Error fetching curso details:', error);
    }
};

fetchCursoNombre();
}, [cursoId]);

// Efecto para cargar las unidades del curso y seleccionar la primera por defecto
useEffect(() => {
const fetchUnidadesCurso = async () => {
    try {
    const response = await axios.get(`${url_backend}/curso-profesor/${cursoId}/unidades`);
    setUnidades(response.data.unidades);

    // Si hay al menos una unidad y no hay una seleccionada, selecciona la primera por defecto
    if (response.data.unidades.length > 0 && !selectedUnidad) {
        setSelectedUnidad(response.data.unidades[0].id);
    }
    } catch (error) {
    console.error('Error fetching unidades:', error);
    }
};

if (cursoId) {
    fetchUnidadesCurso();
}
}, [cursoId, selectedUnidad]);

useEffect(() => {
    const fetchActividadesPorUnidad = async (unidadId) => {
        try {
            const response = await axios.get(`${url_backend}/unidad/${unidadId}/actividades`);
            setActividades(response.data.actividades || []);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                setActividades([]);
            } else {
                console.error('Error fetching actividades:', error);
            }
        }
    };

    if (selectedUnidad) {
        fetchActividadesPorUnidad(selectedUnidad);
    }
}, [selectedUnidad]);

const fetchActividadesPorUnidad = async (unidadId) => {
    try {
        const response = await axios.get(`${url_backend}/unidad/${unidadId}/actividades`);
        setActividades(response.data.actividades || []);
    } catch (error) {
        if (error.response && error.response.status === 404) {
        setActividades([]);
        } else {
        console.error('Error fetching actividades:', error);
        }
    }
    };


useEffect(() => {
    const fetchEvaluacionesPorUnidad = async (unidadId) => {
        try {
            const response = await axios.get(`${url_backend}/unidad/${unidadId}/evaluaciones`);
            setEvaluaciones(response.data.evaluaciones || []);
            console.log("Datos de la evaluación recibidos:", response.data.evaluaciones);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                setEvaluaciones([]);
            } else {
                console.error('Error fetching evaluaciones:', error);
            }
            
        }
    };

    if (selectedUnidad) {
        fetchEvaluacionesPorUnidad(selectedUnidad);
    }
}, [selectedUnidad]);

const fetchEvaluacionesPorUnidad = async (unidadId) => {
    try {
        const response = await axios.get(`${url_backend}/unidad/${unidadId}/evaluaciones`);
        
        console.log("Datos de la evaluación recibidos:", response.data.evaluaciones);
        setEvaluaciones(response.data.evaluaciones || []);
    } catch (error) {
        if (error.response && error.response.status === 404) {
        setEvaluaciones([]);
        } else {
        console.error('Error fetching evaluaciones:', error);
        }
    }
    };

// Función para obtener las preguntas desde el backend
const fetchPreguntas = async (evaluacionId) => {
    try {
        const response = await fetch(`${url_backend}/evaluacion/${evaluacionId}/preguntas`);
        const data = await response.json();
        setPreguntasEvaluacion(data); // Aquí se actualiza el estado completo
    } catch (error) {
        console.error("Error al obtener preguntas:", error);
    }
};


// useEffect para ejecutar fetchPreguntas solo cuando showPreviewModal sea true
useEffect(() => {
    if (showPreviewModal && selectedEvaluacion) {
        fetchPreguntas(selectedEvaluacion);
    }
}, [showPreviewModal, selectedEvaluacion]);


const handleUnidadClick = (unidadId, unidadNombre) => {
setSelectedUnidad(unidadId);
setSelectedUnidadNombre(unidadNombre);
setSelectedActividad(null);
setSelectedEvaluacion(null);
setMostrarRespuesta(false);
fetchActividadesPorUnidad(unidadId);
fetchEvaluacionesPorUnidad(unidadId);
};


const handleActividadClick = async (actividadId, actividadTitulo, actividadDescripcion) => {
if (selectedActividad === actividadId) {
    setSelectedActividad(null); // Colapsar si ya está seleccionada
    setSelectedActividadTitulo(actividadTitulo)
    setSelectedActividadDescripcion(actividadDescripcion)
    setRespuestaActividad(null); // Limpiar la respuesta activa al colapsar
    setMostrarRespuesta(false); // Ocultar la respuesta al colapsar
} else {
    setSelectedActividad(actividadId); // Expandir nueva actividad
    setMostrarRespuesta(false); // Ocultar la respuesta al colapsar

    try {
    const response = await axios.get(`${url_backend}/respuestas/${user.id}/${actividadId}`);
    console.log(response.data);

    if (response.data.message) {
            setRespuestaActividad([]);
    } else {
            setRespuestaActividad(response.data); // Suponiendo que response.data es una lista de respuestas
    }

    } catch (error) {
    console.error('Error fetching respuesta:', error);
    }
}
};


const handleSubmitNuevaUnidad = async (event) => {
event.preventDefault();
try {
    const response = await axios.post(`${url_backend}/curso/${cursoId}/unidad`, {
    nombre_unidad: nuevaUnidadNombre
    });
    console.log(response.data.message); // Mensaje de éxito

    setUnidades([...unidades, { id: response.data.unidad_id, nombre: nuevaUnidadNombre }]);
    setNuevaUnidadNombre('');
    setShowCrearUnidadForm(false);

} catch (error) {
    console.error('Error creating unidad:', error);
}
};


const handleSubmitNuevaActividad = async (event) => {
    event.preventDefault();

    // Validar que los campos de título, descripción, estado y archivo PDF estén llenos
    if (!nuevaActividadTitulo || !nuevaActividadDescripcion || !nuevaActividadEstado || !selectedFile) {
        alert('Por favor, rellene todos los campos y suba un archivo PDF.');
        return;
    }

    // Validar fecha y hora de inicio
    if (nuevaActividadFechaInicio && nuevaActividadHoraInicio) {
        const fechaHoraInicio = new Date(`${nuevaActividadFechaInicio}T${nuevaActividadHoraInicio}`);
        if (fechaHoraInicio <= new Date()) {
            alert('La fecha y hora de inicio deben ser mayores a la fecha y hora actual.');
            return;
        }
    }

    // Validar fecha y hora de cierre
    if (nuevaActividadFechaCierre && nuevaActividadHoraCierre) {
        const fechaHoraCierre = new Date(`${nuevaActividadFechaCierre}T${nuevaActividadHoraCierre}`);
        if (fechaHoraCierre <= new Date()) {
            alert('La fecha y hora de cierre deben ser mayores a la fecha y hora actual.');
            return;
        }

        if (nuevaActividadFechaInicio && nuevaActividadHoraInicio) {
            const fechaHoraInicio = new Date(`${nuevaActividadFechaInicio}T${nuevaActividadHoraInicio}`);
            if (fechaHoraCierre <= fechaHoraInicio) {
                alert('La fecha y hora de cierre deben ser mayores a la fecha y hora de inicio.');
                return;
            }
        }
    }

    // Crear el formData para enviar el archivo PDF
    const formData = new FormData();
    formData.append('titulo', nuevaActividadTitulo);
    formData.append('descripcion', nuevaActividadDescripcion);
    formData.append('estado', nuevaActividadEstado);
    formData.append('id_unidad', selectedUnidad);
    formData.append('fecha_inicio', nuevaActividadFechaInicio || '');
    formData.append('fecha_cierre', nuevaActividadFechaCierre || '');
    formData.append('hora_inicio', nuevaActividadHoraInicio || '');
    formData.append('hora_cierre', nuevaActividadHoraCierre || '');
    if (selectedFile) {
        formData.append('archivo_pdf', selectedFile); // Cambia 'file' por 'archivo_pdf'
        console.log("Archivo en FormData:", selectedFile);
    } else {
        console.warn("No se ha seleccionado ningún archivo");
    }

    for (var pair of formData.entries()) {
        console.log(pair[0]+ ', ' + pair[1]);
    }

    // Establecer el estado de carga en true
    setIsLoading(true);

    try {
        const response = await axios.post(`${url_backend}/unidad/${selectedUnidad}/actividad`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        console.log(response.data.message); // Mensaje de éxito

        setActividades([...actividades, { 
            id: response.data.actividad_id, 
            titulo: nuevaActividadTitulo, 
            descripcion: nuevaActividadDescripcion, 
            estado: nuevaActividadEstado, 
            fecha_inicio: nuevaActividadFechaInicio, 
            fecha_cierre: nuevaActividadFechaCierre, 
            hora_inicio: nuevaActividadHoraInicio, 
            hora_cierre: nuevaActividadHoraCierre 
        }]);

        // Limpiar los campos del formulario
        setNuevaActividadTitulo('');
        setNuevaActividadDescripcion('');
        setNuevaActividadEstado('');
        setNuevaActividadFechaInicio('');
        setNuevaActividadFechaCierre('');
        setNuevaActividadHoraInicio('');
        setNuevaActividadHoraCierre('');
        setSelectedFile(null); // Limpiar el archivo PDF seleccionado
        setShowCrearActividadForm(false);
        closeModalAct();
        window.location.reload(); // Refrescar la página

    } catch (error) {
        console.error('Error creando la actividad:', error);
    } finally {
        // Establecer el estado de carga en false al final del proceso, ya sea que falle o tenga éxito
        setIsLoading(false);
    }
};

const handleEstadoChange = (e) => {
    const estadoSeleccionado = e.target.value;
    setNuevaActividadEstado(estadoSeleccionado);

    // Resetear los campos de fecha y hora de inicio si se selecciona "Abierto"
    if (estadoSeleccionado === '1') {
        setNuevaActividadFechaInicio('');
        setNuevaActividadHoraInicio('');
    }
};

const handleAgregarFechaCierreChange = (e) => {
setAgregarFechaCierre(e.target.checked);
if (!e.target.checked) {
    setNuevaActividadFechaCierre('');
    setNuevaActividadHoraCierre('');
}
};


const handleSubmitNuevaEvaluacion = async (event) => {
    
        setIsLoading(true); // Activar el estado de carga

        // Validar que todos los campos estén llenos
        if (!nuevaEvaluacionTitulo || !nuevaEvaluacionDescripcion || !nuevaEvaluacionPregDesarrollo || !nuevaEvaluacionPregAlternativas || !nuevaEvaluacionPregVF || !nuevaEvaluacionversiones) {
            alert('Por favor, rellene todos los campos.');
            setIsLoading(false); // Desactivar carga si hay error
            return;
        }

        // Solicitud POST para crear la evaluación
        try {
            const response = await axios.post(`${url_backend}/unidad/${selectedUnidad}/evaluacion`, {
                titulo: nuevaEvaluacionTitulo,
                descripcion: nuevaEvaluacionDescripcion,
                dificultad: nuevaEvaluacionDificultad,
                curso_id: cursoId,
                preguntas_desarrollo: nuevaEvaluacionPregDesarrollo,
                preguntas_alternativas: nuevaEvaluacionPregAlternativas,
                preguntas_vf: nuevaEvaluacionPregVF,
                puntaje: nuevaEvaluacionPtje,
                versiones: nuevaEvaluacionversiones,
            });

            // Si se crea con éxito
            setEvaluaciones([...evaluaciones, {
                id: response.data.evaluacion_id,
                titulo: nuevaEvaluacionTitulo,
                descripcion: nuevaEvaluacionDescripcion,
                versiones: nuevaEvaluacionversiones
            }]);
            // Limpiar campos
            setNuevaEvaluacionTitulo('');
            setNuevaEvaluacionDescripcion('');
            setNuevaEvaluacionPregDesarrollo('');
            setNuevaEvaluacionPregAlternativas('');
            setNuevaEvaluacionPregVF('');
            setNuevaEvaluacionPtje('');
            setNuevaEvaluacionversiones('');
            setNuevaEvaluacionthread("");
            setShowCrearEvaluacionForm(false);
            setSelectedEvaluacion(response.data.evaluacion_id);
            closeModalEval();
            openPreviewModal();

        } catch (error) {
            console.error('Error creando la evaluación:', error);
        } finally {
            setIsLoading(false); // Desactivar carga al final
        }

};


const openPreviewModal = () => setShowPreviewModal(true);
const closePreviewModal = () => {
    setShowPreviewModal(false);
    window.location.reload(); // Refresca la página
}

const handleClosePreviewModal = () => { 
    closePreviewModal();  // Cierra el modal de vista previa
    openModalEval();      // Vuelve a abrir el modal de "Nueva Evaluación"
};

const handleEditarUnidad = (unidadId, nombreUnidad) => {
setSelectedUnidadNombre("")
setEditandoUnidadId(unidadId);
setEditandoUnidadNombre(nombreUnidad);
};

const handleSubmitEditarUnidad = async (event) => {
event.preventDefault();
try {
    const response = await axios.put(`${url_backend}/unidad/${editandoUnidadId}`, {
    nombre_unidad: editandoUnidadNombre
    });
    console.log(response.data.message); // Mensaje de éxito

    setUnidades(unidades.map(unidad =>
    unidad.id === editandoUnidadId ? { ...unidad, nombre: editandoUnidadNombre } : unidad
    ));

    setSelectedUnidadNombre(editandoUnidadNombre)
    setEditandoUnidadId(null);
    setEditandoUnidadNombre('');

} catch (error) {
    console.error('Error editing unidad:', error);
}
};

const handleCancelarEditarUnidad = () => {
setSelectedUnidadNombre(editandoUnidadNombre)
setEditandoUnidadId(null);
setEditandoUnidadNombre('');
};


// Función para manejar la eliminación de una unidad
const handleBorrarUnidad = async (unidadId) => {
if (window.confirm("¿Estás seguro de que deseas eliminar esta unidad?")) {
    try {
    await axios.delete(`${url_backend}/unidad/${unidadId}`);

    // Filtrar las unidades después de la eliminación
    const updatedUnidades = unidades.filter(unidad => unidad.id !== unidadId);
    setUnidades(updatedUnidades);

    // Actualizar selectedUnidad: seleccionar la siguiente unidad si existe, o null si no hay más unidades
    if (updatedUnidades.length > 0) {
        setSelectedUnidad(updatedUnidades[0].id);
    } else {
        setSelectedUnidad(null);
    }
    } catch (error) {
    console.error('Error deleting unidad:', error);
    }
}
};

// Función para manejar la eliminación de una respuesta
const handleBorrarRespuesta = async ( respuestaId) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta respuesta?")) {
        try {
            const response = await fetch(`${url_backend}/respuesta/${respuestaId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Error al eliminar la respuesta');
            }

            const data = await response.json();
            setMostrarRespuesta(false);
            setSelectedActividad(null);
            // Actualiza la interfaz, si es necesario

        } catch (error) {
            console.error('Error deleting respuesta:', error);
            alert('Hubo un error al eliminar la respuesta');
        }
    }
  };


// // Función para manejar el cambio de unidad seleccionada
// const handleSeleccionarUnidad = (unidadId) => {
//   setSelectedUnidad(unidadId);
// };

// Obtener el nombre de la unidad seleccionada
const getSelectedUnidadNombre = () => {
const unidad = unidades.find(unidad => unidad.id === selectedUnidad);
return unidad ? unidad.nombre : '';
};

const handleEditarActividad = (actividadId, titulo, descripcion, estado) => {
openModalEditAct(true)
setSelectedActividadTitulo("");
setSelectedActividadDescripcion("");
setEditingActividadId(actividadId);
setEditingActividadTitulo(titulo);
setEditingActividadDescripcion(descripcion);
setEditingActividadEstado(estado);
};

const handleSubmitEditarActividad = async (event) => {
event.preventDefault();
try {
    const response = await axios.put(`${url_backend}/actividad/${editingActividadId}`, {
    titulo: editingActividadTitulo,
    descripcion: editingActividadDescripcion,
    estado: editingActividadEstado
    });
    console.log(response.data.message); // Mensaje de éxito

    setActividades(actividades.map(actividad =>
    actividad.id === editingActividadId ? { ...actividad, titulo: editingActividadTitulo, descripcion: editingActividadDescripcion, estado: editingActividadEstado} : actividad
    ));

    setSelectedActividadTitulo(editingActividadTitulo);
    setSelectedActividadDescripcion(editingActividadDescripcion);
    setSelectedActividadEstado(editingActividadEstado);

    // Limpiar el estado de edición
    setEditingActividadId(null);
    setEditingActividadTitulo('');
    setEditingActividadDescripcion('');
    setEditingActividadEstado('');
    closeModalEditAct(true);
    // Refresca la página
    window.location.reload(); // Refresca la página
    

} catch (error) {
    console.error('Error editing actividad:', error);
}
};

const handleCancelarEditarActividad = () => {
setEditingActividadId(null);
setEditingActividadTitulo('');
setEditingActividadDescripcion('');
setEditingActividadEstado('');
};

const handleBorrarActividad = async (actividadId) => {
if (window.confirm("¿Estás seguro de que deseas eliminar esta actividad?")) {
    try {
    await axios.delete(`${url_backend}/actividad/${actividadId}`);
    setActividades(actividades.filter(actividad => actividad.id !== actividadId));
    if (selectedActividad === actividadId) {
        setSelectedActividad(null);
    }
    } catch (error) {
    console.error('Error deleting actividad:', error);
    }
}
};

const handleBorrarEvaluacion = async (evaluacionId) => {
if (window.confirm("¿Estás seguro de que deseas eliminar esta evaluacion?")) {
    try {
    await axios.delete(`${url_backend}/evaluacion/${evaluacionId}`);
    setEvaluaciones(evaluaciones.filter(evaluacion => evaluacion.id !== evaluacionId));
    if (selectedEvaluacion === evaluacionId) {
        setSelectedEvaluacion(null);
    }
    } catch (error) {
    console.error('Error deleting evaluacion:', error);
    }
}
};

const getEstadoTexto = (estado) => {
    switch (estado) {
        case 1:
            return "Abierto";
        case 2:
            return "Oculto";
        case 3:
            return "Cerrado";
        default:
            return "Actualizando";
    }
};

    // Función para formatear la fecha en formato dd-mm-aaaa
    const formatDate = (date) => {
        if (date instanceof Date || typeof date === 'string') {
            // Convierte la fecha a un objeto Date si es una cadena
            const dateObj = typeof date === 'string' ? new Date(date) : date;

            // Extrae el día, mes y año
            const day = String(dateObj.getDate() + 1).padStart(2, '0');
            const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // Mes empieza desde 0
            const year = dateObj.getFullYear();

            return `${day}-${month}-${year}`;
        }
        return "Fecha no válida";
    };

const handleMostrarRespuesta = () => {
setMostrarRespuesta(true);
};

const handleOcultarRespuesta = () => {
setMostrarRespuesta(false);
};

const handleFileChange = (event) => {
setSelectedFile(event.target.files[0]);
};

const shouldShowActividad = (actividad) => {
    if (actividad.estado === 2) {
        return user.tipo === 2; // Solo muestra si el usuario es tipo 2
    }
    return true; // Muestra para todos los demás estados
};

const handleAgregarRespuesta = async (event) => {
    event.preventDefault();
    try{
        console.log("id unidad", selectedUnidad)
        // Solicitud GET para verificar si hay material en el corpus
        const response = await axios.get(`${url_backend}/unidad/${selectedUnidad}/verificar-corpus`, {
            params: { unidadId: selectedUnidad } // Aquí le pasas la unidadId como parámetro
        });
        if (response.data.corpus_vacio) {
        alert('No hay material disponible, por favor avísale a tu profesor'); // Mensaje personalizado
        return;
        }
        // Verificar si hay un archivo seleccionado
        if (selectedFile) {
            const formData = new FormData();
            console.log("Formulario enviado con archivo:", selectedFile);
            formData.append('file', selectedFile);
            formData.append('usuario_id', user.id); // Añadir usuario_id al FormData
            formData.append('actividad_id', selectedActividad); // Añadir actividad_id al FormData
            formData.append('unidad_id', selectedUnidad); // Añadir unidad_id al FormData

            // Activar el estado de carga
            setIsLoading(true);

            try {
                console.log("Enviando solicitud a la API");
                const response = await axios.post(`${url_backend}/agregarrespuesta/`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                console.log('Respuesta recibida:', response.data);

                // Reiniciar el estado y la UI
                setMostrarRespuesta(false);
                setSelectedActividad(null);
                setRespuestaActividad(processFeedback(response.data.feedback));

                // Usamos un pequeño retraso para permitir que el estado de carga se detenga antes de la alerta
                setTimeout(() => {
                    // Desactivar el estado de carga antes de mostrar la alerta
                    setIsLoading(false);
                    
                    // Mostrar la alerta de feedback
                    alert('Feedback completo');
                }, 500); // Ajuste el retraso para dar tiempo a la UI de actualizarse correctamente

            } catch (error) {
                console.error('Error uploading file:', error);
                // Desactivar el estado de carga en caso de error
                setIsLoading(false);
            }
        } else {
            console.log("No se ha seleccionado ningún archivo.");
        }
    } catch (error){
        console.error('Error verificando el corpus o realizando la operación:', error);        
        setMessage("error"); // Mensaje de error
        setShowMessage(true);
    }
};




const processFeedback = (feedback) => {
    // Eliminar patrones innecesarios como "【\d+:\d+†source】"
    let cleanedFeedback = feedback.replace(/【\d+:\d+†source】/g, '');

    // Convertir títulos "###" en etiquetas <h3> (Encabezado)
    cleanedFeedback = cleanedFeedback.replace(/###\s(.*?)\n/g, '<h3>$1</h3>');

    // Convertir "##" en etiquetas <h2>
    cleanedFeedback = cleanedFeedback.replace(/##\s(.*?)\n/g, '<h2>$1</h2>');

    // Convertir negrita **texto** en <strong>texto</strong>
    cleanedFeedback = cleanedFeedback.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Convertir itálica *texto* en <em>texto</em>
    cleanedFeedback = cleanedFeedback.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Convertir saltos de línea (\n) en <br> para que aparezcan en HTML
    cleanedFeedback = cleanedFeedback.replace(/\n/g, '<br>');

    // Manejar fragmentos de código rodeados por comillas invertidas (`...`) para convertirlos en <code>
    return cleanedFeedback.split(/(`.*?`)/g).map((part, index) => {
        if (part.startsWith('`') && part.endsWith('`')) {
            return <code key={index}>{part.slice(1, -1)}</code>;
        } else {
            return <span key={index} dangerouslySetInnerHTML={{ __html: part }} />;
        }
    });
};

const openModalAct = () => setShowActividadModal(true);
const closeModalAct = () => setShowActividadModal(false);
const openModalEval = async () => { // Convertir la función en async
    try {
        // Solicitud GET para verificar si hay material en el corpus
        const response = await axios.get(`${url_backend}/unidad/${selectedUnidad}/verificar-corpus`, {
            params: { unidadId: selectedUnidad } // Aquí le pasas la unidadId como parámetro
        });



        // Si hay material, abre el modal
        setShowEvaluacionModal(true);

    } catch (error) {
        console.error('Error verificando el corpus:', error);
    }
};

const closeModalEval = () => setShowEvaluacionModal(false);
const openModalEditAct = () => setShowEditActModal(true);
const closeModalEditAct  = () => setShowEditActModal(false);

const handleRegenerarPregunta = async (evaluacion, preguntaTipo, thread) => {
    try {
        // Imprimir todos los datos de la evaluación para asegurarte de que tienes lo necesario
        console.log("Datos de la evaluacion", evaluacion);
        // Activar el estado de carga
        setIsLoading(true);
        // Obtener el id de la pregunta desde la evaluación
        const preguntaId = evaluacion.id; // Accede al id de la pregunta

        // Llamada a la API para regenerar la pregunta
        const response = await axios.post(`${url_backend}/regenerar-pregunta/${preguntaTipo}`, {
            thread: thread,
            unidad_id: selectedUnidad, 
            evaluacion_id: selectedEvaluacion,
            pregunta_id: preguntaId,  // Aquí añades el id de la pregunta
        });

        const nuevaPregunta = response.data.nueva_pregunta;
        console.log("Nueva pregunta generada:", nuevaPregunta);

        if (nuevaPregunta && nuevaPregunta.enunciado) {
            // Actualizar el estado local de las preguntas
            setPreguntasEvaluacion((prevEvaluacion) => ({
                ...prevEvaluacion,
                preguntas: {
                    ...prevEvaluacion.preguntas,
                    [preguntaTipo]: prevEvaluacion.preguntas[preguntaTipo].map((pregunta) =>
                        pregunta.id === evaluacion.id ? nuevaPregunta : pregunta
                    )
                }
            }));
        }
        setIsLoading(false);
        // Llamar a la función para recargar la vista previa
        recargarVistaPrevia();

    } catch (error) {
        console.error("Error regenerando la pregunta: ", error);
        setIsLoading(false);
    }
};

// Función para recargar la vista previa
const recargarVistaPrevia = () => {
    fetchPreguntasEvaluacion();  // Esta función debería volver a cargar las preguntas desde el servidor
};

// Función para obtener preguntas actualizadas desde el servidor
const fetchPreguntasEvaluacion = async () => {
    try {
        const response = await axios.get(`${url_backend}/evaluacion/${selectedEvaluacion}/preguntas`);
        setPreguntasEvaluacion(response.data);  // Actualizar las preguntas de la evaluación con los datos recibidos
    } catch (error) {
        console.error("Error al obtener preguntas de la evaluación:", error);
    }
};


const generatePDF = async (evaluacion, index) => {
    const pdf = new jsPDF();
    const pageHeight = pdf.internal.pageSize.height;
    const pageWidth = pdf.internal.pageSize.width;
    const marginTop = 20;      // Margen superior
    const marginBottom = 20;   // Margen inferior
    const marginLeft = 15;     // Margen izquierdo
    const marginRight = 15;    // Margen derecho
    const usableWidth = pageWidth - marginLeft - marginRight;
    const lineHeight = 7;      // Altura de línea
    let yPos = marginTop;

    // Título: "Evaluación: nombre" centrado y grande
    pdf.setFontSize(20);  // Tamaño grande para el título
    pdf.setFont('helvetica', 'bold');
    const titleText = `Evaluación: ${evaluacion.titulo || "Sin título"}`;
    const titleLines = pdf.splitTextToSize(titleText, usableWidth);
    titleLines.forEach(line => {
        pdf.text(line, pageWidth / 2, yPos, { align: 'center' });
        yPos += lineHeight;
    });
    yPos += lineHeight; // Espacio después del título

    // Función para agregar una nueva página si es necesario
    const addPageIfNeeded = (requiredSpace) => {
        if (yPos + requiredSpace > pageHeight - marginBottom) {
            pdf.addPage();
            yPos = marginTop;
            addFooter(pdf);
        }
    };

    // Función para agregar pie de página con número de página
    const addFooter = (pdfInstance) => {
        const currentPage = pdfInstance.internal.getNumberOfPages();
        pdfInstance.setFontSize(10);
        const footerText = `Página ${currentPage}`;
        pdfInstance.text(footerText, pageWidth / 2, pageHeight - 10, { align: 'center' });
    };

    // Inicializar el pie de página en la primera página
    addFooter(pdf);

    // Contador para la numeración de preguntas
    let questionNumber = 1;

    // Agregar preguntas de desarrollo
    if (evaluacion.preguntas_desarrollo.length > 0) {
        evaluacion.preguntas_desarrollo.forEach(pregunta => {
            const preguntaText = `${questionNumber}. ${pregunta.enunciado || "Sin enunciado"}`;
            const puntajeText = `Puntaje: ${pregunta.puntaje || 0}`;

            // Dividir el texto para ajustarlo al ancho utilizable
            const preguntaLines = pdf.splitTextToSize(preguntaText, usableWidth);
            const puntajeLines = pdf.splitTextToSize(puntajeText, usableWidth);
            const requiredSpace = preguntaLines.length * lineHeight + puntajeLines.length * lineHeight + lineHeight * 4; // Espacio adicional para respuestas

            addPageIfNeeded(requiredSpace);

            // Agregar pregunta en negrita
            pdf.setFont('helvetica', 'bold');
            preguntaLines.forEach(line => {
                pdf.text(line, marginLeft, yPos);
                yPos += lineHeight;
            });

            // Agregar puntaje en negrita
            pdf.setFont('helvetica', 'bold');
            puntajeLines.forEach(line => {
                pdf.text(line, marginLeft, yPos);
                yPos += lineHeight;
            });

            // Espacio para que el alumno responda
            yPos += lineHeight * 4; // Espacio en blanco
            questionNumber++;
        });
    }

    // Agregar preguntas de alternativas
    if (evaluacion.preguntas_alternativas.length > 0) {
        evaluacion.preguntas_alternativas.forEach(pregunta => {
            const preguntaText = `${questionNumber}. ${pregunta.enunciado || "Sin enunciado"}`;
            const opciones = [
                `A. ${pregunta.respuesta_a || "Sin respuesta"}`,
                `B. ${pregunta.respuesta_b || "Sin respuesta"}`,
                `C. ${pregunta.respuesta_c || "Sin respuesta"}`,
                `D. ${pregunta.respuesta_d || "Sin respuesta"}`
            ];
            if (pregunta.respuesta_e) {
                opciones.push(`E. ${pregunta.respuesta_e || "Sin respuesta"}`);
            }
            const puntajeText = `Puntaje: ${pregunta.puntaje || 0}`;

            // Dividir el texto para ajustarlo al ancho utilizable
            const preguntaLines = pdf.splitTextToSize(preguntaText, usableWidth);
            const opcionesText = opciones.join('\n');
            const opcionesLines = pdf.splitTextToSize(opcionesText, usableWidth);
            const puntajeLines = pdf.splitTextToSize(puntajeText, usableWidth);
            const requiredSpace = preguntaLines.length * lineHeight + opcionesLines.length * lineHeight + puntajeLines.length * lineHeight + lineHeight * 2;

            addPageIfNeeded(requiredSpace);

            // Agregar pregunta en negrita
            pdf.setFont('helvetica', 'bold');
            preguntaLines.forEach(line => {
                pdf.text(line, marginLeft, yPos);
                yPos += lineHeight;
            });

            // Agregar opciones en normal
            pdf.setFont('helvetica', 'normal');
            opcionesLines.forEach(line => {
                pdf.text(line, marginLeft + 5, yPos); // Indentación para opciones
                yPos += lineHeight;
            });

            // Agregar puntaje en negrita
            pdf.setFont('helvetica', 'bold');
            puntajeLines.forEach(line => {
                pdf.text(line, marginLeft, yPos);
                yPos += lineHeight;
            });

            yPos += lineHeight; // Espacio adicional
            questionNumber++;
        });
    }

    // Agregar preguntas de verdadero/falso
    if (evaluacion.preguntas_vf.length > 0) {
        evaluacion.preguntas_vf.forEach(pregunta => {
            const preguntaText = `${questionNumber}. ${pregunta.enunciado || "Sin enunciado"}`;
            const respuestaLine = "__________ (V/F)";

            // Dividir el texto para ajustarlo al ancho utilizable
            const preguntaLines = pdf.splitTextToSize(preguntaText, usableWidth);
            const requiredSpace = preguntaLines.length * lineHeight + lineHeight * 2; // Espacio para la línea de respuesta

            addPageIfNeeded(requiredSpace);

            // Agregar pregunta en negrita
            pdf.setFont('helvetica', 'bold');
            preguntaLines.forEach(line => {
                pdf.text(line, marginLeft, yPos);
                yPos += lineHeight;
            });

            // Agregar línea para respuesta
            pdf.setFont('helvetica', 'normal');
            pdf.text(respuestaLine, marginLeft, yPos);
            yPos += lineHeight * 2; // Espacio adicional
            questionNumber++;
        });
    }

    
    return new Promise((resolve) => {
        const blob = pdf.output("blob");
        resolve(blob); // Devuelve el blob del PDF sin descargarlo directamente
    });
};

const generatePDF2 = async (evaluacion, index) => {
    const pdf = new jsPDF();

    // Márgenes y medidas de la página
    const margin = 20;
    const maxWidth = pdf.internal.pageSize.getWidth() - margin * 2;
    const pageHeight = pdf.internal.pageSize.height;
    let y = margin;

    // Título
    pdf.setFontSize(22);
    pdf.text(`Rúbrica: ${evaluacion.titulo || "Sin título"}`, pdf.internal.pageSize.width / 2, y, { align: 'center' });
    y += 20;

    // Sección de preguntas de desarrollo
    if (evaluacion.preguntas_desarrollo.length > 0) {
        pdf.setFontSize(16);
        pdf.text('Preguntas de Desarrollo', margin, y);
        y += 10;

        evaluacion.preguntas_desarrollo.forEach((pregunta, idx) => {
            if (y + 30 > pageHeight - margin) {
                pdf.addPage();
                y = margin;
            }

            pdf.setFontSize(12);
            const lines = pdf.splitTextToSize(`${idx + 1}. ${pregunta.enunciado || "Sin enunciado"}`, maxWidth);
            pdf.text(lines, margin, y);
            y += lines.length * 10;

            pdf.setFontSize(10);
            pdf.text(`Puntaje: ${pregunta.puntaje || 0}`, margin, y);
            y += 10;

            const respuestaLines = pdf.splitTextToSize(`Respuesta Correcta: ${pregunta.respuesta || "Sin respuesta"}`, maxWidth);
            pdf.text(respuestaLines, margin, y);
            y += respuestaLines.length * 10 + 5;
        });
    }

    // Sección de preguntas alternativas
    if (evaluacion.preguntas_alternativas.length > 0) {
        if (y + 30 > pageHeight - margin) {
            pdf.addPage();
            y = margin;
        }

        pdf.setFontSize(16);
        pdf.text('Preguntas Alternativas', margin, y);
        y += 10;

        evaluacion.preguntas_alternativas.forEach((pregunta, idx) => {
            if (y + 50 > pageHeight - margin) {
                pdf.addPage();
                y = margin;
            }

            pdf.setFontSize(12);
            const lines = pdf.splitTextToSize(`${idx + 1}. ${pregunta.enunciado || "Sin enunciado"}`, maxWidth);
            pdf.text(lines, margin, y);
            y += lines.length * 10;

            pdf.setFontSize(10);
            const opciones = [
                { letra: 'A', texto: pregunta.respuesta_a },
                { letra: 'B', texto: pregunta.respuesta_b },
                { letra: 'C', texto: pregunta.respuesta_c },
                { letra: 'D', texto: pregunta.respuesta_d },
                pregunta.respuesta_e ? { letra: 'E', texto: pregunta.respuesta_e } : null
            ].filter(Boolean); // Filtrar solo respuestas válidas

            opciones.forEach(opcion => {
                const isCorrect = opcion.letra.toLowerCase() === pregunta.correcta.toLowerCase();
                pdf.text(`${opcion.letra}. ${opcion.texto || "Sin respuesta"}${isCorrect ? ' (Correcta)' : ''}`, margin, y, { maxWidth: maxWidth });
                y += 10;
            });

            pdf.text(`Puntaje: ${pregunta.puntaje || 0}`, margin, y);
            y += 15;
        });
    }

    // Sección de preguntas de verdadero/falso
    if (evaluacion.preguntas_vf.length > 0) {
        if (y + 30 > pageHeight - margin) {
            pdf.addPage();
            y = margin;
        }

        pdf.setFontSize(16);
        pdf.text('Preguntas de Verdadero/Falso', margin, y);
        y += 10;

        evaluacion.preguntas_vf.forEach((pregunta, idx) => {
            if (y + 30 > pageHeight - margin) {
                pdf.addPage();
                y = margin;
            }

            pdf.setFontSize(12);
            const lines = pdf.splitTextToSize(`${idx + 1}. ${pregunta.enunciado || "Sin enunciado"}`, maxWidth);
            pdf.text(lines, margin, y);
            y += lines.length * 10;

            pdf.setFontSize(10);
            pdf.text(`Puntaje: ${pregunta.puntaje || 0}`, margin, y);
            y += 10;

            pdf.text(`Respuesta Correcta: ${pregunta.correcta === 'V' ? 'Verdadero' : 'Falso'}`, margin, y);
            y += 15;
        });
    }

    // Pie de página con el número de página
    let pageCount = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(10);
        pdf.text(`Página ${i} de ${pageCount}`, pdf.internal.pageSize.getWidth() / 2, pageHeight - margin, { align: 'center' });
    }

    return new Promise((resolve) => {
        const blob = pdf.output("blob");
        resolve(blob); // Devuelve el blob del PDF sin descargarlo directamente
    });
    
};

const generateAllPDFs = async (evaluacion) => {
    const zip = new JSZip(); // Crea una nueva instancia de JSZip
    const pdfFiles = [];

    if (evaluacion.versiones == 1) {
        // Generar el PDF de la evaluación
        const pdfBlob = await generatePDF(evaluacion, 0);
        pdfFiles.push(pdfBlob);
        zip.file(`${evaluacion.titulo || "evaluacion"}.pdf`, pdfBlob); // Guardar con el nombre del título de la evaluación

        // Generar el PDF de la rúbrica
        const pdfBlob2 = await generatePDF2(evaluacion, 0);
        pdfFiles.push(pdfBlob2);
        zip.file(`rubrica_${evaluacion.titulo || "evaluacion"}.pdf`, pdfBlob2); // Guardar con el prefijo "rubrica_"

    } else {
        const versiones = generateEvaluations(evaluacion);

        for (let i = 0; i < versiones.length; i++) {
            const version = versiones[i];

            // Generar el PDF de la evaluación
            const pdfBlob = await generatePDF(version, i);
            pdfFiles.push(pdfBlob);
            zip.file(`${evaluacion.titulo || "evaluacion"}_v${i + 1}.pdf`, pdfBlob); // Guardar con el nombre de la versión

            // Generar el PDF de la rúbrica
            const pdfBlob2 = await generatePDF2(version, i);
            pdfFiles.push(pdfBlob2);
            zip.file(`rubrica_${evaluacion.titulo || "evaluacion"}_v${i + 1}.pdf`, pdfBlob2); // Guardar con el prefijo "rubrica_" y versión
        }
    }

    // Generar el ZIP y descargar
    zip.generateAsync({ type: "blob" }).then((content) => {
        saveAs(content, `${evaluacion.titulo || "evaluaciones"}.zip`);
    });

    return pdfFiles;
};

        

const generateAllDocs = async (evaluacion) => {
    const zip = new JSZip(); // Crea una nueva instancia de JSZip
    const docFiles = [];

    if (!evaluacion) {
        console.error("La evaluación no está definida.");
        return;
    }

    if (evaluacion.versiones == 1) {
        // Generar el DOC de la evaluación
        const docBlob = await generateDocs(evaluacion, 0);
        docFiles.push(docBlob);
        zip.file(`${evaluacion.titulo || "evaluacion"}.docx`, docBlob); // Guardar con el nombre del título de la evaluación

        // Generar el DOC de la rúbrica
        const docBlob2 = await generateDocs2(evaluacion, 0);
        docFiles.push(docBlob2);
        zip.file(`rubrica_${evaluacion.titulo || "evaluacion"}.docx`, docBlob2); // Guardar con el prefijo "rubrica_"

    } else {
        const versiones = generateEvaluations(evaluacion);

        for (let i = 0; i < versiones.length; i++) {
            const version = versiones[i];

            // Generar el DOC de la evaluación
            const docBlob = await generateDocs(version, i);
            docFiles.push(docBlob);
            zip.file(`${evaluacion.titulo || "evaluacion"}_v${i + 1}.docx`, docBlob); // Guardar con el nombre de la versión

            // Generar el DOC de la rúbrica
            const docBlob2 = await generateDocs2(version, i);
            docFiles.push(docBlob2);
            zip.file(`rubrica_${evaluacion.titulo || "evaluacion"}_v${i + 1}.docx`, docBlob2); // Guardar con el prefijo "rubrica_" y versión
        }
    }

    // Generar el ZIP y descargar
    zip.generateAsync({ type: "blob" }).then((content) => {
        saveAs(content, `${evaluacion.titulo || "evaluaciones"}.zip`);
    });

    return docFiles;
};


    
    

const generateDocs = async (evaluacion, index) => {
    console.log("Iniciando generación de documento DOCX...");
    const doc = new Document({
        sections: [],
    });

    // Crear la sección principal del documento
    const mainSection = {
        properties: {},
        children: [],
    };

    // Título de la evaluación: "Evaluación: nombre"
    mainSection.children.push(
        new Paragraph({
            children: [
                new TextRun({
                    text: `Evaluación: ${evaluacion.titulo || "Sin título"}`,
                    bold: true,
                    size: 48,
                }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
        })
    );

    // Separador entre el título y las preguntas
    mainSection.children.push(
        new Paragraph({
            text: "",
            spacing: { after: 300 },
        })
    );

    // Preguntas de desarrollo
    if (evaluacion.preguntas_desarrollo.length > 0) {
        evaluacion.preguntas_desarrollo.forEach((pregunta, idx) => {
            const questionText = `${idx + 1}. ${pregunta.enunciado || "Sin enunciado"}`;

            mainSection.children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: questionText,
                            bold: true,
                            size: 28,
                        }),
                    ],
                    spacing: { after: 200 },
                })
            );

            // Añadir líneas para la respuesta (ajustado al tamaño exacto)
            const lineText = "_______________________________________________________________";
            mainSection.children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: lineText,
                            size: 28,
                        }),
                    ],
                    spacing: { after: 200 },
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: lineText,
                            size: 28,
                        }),
                    ],
                    spacing: { after: 200 },
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: lineText,
                            size: 28,
                        }),
                    ],
                    spacing: { after: 500 }, // Aumentar espacio entre preguntas de desarrollo
                })
            );
        });
    }

    // Preguntas alternativas (con más espacio entre preguntas)
    if (evaluacion.preguntas_alternativas.length > 0) {
        evaluacion.preguntas_alternativas.forEach((pregunta, idx) => {
            const questionText = `${idx + 1}. ${pregunta.enunciado || "Sin enunciado"}`;
            const opciones = [
                `A. ${pregunta.respuesta_a || "Sin respuesta"}`,
                `B. ${pregunta.respuesta_b || "Sin respuesta"}`,
                `C. ${pregunta.respuesta_c || "Sin respuesta"}`,
                `D. ${pregunta.respuesta_d || "Sin respuesta"}`,
            ];
            if (pregunta.respuesta_e) {
                opciones.push(`E. ${pregunta.respuesta_e || "Sin respuesta"}`);
            }

            mainSection.children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: questionText,
                            bold: true,
                            size: 28,
                        }),
                    ],
                    spacing: { after: 200 },
                }),
                ...opciones.map((opcion) =>
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: opcion,
                                size: 24,
                            }),
                        ],
                        spacing: { after: 150 }, // Separación entre opciones
                    })
                ),
                new Paragraph({
                    text: "", // Espacio adicional entre preguntas alternativas
                    spacing: { after: 500 },
                })
            );
        });
    }

    // Preguntas de verdadero/falso (con más espacio entre preguntas)
    if (evaluacion.preguntas_vf.length > 0) {
        evaluacion.preguntas_vf.forEach((pregunta, idx) => {
            const questionText = `${idx + 1}. ${pregunta.enunciado || "Sin enunciado"}`;
            const respuestaLine = "__________ (V/F)";

            mainSection.children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: questionText,
                            bold: true,
                            size: 28,
                        }),
                    ],
                    spacing: { after: 200 },
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: respuestaLine,
                            size: 28,
                        }),
                    ],
                    spacing: { after: 500 }, // Aumentar espacio entre preguntas verdadero/falso
                })
            );
        });
    }

    // Añadir la sección al documento
    doc.addSection(mainSection);

    try {
        
        const blob = await Packer.toBlob(doc); // Genera el blob del DOCX
        return blob; // Devuelve el blob del DOCX
    } catch (error) {
        console.error("Error al generar el documento:", error);
    }
};



const generateDocs2 = async (evaluacion, index) => {
    console.log("Iniciando generación de documento DOCX...");
    const doc = new Document({
        sections: [],
    });

    const mainSection = {
        properties: {},
        children: [],
    };

    // Título: "Rúbrica: nombre"
    mainSection.children.push(
        new Paragraph({
            children: [
                new TextRun({
                    text: `Rúbrica: ${evaluacion.titulo || "Sin título"}`,
                    bold: true,
                    size: 48,
                }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
        })
    );

    // Sección de preguntas de desarrollo
    if (evaluacion.preguntas_desarrollo.length > 0) {
        mainSection.children.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: "Preguntas de Desarrollo",
                        bold: true,
                        size: 32,
                    }),
                ],
                spacing: { after: 200 },
            })
        );

        evaluacion.preguntas_desarrollo.forEach((pregunta, idx) => {
            const questionText = `${idx + 1}. ${pregunta.enunciado || "Sin enunciado"}`;

            mainSection.children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: questionText,
                            bold: true,
                            size: 24,
                        }),
                    ],
                    spacing: { after: 200 },
                })
            );

            // Puntaje
            const puntajeText = `Puntaje: ${pregunta.puntaje || 0}`;
            mainSection.children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: puntajeText,
                            size: 20,
                        }),
                    ],
                    spacing: { after: 200 },
                })
            );

            // Respuesta Correcta
            const respuestaText = `Respuesta Correcta: ${pregunta.respuesta || "Sin respuesta"}`;
            mainSection.children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: respuestaText,
                            size: 20,
                        }),
                    ],
                    spacing: { after: 500 },
                })
            );
        });
    }

    // Sección de preguntas alternativas
    if (evaluacion.preguntas_alternativas.length > 0) {
        mainSection.children.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: "Preguntas Alternativas",
                        bold: true,
                        size: 32,
                    }),
                ],
                spacing: { after: 200 },
            })
        );

        evaluacion.preguntas_alternativas.forEach((pregunta, idx) => {
            const questionText = `${idx + 1}. ${pregunta.enunciado || "Sin enunciado"}`;
            const opciones = [
                { letra: 'A', texto: pregunta.respuesta_a },
                { letra: 'B', texto: pregunta.respuesta_b },
                { letra: 'C', texto: pregunta.respuesta_c },
                { letra: 'D', texto: pregunta.respuesta_d },
            ];
            if (pregunta.respuesta_e) {
                opciones.push({ letra: 'E', texto: pregunta.respuesta_e });
            }

            mainSection.children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: questionText,
                            bold: true,
                            size: 24,
                        }),
                    ],
                    spacing: { after: 200 },
                }),
                ...opciones.map((opcion) => {
                    const isCorrect = opcion.letra.toLowerCase() === pregunta.correcta.toLowerCase();
                    return new Paragraph({
                        children: [
                            new TextRun({
                                text: `${opcion.letra}. ${opcion.texto || "Sin respuesta"}${isCorrect ? " (Correcta)" : ""}`,
                                size: 20,
                            }),
                        ],
                        spacing: { after: 150 }, // Separación entre opciones
                    });
                })
            );

            const puntajeText = `Puntaje: ${pregunta.puntaje || 0}`;
            mainSection.children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: puntajeText,
                            size: 20,
                        }),
                    ],
                    spacing: { after: 500 },
                })
            );
        });
    }

    // Sección de preguntas de verdadero/falso
    if (evaluacion.preguntas_vf.length > 0) {
        mainSection.children.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: "Preguntas de Verdadero/Falso",
                        bold: true,
                        size: 32,
                    }),
                ],
                spacing: { after: 200 },
            })
        );

        evaluacion.preguntas_vf.forEach((pregunta, idx) => {
            const questionText = `${idx + 1}. ${pregunta.enunciado || "Sin enunciado"}`;
            const respuestaText = `Respuesta Correcta: ${pregunta.correcta === 'V' ? 'Verdadero' : 'Falso'}`;

            mainSection.children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: questionText,
                            bold: true,
                            size: 24,
                        }),
                    ],
                    spacing: { after: 200 },
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: respuestaText,
                            size: 20,
                        }),
                    ],
                    spacing: { after: 500 },
                })
            );

            const puntajeText = `Puntaje: ${pregunta.puntaje || 0}`;
            mainSection.children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: puntajeText,
                            size: 20,
                        }),
                    ],
                    spacing: { after: 500 },
                })
            );
        });
    }

    // Añadir la sección al documento
    doc.addSection(mainSection);

    try {
        const blob = await Packer.toBlob(doc); // Genera el blob del DOCX
        return blob; // Devuelve el blob del DOCX
    } catch (error) {
        console.error("Error al generar el documento:", error);
    }
    
};


function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function generateEvaluations(evaluacion) {
    let versiones = [];
    const N = parseInt(evaluacion.versiones, 10); // Convertir versiones a int
    
    console.log("Número de versiones:", N); // Comprobar el número de versiones
    
    for (let i = 0; i < N; i++) {
        console.log(`Generando versión ${i + 1}`);

        // Copiar las preguntas para no modificar el original
        let preguntasDesarrollo = [...evaluacion.preguntas_desarrollo];
        let preguntasAlternativas = [...evaluacion.preguntas_alternativas];
        let preguntasVF = [...evaluacion.preguntas_vf];

        // Desordenar las preguntas
        preguntasDesarrollo = shuffleArray(preguntasDesarrollo);
        preguntasAlternativas = shuffleArray(preguntasAlternativas);
        preguntasVF = shuffleArray(preguntasVF);

        // Desordenar las alternativas de cada pregunta y reasignar las letras
        preguntasAlternativas = preguntasAlternativas.map((pregunta, index) => {
            console.log(`Preguntas alternativas antes de desordenar para la pregunta ${index + 1}:`, pregunta);

            // Crear un array de las respuestas con la letra asociada
            let respuestas = [
                { letra: 'a', texto: pregunta.respuesta_a },
                { letra: 'b', texto: pregunta.respuesta_b },
                { letra: 'c', texto: pregunta.respuesta_c },
                { letra: 'd', texto: pregunta.respuesta_d },
            ];

            if (pregunta.respuesta_e) {
                respuestas.push({ letra: 'e', texto: pregunta.respuesta_e });
            }

            // Guardar el texto de la respuesta correcta ANTES de desordenar
            const textoCorrectoOriginal = respuestas.find(respuesta => respuesta.letra === pregunta.correcta).texto;

            console.log("Texto de la alternativa correcta antes de desordenar:", textoCorrectoOriginal);

            // Desordenar las alternativas
            respuestas = shuffleArray(respuestas);

            console.log("Respuestas desordenadas:", respuestas);

            // Asignar las letras correctas a cada alternativa (la primera será 'a', la segunda 'b', etc.)
            respuestas = respuestas.map((respuesta, index) => {
                const letras = ['a', 'b', 'c', 'd', 'e']; // Para asegurar que cada alternativa tenga la letra correcta
                respuesta.letra = letras[index]; // Asignar la nueva letra según el índice
                return respuesta;
            });

            // Actualizar las letras en el objeto de la pregunta
            let nuevaPregunta = {
                ...pregunta,
                respuesta_a: respuestas[0].texto,
                respuesta_b: respuestas[1].texto,
                respuesta_c: respuestas[2].texto,
                respuesta_d: respuestas[3].texto,
            };

            if (respuestas.length > 4) {
                nuevaPregunta.respuesta_e = respuestas[4].texto; // Agregar la quinta opción si existe
            }

            // Buscar la nueva letra de la respuesta correcta después de desordenar
            const nuevaCorrecta = respuestas.find(respuesta => respuesta.texto === textoCorrectoOriginal).letra;

            console.log("Nueva letra correcta después de desordenar:", nuevaCorrecta);

            // Asignar la nueva letra correcta
            nuevaPregunta.correcta = nuevaCorrecta;

            console.log(`Pregunta después de desordenar las alternativas:`, nuevaPregunta);
            return nuevaPregunta;
        });

        // Crear la nueva versión
        versiones.push({
            ...evaluacion,
            preguntas_desarrollo: preguntasDesarrollo,
            preguntas_alternativas: preguntasAlternativas,
            preguntas_vf: preguntasVF
        });
    }

    console.log("Versiones generadas:", versiones);
    return versiones;
}


const generateMoodle = async (evaluacion) => {
    // Crear el contenido del formato XML
    let xmlContent = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xmlContent += `<quiz>\n`;
    xmlContent += `    <name>\n        <text>${evaluacion.titulo}</text>\n    </name>\n`;
    xmlContent += `    <intro>\n        <text>${evaluacion.descripcion}</text>\n    </intro>\n`;

    // Añadir preguntas de desarrollo
    evaluacion.preguntas_desarrollo.forEach(pregunta => {
        xmlContent += `    <question type="essay">\n`;
        xmlContent += `        <name>\n            <text>${pregunta.enunciado}</text>\n        </name>\n`;
        xmlContent += `        <questiontext format="html">\n            <text>${pregunta.enunciado}</text>\n        </questiontext>\n`;
        xmlContent += `        <generalfeedback format="html">\n            <text></text>\n        </generalfeedback>\n`;
        xmlContent += `        <defaultmark>${pregunta.puntaje || 0}</defaultmark>\n`;
        xmlContent += `        <penalty>0.000000</penalty>\n`;
        xmlContent += `        <hidden>0</hidden>\n`;
        xmlContent += `    </question>\n`;
    });

    // Añadir preguntas de opción múltiple
    evaluacion.preguntas_alternativas.forEach(pregunta => {
        xmlContent += `    <question type="multichoice">\n`;
        xmlContent += `        <name>\n            <text>${pregunta.enunciado}</text>\n        </name>\n`;
        xmlContent += `        <questiontext format="html">\n            <text>${pregunta.enunciado}</text>\n        </questiontext>\n`;
        xmlContent += `        <generalfeedback format="html">\n            <text></text>\n        </generalfeedback>\n`;
        xmlContent += `        <defaultmark>1.000000</defaultmark>\n`;
        xmlContent += `        <penalty>0.333333</penalty>\n`;
        xmlContent += `        <hidden>0</hidden>\n`;

        // Opciones de respuesta
        const opciones = ['a', 'b', 'c', 'd', 'e'];
        opciones.forEach((opcion) => {
            const respuesta = pregunta[`respuesta_${opcion}`];
            if (respuesta) {
                const fraccion = (pregunta.correcta.toLowerCase() === opcion) ? '100' : '0';
                xmlContent += `        <answer fraction="${fraccion}">\n`;
                xmlContent += `            <text>${respuesta}</text>\n`;
                xmlContent += `            <feedback format="html">\n                <text></text>\n`;
                xmlContent += `            </feedback>\n`;
                xmlContent += `        </answer>\n`;
            }
        });

        xmlContent += `    </question>\n`;
    });

    evaluacion.preguntas_vf.forEach(pregunta => {
        console.log(`Valor de pregunta.correcta: '${pregunta.correcta}'`); // Para depuración
    
        // Verificar si la respuesta es válida
        if (pregunta.correcta !== 'V' && pregunta.correcta !== 'F') {
            console.warn(`La respuesta para la pregunta '${pregunta.enunciado}' no es válida: '${pregunta.correcta}'.`);
            return; // Saltar esta pregunta si la respuesta no es válida
        }
    
        // Determinar la respuesta correcta
        const esCorrecto = pregunta.correcta === 'V'; // true si 'V', false si 'F'
    
        xmlContent += `    <question type="truefalse">\n`;
        xmlContent += `        <name>\n            <text>${pregunta.enunciado}</text>\n        </name>\n`;
        xmlContent += `        <questiontext format="html">\n            <text><![CDATA[<p>${pregunta.enunciado}</p>]]></text>\n        </questiontext>\n`;
        xmlContent += `        <generalfeedback format="html">\n            <text></text>\n        </generalfeedback>\n`;
    
        // Default grade y Penalty
        xmlContent += `        <defaultgrade>1.0000000</defaultgrade>\n`;
        xmlContent += `        <penalty>0.3333333</penalty>\n`;
        xmlContent += `        <hidden>0</hidden>\n`;
    
        // Respuesta True
        xmlContent += `        <answer fraction="${esCorrecto ? '100' : '0'}" format="moodle_auto_format">\n`;
        xmlContent += `            <text>true</text>\n`;  // Para Moodle, la respuesta 'True' en minúscula
        xmlContent += `            <feedback format="html">\n                <text></text>\n`;
        xmlContent += `            </feedback>\n`;
        xmlContent += `        </answer>\n`;
    
        // Respuesta False
        xmlContent += `        <answer fraction="${!esCorrecto ? '100' : '0'}" format="moodle_auto_format">\n`;
        xmlContent += `            <text>false</text>\n`;  // Para Moodle, la respuesta 'False' en minúscula
        xmlContent += `            <feedback format="html">\n                <text></text>\n`;
        xmlContent += `            </feedback>\n`;
        xmlContent += `        </answer>\n`;
    
        xmlContent += `    </question>\n`;
    });
    
    
    



    xmlContent += `</quiz>`;

    // Crear un blob y descargar el archivo
    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${evaluacion.titulo}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};



const handlePDFDownload = (evaluacion) => {
    generateAllPDFs(evaluacion); // Llama directamente a la función que genera el ZIP
};

const handleDocsDownload = (evaluacion) => {
    generateAllDocs(evaluacion); // Llama directamente a la función que genera el ZIP
};

const handleMoodleExport = (evaluacion) => {
    generateMoodle(evaluacion);
};


const [showOptions, setShowOptions] = useState(false);

const handleButtonClick = () => {
    setShowOptions(!showOptions);
};



const handleBorrarPreguntaAlternativa = async (preguntaId) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta pregunta de alternativas?")) {
        try {
            await axios.delete(`${url_backend}/pregunta/alternativa/${preguntaId}`);
            // Actualizar el estado de preguntasEvaluacion para reflejar la eliminación
            setPreguntasEvaluacion(prevState => ({
                ...prevState,
                preguntas: {
                    ...prevState.preguntas,
                    alternativas: prevState.preguntas.alternativas.filter(pregunta => pregunta.id !== preguntaId)
                }
            }));
            console.log('Pregunta de alternativas eliminada correctamente');
        } catch (error) {
            console.error('Error al eliminar pregunta de alternativas:', error);
        }
    }
};

const handleBorrarPreguntaVF = async (preguntaId) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta pregunta de Verdadero/Falso?")) {
        try {
            await axios.delete(`${url_backend}/pregunta/vf/${preguntaId}`);
            // Actualizar el estado de preguntasEvaluacion para reflejar la eliminación
            setPreguntasEvaluacion(prevState => ({
                ...prevState,
                preguntas: {
                    ...prevState.preguntas,
                    vf: prevState.preguntas.vf.filter(pregunta => pregunta.id !== preguntaId)
                }
            }));
            console.log('Pregunta de Verdadero/Falso eliminada correctamente');
        } catch (error) {
            console.error('Error al eliminar pregunta de Verdadero/Falso:', error);
        }
    }
};

const handleBorrarPreguntaDesarrollo = async (preguntaId) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta pregunta de desarrollo?")) {
        try {
            await axios.delete(`${url_backend}/pregunta/desarrollo/${preguntaId}`);
            // Actualizar el estado de preguntasEvaluacion para reflejar la eliminación
            setPreguntasEvaluacion(prevState => ({
                ...prevState,
                preguntas: {
                    ...prevState.preguntas,
                    desarrollo: prevState.preguntas.desarrollo.filter(pregunta => pregunta.id !== preguntaId)
                }
            }));
            console.log('Pregunta de desarrollo eliminada correctamente');
        } catch (error) {
            console.error('Error al eliminar pregunta de desarrollo:', error);
        }
    }
};

const handleOpenEditModal = (pregunta, tipo) => {
    setPreguntaEditada({
        ...pregunta,
        puntaje: pregunta.puntaje || 0 // Asegura que el puntaje esté inicializado a 0 si es necesario
    });
    setEditQuestionType(tipo);
    setShowEditModal(true);
};

const handleCloseEditModal = () => {
    setShowEditModal(false);
    setPreguntaEditada(null);
    setEditQuestionType('');
};

const handleEditarPregunta = async () => {
    try {
        if (editQuestionType === 'alternativa') {
            await axios.put(`${url_backend}/alternativa/${preguntaEditada.id}`, preguntaEditada);
        } else if (editQuestionType === 'vf') {
            await axios.put(`${url_backend}/vf/${preguntaEditada.id}`, preguntaEditada);
        } else if (editQuestionType === 'desarrollo') {
            await axios.put(`${url_backend}/desarrollo/${preguntaEditada.id}`, preguntaEditada);
        }

        // Actualizar preguntas en el estado
        fetchPreguntas(selectedEvaluacion);
        handleCloseEditModal();
    } catch (error) {
        console.error("Error al editar pregunta:", error);
        // Agregar retroalimentación visual si es necesario
    }
};

const navigate = useNavigate(); // Hook para navegación

const handleResponderEvaluacion = (evaluacionId) => {
    navigate(`/responder-evaluacion/${evaluacionId}`);
};
const openModalPreguntas = () => {
    setPreguntasGeneradas([]);
    setMostrarFormulario(true);
    setIsLoading(false);
    setShowGenerarPreguntasModal(true);
    setCantidadPreguntas({ desarrollo: "", alternativas: "", verdaderoFalso: "" });
    setDificultad("facil");
};


const closeModalPreguntas = () => {
    setShowGenerarPreguntasModal(false);
};

///////////////////////////////////////////////////////////////////////////////////////////////
///////////
////////// funciones de nuevo guion de clase 
//////////
///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////

const openModalGuion = () => setShowGuionModal(true);
const closeModalGuion = () => setShowGuionModal(false);


const handleSubmitNuevoGuion = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    if (!nuevoGuionTitulo || !nuevoGuionRA || !nuevoGuionContenido || !nuevoGuionEstilo || !nuevoGuionDuracion || !nuevoGuionSemana) {
        alert("Por favor, rellene todos los campos del formulario.");
        setIsLoading(false);
        return;
    }

    if (!selectedGuionFile) {
        alert("Por favor, adjunte un recurso (PDF, PPT, etc.).");
        setIsLoading(false);
        return;
    }

    try {
        const formData = new FormData();
        formData.append("titulo", nuevoGuionTitulo);
        formData.append("ra", nuevoGuionRA);
        formData.append("contenido", nuevoGuionContenido);
        formData.append("estilo", nuevoGuionEstilo);
        formData.append("duracion", nuevoGuionDuracion);
        formData.append("semana", nuevoGuionSemana);
        formData.append("archivo", selectedGuionFile);

        const response = await axios.post(
            `${url_backend}/unidad/${selectedUnidad}/crear-guion`,
            formData,
            { 
                headers: { 
                    "Content-Type": "multipart/form-data" 
                } 
            }
        );

        if (response.status === 200 || response.status === 201) {
            const data = response.data;
            
            console.log("🔍 RESPUESTA DEL BACKEND:", data);
            console.log("🔍 guion_id recibido:", data.guion_id);
            console.log("🔍 planificacion recibida:", data.planificacion);
            
            await fetchGuionesUnidad();

            const guionId = data.guion_id;
            
            if (!guionId) {
                console.error("❌ guion_id no viene en la respuesta del backend");
                alert("Error: No se pudo obtener el ID del guion creado");
                return;
            }

            const planificacionConId = {
                ...data.planificacion,
                guion_id: guionId,
                titulo: nuevoGuionTitulo
            };

            console.log("🔍 Planificación con ID:", planificacionConId);

            // ✅ AJUSTADO: Acceder correctamente a los datos en la nueva estructura
            const identificacionClase = data.planificacion?.identificacion_clase || {};
            
            setDatosGlobalesClase({
                nombreProfesor: data.planificacion?.nombre_profesor || "",
                nombreUnidad: data.planificacion?.nombre_unidad || "",
                nombreClase: identificacionClase.asignatura || identificacionClase.titulo || nuevoGuionTitulo,
                nombreMateria: data.planificacion?.nombre_curso || ""
            });
            
            console.log("🌍 Datos globales guardados:", {
                profesor: data.planificacion?.nombre_profesor,
                unidad: data.planificacion?.nombre_unidad,
                clase: identificacionClase.asignatura || identificacionClase.titulo,
                materia: data.planificacion?.nombre_curso
            });

            // ✅ AJUSTADO: Verificar la nueva estructura de datos
            console.log("📊 Nueva estructura de identificacion_clase:", identificacionClase);
            console.log("📊 Campos disponibles:", Object.keys(identificacionClase));
            
            // Limpiar formulario
            setNuevoGuionTitulo("");
            setNuevoGuionRA("");
            setNuevoGuionContenido("");
            setNuevoGuionEstilo("");
            setNuevoGuionDuracion("");
            setNuevoGuionSemana("");
            setSelectedGuionFile(null);
            setShowGuionModal(false);

            openModalPlanificacion(planificacionConId, nuevoGuionTitulo);
            alert("✅ Guion creado exitosamente.");
        }
    } catch (error) {
        console.error("Error al conectar con el servidor:", error);
        alert("Error al conectar con el servidor.");
    } finally {
        setIsLoading(false);
    }
};
///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////////////////////////
///////////
////////// mostrar planificacion
//////////
///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////
const [showPlanificacionModal, setShowPlanificacionModal] = useState(false);
const [nuevoGuionPlanificacion, setNuevoGuionPlanificacion] = useState(null);
const [stepPlanificacion, setStepPlanificacion] = useState(0); // controla pestañas
// 1️⃣ Estado
const [planificacionesUnidad, setPlanificacionesUnidad] = useState([]); // todas las planificaciones de la unidad
const [planificaciones, setPlanificaciones] = useState([]); // 👈 aquí

const [selectedPlanificacion, setSelectedPlanificacion] = useState(null); // cuál está expandida

// Función para formatear el nombre de la unidad
const formatearNombreUnidad = (nombreUnidad) => {
  if (!nombreUnidad) return "";
  
  // Si ya empieza con "unidad" (case insensitive), lo dejamos igual
  if (/^unidad\s+/i.test(nombreUnidad)) {
    return nombreUnidad;
  }
  
  // Si no empieza con "unidad", se lo agregamos
  return `Unidad ${nombreUnidad}`;
};

// Al inicio de tu componente CursoProfesor, después de los estados
const [datosGlobalesClase, setDatosGlobalesClase] = useState({
  nombreProfesor: "",
  nombreUnidad: "", 
  nombreClase: "",
  nombreMateria: ""
});

const openModalPlanificacion = (planificacionData, titulo) => {
  // ✅ LIMPIAR primero cualquier estado residual
  setNuevoGuionPlanificacion(null);
  setStepPlanificacion(0);

  // ✅ VALIDACIÓN EXTREMA
  if (!planificacionData) {
    console.error("❌ openModalPlanificacion: Sin datos de planificación");
    alert("Error: No hay datos de planificación disponibles");
    return;
  }

  // ✅ BUSCAR guion_id en múltiples ubicaciones posibles
  const guionId = 
    planificacionData.guion_id ||
    planificacionData.id ||
    planificacionData.planificacion_id;

  if (!guionId) {
    console.error("❌ openModalPlanificacion: No se pudo encontrar guion_id en:", planificacionData);
    alert("Error: No se pudo identificar el guion. Código: NO_GUION_ID");
    return;
  }

  // ✅ CONSTRUIR objeto seguro (COMPATIBLE: nuevo docente + antiguo)
const planificacionSegura = {
  ...planificacionData,
  guion_id: guionId,
  titulo: titulo || planificacionData.titulo || "Planificación Sin Título",

  // Identificación
  identificacion_clase: planificacionData.identificacion_clase || {},

  // ✅ Campos principales (nuevo)
  resultado_aprendizaje: planificacionData.resultado_aprendizaje || "",
  contenido_tematico:
    planificacionData.contenido_tematico ||
    planificacionData.contenidos_tematicos || // compat viejo
    planificacionData.identificacion_clase?.contenidos_clase ||
    "",
  analisis_ra: planificacionData.analisis_ra || {},
  metadata: planificacionData.metadata || {},

  // ✅ Secuencia (nuevo → secuencia_actividades, viejo → secuencia_didactica)
  secuencia_actividades:
    planificacionData.secuencia_actividades ||
    planificacionData.secuencia_didactica ||
    {},

  // Evaluaciones / estrategias
  evaluaciones_formativas: planificacionData.evaluaciones_formativas || [],
  estrategias_didacticas: planificacionData.estrategias_didacticas || [],

  // ✅ Bibliografía (nuevo)
  bibliografia_material: planificacionData.bibliografia_material || [],

  // ✅ Compatibilidad antigua (si aún hay registros viejos)
  materiales_apoyo: planificacionData.materiales_apoyo || [],
  frameworks: planificacionData.frameworks || {},

  // Contexto BD
  nombre_curso: planificacionData.nombre_curso || "",
  nombre_profesor: planificacionData.nombre_profesor || "",
  nombre_unidad: planificacionData.nombre_unidad || ""
};


  // ✅ SETEAR ESTADO
  setNuevoGuionPlanificacion(planificacionSegura);
  setShowPlanificacionModal(true);

  console.log("🎯 Modal de planificación abierto:", {
    guion_id: planificacionSegura.guion_id,
    titulo: planificacionSegura.titulo,
    tieneDatos: !!planificacionSegura.identificacion_clase
  });
};

const closeModalPlanificacion = () => {
  console.log("🔒 Cerrando modal de planificación y limpiando estado...");
  
  // ✅ LIMPIAR COMPLETAMENTE el estado
  setNuevoGuionPlanificacion(null);
  setShowPlanificacionModal(false);
  setStepPlanificacion(0);
  
  // ✅ Limpiar también los estados relacionados
  setFlashcardsData([]);
  setCurrentFlashcardIndex(0);
  setIsFlashcardFlipped(false);
  
  console.log("✅ Estado limpiado correctamente");
};



// Fetch de guiones de la unidad (solo info básica)
const fetchGuionesUnidad = async () => {
  if (!selectedUnidad) return;

  try {
    const response = await axios.get(`${url_backend}/unidad/${selectedUnidad}/planificaciones`);
    if (response.status === 200) {
      const guionesData = response.data;
      setGuiones(guionesData); // Array de guiones { id, titulo }

      // ✅ INICIALIZAR materialesPorGuion AUTOMÁTICAMENTE con los guiones
      const materialesIniciales = {};
      guionesData.forEach(guion => {
        if (guion.guion_id) {
          materialesIniciales[guion.guion_id] = {
            evaluaciones: {
              diagnostico: false,
              durante: false, 
              cierre: false
            },
            extras: {
              resumen: false,
              mapaConceptual: false,
              flashcards: false,
              glosario: false
            }
          };
        }
      });
      
      setMaterialesPorGuion(materialesIniciales);
      console.log('✅ Guiones y materialesPorGuion inicializados:', {
        guionesCount: guionesData.length,
        materialesCount: Object.keys(materialesIniciales).length
      });
    }
  } catch (error) {
    console.error("Error al obtener guiones:", error);
  }
};

useEffect(() => {
  fetchGuionesUnidad();
}, [selectedUnidad]);

{selectedGuion && showGuionModal && (
    <Modal
        planificacion={guiones.find(g => g.id === selectedGuion)?.planificacion} // ✅ Agregar ?.
        onClose={() => setShowGuionModal(false)}
    />
)}

// 2️⃣ Traer planificaciones al cargar la unidad
const fetchPlanificacionesUnidad = async () => {
  if (!selectedUnidad) return;
  try {
    const response = await axios.get(`${url_backend}/unidad/${selectedUnidad}/planificaciones`);
    if (response.status === 200) {
      setPlanificacionesUnidad(response.data);
      console.log("📤 Planificaciones de la unidad:", response.data);
    }
  } catch (error) {
    console.error("❌ Error al obtener planificaciones:", error);
  }
};

useEffect(() => {
  if (!selectedUnidad) return; // seguridad: no hacer fetch si no hay unidad seleccionada

  // Limpiar planificaciones previas antes de cargar nuevas
  setPlanificaciones([]);

  fetchPlanificacionesUnidad();
}, [selectedUnidad]);
const handleVerPlanificacion = async (guion) => {
  console.log("🔍 handleVerPlanificacion llamado con:", guion);

  if (!guion) {
    console.error("Guion es undefined/null");
    return;
  }

  const guionId = guion.guion_id || guion.id;
  if (!guionId) {
    console.error("No se encontró ID del guion. Guion object:", guion);
    return;
  }

  setSelectedGuion(guionId);

  try {
    const response = await axios.get(`${url_backend}/guion/${guionId}/planificacion`);
    console.log("📡 Respuesta completa del backend:", response);
    console.log("📊 Datos de planificación recibidos:", response.data);

    if (response.status === 200) {
      const planificacionData = response.data;

      // ✅ ACTUALIZADO: GUARDAR DATOS EN VARIABLE GLOBAL con nueva estructura
      const identificacionClase = planificacionData.identificacion_clase || {};
      setDatosGlobalesClase({
        nombreProfesor: planificacionData.nombre_profesor || "",
        nombreUnidad: planificacionData.nombre_unidad || "",
        // ✅ CAMBIO: Usar 'asignatura' en lugar de 'nombre_asignatura'
        nombreClase: identificacionClase.asignatura || identificacionClase.titulo || guion.titulo,
        nombreMateria: planificacionData.nombre_curso || ""
      });
      
      console.log("🌍 Datos globales actualizados:", {
        profesor: planificacionData.nombre_profesor,
        unidad: planificacionData.nombre_unidad,
        clase: identificacionClase.asignatura || identificacionClase.titulo,
        materia: planificacionData.nombre_curso
      });

      // ✅ Verificar nueva estructura de datos
      console.log("🆕 Verificación de nueva estructura:", {
        tieneResultadoAprendizaje: !!planificacionData.resultado_aprendizaje,
        tieneContenidosTematicos: !!planificacionData.contenidos_tematicos,
        tieneAnalisisRA: !!planificacionData.analisis_ra,
        tieneFrameworks: !!planificacionData.frameworks,
        tieneMetadata: !!planificacionData.metadata,
        camposIdentificacion: planificacionData.identificacion_clase ? Object.keys(planificacionData.identificacion_clase) : []
      });

      // ✅ EXTRAER Y ESTRUCTURAR correctamente los datos
      let planificacionParaModal;

      if (planificacionData.guion) {
        console.log("📝 Estructura 'guion' detectada (legacy)");
        planificacionParaModal = {
          ...planificacionData.guion,
          guion_id: guionId,
          titulo: guion.titulo,
          // ✅ Agregar campos faltantes
          resultado_aprendizaje: planificacionData.resultado_aprendizaje || "",
          contenidos_tematicos: planificacionData.contenidos_tematicos || "",
          analisis_ra: planificacionData.analisis_ra || {},
          frameworks: planificacionData.frameworks || {},
          metadata: planificacionData.metadata || {}
        };

        if (planificacionParaModal.desarrollo) {
          planificacionParaModal.desarrollo = formatDesarrolloParaModal(planificacionParaModal.desarrollo);
        }
      } else {
        console.log("📝 Estructura raíz detectada (nueva)");
        planificacionParaModal = {
          ...planificacionData,
          guion_id: guionId,
          titulo: guion.titulo
        };
      }

      console.log("🎯 Planificación preparada para modal:", {
        id: planificacionParaModal.guion_id,
        titulo: planificacionParaModal.titulo,
        analisisRA: !!planificacionParaModal.analisis_ra,
        frameworks: !!planificacionParaModal.frameworks,
        metadata: !!planificacionParaModal.metadata
      });

      openModalPlanificacion(planificacionParaModal, guion.titulo);

    } else {
      alert("No se pudo obtener la planificación.");
    }
  } catch (error) {
    console.error("Error al obtener planificación:", error);
    alert("Error al cargar la planificación");
  }
};

const formatDesarrolloParaModal = (texto) => {
  if (!texto) return "";

  let limpio = texto;

  // 1️⃣ Quitar negritas
  limpio = limpio.replace(/\*\*(.*?)\*\*/g, "$1");

  // 2️⃣ Insertar salto de línea antes de números enumerados
  // Coincide con "1." "2." "3." etc., y agrega salto de línea
  limpio = limpio.replace(/(\d+\.)\s*/g, "\n$1 ");

  // 3️⃣ Limpiar espacios extra y al inicio
  limpio = limpio.replace(/\s+\n/g, "\n").trim();

  return limpio;
};


const handleEliminarGuion = async (guionId) => {
  if (!guionId) return;

  if (!window.confirm("¿Seguro que deseas eliminar este guion y su planificación?")) return;

  // Activar loading
  setIsLoading(true);

  try {
    await axios.delete(`${url_backend}/guion/${guionId}`);
    
    // Recargar la lista desde el backend
    await fetchGuionesUnidad();

    if (selectedGuion === guionId) setSelectedGuion(null);

    alert("✅ Guion eliminado correctamente.");
  } catch (error) {
    console.error("❌ Error al eliminar guion:", error);
    alert("Ocurrió un error al eliminar el guion.");
  } finally {
    // Desactivar loading
    setIsLoading(false);
  }
};
// Agrega esto en tus estados del componente:
const [evaluacionSeleccionada, setEvaluacionSeleccionada] = useState(null);

const handleDescargarGuionPDF = async (guion) => {
  const guionId = guion.guion_id || guion.id;
  if (!guionId) {
    console.error("⚠️ No se encontró el ID del guion:", guion);
    return;
  }

  setSelectedGuion(guionId);

  try {
    const response = await axios.get(`${url_backend}/guion/${guionId}/planificacion`);
    
    console.log("📦 Planificación recibida del backend:", response.data);

    if (response.status === 200) {
      // ✅ CORRECCIÓN: Pasar tanto la planificación como el título
      DescargarGuionPDF(response.data, guion.titulo || "Planificación de Clase");
    } else {
      alert("No se pudo obtener la planificación.");
    }
  } catch (error) {
    console.error("Error al obtener planificación:", error);
  }
};


const DescargarGuionPDF = (planificacion, titulo) => {
  const doc = new jsPDF("portrait", "mm", "a4");

  const COLOR_PRINCIPAL = [60, 60, 120]; // color institucional sobrio
  const MARGIN_LEFT = 20;
  const MARGIN_RIGHT = 190;
  const MAX_WIDTH = 170;
  let y = 30;

  const checkPage = (space = 10) => {
    if (y + space > 280) {
      doc.addPage();
      y = 30;
    }
  };

  const addChapter = (title, subtitle = "") => {
    doc.addPage();
    y = 35;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(...COLOR_PRINCIPAL);
    doc.text(title, MARGIN_LEFT, y);
    y += 8;

    if (subtitle) {
      doc.setFontSize(12);
      doc.setTextColor(80);
      doc.text(subtitle, MARGIN_LEFT, y);
      y += 8;
    }

    doc.setDrawColor(...COLOR_PRINCIPAL);
    doc.setLineWidth(1);
    doc.line(MARGIN_LEFT, y, MARGIN_RIGHT, y);
    y += 12;
    doc.setTextColor(0);
  };

  const addSubchapter = (title) => {
    checkPage(8);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...COLOR_PRINCIPAL);
    doc.text(title, MARGIN_LEFT, y);
    y += 7;
    doc.setTextColor(0);
  };

  const addParagraph = (text) => {
    if (!text) return;
    checkPage(10);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    const wrapped = doc.splitTextToSize(text, MAX_WIDTH);
    doc.text(wrapped, MARGIN_LEFT, y);
    y += wrapped.length * 6 + 4;
  };

  const addField = (label, text) => {
    if (!text) return;
    checkPage(8);
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, MARGIN_LEFT, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    addParagraph(text);
  };

  const addList = (items, title = null) => {
    if (!items || items.length === 0) return;
    if (title) addSubchapter(title);
    doc.setFont("helvetica", "normal");
    items.forEach(item => {
      const wrapped = doc.splitTextToSize(`– ${item}`, MAX_WIDTH - 5);
      doc.text(wrapped, MARGIN_LEFT + 5, y);
      y += wrapped.length * 6;
      checkPage(6);
    });
    y += 4;
  };
  const addIndentedList = (items, title = null) => {
  if (!items || items.length === 0) return;

  if (title) addSubchapter(title);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  items.forEach(item => {
    const wrapped = doc.splitTextToSize(item, MAX_WIDTH - 10);
    doc.text(wrapped, MARGIN_LEFT + 5, y);
    y += wrapped.length * 6;
    checkPage(6);
  });

  y += 4;
};

  const addNumberedList = (items, title = null) => {
  if (!items || items.length === 0) return;

  if (title) addSubchapter(title);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  items.forEach((item, index) => {
    const texto = `${index + 1}. ${item.replace(/^\d+\.\s*/, '')}`;
    const wrapped = doc.splitTextToSize(texto, MAX_WIDTH);
    doc.text(wrapped, MARGIN_LEFT, y);
    y += wrapped.length * 6;
    checkPage(6);
  });

  y += 4;
};

  // ===================== PORTADA =====================
  doc.setFillColor(...COLOR_PRINCIPAL);
  doc.rect(0, 0, 210, 40, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(255);
  doc.text(titulo, 105, 25, { align: "center" });
  doc.setFontSize(12);
  doc.text("Guía Docente Universitaria", 105, 33, { align: "center" });
  doc.setTextColor(0);
  y = 50;

  addParagraph("Este documento corresponde a una guía docente diseñada para orientar la planificación, ejecución y evaluación de una sesión de clase en educación superior, incluyendo análisis pedagógicos, frameworks y recomendaciones relevantes para el docente.");

  // ===================== CAPÍTULO 1 – IDENTIFICACIÓN =====================
  addChapter("Capítulo 1 · Identificación de la Clase", "Información general de la sesión");
  const id = planificacion.identificacion_clase || {};
  addField("Título de la clase", planificacion.titulo);
  addField("Asignatura", id.asignatura);
  addField("Semana / Unidad", id.semana);
  addField("Duración total de la sesión", id.duracion_total);
  addField("Tipo de clase", id.tipo_clase);

  // ===================== CAPÍTULO 2 – ANÁLISIS RA =====================
  addChapter("Capítulo 2 · Análisis del Resultado de Aprendizaje", "Evaluación y recomendaciones pedagógicas");
  const analisis = planificacion.analisis_ra || {};
  if (Array.isArray(analisis.verbos_identificados)) {
    const verbos = analisis.verbos_identificados.map(v =>
      analisis.niveles_bloom?.[v]
        ? `${v} — ${analisis.niveles_bloom[v]}`
        : v
    );
    addNumberedList(verbos, "Verbos identificados y nivel Bloom");
  }
  addField("Factibilidad de la sesión", analisis.factibilidad_duracion);
  addIndentedList(analisis.evidencias_observables, "Evidencias observables");
  addIndentedList(analisis.riesgos_potenciales, "Riesgos potenciales");
  addField("Recomendación experta", analisis.recomendacion_experta);

 // ===================== CAPÍTULO 3 – RESULTADO DE APRENDIZAJE =====================
// ===================== CAPÍTULO 3 – RESULTADO DE APRENDIZAJE =====================
// ===================== CAPÍTULO 3 – RESULTADO DE APRENDIZAJE =====================
addChapter("Capítulo 3 · Resultado de Aprendizaje", "Competencia a desarrollar en la sesión");

const procesarResultadoAprendizaje = (texto) => {
  if (!texto || texto.trim().length === 0) {
    return "No especificado";
  }
  
  try {
    // Primero limpiar numeración existente
    const textoLimpio = texto
      .replace(/^\d+[\.\)]\s*/gm, '')   // "1. ", "2) " al inicio de línea
      .replace(/^[a-zA-Z]\)\s*/gm, '')  // "a) ", "b) " al inicio de línea
      .replace(/^•\s*/gm, '')           // "• "
      .replace(/^[\-\*]\s*/gm, '')      // "- ", "* "
      .trim();
    
    // Lógica original de división
    let items = [];
    
    if (textoLimpio.includes('.  ')) {
      items = textoLimpio.split('.  ')
        .map(item => item.trim())
        .filter(item => item.length > 0);
    } else if (textoLimpio.match(/\.\s+[A-ZÁÉÍÓÚ]/)) {
      items = textoLimpio.split(/\.\s+(?=[A-ZÁÉÍÓÚ])/)
        .map(item => item.trim())
        .filter(item => item.length > 0);
    } else {
      items = textoLimpio.split('.')
        .map(item => item.trim())
        .filter(item => item.length > 0);
    }
    
    // Siempre numerar después de limpiar
    items = items
      .map(item => item.endsWith('.') ? item : item + '.')
      .map((item, index) => `${index + 1}. ${item}`);
    
    return items.join('\n');
    
  } catch (error) {
    console.error("Error procesando resultado de aprendizaje:", error);
    return texto; // Texto original como fallback
  }
};

addField("Resultado de Aprendizaje", procesarResultadoAprendizaje(planificacion.resultado_aprendizaje));

// ===================== CAPÍTULO 4 – CONTENIDOS =====================
// ===================== CAPÍTULO 4 – CONTENIDOS =====================
addChapter("4. CONTENIDOS TEMÁTICOS", "Temas y subtemas de la sesión");

// Procesar Contenidos Temáticos - SIEMPRE NUMERA después de limpiar
const procesarContenidos = (texto) => {
  if (!texto || texto.trim().length === 0) {
    return "No especificados";
  }
  
  try {
    // Normalizar saltos de línea
    const normalizado = texto.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    // Dividir, limpiar y filtrar
    const contenidos = normalizado
      .split('\n')
      .map(linea => {
        // Paso 1: Limpiar
        let limpio = linea.trim();
        
        // Quitar numeración existente (1., 2., 1), a), etc.)
        limpio = limpio.replace(/^\d+[\.\)]\s*/, '');      // "1. ", "2) "
        limpio = limpio.replace(/^[a-zA-Z]\)\s*/, '');     // "a) ", "b) "
        limpio = limpio.replace(/^•\s*/, '');              // "• "
        limpio = limpio.replace(/^[\-\*]\s*/, '');         // "- ", "* "
        
        // Quitar punto final si existe
        if (limpio.endsWith('.')) {
          limpio = limpio.slice(0, -1);
        }
        
        // Limpiar espacios
        limpio = limpio.replace(/\s+/g, ' ').trim();
        
        return limpio;
      })
      .filter(linea => {
        // Filtrar líneas vacías
        if (linea.length === 0) return false;
        // Filtrar solo puntuación
        if (/^[\.\-\*\(\)]+$/.test(linea)) return false;
        return true;
      })
      .map((item, index) => {
        // Paso 2: SIEMPRE NUMERAR (incluso si antes estaban numerados)
        return `${index + 1}. ${item}`;
      })
      .filter(item => item.length > 5); // Filtrar items muy cortos
    
    // Unir en una sola cadena para PDF
    return contenidos.length > 0 
      ? contenidos.join('\n')
      : "No se encontraron contenidos válidos";
    
  } catch (error) {
    console.error("Error procesando contenidos:", error);
    return "Error al procesar contenidos";
  }
};

// Usar en el PDF
addField("Contenidos", procesarContenidos(planificacion.contenidos_tematicos));
  // ===================== CAPÍTULO 5 – SECUENCIA DIDÁCTICA =====================
addChapter("Capítulo 5 · Secuencia Didáctica", "Estructura en fases de análisis, experimentación y síntesis");

// Pregunta Problema Central
if (planificacion.secuencia_didactica?.pregunta_problema_central) {
  addSubchapter("Pregunta Problema Central");
  addParagraph(planificacion.secuencia_didactica.pregunta_problema_central);
}

// Mapeo de las fases
const estructura = planificacion.secuencia_didactica?.estructura || {};
const fasesOrdenadas = ["fase_analisis", "fase_experimentacion", "fase_sintesis"];

fasesOrdenadas.forEach(faseKey => {
  const fase = estructura[faseKey];
  if (!fase) return;
  
  // Determinar título de la fase
  let tituloFase = "";
  switch(faseKey) {
    case "fase_analisis": tituloFase = "Fase 1 · Análisis"; break;
    case "fase_experimentacion": tituloFase = "Fase 2 · Experimentación"; break;
    case "fase_sintesis": tituloFase = "Fase 3 · Síntesis"; break;
    default: tituloFase = `Fase · ${faseKey.replace("fase_", "").toUpperCase()}`;
  }
  
  addSubchapter(tituloFase);
  
  // Tiempo
  if (fase.tiempo || fase.tiempo_total) {
    addField("Tiempo estimado", fase.tiempo || fase.tiempo_total);
  }
  
  // Propósito técnico
  if (fase.proposito_tecnico) {
    addField("Propósito técnico", fase.proposito_tecnico);
  }
  
  // Actividades
  if (fase.actividad_estudiante) {
    addField("Actividad del estudiante", fase.actividad_estudiante);
  }
  
  // Actividades detalladas (para fase_experimentacion)
  if (fase.actividades && Array.isArray(fase.actividades)) {
    checkPage(10);
    doc.setFont("helvetica", "bold");
    doc.text("Actividades detalladas:", MARGIN_LEFT, y);
    y += 6;
    
    fase.actividades.forEach((act, idx) => {
      checkPage(20);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(`${idx + 1}. ${act.nombre || 'Actividad'}`, MARGIN_LEFT + 5, y);
      y += 5;
      
      doc.setFont("helvetica", "normal");
      if (act.descripcion) {
        const wrappedDesc = doc.splitTextToSize(act.descripcion, MAX_WIDTH - 10);
        doc.text(wrappedDesc, MARGIN_LEFT + 10, y);
        y += wrappedDesc.length * 5 + 2;
      }
      
      if (act.decision_disciplinar) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text("Decisión disciplinar:", MARGIN_LEFT + 10, y);
        y += 4;
        doc.setFont("helvetica", "normal");
        const wrappedDec = doc.splitTextToSize(act.decision_disciplinar, MAX_WIDTH - 15);
        doc.text(wrappedDec, MARGIN_LEFT + 15, y);
        y += wrappedDec.length * 4 + 2;
      }
      
      if (act.producto_parcial) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text("Producto parcial:", MARGIN_LEFT + 10, y);
        y += 4;
        doc.setFont("helvetica", "normal");
        const wrappedProd = doc.splitTextToSize(act.producto_parcial, MAX_WIDTH - 15);
        doc.text(wrappedProd, MARGIN_LEFT + 15, y);
        y += wrappedProd.length * 4 + 2;
      }
      
      if (act.duracion) {
        doc.setFont("helvetica", "bold");
        doc.text("Duración:", MARGIN_LEFT + 10, y);
        doc.setFont("helvetica", "normal");
        doc.text(act.duracion, MARGIN_LEFT + 30, y);
        y += 5;
      }
      
      y += 5;
    });
  }
  
  // Herramientas técnicas
  if (fase.herramientas_tecnicas && Array.isArray(fase.herramientas_tecnicas)) {
    checkPage(10);
    doc.setFont("helvetica", "bold");
    doc.text("Herramientas técnicas:", MARGIN_LEFT, y);
    y += 6;
    
    doc.setFont("helvetica", "normal");
    fase.herramientas_tecnicas.forEach((herramienta, idx) => {
      const text = herramienta.startsWith('http') 
        ? `${idx + 1}. Enlace: ${herramienta}`
        : `${idx + 1}. ${herramienta}`;
      const wrapped = doc.splitTextToSize(text, MAX_WIDTH - 10);
      doc.text(wrapped, MARGIN_LEFT + 5, y);
      y += wrapped.length * 5;
      checkPage(6);
    });
    y += 4;
  }
  
  // Decisiones disciplinares
  if (fase.decision_disciplinar) {
    addField("Decisión disciplinar", fase.decision_disciplinar);
  }
  
  if (fase.decision_final) {
    addField("Decisión final", fase.decision_final);
  }
  
  // Productos
  if (fase.producto_analitico) {
    addField("Producto analítico", fase.producto_analitico);
  }
  
  if (fase.actividad_integradora) {
    addField("Actividad integradora", fase.actividad_integradora);
  }
  
  if (fase.artefacto_final) {
    addField("Artefacto final", fase.artefacto_final);
  }
  
  // Formato de presentación
  if (fase.formato_presentacion) {
    addField("Formato de presentación", fase.formato_presentacion);
  }
  
if (fase.evaluacion_formativa) {
  checkPage(20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Evaluación Formativa", MARGIN_LEFT, y);
  y += 6;
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Tipo: ${fase.evaluacion_formativa.tipo || 'Evaluación continua'}`, MARGIN_LEFT, y);
  y += 8;
  
  if (fase.evaluacion_formativa.criterios) {
    fase.evaluacion_formativa.criterios.forEach((criterio, idx) => {
      checkPage(30);
      
      // Criterio principal con fondo
      doc.setFillColor(240, 240, 240);
      doc.rect(MARGIN_LEFT - 2, y - 2, MAX_WIDTH + 4, 10, 'F');
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(`${idx + 1}. ${criterio.criterio || ''}`, MARGIN_LEFT, y + 6);
      y += 12;
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      
      // Niveles organizados verticalmente
      const niveles = [
        { nivel: 'Logrado', valor: criterio.logrado, color: [34, 139, 34] }, // Verde
        { nivel: 'En proceso', valor: criterio.en_proceso, color: [255, 165, 0] }, // Naranja
        { nivel: 'Inicial', valor: criterio.inicial, color: [220, 53, 69] } // Rojo
      ];
      
      niveles.forEach(item => {
        if (item.valor) {
          // Icono simple (•) y nivel
          doc.setTextColor(...item.color);
          doc.setFont("helvetica", "bold");
          doc.text(`• ${item.nivel}:`, MARGIN_LEFT + 5, y);
          
          // Descripción
          doc.setTextColor(0, 0, 0); // Negro
          doc.setFont("helvetica", "normal");
          const wrapped = doc.splitTextToSize(item.valor, MAX_WIDTH - 25);
          doc.text(wrapped, MARGIN_LEFT + 30, y);
          
          y += wrapped.length * 5;
          y += 4; // Espacio entre niveles
        }
      });
      y += 10; // Espacio entre criterios
    });
  }
  y += 4;
}
// Rúbrica final (solo para fase_sintesis)

 // Rúbrica final - VERSIÓN MEJORADA Y LIMPIA
if (fase.rubrica_final) {
  checkPage(20); // Asegurar espacio suficiente
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Rúbrica Final", MARGIN_LEFT, y);
  y += 6;
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Tipo: ${fase.rubrica_final.tipo || 'Evaluación integradora'}`, MARGIN_LEFT, y);
  y += 8;
  
  if (fase.rubrica_final.criterios_principales) {
    fase.rubrica_final.criterios_principales.forEach((criterio, idx) => {
      checkPage(30); // Verificar espacio para cada criterio
      
      // Criterio principal con fondo
      doc.setFillColor(240, 240, 240);
      doc.rect(MARGIN_LEFT - 2, y - 2, MAX_WIDTH + 4, 10, 'F');
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(`${idx + 1}. ${criterio.criterio || ''}`, MARGIN_LEFT, y + 6);
      y += 12;
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      
      // Niveles organizados verticalmente
      const niveles = [
        { nivel: 'Excelente', valor: criterio.excelente, color: [34, 139, 34] }, // Verde
        { nivel: 'Adecuado', valor: criterio.adecuado, color: [255, 165, 0] },   // Naranja
        { nivel: 'Insuficiente', valor: criterio.insuficiente, color: [220, 53, 69] } // Rojo
      ];
      
      niveles.forEach(item => {
        if (item.valor) {
          // Icono simple (•) y nivel
          doc.setTextColor(...item.color);
          doc.setFont("helvetica", "bold");
          doc.text(`• ${item.nivel}:`, MARGIN_LEFT + 5, y);
          
          // Descripción
          doc.setTextColor(0, 0, 0); // Negro
          doc.setFont("helvetica", "normal");
          const wrapped = doc.splitTextToSize(item.valor, MAX_WIDTH - 25);
          doc.text(wrapped, MARGIN_LEFT + 30, y);
          
          y += wrapped.length * 5;
          y += 4; // Espacio entre niveles
        }
      });
      y += 10; // Espacio entre criterios
    });
  }
  y += 4;
}
    
  y += 8; // Espacio entre fases
});

// Gestión del tiempo - VERSIÓN CORREGIDA
if (planificacion.secuencia_didactica?.gestion_tiempo) {
  const gestion = planificacion.secuencia_didactica.gestion_tiempo;
  addSubchapter("Gestión del Tiempo");
  
  if (gestion.duracion_total_verificada) {
    // Limpiar el texto si tiene símbolos de escape
    const duracionLimpia = gestion.duracion_total_verificada
      .replace(/"/g, '')
      .replace(/\\/g, '');
    addField("Duración total verificada", duracionLimpia);
  }
  
  // En la sección de Gestión del Tiempo, actualiza así:
  if (gestion.porcentaje_activo_estudiante) {
    // Reemplazar símbolos problemáticos
    const porcentajeLimpio = gestion.porcentaje_activo_estudiante
      .replace(/≥/g, '>=')
      .replace(/≤/g, '<=')
      .trim();
    
    addField("Porcentaje activo del estudiante", porcentajeLimpio);
  }
}


// Notas de implementación
if (planificacion.secuencia_didactica?.notas_implementacion) {
  const notas = planificacion.secuencia_didactica.notas_implementacion;
  addSubchapter("Notas de Implementación");
  
  if (notas.preparacion_docente) {
    addField("Preparación docente", notas.preparacion_docente);
  }
  
  if (notas.preparacion_estudiante) {
    addField("Preparación estudiante", notas.preparacion_estudiante);
  }
  
  if (notas.dificultades_tecnicas_esperadas) {
    addField("Dificultades técnicas esperadas", notas.dificultades_tecnicas_esperadas);
  }
  
  if (notas.variaciones_posibles) {
    addField("Variaciones posibles", notas.variaciones_posibles);
  }
}
  // ===================== CAPÍTULO 6 – ESTRATEGIAS DIDÁCTICAS =====================
  addChapter("Capítulo 6 · Estrategias Didácticas", "Metodologías aplicadas");
  (planificacion.estrategias_didacticas || []).forEach((e, i) => {
    addSubchapter(`${i + 1}. ${e.nombre} (${e.momento})`);
    addField("Descripción", e.descripcion_corta);
    addList(e.pasos, "Pasos de la estrategia");
    addField("Tiempo estimado", e.tiempo);
  });

  // ===================== CAPÍTULO 7 – FRAMEWORKS =====================
  addChapter("Capítulo 7 · Frameworks", "UDL y SAMR");

  const frameworks = planificacion.frameworks || {};

  // ===== UDL =====
  (frameworks.udl_esencial || []).forEach((udl) => {
    addSubchapter(`UDL: ${udl.principio.replace("_", " ").toUpperCase()}`);
    addField("Tiempo", udl.tiempo);
    addField("Acción docente", udl.accion_docente);
    addField("Acción estudiante", udl.accion_estudiante);
    addField("Evidencia observable", udl.evidencia_observable || udl.criterio_observable);
    addField("Propósito pedagógico", udl.proposito_pedagogico);
  });

    // ===== SAMR =====
  (frameworks.samr_practico || []).forEach((samr, i) => {
    // Mostrar el tema en el título si existe
    let tituloSAMR = `SAMR: Nivel ${samr.nivel}`;
    if (samr.tema) {
      tituloSAMR = `SAMR: ${samr.tema} - Nivel ${samr.nivel}`;
    }
    
    addSubchapter(tituloSAMR);
    addField("Decisión didáctica", samr.decision_didactica);
    addField("Antes", samr.antes);
    addField("Después", samr.despues);
    
    // Herramientas recomendadas (NUEVO)
    if (samr.herramientas_recomendadas && samr.herramientas_recomendadas.length > 0) {
      checkPage(10);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("Herramientas recomendadas:", MARGIN_LEFT, y);
      y += 6;
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      samr.herramientas_recomendadas.forEach((herramienta, idx) => {
        const wrapped = doc.splitTextToSize(`${idx + 1}. ${herramienta}`, MAX_WIDTH - 10);
        doc.text(wrapped, MARGIN_LEFT + 5, y);
        y += wrapped.length * 6;
        checkPage(6);
      });
      y += 4;
    }
    
    addField("Impacto pedagógico", samr.impacto_pedagogico);
  });

  // ===================== CAPÍTULO 8 – EVALUACIONES FORMATIVAS =====================
  addChapter("Capítulo 8 · Evaluaciones Formativas", "Instancias breves de verificación del aprendizaje");
  (planificacion.evaluaciones_formativas || []).forEach((ev, i) => {
    addSubchapter(`${i + 1}. ${ev.tipo} – ${ev.momento}`);
    addField("Descripción", ev.descripcion);
    addNumberedList(ev.verbos_ra_evaluados, "Verbos RA evaluados");
    addField("Nivel Bloom", ev.nivel_bloom_evaluado);
    addNumberedList(ev.criterios, "Criterios de evaluación");
    addField("Retroalimentación", ev.retroalimentacion);
  });

  // ===================== CAPÍTULO 9 – MATERIALES =====================
  addChapter("Capítulo 9 · Materiales de Apoyo", "Recursos para facilitar la clase");
  (planificacion.materiales_apoyo || []).forEach((m, i) => {
    addSubchapter(`${m.titulo} (${m.tipo})`);
    addField("Descripción", m.descripcion);
    addField("Momento de uso", m.momento_uso);
    addField("Formato", m.formato);
    addField("Contenido", m.contenido);
    addField("Instrucciones de uso", m.instrucciones_uso);
  });

  // ===================== PIE DE PÁGINA =====================
  const pages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text(`Página ${i} de ${pages}`, 105, 290, { align: "center" });
  }

  doc.save(`${titulo}_Guia_Docente.pdf`);
};




///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////////////////////////
///////////
////////// mostrar herramientas
//////////
///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////


// Estados
const [showResumenModal, setShowResumenModal] = useState(false);
const [resumenTexto, setResumenTexto] = useState(null);
const [resumenData, setResumenData] = useState(null); // Cambiar nombre para guardar más datos
const [currentGuionId, setCurrentGuionId] = useState(null);
// 📄 Manejo del resumen
// 📄 Manejo del resumen SIMPLIFICADO
const handleResumen = async (guion_id, accion = "obtener") => {
  console.log(`📥 ${accion === "regenerar" ? "Regenerando" : "Obteniendo"} resumen para guion:`, guion_id);
  
  setIsLoading(true);
  setCurrentGuionId(guion_id);

  try {
    const response = await axios.get(
      `${url_backend}/planificacion/${guion_id}/resumen?accion=${accion}`
    );
    
    console.log("✅ Resumen obtenido:", response.data);

    const resumen = response.data?.resumen;
    
    if (resumen && typeof resumen === "object") {
      // Guardar el resumen
      setResumenTexto(resumen);
      
      // Guardar TODOS los datos de la respuesta para usar unidad_nombre, profesor, etc.
      setResumenData(response.data);
      
      // ABRIR EL MODAL SOLO CUANDO TENEMOS LOS DATOS
      setShowResumenModal(true);
    } else {
      console.warn("⚠️ Resumen vacío o malformado");
      setResumenTexto(null);
      setResumenData(null);
    }
    
  } catch (error) {
    console.error("❌ Error al obtener resumen:", error);
    alert(`Error: ${error.response?.data?.detail || error.message}`);
    setResumenTexto(null);
    setResumenData(null);
  } finally {
    setIsLoading(false);
  }
};
const generatePDFResumen = async (resumen, accion = "descargar") => {
  if (!resumen) {
    throw new Error("No hay resumen para generar");
  }

  try {
    const pdf = new jsPDF();
    const pageHeight = pdf.internal.pageSize.height;
    const pageWidth = pdf.internal.pageSize.width;
    const margin = 15;
    const usableWidth = pageWidth - margin * 2;
    const lineHeight = 5.5;
    let yPos = margin;

    // Colores del tema
    const COLOR_MORADO = [110, 0, 140];
    const COLOR_AZUL = [52, 152, 219];
    const COLOR_BLANCO = [255, 255, 255];
    const COLOR_NEGRO = [0, 0, 0];
    const COLOR_GRIS = [100, 100, 100];
    const COLOR_GRIS_CLARO = [240, 240, 240];

    // ========== CARGAR LOGO ==========
    let logoBase64 = logoBase64Cache;
    if (!logoBase64) {
      try {
        logoBase64 = await cargarLogoBase64();
      } catch (error) {
        console.log("Error al cargar logo:", error);
        logoBase64 = null;
      }
    }

    // ========== ENCABEZADO PROFESIONAL ==========
    pdf.setFillColor(...COLOR_MORADO);
    pdf.rect(0, 0, pageWidth, 50, "F");
    
    // Logo
    if (logoBase64) {
      try {
        pdf.addImage(logoBase64, 'PNG', pageWidth - 40, 8, 25, 25);
      } catch (error) {
        console.log("Error al agregar logo:", error);
      }
    }

    // Título principal
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(18);
    pdf.setTextColor(...COLOR_BLANCO);
    pdf.text("RESUMEN DE CONTENIDOS", margin, 25);
    
    // Información institucional
    pdf.setFontSize(8);
    pdf.setTextColor(...COLOR_BLANCO);
    
    // Línea 1: Profesor
    if (datosGlobalesClase.nombreProfesor) {
      pdf.text(`Profesor: ${datosGlobalesClase.nombreProfesor}`, margin, 35);
    }
    
    // Línea 2: Materia/Clase
    const materiaTexto = datosGlobalesClase.nombreMateria || datosGlobalesClase.nombreClase || '';
    if (materiaTexto) {
      pdf.text(`Materia: ${materiaTexto}`, margin, 41);
    }
    
    // Línea 3: Unidad y Fecha
    const fecha = new Date().toLocaleDateString('es-ES');
    const unidadTexto = datosGlobalesClase.nombreUnidad ? `${datosGlobalesClase.nombreUnidad} • ` : '';
    pdf.text(`${unidadTexto}${fecha}`, margin, 47);

    yPos = 60;

    // ========== FUNCIÓN PARA AGREGAR SECCIONES ==========
    const addSection = (titulo, contenido, esLista = false) => {
      // Verificar espacio para nueva sección
      const espacioNecesario = 25;
      if (yPos + espacioNecesario > pageHeight - margin) {
        pdf.addPage();
        yPos = margin;
        
        pdf.setFontSize(8);
        pdf.setTextColor(...COLOR_GRIS);
        pdf.text("Continuación", margin, 10);
        pdf.text(`Página ${pdf.internal.getNumberOfPages()}`, pageWidth - margin, 10, { align: "right" });
        yPos = margin + 5;
      }

      // Título de sección
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.setTextColor(...COLOR_MORADO);
      pdf.text(titulo.toUpperCase(), margin, yPos);
      yPos += 8;

      // Línea debajo del título
      pdf.setDrawColor(...COLOR_MORADO);
      pdf.setLineWidth(0.5);
      pdf.line(margin, yPos - 2, margin + 50, yPos - 2);
      yPos += 5;

      // Contenido
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(...COLOR_NEGRO);

      if (esLista && Array.isArray(contenido) && contenido.length > 0) {
        contenido.forEach((item, index) => {
          if (!item || item.trim() === '') return;
          
          const itemLines = pdf.splitTextToSize(`• ${item}`, usableWidth - 5);
          
          itemLines.forEach((line) => {
            if (yPos + lineHeight > pageHeight - margin) {
              pdf.addPage();
              yPos = margin + 5;
              pdf.setFontSize(8);
              pdf.setTextColor(...COLOR_GRIS);
              pdf.text("Continuación", margin, 10);
              pdf.text(`Página ${pdf.internal.getNumberOfPages()}`, pageWidth - margin, 10, { align: "right" });
            }
            
            pdf.text(line, margin + 5, yPos);
            yPos += lineHeight;
          });
          
          yPos += 2;
        });
      } else if (contenido && typeof contenido === 'string') {
        const lines = pdf.splitTextToSize(contenido, usableWidth);
        
        lines.forEach((line) => {
          if (yPos + lineHeight > pageHeight - margin) {
            pdf.addPage();
            yPos = margin + 5;
            pdf.setFontSize(8);
            pdf.setTextColor(...COLOR_GRIS);
            pdf.text("Continuación", margin, 10);
            pdf.text(`Página ${pdf.internal.getNumberOfPages()}`, pageWidth - margin, 10, { align: "right" });
          }
          
          pdf.text(line, margin, yPos);
          yPos += lineHeight;
        });
      } else {
        pdf.text("Sin datos disponibles", margin, yPos);
        yPos += lineHeight;
      }

      yPos += 8;
    };

    // ========== SECCIONES DEL RESUMEN ==========
    
    if (resumen.tema_principal) {
      addSection("Tema Principal", resumen.tema_principal, false);
    }
    
    if (resumen.ideas_principales && Array.isArray(resumen.ideas_principales) && resumen.ideas_principales.length > 0) {
      addSection("Ideas Principales", resumen.ideas_principales, true);
    }
    
    if (resumen.conceptos_clave && Array.isArray(resumen.conceptos_clave) && resumen.conceptos_clave.length > 0) {
      addSection("Conceptos Clave", resumen.conceptos_clave, true);
    }
    
    if (resumen.conclusion) {
      addSection("Conclusión", resumen.conclusion, false);
    }

    // ========== PIE DE PÁGINA ==========
    const totalPages = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      
      pdf.setFontSize(8);
      pdf.setTextColor(...COLOR_GRIS);
      
      pdf.text(`Resumen generado: ${new Date().toLocaleDateString('es-ES')}`, margin, pageHeight - 10);
      pdf.text(`Página ${i} de ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: "center" });
      pdf.text('AI-Want-2-Teach', pageWidth - margin, pageHeight - 10, { align: "right" });
    }

    // ========== ACCIÓN BASADA EN PARÁMETRO ==========
    if (accion === "descargar") {
      // Generar nombre del archivo
      let nombreAsignatura = datosGlobalesClase.nombreClase || 
                            datosGlobalesClase.nombreMateria || 
                            datosGlobalesClase.nombreUnidad || 
                            "resumen";
      
      const nombreArchivo = `resumen_${nombreAsignatura
        .toLowerCase()
        .replace(/[^a-z0-9áéíóúüñ\s]/g, '')
        .replace(/\s+/g, '_')
        .trim()}.pdf`;
      
      console.log("Descargando resumen como:", nombreArchivo);
      pdf.save(nombreArchivo);
      
      return true; // Para confirmación opcional
      
     } else if (accion === "compartir") {
      // ✅ CORREGIDO: Devolver el PDF listo para blob
      // Crear el blob directamente aquí
      const pdfBlob = pdf.output('blob');
      return pdfBlob; // Devuelve el blob directamente
    }
    
  } catch (error) {
    console.error("Error generando PDF de resumen:", error);
    throw error;
  }
};


// Estados para el mapa conceptual
const [showMapaModal, setShowMapaModal] = useState(false);
const [mapaData, setMapaData] = useState(null);
// Cambia el estado para usar el mapa procesado
const [mapaProcesado, setMapaProcesado] = useState(null);

// 2. FUNCIÓN AUXILIAR PARA AGRUPAR RELACIONES (¡ESTA FALTABA!)
// 2. FUNCIÓN AUXILIAR PARA AGRUPAR RELACIONES (ACTUALIZADA)
const agruparRelacionesPorConcepto = (relaciones) => {
  if (!relaciones) return {};
  
  const agrupadas = {};
  relaciones.forEach(rel => {
    // 🔥 Agrupar por ID del concepto origen
    if (!agrupadas[rel.origen]) {
      agrupadas[rel.origen] = [];
    }
    agrupadas[rel.origen].push(rel);
  });
  return agrupadas;
};



// 🗺️ Manejo del mapa conceptual CON DEBUG
// 🗺️ Manejo del mapa conceptual CON DEBUG
// 2. MODIFICA la función handleGenerarMapaConceptual para asegurar que setMapaProcesado se ejecute
const handleGenerarMapaConceptual = async (guion_id, accion = "obtener") => {
  console.log(`📥 ${accion === "regenerar" ? "Regenerando" : "Obteniendo"} mapa conceptual para guion:`, guion_id);
  
  setIsLoading(true);
  setCurrentGuionId(guion_id);

  try {
    const response = await axios.get(
      `${url_backend}/planificacion/${guion_id}/mapa-conceptual?accion=${accion}`
    );
    
    console.log("🗺️ Mapa conceptual obtenido:", response.data);

    const mapaRaw = response.data?.mapa_conceptual;
    
    if (mapaRaw && typeof mapaRaw === "object") {
      const mapaProcesadoData = procesarMapaConceptual(mapaRaw);
      
      if (mapaProcesadoData) {
        setMapaProcesado(mapaProcesadoData);
        
        // ABRIR EL MODAL SOLO CUANDO TENEMOS LOS DATOS
        setShowMapaModal(true);
      } else {
        console.error("❌ procesarMapaConceptual retornó null");
        setMapaProcesado(null);
      }
    } else {
      console.warn("⚠️ Mapa vacío o malformado");
      setMapaProcesado(null);
    }
    
  } catch (error) {
    console.error("❌ Error al obtener mapa conceptual:", error);
    alert(`Error: ${error.response?.data?.detail || error.message}`);
    setMapaProcesado(null);
  } finally {
    setIsLoading(false);
  }
};
// ✅ FUNCIÓN PARA REHACER MAPA CONCEPTUAL
const handleRehacerMapaConceptual = async (guion_id) => {
  if (window.confirm("¿Estás seguro de regenerar el mapa conceptual? Se creará una nueva versión.")) {
    setShowMapaModal(false);
    setTimeout(() => {
      handleGenerarMapaConceptual(guion_id, "regenerar");
    }, 300);
  }
};
// Agrega esta función para procesar los datos del mapa

// REEMPLAZA la función detectarTipoMapa por esto:
const procesarMapaConceptual = (mapaData) => {
  console.log("🔄 INICIANDO procesarMapaConceptual - CON CLASIFICACIÓN CORREGIDA");
  
  if (!mapaData) {
    console.error("❌ mapaData es null o undefined");
    return null;
  }

  try {
    // 🆕 DETECTAR Y NORMALIZAR ESTRUCTURA
    let conceptos = [];
    let relaciones = [];
    let titulo = "";
    let conceptoRaiz = "";

    // Si viene en el formato nuevo (con array "conceptos")
    if (mapaData.conceptos && Array.isArray(mapaData.conceptos)) {
      console.log("📦 Detectado NUEVO formato con array conceptos");
      conceptos = mapaData.conceptos;
      relaciones = mapaData.relaciones || [];
      titulo = mapaData.titulo || "Mapa Conceptual";
      
      // Encontrar el concepto raíz
      const raiz = conceptos.find(c => c.nivel === "raiz" || c.id === "cp_1");
      conceptoRaiz = raiz ? raiz.nombre : (conceptos[0]?.nombre || "Concepto Principal");
    } 
    // Si viene en el formato antiguo
    else if (mapaData.conceptos_principales || mapaData.conceptos_secundarios) {
      console.log("📦 Detectado formato ANTIGUO - normalizando...");
      conceptos = [
        ...(mapaData.conceptos_principales || []),
        ...(mapaData.conceptos_secundarios || [])
      ];
      relaciones = mapaData.relaciones || [];
      titulo = mapaData.titulo || "Mapa Conceptual";
      conceptoRaiz = mapaData.estructura?.concepto_raiz || 
                    mapaData.conceptos_principales?.[0]?.nombre || 
                    "Concepto Principal";
    } else {
      console.error("❌ Formato no reconocido");
      return null;
    }

    console.log(`📊 Total conceptos: ${conceptos.length}, Relaciones: ${relaciones.length}`);

    // 🔥 DECODIFICAR todos los conceptos
    const decodificarHTML = (texto) => {
      if (!texto) return texto;
      return texto
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, '&');
    };

    const conceptosDecodificados = conceptos.map(concepto => ({
      ...concepto,
      nombre: decodificarHTML(concepto.nombre),
      descripcion: concepto.descripcion ? decodificarHTML(concepto.descripcion) : ""
    }));

    // 🆕 DEPURACIÓN DETALLADA DE CONCEPTOS
    console.log("🔍 DEPURACIÓN - TODOS LOS CONCEPTOS:");
    conceptosDecodificados.forEach((concepto, index) => {
      const nivel = concepto.nivel;
      const idParts = concepto.id.split("_").length;
      
      console.log(`  ${index + 1}. ${concepto.id} - "${concepto.nombre}"`);
      console.log(`     Nivel: ${nivel}, Partes ID: ${idParts}`);
    });

    // Crear mapa de conceptos por ID
    const conceptosMap = {};
    conceptosDecodificados.forEach(concepto => {
      conceptosMap[concepto.id] = concepto;
    });

    // 🆕 CLASIFICACIÓN CORREGIDA - USAR NIVEL DEL BACKEND COMO PRIORIDAD
    const conceptosPorNivel = {
      raiz: [],
      principal: [],
      secundario: [],
      terciario: []
    };

    conceptosDecodificados.forEach(concepto => {
      const nivel = concepto.nivel;
      const id = concepto.id;
      
      // 🎯 PRIORIDAD: Usar el nivel que viene del backend
      if (nivel === "raiz") {
        conceptosPorNivel.raiz.push(concepto);
      } 
      else if (nivel === "principal") {
        conceptosPorNivel.principal.push(concepto);
      }
      else if (nivel === "secundario") {
        conceptosPorNivel.secundario.push(concepto);
      }
      else if (nivel === "terciario") {
        conceptosPorNivel.terciario.push(concepto);
      }
      // 🆕 FALLBACK: Solo si no viene nivel, usar ID
      else if (id === "cp_1") {
        conceptosPorNivel.raiz.push(concepto);
      }
      else if (id.startsWith("cp_") && id.split("_").length === 2) {
        conceptosPorNivel.principal.push(concepto);
      }
      else if (id.startsWith("cs_") && id.split("_").length === 3) {
        conceptosPorNivel.secundario.push(concepto);
      }
      else if (id.split("_").length >= 4) {
        conceptosPorNivel.terciario.push(concepto);
      }
      else {
        // Último fallback
        console.warn(`⚠️ Nivel no claro para: ${id}, usando principal como default`);
        conceptosPorNivel.principal.push(concepto);
      }
    });

    console.log("📊 DISTRIBUCIÓN FINAL CORREGIDA:");
    console.log(`  Raíz: ${conceptosPorNivel.raiz.length} -`, conceptosPorNivel.raiz.map(c => c.nombre));
    console.log(`  Principal: ${conceptosPorNivel.principal.length} -`, conceptosPorNivel.principal.map(c => c.nombre));
    console.log(`  Secundario: ${conceptosPorNivel.secundario.length} -`, conceptosPorNivel.secundario.map(c => c.nombre));
    console.log(`  Terciario: ${conceptosPorNivel.terciario.length} -`, conceptosPorNivel.terciario.map(c => c.nombre));

    // 🆕 VERIFICACIÓN CRÍTICA - ¿ESTÁN BIEN CLASIFICADOS LOS SECUNDARIOS?
    const secundariosEsperados = conceptosDecodificados.filter(c => 
      c.id.startsWith('cs_') && c.id.split('_').length === 3
    );
    console.log("🔍 VERIFICACIÓN SECUNDARIOS:");
    console.log(`   Secundarios por ID (cs_*): ${secundariosEsperados.length}`);
    secundariosEsperados.forEach(sec => {
      const enSecundarios = conceptosPorNivel.secundario.some(c => c.id === sec.id);
      console.log(`   ${sec.id}: ${enSecundarios ? '✅ En secundarios' : '❌ FALTANTE en secundarios'}`);
    });

    // 🆕 PROCESAR RELACIONES
    const relacionesProcesadas = relaciones.map(rel => {
      const conceptoOrigen = conceptosMap[rel.origen];
      const conceptoDestino = conceptosMap[rel.destino];
      
      return {
        origen: rel.origen,
        destino: rel.destino,
        origenNombre: conceptoOrigen?.nombre || `[NO ENCONTRADO: ${rel.origen}]`,
        destinoNombre: conceptoDestino?.nombre || `[NO ENCONTRADO: ${rel.destino}]`,
        tipo: rel.tipo,
        descripcion: rel.descripcion
      };
    });

    // 🆕 FUNCIÓN PARA AGRUPAR RELACIONES
    const agruparRelacionesPorConcepto = (relaciones) => {
      const agrupadas = {};
      relaciones.forEach(rel => {
        if (!agrupadas[rel.origen]) agrupadas[rel.origen] = [];
        agrupadas[rel.origen].push(rel);
      });
      return agrupadas;
    };

    const relacionesPorConcepto = agruparRelacionesPorConcepto(relacionesProcesadas);

    const resultado = {
      titulo: titulo,
      conceptoRaiz: conceptoRaiz,
      conceptos: conceptosDecodificados,
      conceptosPorId: conceptosMap,
      conceptosPorNivel: conceptosPorNivel,
      relaciones: relacionesProcesadas,
      relacionesPorConcepto: relacionesPorConcepto,
      tipo: 'jerarquico',
      estadisticas: {
        totalConceptos: conceptosDecodificados.length,
        niveles: 4,
        conceptosRaiz: conceptosPorNivel.raiz.length,
        conceptosPrincipales: conceptosPorNivel.principal.length,
        conceptosSecundarios: conceptosPorNivel.secundario.length,
        conceptosTerciarios: conceptosPorNivel.terciario.length,
        relacionesCount: relacionesProcesadas.length
      }
    };

    console.log("✅ Mapa procesado CORRECTAMENTE:", {
      titulo: resultado.titulo,
      conceptoRaiz: resultado.conceptoRaiz,
      estadisticas: resultado.estadisticas
    });
    
    return resultado;

  } catch (error) {
    console.error("❌ Error en procesarMapaConceptual:", error);
    return null;
  }
};
// 4. COMPONENTE MAPA JERÁRQUICO
// 4. COMPONENTE MAPA JERÁRQUICO (ACTUALIZADO)
// 4. COMPONENTE MAPA JERÁRQUICO (CORREGIDO)
const MapaArbolVertical = ({ mapa }) => {
  if (!mapa) return <div>No hay datos del mapa</div>;

  console.log("🎯 Mapa recibido:", mapa);
  console.log("📊 Conceptos por nivel:", mapa.conceptosPorNivel);

  // 🆕 OBTENER CONCEPTOS DESDE LA NUEVA ESTRUCTURA
  const conceptoRaizObj = mapa.conceptosPorNivel.raiz[0] || mapa.conceptosPorNivel.principal[0];
  const conceptoRaizNombre = conceptoRaizObj?.nombre || mapa.conceptoRaiz;
  const conceptoRaizId = conceptoRaizObj?.id || "cp_1";

  console.log("🎯 Concepto raíz:", { nombre: conceptoRaizNombre, id: conceptoRaizId });

  // 🆕 OBTENER HIJOS DIRECTOS USANDO IDs
  let hijosDirectosDelRaiz = mapa.relacionesPorConcepto[conceptoRaizId] || [];
  
  // 🔥 SI NO HAY RELACIONES EXPLÍCITAS, BUSCAR CONCEPTOS QUE TENGAN AL RAÍZ COMO PADRE
  if (hijosDirectosDelRaiz.length === 0) {
    console.log("⚠️ No hay relaciones explícitas desde el raíz, buscando conceptos con padre...");
    
    // Buscar en conceptos principales cuáles tienen al raíz como padre
    const conceptosConPadreRaiz = mapa.conceptosPorNivel.principal.filter(concepto => 
      concepto.padre === conceptoRaizId || concepto.padre === "cp_1"
    );
    
    console.log("📋 Conceptos con padre raíz:", conceptosConPadreRaiz.map(c => c.nombre));
    
    // Convertir a formato de relaciones
    hijosDirectosDelRaiz = conceptosConPadreRaiz.map(concepto => ({
      origen: conceptoRaizId,
      destino: concepto.id,
      origenNombre: conceptoRaizNombre,
      destinoNombre: concepto.nombre,
      tipo: "incluye"
    }));
  }
  
  console.log("📋 Hijos directos del raíz (final):", hijosDirectosDelRaiz);

  // 🆕 FUNCIÓN PARA BUSCAR CONCEPTO POR ID
  const buscarConceptoPorId = (id) => {
    return mapa.conceptosPorId[id] || null;
  };


const [showUrlTemporalModal, setShowUrlTemporalModal] = useState(false);
const [stepUrlTemporal, setStepUrlTemporal] = useState(0);
const [claseSeleccionadaUrl, setClaseSeleccionadaUrl] = useState(null);
const [materialesRevisadosUrl, setMaterialesRevisadosUrl] = useState(false);
const [diasExpiracionUrl, setDiasExpiracionUrl] = useState('30');
const [distribucionUrl, setDistribucionUrl] = useState('copiar');
const [incluirNombreUrl, setIncluirNombreUrl] = useState(true);
const [urlGenerada, setUrlGenerada] = useState('');
const [isLoadingUrl, setIsLoadingUrl] = useState(false);

const resetEstadoUrlSimple = () => {
  setStepUrlTemporal(0);
  setClaseSeleccionadaUrl(null);
  setMaterialesRevisadosUrl(false);
  setDiasExpiracionUrl('30');
  setDistribucionUrl('copiar');
  setIncluirNombreUrl(true);
  setUrlGenerada('');
  setIsLoadingUrl(false);
};

  return (
    <div className="ps-4 position-relative">
      
      {/* LÍNEA VERTICAL PRINCIPAL */}
      <div className="position-absolute border-start border-3 border-primary" 
           style={{
             left: '20px', 
             top: '80px', 
             bottom: '20px',
             zIndex: 1
           }}></div>

      {/* CONCEPTO RAÍZ */}
      <div className="position-relative mb-5">
        <div className="bg-primary text-white p-4 rounded shadow d-inline-block position-relative" 
             style={{zIndex: 2}}>
          <h4 className="mb-1">🎯 {conceptoRaizNombre}</h4>
          <small className="opacity-75">Concepto central</small>
        </div>
      </div>

      {/* 🆕 MOSTRAR HIJOS DIRECTOS USANDO IDs */}
      <div className="ms-4">
        {hijosDirectosDelRaiz.map((relacion, index) => {
          // Buscar el concepto completo por ID
          const concepto = buscarConceptoPorId(relacion.destino);
          
          if (!concepto) {
            console.warn("❌ Concepto no encontrado para ID:", relacion.destino);
            return null;
          }
          
          const relacionesDelConcepto = mapa.relacionesPorConcepto[concepto.id] || [];
          
          console.log(`📁 Procesando concepto: ${concepto.nombre}`, {
            concepto,
            relaciones: relacionesDelConcepto
          });
          
          return (
            <div key={index} className="position-relative mb-4">
              
              {/* LÍNEA HORIZONTAL A CONCEPTO PRINCIPAL */}
              <div className="position-absolute border-top border-2 border-primary" 
                   style={{
                     left: '-25px', 
                     top: '30px', 
                     width: '25px',
                     zIndex: 1
                   }}></div>
              
              {/* CONCEPTO PRINCIPAL */}
              <div className="card border-success shadow-sm position-relative"
                   style={{zIndex: 2}}>
                <div className="card-header bg-success text-white py-2">
                  <div className="d-flex align-items-center">
                    <span className="me-2">📌</span>
                    <h6 className="mb-0 flex-grow-1">{concepto.nombre}</h6>
                  </div>
                </div>
                <div className="card-body py-3">
                  <p className="small text-muted mb-3">{concepto.descripcion}</p>
                  
                  {/* SUBCONCEPTOS - NIVEL 2 */}
                  {relacionesDelConcepto.length > 0 && (
                    <div className="ms-3 mt-3 position-relative">
                      
                      {/* LÍNEA VERTICAL PARA SUBCONCEPTOS */}
                      <div className="position-absolute border-start border-2 border-success" 
                           style={{
                             left: '-15px', 
                             top: '0', 
                             bottom: '0',
                             zIndex: 1
                           }}></div>
                      
                      {relacionesDelConcepto.map((rel, relIndex) => {
                        const subConcepto = buscarConceptoPorId(rel.destino);
                        const subRelaciones = mapa.relacionesPorConcepto[rel.destino] || [];
                        
                        console.log(`   ↳ Subconcepto: ${rel.destinoNombre}`, { subConcepto, subRelaciones });
                        
                        return (
                          <div key={relIndex} className="position-relative mb-3">
                            
                            {/* LÍNEA HORIZONTAL A SUBCONCEPTO */}
                            <div className="position-absolute border-top border-2 border-success" 
                                 style={{
                                   left: '-15px', 
                                   top: '20px', 
                                   width: '15px',
                                   zIndex: 1
                                 }}></div>
                            
                            {/* SUBCONCEPTO */}
                            <div className="bg-light p-3 rounded border border-success position-relative"
                                 style={{zIndex: 2}}>
                              <div className="d-flex align-items-start">
                                <span className="text-success me-2 mt-1">•</span>
                                <div className="flex-grow-1">
                                  <strong className="text-success d-block mb-1">{rel.destinoNombre}</strong>
                                  {subConcepto?.descripcion && (
                                    <small className="text-muted d-block">{subConcepto.descripcion}</small>
                                  )}
                                </div>
                              </div>
                              
                              {/* SUB-SUBCONCEPTOS - NIVEL 3 */}
                              {subRelaciones.length > 0 && (
                                <div className="ms-4 mt-3 position-relative">
                                  
                                  {/* LÍNEA VERTICAL PARA SUB-SUBCONCEPTOS */}
                                  <div className="position-absolute border-start border-1 border-warning" 
                                       style={{
                                         left: '-12px', 
                                         top: '0', 
                                         bottom: '0',
                                         zIndex: 1
                                       }}></div>
                                  
                                  {subRelaciones.map((subRel, subIndex) => {
                                    const subSubConcepto = buscarConceptoPorId(subRel.destino);
                                    const subSubRelaciones = mapa.relacionesPorConcepto[subRel.destino] || []; // ✅ DEFINIDO CORRECTAMENTE
                                    
                                    return (
                                      <div key={subIndex} className="position-relative mb-2">
                                        
                                        {/* LÍNEA HORIZONTAL A SUB-SUBCONCEPTO */}
                                        <div className="position-absolute border-top border-1 border-warning" 
                                             style={{
                                               left: '-12px', 
                                               top: '12px', 
                                               width: '12px',
                                               zIndex: 1
                                             }}></div>
                                        
                                        {/* SUB-SUBCONCEPTO */}
                                        <div className="bg-white p-2 rounded border border-warning">
                                          <div className="d-flex align-items-start">
                                            <span className="text-warning me-2">◦</span>
                                            <div>
                                              <strong className="text-dark d-block mb-1">{subRel.destinoNombre}</strong>
                                              {subSubConcepto?.descripcion && (
                                                <small className="text-muted">{subSubConcepto.descripcion}</small>
                                              )}
                                              
                                              {/* ✅ CONCEPTOS TERCIARIOS - NIVEL 4 */}
                                              {subSubRelaciones.length > 0 && (
                                                <div className="ms-3 mt-2 position-relative">
                                                  
                                                  {/* LÍNEA VERTICAL PARA TERCIARIOS */}
                                                  <div className="position-absolute border-start border-1 border-info" 
                                                       style={{
                                                         left: '-10px', 
                                                         top: '0', 
                                                         bottom: '0',
                                                         zIndex: 1
                                                       }}></div>
                                                  
                                                  {subSubRelaciones.map((terRel, terIndex) => {
                                                    const terConcepto = buscarConceptoPorId(terRel.destino);
                                                    
                                                    return (
                                                      <div key={terIndex} className="position-relative mb-1">
                                                        
                                                        {/* LÍNEA HORIZONTAL A TERCIARIO */}
                                                        <div className="position-absolute border-top border-1 border-info" 
                                                             style={{
                                                               left: '-10px', 
                                                               top: '10px', 
                                                               width: '10px',
                                                               zIndex: 1
                                                             }}></div>
                                                        
                                                        {/* CONCEPTO TERCIARIO */}
                                                        <div className="bg-light p-2 rounded border border-info">
                                                          <div className="d-flex align-items-start">
                                                            <span className="text-info me-2">▪</span>
                                                            <div>
                                                              <strong className="text-dark d-block mb-0 small">
                                                                {terRel.destinoNombre}
                                                              </strong>
                                                              {terConcepto?.descripcion && (
                                                                <small className="text-muted">{terConcepto.descripcion}</small>
                                                              )}
                                                            </div>
                                                          </div>
                                                        </div>
                                                      </div>
                                                    );
                                                  })}
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
// GENERAR MERMAID (MANTENER EXACTAMENTE IGUAL - NO TOCAR)
// GENERAR MERMAID (VERSIÓN OPTIMIZADA)
// ✅ VERSIÓN CORREGIDA DEFINITIVA - CON SALTO DE LÍNEA OBLIGATORIO
// ✅ VERSIÓN CORREGIDA DEFINITIVA - ESTRUCTURA CORRECTA
const generarMermaidLayoutHorizontalCorregido = (mapaProcesado) => {
  console.log('🔧 Generando Mermaid HORIZONTAL (MODO SEGURO ESTRUCTURAL)...');

  // ✅ FUNCIÓN DE ESCAPE MEJORADA
  const esc = (txt) => {
    if (!txt) return '';
    return String(txt)
      .replace(/</g, '&lt;')  // Usar entidades HTML para <>
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/&/g, '&amp;')
      .replace(/\n/g, '<br/>'); // Manejar saltos de línea
  };

  // ✅ CONSTRUIR MERMAID CON ESTRUCTURA CORRECTA
  let mermaidCode = 'flowchart LR\n\n';
  
  // Definir estilos
  mermaidCode += 'classDef raiz fill:#e74c3c,color:white,stroke-width:3px\n';
  mermaidCode += 'classDef principal fill:#3498db,color:white,stroke-width:2px\n';
  mermaidCode += 'classDef secundario fill:#f39c12,color:white,stroke-width:1px\n\n';
  mermaidCode += 'classDef terciario fill:#2ecc71,color:white,stroke-width:1px\n\n';

  const { conceptosPorNivel, relaciones } = mapaProcesado;

  // ✅ DECLARAR NODOS CON SALTO DE LÍNEA OBLIGATORIO
  // Nodo raíz
  if (conceptosPorNivel.raiz && conceptosPorNivel.raiz[0]) {
    const raiz = conceptosPorNivel.raiz[0];
    mermaidCode += `${raiz.id}["${esc(raiz.nombre)}"]\n`;
    mermaidCode += `class ${raiz.id} raiz\n\n`;
  }

  // Nodos principales
  if (conceptosPorNivel.principal) {
    conceptosPorNivel.principal.forEach(principal => {
      mermaidCode += `${principal.id}["${esc(principal.nombre)}"]\n`;
      mermaidCode += `class ${principal.id} principal\n\n`;
    });
  }

  // Nodos secundarios
  if (conceptosPorNivel.secundario) {
    conceptosPorNivel.secundario.forEach(secundario => {
      mermaidCode += `${secundario.id}["${esc(secundario.nombre)}"]\n`;
      mermaidCode += `class ${secundario.id} secundario\n\n`;
    });
  }
  // Nodos terciarios
  if (conceptosPorNivel.terciario) {
    conceptosPorNivel.terciario.forEach(terciario => {
      mermaidCode += `${terciario.id}["${esc(terciario.nombre)}"]\n`;
      mermaidCode += `class ${terciario.id} terciario\n\n`;
    });
  }

  // ✅ RELACIONES CON SALTO DE LÍNEA
  if (relaciones) {
    relaciones.forEach(rel => {
      mermaidCode += `${rel.origen} --> ${rel.destino}\n`;
    });
  }

  console.log('✅ Mermaid HORIZONTAL (ESTRUCTURAL) generado');
  console.log('📝 Código Mermaid generado:', mermaidCode);
  return mermaidCode;
};

// ✅ FUNCIÓN PDF MEJORADA CON MANEJO DE ERRORES
// ✅ SOLUCIÓN DIRECTA - OCUPAR TODO EL ANCHO DISPONIBLE
// ✅ AJUSTAR ANCHO SEGÚN CANTIDAD DE NODOS
// ✅ SOLUCIÓN INTELIGENTE - CALCULAR ANCHO SEGÚN DIMENSIONES REALES
const generarPDFConMermaidParaTuCaso = async (mapaProcesado, modo = 'descargar') => {
  try {
    console.log("🔄 Generando PDF con cálculo inteligente de ancho...");

    let mermaidCode = generarMermaidLayoutHorizontalCorregido(mapaProcesado);
    
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'fixed';
    tempContainer.style.left = '-10000px';
    tempContainer.style.top = '0';
    tempContainer.style.background = 'white';
    tempContainer.style.padding = '20px';
    tempContainer.style.minWidth = '600px';
    tempContainer.style.minHeight = '400px';  
    tempContainer.style.zIndex = '9999';
    tempContainer.style.fontFamily = 'Arial, sans-serif';
    
    tempContainer.innerHTML = `
      <div style="text-align: center; margin-bottom: 15px;">
        <h2 style="color: #2c3e50; margin: 0; font-size: 18px;">${mapaProcesado.titulo}</h2>
      </div>
      <div class="mermaid">${mermaidCode}</div>
    `;

    document.body.appendChild(tempContainer);

    // Mermaid
    if (typeof mermaid !== 'undefined') {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
        flowchart: {
          useMaxWidth: false,
          htmlLabels: true
        }
      });
    }

    await mermaid.init(undefined, tempContainer.querySelector('.mermaid'));
    await new Promise(resolve => setTimeout(resolve, 2000));

    // ✅ OBTENER DIMENSIONES REALES DEL DIAGRAMA
    const mermaidElement = tempContainer.querySelector('.mermaid');
    const svgElement = mermaidElement.querySelector('svg');
    
    let anchoReal = 800; // Valor por defecto
    let altoReal = 400;
    
    if (svgElement) {
      const bbox = svgElement.getBBox();
      anchoReal = bbox.width + 100; // Ancho real + margen
      altoReal = bbox.height + 100; // Alto real + margen
      console.log(`📏 Dimensiones reales del diagrama: ${anchoReal}x${altoReal}px`);
    }

    // Ajustar contenedor al tamaño real
    tempContainer.style.width = `${anchoReal}px`;
    tempContainer.style.height = `${altoReal + 100}px`;

    // Capturar
    const canvas = await html2canvas(tempContainer, {
      scale: 1,
      useCORS: true,
      backgroundColor: '#ffffff'
    });

    document.body.removeChild(tempContainer);

    // ✅ GENERAR PDF CON CÁLCULO INTELIGENTE DE ESCALA
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png');

    const pdfWidth = pdf.internal.pageSize.getWidth();   // 210mm
    const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

    // ✅ CALCULAR ESCALA ÓPTIMA BASADA EN DIMENSIONES REALES
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    
    // Calcular escala para ancho máximo (95% de la página)
    const escalaPorAncho = (pdfWidth * 0.95) / imgWidth;
    
    // Calcular escala para alto máximo (80% de la página - espacio para título)
    const escalaPorAlto = (pdfHeight * 0.80) / imgHeight;
    
    // Usar la escala MÁS PEQUEÑA de las dos para que quepa completo
    const escalaOptima = Math.min(escalaPorAncho, escalaPorAlto);
    
    console.log(`📊 Escalas calculadas: Ancho=${escalaPorAncho}, Alto=${escalaPorAlto}`);
    console.log(`🎯 Usando escala óptima: ${escalaOptima}`);

    const finalWidth = imgWidth * escalaOptima;
    const finalHeight = imgHeight * escalaOptima;

    // Centrar en la página
    const x = (pdfWidth - finalWidth) / 2;
    const y = (pdfHeight - finalHeight) / 2 - 10; // Centrado vertical con ajuste

    pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);
    
    // ========== NOMBRE DEL ARCHIVO ==========
    let nombreAsignatura = datosGlobalesClase.nombreClase || 
                          datosGlobalesClase.nombreMateria || 
                          datosGlobalesClase.nombreUnidad || 
                          "mapaconceptual";
    
    // Limpiar nombre para archivo
    const nombreArchivo = `mapaconceptual_${nombreAsignatura
      .toLowerCase()
      .replace(/[^a-z0-9áéíóúüñ\s]/g, '')  // Solo letras, números y espacios
      .replace(/\s+/g, '_')                // Espacios a guiones bajos
      .trim()}.pdf`;

    if (modo === 'compartir') {
      return pdf.output('blob');
    } else {
      pdf.save(nombreArchivo);
      return null;
    }

  } catch (error) {
    console.error("❌ Error:", error);
    return null;
  }
};


// VERIFICACIÓN (MANTENER IGUAL)
const verificarEstructura = (mapaProcesado) => {
  console.log('🔍 VERIFICANDO ESTRUCTURA:');
  console.log('Raíz:', mapaProcesado.conceptosPorNivel.raiz[0]?.nombre);
  
  mapaProcesado.conceptosPorNivel.principal.forEach(principal => {
    const hijos = mapaProcesado.relaciones.filter(rel => rel.origen === principal.id);
    console.log(`Principal "${principal.nombre}" tiene ${hijos.length} hijos:`, 
                hijos.map(h => h.destinoNombre));
  });
};
const renderPasoAPaso = (texto) => {
  if (!texto) return <span>No especificada</span>;

  // Normaliza
  const t = String(texto).trim();

  // Detecta si trae numeración tipo "1) ..." o "1. ..."
  const tieneNumeracion = /^\s*1[\)\.]\s+/.test(t);
  if (!tieneNumeracion) return <span>{t}</span>;

  // Divide conservando orden por "n) " o "n. "
  // Ej: "1) a 2) b" => ["a", "b"]
  const pasos = t
    .split(/\s*\d+[\)\.]\s+/g)   // corta en cada "n) " o "n. "
    .map(s => s.trim())
    .filter(Boolean);

  if (pasos.length <= 1) return <span>{t}</span>;

  return (
    <ol className="mb-0 ps-3">
      {pasos.map((p, i) => (
        <li key={i}>{p}</li>
      ))}
    </ol>
  );
};

// FUNCIÓN PRINCIPAL (AGREGAR PARÁMETRO MODO)
const generarPDFConMermaidLocal = async (mapaData, modo = 'descargar') => {
  try {
    console.log("🔄 [GENERAR_PDF_LOCAL_1] INICIANDO - Modo:", modo);
    
    // ✅ USAR EL MISMO isLoading
    setIsLoading(true);
    
    const mapaProcesado = procesarMapaConceptual(mapaData);
    if (!mapaProcesado) {
      console.error('❌ No se pudo procesar el mapa conceptual');
      setIsLoading(false);
      return null;
    }
    
    console.log("✅ Mapa procesado correctamente");
    verificarEstructura(mapaProcesado);
    
    const resultado = await generarPDFConMermaidParaTuCaso(mapaProcesado, modo);
    console.log("✅ PDF generado correctamente");
    
    return resultado;
    
  } catch (error) {
    console.error('❌ Error generando PDF:', error);
    return null;
  } finally {
    // ✅ DESACTIVAR LOADING
    setIsLoading(false);
  }
};




// 🃏 NUEVOS ESTADOS PARA FLASHCARDS
const [showFlashcardsModal, setShowFlashcardsModal] = useState(false);
const [flashcardsData, setFlashcardsData] = useState(null);


// 🃏 Manejo de flashcards
// 🃏 Manejo de flashcards - VERSIÓN CORREGIDA
// 🃏 Manejo de flashcards - VERSIÓN CON VALIDACIÓN
const handleGenerarFlashcards = async (guion_id, accion = "obtener") => {
  console.log(`📥 ${accion === "regenerar" ? "Regenerando" : "Obteniendo"} flashcards para guion:`, guion_id);
  
  setIsLoading(true);
  setCurrentGuionId(guion_id); // Guardar el ID actual

  try {
    const response = await axios.get(
      `${url_backend}/planificacion/${guion_id}/flashcards?accion=${accion}`
    );
    
    console.log("📡 Respuesta del backend:", response);
    
    const flashcards = response.data?.flashcards;
    console.log("🃏 Flashcards recibidas:", flashcards);

    if (flashcards && Array.isArray(flashcards) && flashcards.length > 0) {
      setFlashcardsData(flashcards);
      setCurrentFlashcardIndex(0);
      setIsFlashcardFlipped(false);
      
      // ✅ ABRIR EL MODAL SOLO CUANDO TENEMOS LOS DATOS
      setShowFlashcardsModal(true);
    } else {
      console.warn("⚠️ Flashcards vacías o malformadas");
      setFlashcardsData(null);
    }
    
  } catch (error) {
    console.error("❌ Error al obtener flashcards:", error);
    alert(`Error: ${error.response?.data?.detail || error.message}`);
    setFlashcardsData(null);
  } finally {
    setIsLoading(false);
  }
};

// 🃏 Funciones para navegación - VERSIÓN MEJORADA
const handleFlashcardPrevious = () => {
  setCurrentFlashcardIndex(prev => {
    const newIndex = prev > 0 ? prev - 1 : flashcardsData.length - 1;
    // ✅ Resetear scroll y vista frontal
    resetFlashcardView();
    return newIndex;
  });
};

const handleFlashcardNext = () => {
  setCurrentFlashcardIndex(prev => {
    const newIndex = prev < flashcardsData.length - 1 ? prev + 1 : 0;
    // ✅ Resetear scroll y vista frontal
    resetFlashcardView();
    return newIndex;
  });
};

// ✅ NUEVA FUNCIÓN: Resetear vista de flashcard
const resetFlashcardView = () => {
  setIsFlashcardFlipped(false);
  
  // Resetear scroll si es necesario
  setTimeout(() => {
    const frontElement = document.querySelector('.flashcard-front');
    const backElement = document.querySelector('.flashcard-back');
    if (frontElement) frontElement.scrollTop = 0;
    if (backElement) backElement.scrollTop = 0;
  }, 50);
};

// ✅ NUEVA FUNCIÓN: Ir a flashcard específica
const handleGoToFlashcard = (index) => {
  setCurrentFlashcardIndex(index);
  resetFlashcardView();
};

// 🃏 Efecto para navegación con teclado - VERSIÓN MEJORADA
useEffect(() => {
  if (!showFlashcardsModal || !flashcardsData) return;
  
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') handleFlashcardPrevious();
    if (e.key === 'ArrowRight') handleFlashcardNext();
    if (e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      setIsFlashcardFlipped(prev => !prev);
    }
    if (e.key === 'Escape') {
      setShowFlashcardsModal(false);
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [showFlashcardsModal, flashcardsData]); // ✅ Remover dependencia de isFlashcardFlipped
// 🃏 Componente para visualizar flashcards
// Estados en tu componente principal

const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
const [isFlashcardFlipped, setIsFlashcardFlipped] = useState(false);
const [showDownloadMenu, setShowDownloadMenu] = useState(false);


// Efecto para navegación con teclado
useEffect(() => {
  if (!showFlashcardsModal) return;
  
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') handleFlashcardPrevious();
    if (e.key === 'ArrowRight') handleFlashcardNext();
    if (e.key === ' ') {
      e.preventDefault();
      setIsFlashcardFlipped(!isFlashcardFlipped);
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [showFlashcardsModal, isFlashcardFlipped, flashcardsData]);


// 🎴 ESTADOS PARA FLASHCARDS DE VISTA PREVIA
const [flashcardsDataVistaPrevia, setFlashcardsDataVistaPrevia] = useState([]);
const [currentFlashcardIndexVistaPrevia, setCurrentFlashcardIndexVistaPrevia] = useState(0);
const [isFlashcardFlippedVistaPrevia, setIsFlashcardFlippedVistaPrevia] = useState(false);
// ✅ CORREGIDA - Recibe parámetro y maneja errores
// ✅ CORREGIDA - Función específica para compartir (sin descargar)
// ✅ CORREGIDA - Función específica para compartir (sin descargar)
const generarHTMLFlashcards = (flashcardsData, modo = 'retornar') => {
  console.log("🔍 DEBUG generarHTMLFlashcards - datos recibidos:", flashcardsData);
  console.log("🎯 Modo seleccionado:", modo);
  
  // ✅ OBTENER NOMBRE DE LA CLASE PARA EL ARCHIVO
  let nombreClase = datosGlobalesClase.nombreClase || 
                   datosGlobalesClase.nombreMateria || 
                   datosGlobalesClase.nombreUnidad || 
                   "flashcards";
  
  console.log("📚 Nombre de clase para archivo:", nombreClase);
  
  // ✅ CORREGIDO: Manejar diferentes estructuras de datos
  let flashcardsArray;
  
  if (Array.isArray(flashcardsData)) {
    flashcardsArray = flashcardsData;
  } else if (flashcardsData && Array.isArray(flashcardsData.flashcards)) {
    flashcardsArray = flashcardsData.flashcards;
  } else if (flashcardsData && flashcardsData.data && Array.isArray(flashcardsData.data.flashcards)) {
    flashcardsArray = flashcardsData.data.flashcards;
  } else if (flashcardsData && flashcardsData.data && Array.isArray(flashcardsData.data)) {
    flashcardsArray = flashcardsData.data;
  } else {
    console.error("❌ Estructura no reconocida para flashcards:", flashcardsData);
    flashcardsArray = [];
  }
  
  console.log("🔍 DEBUG - flashcardsArray final:", flashcardsArray);
  
  if (!flashcardsArray || flashcardsArray.length === 0) {
    console.error("❌ No hay flashcards para generar");
    const htmlError = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Flashcards Vacías</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 40px; text-align: center; }
        .error { color: #d32f2f; background: #ffebee; padding: 30px; border-radius: 12px; }
    </style>
</head>
<body>
    <div class="error">
        <h2>❌ No hay flashcards disponibles</h2>
        <p>No se pudieron generar las flashcards porque no hay datos disponibles.</p>
    </div>
</body>
</html>`;
    
    // Si es modo descarga, mostrar alerta
    if (modo === 'descargar') {
      alert("No hay flashcards para descargar");
    }
    return modo === 'descargar' ? null : htmlError;
  }

  // ✅ HTML MEJORADO CON INFORMACIÓN PERSONALIZADA
// En la sección de estilos CSS del HTML, modifica estas clases:
const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Flashcards - ${nombreClase}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        
        .flashcard-container {
            background: white;
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            max-width: 600px;
            width: 100%;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
        }
        
        .header h1 {
            color: #333;
            margin-bottom: 10px;
            font-size: 2.2em;
        }
        
        .header-subtitle {
            color: #666;
            font-size: 1.1em;
            margin-bottom: 5px;
        }
        
        .header-info {
            color: #888;
            font-size: 0.9em;
            margin-top: 5px;
        }
        
        .controls {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 25px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 12px;
        }
        
        .nav-btn {
            background: #007bff;
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            transition: all 0.3s;
        }
        
        .nav-btn:hover {
            background: #0056b3;
            transform: translateY(-2px);
        }
        
        .counter {
            font-weight: bold;
            font-size: 1.2em;
            color: #333;
        }
        
        /* Estilos de la flashcard - AJUSTADOS PARA TEXTO LARGO */
        .flashcard {
            perspective: 1000px;
            height: 350px; /* Aumentado de 300px para más espacio */
            margin: 20px 0;
            cursor: pointer;
        }
        
        .flashcard-inner {
            position: relative;
            width: 100%;
            height: 100%;
            transition: transform 0.6s;
            transform-style: preserve-3d;
        }
        
        .flashcard.flipped .flashcard-inner {
            transform: rotateY(180deg);
        }
        
        .flashcard-front, .flashcard-back {
            position: absolute;
            width: 100%;
            height: 100%;
            backface-visibility: hidden;
            border-radius: 15px;
            padding: 30px; /* Reducido de 40px */
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            overflow: hidden; /* Previene desbordamiento */
        }
        
        .flashcard-front {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        
        .flashcard-back {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            transform: rotateY(180deg);
        }
        
        /* Contenedor de contenido ajustable */
        .card-content-container {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            overflow-y: auto; /* Permite scroll si es necesario */
            padding: 5px;
        }
        
        .card-content {
            font-size: 1.2em; /* Reducido de 1.4em */
            line-height: 1.4; /* Mejorado para legibilidad */
            margin-bottom: 10px;
            max-height: 200px; /* Límite máximo */
            overflow-y: auto; /* Scroll para contenido muy largo */
            padding: 5px 10px;
            width: 100%;
            word-wrap: break-word; /* Rompe palabras largas */
            overflow-wrap: break-word; /* Alternativa moderna */
        }
        
        .card-hint {
            font-size: 0.9em;
            opacity: 0.8;
            margin-top: 15px;
            position: absolute;
            bottom: 15px;
        }
        
        .category {
            background: rgba(255,255,255,0.2);
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.9em;
            margin-top: 10px;
            position: absolute;
            bottom: 15px;
        }
        
        /* Barra de scroll personalizada */
        .card-content::-webkit-scrollbar {
            width: 5px;
        }
        
        .card-content::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
        }
        
        .card-content::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.3);
            border-radius: 10px;
        }
        
        .miniatures {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 8px;
            margin: 25px 0;
        }
        
        .mini-card {
            width: 40px;
            height: 40px;
            border: 2px solid #007bff;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            background: white;
            font-weight: bold;
            transition: all 0.3s;
        }
        
        .mini-card.active {
            background: #007bff;
            color: white;
        }
        
        .mini-card:hover {
            transform: scale(1.1);
        }
        
        .instructions {
            text-align: center;
            color: #666;
            margin-top: 20px;
            font-size: 0.9em;
        }
        
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #888;
            font-size: 0.8em;
        }
        
        @media (max-width: 768px) {
            .flashcard-container {
                margin: 10px;
                padding: 20px;
            }
            
            .card-content {
                font-size: 1.1em; /* Aún más pequeño en móviles */
                max-height: 180px;
            }
            
            .flashcard {
                height: 320px; /* Un poco menor en móviles */
            }
            
            .controls {
                flex-direction: column;
                gap: 10px;
            }
        }
        
        /* Clase para texto muy largo */
        .texto-largo {
            font-size: 1.1em !important;
            line-height: 1.5 !important;
        }
    </style>
</head>
<body>
    <div class="flashcard-container">
        <div class="header">
            <h1>Flashcards Interactivas</h1>
            <p class="header-subtitle">${nombreClase}</p>
            <p class="header-info">
                ${datosGlobalesClase.nombreProfesor ? `Prof. ${datosGlobalesClase.nombreProfesor} • ` : ''}
                ${flashcardsArray.length} tarjetas • ${new Date().toLocaleDateString('es-ES')}
            </p>
        </div>
        
        <div class="controls">
            <button class="nav-btn" onclick="previousCard()">← Anterior</button>
            <span class="counter" id="counter">1/${flashcardsArray.length}</span>
            <button class="nav-btn" onclick="nextCard()">Siguiente →</button>
        </div>
        
        <div class="flashcard" id="flashcard" onclick="flipCard()">
            <div class="flashcard-inner">
                <div class="flashcard-front">
                    <div class="card-content-container">
                        <div class="card-content" id="question">${flashcardsArray[0].pregunta || 'Pregunta no disponible'}</div>
                        <div class="card-hint">Click para ver la respuesta</div>
                    </div>
                </div>
                <div class="flashcard-back">
                    <div class="card-content-container">
                        <div class="card-content" id="answer">${flashcardsArray[0].respuesta || 'Respuesta no disponible'}</div>
                        <div class="category">${flashcardsArray[0].categoria || 'concepto'}</div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="miniatures" id="miniatures">
            ${flashcardsArray.map((_, index) => 
                `<div class="mini-card ${index === 0 ? 'active' : ''}" onclick="goToCard(${index})">${index + 1}</div>`
            ).join('')}
        </div>
        
        <div class="instructions">
            <p>💡 Usa las flechas del teclado ← → para navegar y la barra espaciadora para voltear</p>
        </div>
        
        <div class="footer">
            <p>AI-Want-2-Teach • Material educativo interactivo</p>
        </div>
    </div>

    <script>
        const flashcards = ${JSON.stringify(flashcardsArray, null, 2)};
        let currentIndex = 0;
        let isFlipped = false;

        function updateCard() {
            if (currentIndex >= flashcards.length) return;
            
            const currentFlashcard = flashcards[currentIndex];
            const questionElement = document.getElementById('question');
            const answerElement = document.getElementById('answer');
            
            // Actualizar contenido
            questionElement.textContent = currentFlashcard.pregunta || 'Pregunta no disponible';
            answerElement.textContent = currentFlashcard.respuesta || 'Respuesta no disponible';
            
            // Ajustar tamaño de fuente dinámicamente según longitud del texto
            ajustarTamanoFuente(questionElement, currentFlashcard.pregunta);
            ajustarTamanoFuente(answerElement, currentFlashcard.respuesta);
            
            document.getElementById('counter').textContent = \`\${currentIndex + 1}/\${flashcards.length}\`;
            
            // Actualizar categoría
            const categoryElement = document.querySelector('.category');
            if (categoryElement) {
                categoryElement.textContent = currentFlashcard.categoria || 'concepto';
            }
            
            // Actualizar miniaturas
            document.querySelectorAll('.mini-card').forEach((card, index) => {
                card.classList.toggle('active', index === currentIndex);
            });
            
            // Resetear estado de volteo
            if (isFlipped) {
                flipCard();
            }
        }

        function ajustarTamanoFuente(elemento, texto) {
            if (!texto) return;
            
            // Remover clase previa
            elemento.classList.remove('texto-largo');
            
            // Si el texto es muy largo (más de 150 caracteres), usar fuente más pequeña
            if (texto.length > 150) {
                elemento.classList.add('texto-largo');
            }
            
            // Si el texto es extremadamente largo, agregar scroll
            if (texto.length > 300) {
                elemento.style.overflowY = 'auto';
                elemento.style.maxHeight = '180px';
            } else {
                elemento.style.overflowY = 'visible';
                elemento.style.maxHeight = 'none';
            }
        }

        function flipCard() {
            const card = document.getElementById('flashcard');
            card.classList.toggle('flipped');
            isFlipped = !isFlipped;
        }

        function nextCard() {
            currentIndex = (currentIndex + 1) % flashcards.length;
            updateCard();
        }

        function previousCard() {
            currentIndex = (currentIndex - 1 + flashcards.length) % flashcards.length;
            updateCard();
        }

        function goToCard(index) {
            currentIndex = index;
            updateCard();
        }

        // Navegación con teclado
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') nextCard();
            if (e.key === 'ArrowLeft') previousCard();
            if (e.key === ' ') {
                e.preventDefault();
                flipCard();
            }
        });

        // Inicializar
        updateCard();
        
        // Información de uso
        console.log('🎴 Flashcards cargadas correctamente');
        console.log('Total de flashcards:', flashcards.length);
    </script>
</body>
</html>`;

  // ✅ MODO DESCARGA: Descargar con nombre personalizado
  if (modo === 'descargar') {
    console.log("📥 Descargando flashcards como HTML...");
    
    // Limpiar nombre para archivo
    const nombreArchivo = `flashcards_${nombreClase
      .toLowerCase()
      .replace(/[^a-z0-9áéíóúüñ\s]/g, '')
      .replace(/\s+/g, '_')
      .trim()}.html`;
    
    console.log("📁 Nombre del archivo:", nombreArchivo);
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombreArchivo; // Nombre personalizado
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    alert(`Se descargaron ${flashcardsArray.length} flashcards como ${nombreArchivo}`);
    return null;
  }

  // ✅ MODO RETORNO: Retornar el HTML (por defecto)
  console.log("📄 Retornando HTML de flashcards...");
  return htmlContent;
};
// 📚 NUEVOS ESTADOS PARA GLOSARIOa
const [showGlosarioModal, setShowGlosarioModal] = useState(false);
const [glosarioData, setGlosarioData] = useState(null);

// 📚 Manejo de glosario
const handleGenerarGlosario = async (guion_id, accion = "obtener") => {
  console.log(`📥 ${accion === "regenerar" ? "Regenerando" : "Obteniendo"} glosario para guion:`, guion_id);
  
  setIsLoading(true);
  setCurrentGuionId(guion_id);

  try {
    const response = await axios.get(
      `${url_backend}/planificacion/${guion_id}/glosario?accion=${accion}`
    );
    
    console.log("📡 Respuesta del backend:", response);
    
    const glosario = response.data?.glosario;
    console.log("📚 Glosario recibido:", glosario);

    if (glosario && Array.isArray(glosario) && glosario.length > 0) {
      setGlosarioData(glosario);
      
      // ✅ ABRIR EL MODAL SOLO CUANDO TENEMOS LOS DATOS
      setShowGlosarioModal(true);
    } else {
      console.warn("⚠️ Glosario vacío o malformado");
      setGlosarioData(null);
    }
    
  } catch (error) {
    console.error("❌ Error al obtener glosario:", error);
    alert(`Error: ${error.response?.data?.detail || error.message}`);
    setGlosarioData(null);
  } finally {
    setIsLoading(false);
  }
};

const convertirImagenABase64 = async (imgElement) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      } catch (error) {
        reject(error);
      }
    };
    img.onerror = (error) => {
      console.error('Error cargando imagen:', error);
      resolve(null);
    };
    img.src = imgElement.src;
  });
};
// Variable global para cachear el logo (fuera del componente)

const descargarGlosarioHTML = () => {
  if (!glosarioData || glosarioData.length === 0) {
    alert("No hay glosario para descargar");
    return;
  }

  // Obtener nombre de la asignatura de los datos globales
  let nombreAsignatura = datosGlobalesClase.nombreClase || 
                        datosGlobalesClase.nombreMateria || 
                        datosGlobalesClase.nombreUnidad || 
                        "glosario";

  // Limpiar nombre para archivo
  // Opción 1: Sin límite (recomendado)
  const nombreArchivo = `glosario_${nombreAsignatura
    .toLowerCase()
    .replace(/[^a-z0-9áéíóúüñ\s]/g, '')
    .replace(/\s+/g, '_')
    .trim()}.html`;

  console.log("Descargando HTML como:", nombreArchivo);

  const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Glosario - ${nombreAsignatura}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 40px 20px;
        }
        
        .glosario-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.15);
        }
        
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 2px solid #f0f0f0;
        }
        
        .header h1 {
            color: #2c3e50;
            margin-bottom: 10px;
            font-size: 2.5em;
            background: linear-gradient(135deg, #667eea, #764ba2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        
        .header-info {
            color: #7f8c8d;
            font-size: 1em;
            margin-top: 5px;
        }
        
        .termino-card {
            background: white;
            border: none;
            border-radius: 15px;
            margin-bottom: 20px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.08);
            transition: all 0.3s ease;
            border-left: 4px solid #3498db;
        }
        
        .termino-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.12);
        }
        
        .termino-indicator {
            background: linear-gradient(135deg, #3498db, #2980b9);
            color: white;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 16px;
            flex-shrink: 0;
        }
        
        .termino-titulo {
            color: #2c3e50;
            font-size: 1.4em;
            margin-bottom: 10px;
            font-weight: 600;
        }
        
        .termino-definicion {
            color: #34495e;
            font-size: 1.1em;
            line-height: 1.6;
            margin-bottom: 10px;
        }
        
        .badge-categoria {
            background: linear-gradient(135deg, #e74c3c, #c0392b);
            color: white;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 0.8em;
            font-weight: 600;
        }
        
        .ejemplo-container {
            background: linear-gradient(135deg, #f8f9fa, #e9ecef);
            border-left: 3px solid #27ae60;
            padding: 15px;
            border-radius: 8px;
            margin-top: 10px;
        }
        
        .ejemplo-texto {
            color: #2c3e50;
            font-style: italic;
            line-height: 1.5;
        }
        
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #f0f0f0;
            color: #7f8c8d;
        }
        
        @media (max-width: 768px) {
            .glosario-container {
                padding: 20px;
                margin: 10px;
            }
            
            .header h1 {
                font-size: 2em;
            }
        }
    </style>
</head>
<body>
    <div class="glosario-container">
        <div class="header">
            <h1>Glosario de Terminos Clave</h1>
            <p class="header-info">
                ${nombreAsignatura}
                ${datosGlobalesClase.nombreProfesor ? ` • Prof. ${datosGlobalesClase.nombreProfesor}` : ''}
                ${datosGlobalesClase.nombreUnidad ? ` • ${datosGlobalesClase.nombreUnidad}` : ''}
            </p>
        </div>
        
        <div class="glosario-content">
            ${glosarioData.map((termino, index) => `
            <div class="termino-card">
                <div class="card-body">
                    <div class="d-flex align-items-start">
                        <div class="termino-indicator">${index + 1}</div>
                        <div class="flex-grow-1">
                            <h3 class="termino-titulo">${termino.termino}</h3>
                            <p class="termino-definicion">${termino.definicion}</p>
                            ${termino.categoria ? `<span class="badge-categoria">${termino.categoria}</span>` : ''}
                            ${termino.ejemplo ? `
                            <div class="ejemplo-container">
                                <p class="ejemplo-texto"><strong>Ejemplo:</strong> ${termino.ejemplo}</p>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
            `).join('')}
        </div>
        
        <div class="footer">
            <p>Glosario generado automáticamente • Total de términos: ${glosarioData.length} • ${new Date().toLocaleDateString('es-ES')}</p>
            <p style="margin-top: 5px; font-size: 0.9em;">AI-Want-2-Teach • Material educativo</p>
        </div>
    </div>
</body>
</html>`;

  // Crear blob y descargar
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = nombreArchivo; // Usar el nombre personalizado
  
  document.body.appendChild(a);
  a.click();
  
  // Limpiar
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
  
  alert(`Glosario descargado como ${nombreArchivo}`);
};

// Variable global para cachear el logo (fuera del componente)
let logoBase64Cache = null;

// Función para cargar y convertir el logo a base64
const cargarLogoBase64 = async () => {
  // Si ya está cacheado, devolverlo
  if (logoBase64Cache) {
    return logoBase64Cache;
  }
  
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL('image/png');
        logoBase64Cache = dataURL; // Cachear el resultado
        console.log("Logo convertido a base64 correctamente");
        resolve(dataURL);
      } catch (error) {
        console.error('Error convirtiendo logo a base64:', error);
        resolve(null);
      }
    };
    
    img.onerror = (error) => {
      console.error('Error cargando logo:', error);
      resolve(null);
    };
    
    // Usar el import del logo
    img.src = logo;
  });
};

// Estados para el modal de envío - MODIFICADO
const [showEnvioModal, setShowEnvioModal] = useState(false);
const [guionesSeleccionados, setGuionesSeleccionados] = useState([]);
const [stepEnvio, setStepEnvio] = useState(0);

// AHORA cada guión tiene su propia selección de materiales
const [materialesPorGuion, setMaterialesPorGuion] = useState({});
// Al inicio de tu archivo CursoProfesor.js, después de los imports
const EMAIL_INSTITUCIONAL = 'iwanttoteach123@gmail.com';
const [emailsEstudiantes, setEmailsEstudiantes] = useState("");
const [mensajePersonalizado, setMensajePersonalizado] = useState("");
const [vistaPreviaData, setVistaPreviaData] = useState(null);





// Función para cerrar el modal - MODIFICADA
const closeEnvioModal = () => {
  setShowEnvioModal(false);
  setGuionesSeleccionados([]);
  setStepEnvio(0);
  setMaterialesPorGuion({});
  setEmailsEstudiantes("");
  setMensajePersonalizado("");
  setVistaPreviaData(null);
};

// Función para seleccionar/deseleccionar guión - MODIFICADA
const toggleGuionSeleccionado = (guionId) => {
  setGuionesSeleccionados(prev => 
    prev.includes(guionId) 
      ? prev.filter(id => id !== guionId)
      : [...prev, guionId]
  );
};

// NUEVA función para manejar materiales individuales por guión
// Función para manejar materiales individuales por guión - MEJORADA
const toggleMaterialGuion = (guionId, tipo, material) => {
  setMaterialesPorGuion(prev => {
    // Verificar que el guión existe en el estado
    if (!prev[guionId]) {
      console.warn(`Guión ${guionId} no encontrado en materialesPorGuion`);
      // Si no existe, crear una entrada por defecto
      return {
        ...prev,
        [guionId]: {
          extras: {
            resumen: false,
            mapaConceptual: false,
            flashcards: false,
            glosario: false,
            infografia: false  // ✅ AGREGADO
          }
        }
      };
    }

    // Si el tipo 'extras' no existe, crearlo con todos los campos
    if (!prev[guionId][tipo]) {
      return {
        ...prev,
        [guionId]: {
          ...prev[guionId],
          [tipo]: {
            resumen: false,
            mapaConceptual: false,
            flashcards: false,
            glosario: false,
            infografia: false,  // ✅ AGREGADO
            [material]: true  // Activar el que se está togglenado
          }
        }
      };
    }

    // Actualizar el material específico
    return {
      ...prev,
      [guionId]: {
        ...prev[guionId],
        [tipo]: {
          ...prev[guionId][tipo],
          [material]: !prev[guionId][tipo][material]
        }
      }
    };
  });
};

// Función para generar vista previa - ACTUALIZADA
// Función para generar vista previa - ACTUALIZADA

// ✅ FUNCIÓN PARA COMPRIMIR INFOGRAFÍAS ANTES DE ENVIAR
const comprimirInfografiaParaCorreo = async (base64Data, calidad = 0.8) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      // Determinar tamaño máximo basado en tamaño original
      let ancho = img.width;
      let alto = img.height;
      
      // ✅ Log del tamaño original
      console.log(`📏 Tamaño original: ${ancho}x${alto} px`);
      
      // ✅ Solo redimensionar si es necesario
      const MAX_ANCHO = 1600; // Aumentado de 1200
      const MAX_ALTO = 1200; // Aumentado de 800
      const MIN_ANCHO = 800; // Mínimo para mantener calidad
      
      // Calcular proporción de calidad basada en tamaño
      let calidadFinal = calidad;
      
      if (ancho > MAX_ANCHO || alto > MAX_ALTO) {
        // Redimensionar manteniendo relación de aspecto
        const ratio = Math.min(MAX_ANCHO / ancho, MAX_ALTO / alto);
        ancho = Math.round(ancho * ratio);
        alto = Math.round(alto * ratio);
        
        console.log(`↔️ Redimensionando a: ${ancho}x${alto} px`);
      } else if (ancho < MIN_ANCHO) {
        // Si es muy pequeña, mantener tamaño original
        ancho = img.width;
        alto = img.height;
        console.log(`⏫ Manteniendo tamaño original (muy pequeña)`);
      }
      
      // Ajustar calidad según tamaño final
      if (ancho * alto > 800 * 600) {
        // Imágenes grandes - mantener mejor calidad
        calidadFinal = Math.max(calidad, 0.8);
      }
      
      // Crear canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // ✅ Configurar canvas para mejor calidad
      canvas.width = ancho;
      canvas.height = alto;
      
      // ✅ Suavizado de imagen
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // Dibujar imagen
      ctx.drawImage(img, 0, 0, ancho, alto);
      
      // ✅ Opción 1A: Usar WebP (mejor calidad/tamaño)
      try {
        // Primero intentar con WebP
        const webpBase64 = canvas.toDataURL('image/webp', calidadFinal);
        const base64Comprimido = webpBase64.split(',')[1];
        
        const tamañoKB = (base64Comprimido.length * 0.75 / 1024).toFixed(1);
        console.log(`✅ Infografía comprimida (WebP): ${img.width}x${img.height} → ${ancho}x${alto} (${tamañoKB}KB) - Calidad: ${calidadFinal}`);
        
        resolve(base64Comprimido);
      } catch (e) {
        // Si WebP no es soportado, usar PNG con compresión
        console.log('⚠️ WebP no soportado, usando PNG');
        const pngBase64 = canvas.toDataURL('image/png');
        const base64Comprimido = pngBase64.split(',')[1];
        resolve(base64Comprimido);
      }
    };
    
    img.onerror = (err) => {
      console.error('❌ Error cargando imagen:', err);
      reject(err);
    };
    
    img.src = `data:image/png;base64,${base64Data}`;
  });
};

const generarVistaPrevia = () => {
  console.log("🔍 DEBUG generarVistaPrevia - Usando materialesPendientes:", materialesPendientes);
  
  const materialesDetallados = [];
  const guionesConMaterial = [];

  // ✅ AGREGAR ESTO PARA VER QUÉ HAY EN materialesPendientes
  console.log("📦 materialesPendientes actuales:", materialesPendientes);
  
  // Usar materialesPendientes que YA TIENEN LOS DATOS GENERADOS
  materialesPendientes.forEach(material => {
    console.log(`🔍 Procesando material pendiente:`, material);
    
    let formato = 'PDF';
    let extension = 'pdf';
    
    switch (material.subtipo) {
      case 'resumen':
        formato = 'PDF';
        extension = 'pdf';
        break;
      case 'mapaConceptual':
        formato = 'PDF';
        extension = 'pdf';
        break;
      case 'flashcards':
        formato = 'HTML (Interactivo)';
        extension = 'html';
        break;
      case 'glosario':
        formato = 'PDF';
        extension = 'pdf';
        break;
      case 'infografia':
        formato = 'PNG';
        extension = 'png';
        break;
      default:
        formato = 'Archivo';
        extension = 'file';
    }
    
    const nombreArchivo = `${material.nombre.replace(/[^a-zA-Z0-9]/g, '_')}.${extension}`;
    
    materialesDetallados.push({
      nombre: material.nombre,
      archivo: nombreArchivo,
      tipo: material.tipo,
      formato: formato,
      subtipo: material.subtipo,
      guionId: material.guionId,
      data: material.data // ✅ INCLUIR LOS DATOS TAMBIÉN
    });
    
    console.log(`✅ Agregado a vista previa: ${material.nombre}`);
  });
  
  // Agrupar por guiones para mostrar en la vista
  const guionesUnicos = [...new Set(materialesPendientes.map(m => m.guionTitulo))];
  
  guionesUnicos.forEach(guionTitulo => {
    const materialesEsteGuion = materialesPendientes
      .filter(m => m.guionTitulo === guionTitulo)
      .map(m => {
        let icono = '';
        switch (m.subtipo) {
          case 'resumen': icono = '📄'; break;
          case 'mapaConceptual': icono = '🗺️'; break;
          case 'flashcards': icono = '🎴'; break;
          case 'glosario': icono = '📚'; break;
          case 'infografia': icono = '🎨'; break;
        }
        return `${icono} ${m.guionTitulo} - ${m.subtipo}`;
      });
    
    if (materialesEsteGuion.length > 0) {
      guionesConMaterial.push({
        nombre: guionTitulo,
        materiales: materialesEsteGuion
      });
    }
  });

  console.log("🔍 materialesDetallados finales:", materialesDetallados.length);
  console.log("🔍 guionesConMaterial:", guionesConMaterial.length);
  
  setVistaPreviaData({
    guiones: guionesConMaterial,
    materiales: materialesDetallados,
    destinatarios: emailsEstudiantes.split('\n').filter(email => email.trim() !== "").length
  });
  
  console.log("✅ Vista previa generada con", materialesDetallados.length, "materiales");
};

const handleEnviarFinal = async () => {
  try {
    setIsLoading(true);
    
    console.log("🔍 DEBUG handleEnviarFinal - INICIANDO");
    
    // ✅ CREAR UN TIMEOUT GLOBAL
    const timeoutGlobal = setTimeout(() => {
      alert('⚠️ La operación está tardando más de lo esperado.\n' +
            'El correo PUEDE haberse enviado igual.\n' +
            'Revisa tu bandeja de salida en unos minutos.');
    }, 90000);
    
    if (!materialesPendientes || materialesPendientes.length === 0) {
      alert('❌ No hay materiales seleccionados para enviar');
      clearTimeout(timeoutGlobal);
      setIsLoading(false);
      return;
    }

    // 1. Generar archivos
    console.log("📦 Generando archivos para enviar...");
    const archivosParaEnviar = await generarMaterialesParaCompartir(materialesPendientes);
    
    if (!archivosParaEnviar || archivosParaEnviar.length === 0) {
      alert('❌ No se pudieron generar los archivos');
      clearTimeout(timeoutGlobal);
      setIsLoading(false);
      return;
    }
    
    // ✅ ELIMINADO: Cálculo de tamaño que desinforma
    // Solo mantenemos el log para debugging
    const tamanoTotal = archivosParaEnviar.reduce((total, archivo) => total + archivo.size, 0);
    const tamanoMB = tamanoTotal / 1024 / 1024;
    console.log(`📊 Tamaño original estimado: ${tamanoMB.toFixed(2)} MB`);
    
    // 2. Preparar datos
    const destinatarios = emailsEstudiantes.split('\n')
      .filter(email => email.trim() !== "")
      .map(email => email.trim());

    if (destinatarios.length === 0) {
      alert('❌ No hay destinatarios');
      clearTimeout(timeoutGlobal);
      setIsLoading(false);
      return;
    }

    const asunto = `Material de estudio - ${user.nombre}`;
    
    // ✅ USAR MENSAJE DE LA VISTA PREVIA (mensajeCorreo)
    // Si mensajeCorreo está vacío, usar predeterminado
    const mensajeCompleto = mensajeCorreo || 
      `Estimados estudiantes,

    Les comparto el material de estudio correspondiente a los guiones seleccionados.

    ¡Éxito en sus estudios!

    Atentamente,
    ${user.nombre}
    ${user.unidad || "Departamento de Informática"}`;

    console.log("📧 Enviando correo...");
    
    // ✅ TIMEOUT PARA EL ENVÍO
    let envioCompletado = false;
    const timeoutEnvio = setTimeout(() => {
      if (!envioCompletado) {
        console.warn("⏰ Timeout en envío de correo");
      }
    }, 180000);
    
    try {
      const resultado = await Promise.race([
        enviarCorreoConArchivos(destinatarios, asunto, mensajeCompleto, archivosParaEnviar),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout en envío de correo')), 180000)
        )
      ]);
      
      envioCompletado = true;
      clearTimeout(timeoutEnvio);
      clearTimeout(timeoutGlobal);
      
      console.log("✅ Correo enviado:", resultado);
      
      // ✅ MENSAJE SIMPLE DE ÉXITO
      alert(`✅ Correo ENVIADO exitosamente a ${destinatarios.length} estudiante(s)\n\n` +
            `📧 Destinatarios: ${destinatarios.length}\n` +
            `📎 Archivos adjuntos: ${archivosParaEnviar.length}\n` +
            `⏱️ Tiempo estimado de llegada: 1-3 minutos`);
      
      closeEnvioModal();
      
    } catch (errorEnvio) {
      clearTimeout(timeoutEnvio);
      clearTimeout(timeoutGlobal);
      
      if (errorEnvio.message.includes('Timeout') || errorEnvio.code === 'ECONNABORTED') {
        console.log("⏰ Timeout en envío, pero el correo puede haberse enviado");
        alert(`⚠️ El envío tomó más tiempo del esperado.\n\n` +
              `✅ El correo PUEDE haberse enviado correctamente.\n` +
              `📧 Revisa tu bandeja de salida en 2-3 minutos.`);
      } else {
        throw errorEnvio;
      }
    }
    
  } catch (error) {
    console.error('❌ Error en el envío final:', error);
    alert(`❌ Error: ${error.message}`);
    
  } finally {
    setIsLoading(false);
  }
};

const enviarCorreoConArchivos = async (destinatarios, asunto, mensaje, archivos) => {
  try {
    console.log("🚀 Enviando correo con", archivos.length, "archivos");
    
    const formData = new FormData();
    formData.append('destinatarios', JSON.stringify(destinatarios));
    formData.append('asunto', asunto);
    formData.append('mensaje', mensaje);
    formData.append('remitente', 'iwanttoteach123@gmail.com');
    
    // ✅ LIMITAR ARCHIVOS SI SON MUCHOS
    const archivosLimitados = archivos.slice(0, 8); // Máximo 8 archivos
    
    archivosLimitados.forEach((archivo) => {
      if (archivo instanceof File) {
        formData.append('archivos', archivo);
      }
    });
    
    // ✅ CONFIGURACIÓN OPTIMIZADA
    const response = await axios.post(`${url_backend}/enviar-correo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 180000, // 3 minutos
      onUploadProgress: (progressEvent) => {
        const percent = progressEvent.total 
          ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
          : 0;
        if (percent % 20 === 0) { // Log cada 20%
          console.log(`📤 Upload: ${percent}%`);
        }
      }
    });
    
    return response.data;
    
  } catch (error) {
    console.error('❌ Error enviando correo:', error);
    throw error;
  }
};

const crearZipDesdeArchivos = async (archivos) => {
  try {
    // Importar JSZip dinámicamente
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    console.log("📦 Creando estructura ZIP...");
    console.log("🔍 Archivos recibidos para ZIP:");
    archivos.forEach((archivo, i) => {
      console.log(`  ${i}: ${archivo.name} (${archivo.type})`);
    });

    // Agregar cada archivo al ZIP
    archivos.forEach((archivo, index) => {
      // Crear nombre legible para el archivo
      let nombreArchivo = '';
      
      if (archivo.name) {
        // ✅ USAR EL NOMBRE ORIGINAL DEL ARCHIVO
        nombreArchivo = archivo.name;
        
        // Verificar extensión correcta
        const extension = archivo.name.split('.').pop().toLowerCase();
        const mimeType = archivo.type.toLowerCase();
        
        // Debug: Verificar coincidencia extensión-tipo MIME
        console.log(`  Archivo ${index}: "${archivo.name}"`);
        console.log(`    Extensión: .${extension}, MIME: ${mimeType}`);
        
        // ✅ SOLO corregir extensiones si es realmente necesario
        if (!archivo.name.includes('.')) {
          // Si no tiene extensión, asignar según tipo MIME
          if (mimeType.includes('image/png')) {
            nombreArchivo += '.png';
          } else if (mimeType.includes('image/jpeg') || mimeType.includes('image/jpg')) {
            nombreArchivo += '.jpg';
          } else if (mimeType.includes('text/html')) {
            nombreArchivo += '.html';
          } else if (mimeType.includes('application/pdf')) {
            nombreArchivo += '.pdf';
          } else {
            nombreArchivo += '.bin'; // extensión genérica
          }
        }
      } else {
        // Si no tiene nombre, crear uno basado en el material
        const materialInfo = materialesPendientes?.[index];
        if (materialInfo) {
          const tipoMap = {
            'resumen': 'Resumen',
            'mapaConceptual': 'Mapa_Conceptual',
            'flashcards': 'Flashcards',
            'glosario': 'Glosario',
            'infografia': 'Infografia'
          };
          
          const tipo = tipoMap[materialInfo.subtipo] || materialInfo.subtipo;
          const guionTitulo = materialInfo.guionTitulo || 'Material';
          
          // ✅ ASIGNAR EXTENSIÓN CORRECTA SEGÚN TIPO
          if (materialInfo.subtipo === 'infografia') {
            nombreArchivo = `${guionTitulo.replace(/[^a-zA-Z0-9]/g, '_')}_${tipo}.png`;
          } else if (materialInfo.subtipo === 'flashcards') {
            nombreArchivo = `${guionTitulo.replace(/[^a-zA-Z0-9]/g, '_')}_${tipo}.html`;
          } else {
            nombreArchivo = `${guionTitulo.replace(/[^a-zA-Z0-9]/g, '_')}_${tipo}.pdf`;
          }
        } else {
          nombreArchivo = `material_${index + 1}`;
          // Asignar extensión según tipo MIME
          if (archivo.type.includes('image/png')) {
            nombreArchivo += '.png';
          } else if (archivo.type.includes('text/html')) {
            nombreArchivo += '.html';
          } else {
            nombreArchivo += '.pdf'; // Por defecto PDF
          }
        }
      }

      // ✅ LIMPIAR caracteres especiales (pero mantener extensión)
      // Primero separar nombre y extensión
      const lastDotIndex = nombreArchivo.lastIndexOf('.');
      let nombreBase = nombreArchivo;
      let extension = '';
      
      if (lastDotIndex > 0) {
        nombreBase = nombreArchivo.substring(0, lastDotIndex);
        extension = nombreArchivo.substring(lastDotIndex);
      }
      
      // Limpiar solo el nombre base
      nombreBase = nombreBase.replace(/[<>:"/\\|?*]/g, '_');
      
      // Reconstruir con extensión
      nombreArchivo = nombreBase + extension;

      // ✅ AGREGAR AL ZIP SIN MODIFICAR LA EXTENSIÓN
      zip.file(nombreArchivo, archivo);
      console.log(`➕ Añadido al ZIP: ${nombreArchivo} (${archivo.type})`);
    });

    // Generar el ZIP como blob
    const zipBlob = await zip.generateAsync({ 
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 6 // Nivel medio de compresión
      }
    });

    console.log(`✅ ZIP creado: ${(zipBlob.size / 1024 / 1024).toFixed(2)} MB`);
    
    // ✅ DEBUG: Verificar contenido del ZIP
    const zipFiles = Object.keys(zip.files);
    console.log("📁 Archivos dentro del ZIP:");
    zipFiles.forEach(fileName => {
      console.log(`  - ${fileName}`);
    });
    
    return zipBlob;

  } catch (error) {
    console.error('❌ Error al crear ZIP:', error);
    throw new Error(`No se pudo crear el archivo ZIP: ${error.message}`);
  }
};

const handleDescargarZip = async () => {
  try {
    setIsLoading(true);
    console.log("📦 Preparando descarga de ZIP...");

    // 1. Verificar que hay materiales
    if (!materialesPendientes || materialesPendientes.length === 0) {
      alert('❌ No hay materiales seleccionados para descargar');
      setIsLoading(false);
      return;
    }

    // 2. Generar los archivos (usar tu función existente)
    const archivosGenerados = await generarMaterialesParaCompartir(materialesPendientes);
    
    if (!archivosGenerados || archivosGenerados.length === 0) {
      alert('❌ No se pudieron generar los archivos para descargar');
      setIsLoading(false);
      return;
    }

    console.log(`📁 ${archivosGenerados.length} archivos generados`);

    // 3. Crear el archivo ZIP
    const zipBlob = await crearZipDesdeArchivos(archivosGenerados);
    
    // 4. Crear nombre del archivo con fecha
    const fecha = new Date();
    const fechaStr = fecha.toISOString().split('T')[0]; // YYYY-MM-DD
    const horaStr = fecha.getHours().toString().padStart(2, '0') + 
                    fecha.getMinutes().toString().padStart(2, '0');
    const nombreArchivo = `material_estudio_${fechaStr}_${horaStr}.zip`;

    // 5. Descargar el archivo
    const url = window.URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo;
    
    // Agregar al DOM, hacer click y limpiar
    document.body.appendChild(link);
    link.click();
    
    // Limpiar
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 100);

    console.log("✅ ZIP descargado exitosamente");

    // 6. Mostrar mensaje de éxito
    alert(`✅ ZIP descargado exitosamente!\n\n` +
          `📁 Nombre: ${nombreArchivo}\n` +
          `📦 Tamaño: ${(zipBlob.size / 1024 / 1024).toFixed(2)} MB\n` +
          `📄 Archivos incluidos: ${archivosGenerados.length}`);

    // 7. Cerrar el modal
    closeEnvioModal();

  } catch (error) {
    console.error('❌ Error al descargar ZIP:', error);
    alert(`❌ Error al descargar ZIP: ${error.message}`);
  } finally {
    setIsLoading(false);
  }
};
const enviarCorreoConLinkDrive = async (destinatarios, asunto, mensaje, driveLink) => {
  try {
    console.log("📧 Enviando correo con link de Drive...");
    
    const response = await axios.post(`${url_backend}/enviar-correo-con-link`, {
      destinatarios: destinatarios,
      asunto: asunto,
      mensaje: mensaje,
      drive_link: driveLink,
      remitente: user.email || 'iwanttoteach123@gmail.com'
    }, {
      timeout: 60000 // 1 minuto timeout
    });
    
    return response.data;
    
  } catch (error) {
    console.error('❌ Error enviando correo con link:', error);
    throw error;
  }
};
const handleSubirDrive = async () => {
  try {
    setIsLoading(true);
    console.log("☁️ Subiendo archivos a Google Drive...");

    // 1. Verificar que hay materiales
    if (!materialesPendientes || materialesPendientes.length === 0) {
      alert('❌ No hay materiales seleccionados');
      setIsLoading(false);
      return;
    }

    // 2. Generar los archivos
    const archivosGenerados = await generarMaterialesParaCompartir(materialesPendientes);
    
    if (!archivosGenerados || archivosGenerados.length === 0) {
      alert('❌ No se pudieron generar los archivos');
      setIsLoading(false);
      return;
    }

    console.log(`📁 ${archivosGenerados.length} archivos generados`);

    // 3. Crear el archivo ZIP
    const zipBlob = await crearZipDesdeArchivos(archivosGenerados);
    
    // 4. Crear nombre del archivo
    const fecha = new Date();
    const fechaStr = fecha.toISOString().split('T')[0];
    const horaStr = fecha.getHours().toString().padStart(2, '0') + 
                    fecha.getMinutes().toString().padStart(2, '0');
    const nombreArchivo = `material_estudio_${fechaStr}_${horaStr}.zip`;

    // 5. Subir a Google Drive
    const formData = new FormData();
    const zipFile = new File([zipBlob], nombreArchivo, {
      type: 'application/zip'
    });
    
    formData.append('file', zipFile);
    formData.append('dias_expiracion', '36500');
    formData.append('permisos', drivePermisos);

    console.log("📤 Enviando a Google Drive...");
    
    const response = await axios.post(`${url_backend}/api/subir-drive`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 180000,
    });

    const resultado = response.data;

    if (!resultado.success) {
      throw new Error(resultado.error || 'Error subiendo a Google Drive');
    }

    const driveLink = resultado.drive_link;
    
    // 6. Manejar según la distribución seleccionada
    if (distribucionSeleccionada === 'copiar') {
      // Guardar información para mostrar en modal
      setModalDriveLink(driveLink);
      setModalDriveFileName(resultado.file_name);
      setModalDriveFileSize(resultado.file_size_mb);
      
      // Cerrar el modal principal
      closeEnvioModal();
      
    } else if (distribucionSeleccionada === 'correo') {
      // ✅ NUEVO: Enviar SOLO el link por correo
      const destinatarios = emailsEstudiantes.split('\n')
        .filter(email => email.trim() !== "")
        .map(email => email.trim());

      if (destinatarios.length === 0) {
        alert('❌ No hay destinatarios para enviar el correo');
        setIsLoading(false);
        return;
      }

      const asunto = `Material de estudio - ${user.nombre}`;
      
      // Mensaje que incluye el link de Drive
      const mensajeCompleto = `${
        mensajeCorreo || 
        `Estimados estudiantes,

Les comparto el material de estudio correspondiente a los guiones seleccionados.

¡Éxito en sus estudios!

Atentamente,
${user.nombre}
${user.unidad || "Departamento de Informática"}`
      }\n\n🔗 Enlace para descargar: ${driveLink}`;

      console.log("📧 Enviando correo con link de Drive...");
      
      // ✅ LLAMAR A LA NUEVA FUNCIÓN
      await enviarCorreoConLinkDrive(destinatarios, asunto, mensajeCompleto, driveLink);
      
      alert(`✅ Correo ENVIADO exitosamente a ${destinatarios.length} estudiante(s)\n\n` +
            `📧 Destinatarios: ${destinatarios.length}\n` +
            `🔗 Enlace de Google Drive incluido en el correo\n` +
            `⏱️ Los estudiantes recibirán el link en 1-3 minutos`);
      
      closeEnvioModal();
      
    } else if (distribucionSeleccionada === 'qr') {
      // Generar QR con el link de Drive
      await generarCodigoQR(driveLink);
      closeEnvioModal();
    }

  } catch (error) {
    console.error('❌ Error al subir a Drive:', error);
    alert(`❌ Error: ${error.message}`);
    
  } finally {
    setIsLoading(false);
  }
};

 // ✅ AGREGAR ESTOS 4 ESTADOS NUEVOS PARA QR:

const [showQrModal, setShowQrModal] = useState(false);
const [qrImageUrl, setQrImageUrl] = useState('');
const [qrDriveLink, setQrDriveLink] = useState('');
const generarCodigoQR = async (driveLink) => {
  try {
    console.log("📱 Generando código QR para:", driveLink);
    
    // Crear URL del código QR
    const qrData = encodeURIComponent(driveLink);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${qrData}`;
    
    // Mostrar modal con el QR
    setQrImageUrl(qrUrl);
    setQrDriveLink(driveLink);
    setShowQrModal(true);
    
    // Cerrar el modal de envío (si está abierto)
    closeEnvioModal();
    
  } catch (error) {
    console.error('❌ Error generando QR:', error);
    alert('❌ Error generando código QR. Comparte este enlace manualmente:\n\n' + 
          driveLink);
  }
};
const descargarQRComoPNG = async () => {
  try {
    if (!qrImageUrl) {
      alert('❌ No hay código QR para descargar');
      return;
    }
    
    console.log("📥 Descargando QR como PNG...");
    
    // 1. Obtener la imagen como blob
    const response = await fetch(qrImageUrl);
    const blob = await response.blob();
    
    // 2. Crear nombre de archivo con fecha
    const fecha = new Date();
    const fechaStr = fecha.toISOString().split('T')[0];
    const horaStr = fecha.getHours().toString().padStart(2, '0') + 
                    fecha.getMinutes().toString().padStart(2, '0');
    const nombreArchivo = `codigo_qr_material_${fechaStr}_${horaStr}.png`;
    
    // 3. Crear URL temporal y descargar
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    
    // 4. Limpiar
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 100);
    
    console.log("✅ QR descargado como:", nombreArchivo);
    alert(`✅ Código QR descargado como:\n\n${nombreArchivo}`);
    
  } catch (error) {
    console.error('❌ Error descargando QR:', error);
    alert('❌ Error descargando código QR. Intenta de nuevo.');
    
    // Fallback: Descargar directamente (puede abrir en nueva pestaña)
    const link = document.createElement('a');
    link.href = qrImageUrl;
    link.download = 'codigo_qr.png';
    link.click();
  }
};

const [modalDriveLink, setModalDriveLink] = useState(null);
const [modalDriveFileName, setModalDriveFileName] = useState('');
const [modalDriveFileSize, setModalDriveFileSize] = useState(0);


const generarMaterialesParaCompartir = async (materialesData) => {
  console.log("📦 [GENERAR_MATERIALES] Generando materiales para estudiantes...");
  
  const archivosGenerados = [];
  
  for (const material of materialesData) {
    try {
      console.log(`🔄 Procesando: ${material.nombre} - Tipo: ${material.tipo} - Subtipo: ${material.subtipo}`);
      
      // ✅ EXTRAS - Todos los materiales, incluida infografía
      if (material.tipo === 'extra' && material.data) {
        console.log(`📊 Procesando extra: ${material.subtipo}`);
        
        let archivoBlob;
        let extension = 'pdf';
        
        switch (material.subtipo) {
          case 'mapaConceptual':
            archivoBlob = await generarPDFConMermaidParaTuCaso(material.data, 'compartir');
            break;
            
          case 'resumen':
            // ✅ CORREGIDO: Esperar a que se genere el PDF y luego obtener el blob
            const pdfResumen = await generatePDFResumen(material.data, "compartir");
            
            // ✅ VERIFICAR QUE SEA UN OBJETO jsPDF VÁLIDO
            if (pdfResumen && typeof pdfResumen.output === 'function') {
              // Crear blob desde el PDF
              const pdfOutput = pdfResumen.output('blob');
              archivoBlob = pdfOutput;
            } else if (pdfResumen instanceof Blob) {
              // Si ya es un blob
              archivoBlob = pdfResumen;
            } else {
              throw new Error('PDF generado no válido');
            }
            break;
            
          case 'glosario':
            // ✅ Generar PDF para compartir
            const pdfBlobGlosario = await descargarGlosarioPDF(material.data, "compartir");
            archivoBlob = pdfBlobGlosario;
            extension = 'pdf';
            break;
                
          // En generarMaterialesParaCompartir, asegúrate de que para flashcards:
          case 'flashcards':
            const htmlFlashcards = generarHTMLFlashcards(material.data, 'compartir'); // o 'descargar'
            archivoBlob = new Blob([htmlFlashcards], { type: 'text/html' });
            extension = 'html';
            break;
          case 'infografia':
            if (material.data) {
              try {
                console.log(`🎨 Procesando infografía: ${material.nombre}`);
                
                // ✅ DECIDIR TIPO DE IMAGEN BASADO EN EL CONTENIDO
                // El data que llega es base64 puro (sin prefijo data:image/)
                const base64Data = material.data;
                
                // Determinar si es JPG o PNG
                let mimeType, fileExtension;
                
                if (base64Data.startsWith('/9j/')) {
                  // Es JPG
                  mimeType = 'image/jpeg';
                  fileExtension = 'jpg';
                } else if (base64Data.startsWith('iVBORw0KGgo')) {
                  // Es PNG
                  mimeType = 'image/png';
                  fileExtension = 'png';
                } else {
                  // Por defecto JPG
                  mimeType = 'image/jpeg';
                  fileExtension = 'jpg';
                }
                
                // Convertir base64 a blob
                const byteCharacters = atob(base64Data);
                const byteArrays = [];
                
                for (let offset = 0; offset < byteCharacters.length; offset += 512) {
                  const slice = byteCharacters.slice(offset, offset + 512);
                  const byteNumbers = new Array(slice.length);
                  
                  for (let i = 0; i < slice.length; i++) {
                    byteNumbers[i] = slice.charCodeAt(i);
                  }
                  
                  byteArrays.push(new Uint8Array(byteNumbers));
                }
                
                const blob = new Blob(byteArrays, { type: mimeType });
                const nombreArchivo = `${material.nombre.replace(/[^a-zA-Z0-9]/g, '_')}.${fileExtension}`;
                const archivo = new File([blob], nombreArchivo, { type: mimeType });
                
                const sizeKB = (archivo.size / 1024).toFixed(1);
                console.log(`✅ Infografía procesada: ${archivo.name} (${sizeKB}KB)`);
                archivosGenerados.push(archivo);
                
              } catch (error) {
                console.error(`❌ Error procesando infografía:`, error);
                // Si falla, intentar crear un archivo de error placeholder
                const errorBlob = new Blob(
                  [`Error generando infografía: ${error.message}`], 
                  { type: 'text/plain' }
                );
                const errorFile = new File(
                  [errorBlob], 
                  `ERROR_${material.nombre.replace(/[^a-zA-Z0-9]/g, '_')}.txt`,
                  { type: 'text/plain' }
                );
                archivosGenerados.push(errorFile);
              }
            }
            continue; // Ya agregamos el archivo, continuar con siguiente material
            
          default:
            console.warn(`⚠️ Tipo de extra no manejado: ${material.subtipo}`);
            continue;
        }
        
        if (archivoBlob && archivoBlob instanceof Blob) {
          const nombreArchivo = `${material.nombre.replace(/[^a-zA-Z0-9]/g, '_')}.${extension}`;
          const archivo = new File([archivoBlob], nombreArchivo, { type: archivoBlob.type });
          
          archivosGenerados.push(archivo);
          console.log(`✅ Extra agregado: ${nombreArchivo} (${archivo.size} bytes)`);
        }
      }
      
    } catch (error) {
      console.error(`❌ Error generando ${material.nombre}:`, error);
    }
  }
  
  console.log("📦 Archivos finales para enviar a estudiantes:", archivosGenerados.length);
  return archivosGenerados;
};
// ✅ Sincronización automática cuando los guiones cambian
useEffect(() => {
  if (guiones && guiones.length > 0 && Object.keys(materialesPorGuion).length === 0) {
    console.log('🔄 Sincronizando automáticamente materialesPorGuion...');
    
    const materialesIniciales = {};
    guiones.forEach(guion => {
      if (guion.guion_id) {
        materialesIniciales[guion.guion_id] = {
          evaluaciones: {
            diagnostico: false,
            durante: false, 
            cierre: false
          },
          extras: {
            resumen: false,
            mapaConceptual: false,
            flashcards: false,
            glosario: false
          }
        };
      }
    });
    
    setMaterialesPorGuion(materialesIniciales);
  }
}, [guiones, materialesPorGuion]);

// La función ya tiene acceso a flashcardsData del estado

const [generandoMateriales, setGenerandoMateriales] = useState(false);



// Estados para el modal de vista previa completa
const [materialesPrevisualizacion, setMaterialesPrevisualizacion] = useState([]);


// Estados para el flujo de ventanas individuales
const [showVentanaIndividualModal, setShowVentanaIndividualModal] = useState(false);
const [materialesPendientes, setMaterialesPendientes] = useState([]);
const [materialActualIndex, setMaterialActualIndex] = useState(0);
// Función para iniciar el flujo de ventanas individuales



// Estado específico para revisión masiva
const [materialesRevision, setMaterialesRevision] = useState([]);
const [materialActualRevision, setMaterialActualRevision] = useState(0);
const [generandoRevision, setGenerandoRevision] = useState(false);



const iniciarRevisionMasiva = async (materialesPendientes) => {
  console.log("🔄 INICIANDO REVISIÓN MASIVA con:", materialesPendientes);
  setGenerandoRevision(true);
  
  // ✅ INICIALIZAR CON IDs ÚNICOS
  const materialesConId = materialesPendientes.map((material, index) => ({
    ...material,
    id: `${material.subtipo}_${material.guionId}_${Date.now()}_${index}`,
    estado: 'pendiente',
    indice: index,
    regenerado: false // Nueva propiedad para trackear si fue regenerado
  }));
  
  // ✅ INICIALIZAR TODOS LOS ESTADOS
  setMaterialesRevision(materialesConId);
  setMaterialesPrevisualizacion(materialesConId);
  setMaterialesPendientes(materialesConId);
  setMaterialActualRevision(0);
  
  setShowVentanaIndividualModal(true);
  
  try {
    // ✅ PROCESAR UNO POR UNO USANDO "obtener" POR DEFECTO
    for (let i = 0; i < materialesConId.length; i++) {
      const materialOriginal = materialesConId[i];
      console.log(`🔄 Generando ${i + 1}/${materialesConId.length}:`, materialOriginal);
      
      try {
        let data;
        
        switch (materialOriginal.subtipo) {
          case 'resumen':
            // ✅ USAR "obtener" por defecto (obtiene existente o genera si no existe)
            data = await generarResumenParaRevision(materialOriginal.guionId, "obtener");
            break;
          case 'mapaConceptual':
            // ✅ USAR "obtener" por defecto
            data = await generarMapaParaRevision(materialOriginal.guionId, "obtener");
            break;
          case 'flashcards':
            data = await generarFlashcardsParaRevision(materialOriginal.guionId, "obtener");
            break;
          case 'glosario':
            data = await generarGlosarioParaRevision(materialOriginal.guionId, "obtener");
            break;
          case 'infografia':
          // ✅ AGREGAR parámetro accion
            data = await generarInfografiaParaRevision(materialOriginal.guionId, "obtener");
            break;
          default:
            console.warn(`⚠️ Subtipo no reconocido: ${materialOriginal.subtipo}`);
            data = null;
        }
        
        // ✅ ACTUALIZAR SOLO ESTE MATERIAL
        const materialActualizado = {
          ...materialOriginal,
          data: data,
          estado: 'generado'
        };
        
        setMaterialesRevision(prev => 
          prev.map(item => 
            item.id === materialOriginal.id ? materialActualizado : item
          )
        );
        
        setMaterialesPendientes(prev => 
          prev.map(item => 
            item.id === materialOriginal.id ? materialActualizado : item
          )
        );
        
        console.log(`✅ ${i + 1} generado:`, materialActualizado.subtipo);
        
      } catch (error) {
        console.error(`❌ Error en ${i + 1} (${materialOriginal.subtipo}):`, error);
        
        const materialConError = {
          ...materialOriginal,
          data: null,
          estado: 'error',
          error: error.message
        };
        
        setMaterialesRevision(prev => 
          prev.map(item => 
            item.id === materialOriginal.id ? materialConError : item
          )
        );
        
        setMaterialesPendientes(prev => 
          prev.map(item => 
            item.id === materialOriginal.id ? materialConError : item
          )
        );
      }
    }
    
    console.log("📦 TODOS los materiales completados");
    setMaterialActualRevision(0);
    setGenerandoRevision(false);
    
  } catch (error) {
    console.error("❌ Error general en revisión masiva:", error);
    setGenerandoRevision(false);
  }
};
// Y asegúrate de tener estas funciones auxiliares:
// Función modificada para generar resumen con opción de regenerar
const generarResumenParaRevision = async (guionId, accion = "obtener") => {
  console.log(`📥 ${accion === "regenerar" ? "Regenerando" : "Obteniendo"} resumen para guion:`, guionId);
  const response = await axios.get(`${url_backend}/planificacion/${guionId}/resumen?accion=${accion}`);
  return response.data?.resumen;
};

// Agrega esta función para regenerar un material específico
// Esta es la única función de regeneración que necesitas
const regenerarMaterialEnRevision = async (materialId, guionId, subtipo) => {
  console.log(`🔄 Regenerando ${subtipo} en revisión para material ${materialId}`);
  
  try {
    let nuevaData;
    
    switch (subtipo) {
      case 'resumen':
        nuevaData = await generarResumenParaRevision(guionId, "regenerar");
        break;
      case 'mapaConceptual':
        nuevaData = await generarMapaParaRevision(guionId, "regenerar");
        break;
      case 'flashcards':
        // Si tu backend soporta regenerar
        nuevaData = await generarFlashcardsParaRevision(guionId, "regenerar");
        break;
      case 'glosario':
        nuevaData = await generarGlosarioParaRevision(guionId, "regenerar");
        break;
      case 'infografia':
        // ✅ USAR "regenerar" aquí
        nuevaData = await generarInfografiaParaRevision(guionId, "regenerar");
        break;
      default:
        nuevaData = null;
    }
    
    // Actualizar el material
    setMaterialesRevision(prev => 
      prev.map(item => 
        item.id === materialId ? { 
          ...item, 
          data: nuevaData, 
          estado: 'generado',
          regenerado: true 
        } : item
      )
    );
    
    setMaterialesPendientes(prev => 
      prev.map(item => 
        item.id === materialId ? { 
          ...item, 
          data: nuevaData, 
          estado: 'generado',
          regenerado: true 
        } : item
      )
    );
    
    console.log(`✅ Material regenerado en revisión: ${subtipo}`);
    return nuevaData;
    
  } catch (error) {
    console.error(`❌ Error al regenerar ${subtipo} en revisión:`, error);
    
    setMaterialesRevision(prev => 
      prev.map(item => 
        item.id === materialId ? { 
          ...item, 
          estado: 'error',
          error: error.message 
        } : item
      )
    );
    
    throw error;
  }
};
// Función para generar mapa conceptual con opción de regenerar
const generarMapaParaRevision = async (guionId, accion = "obtener") => {
  console.log(`🗺️ ${accion === "regenerar" ? "Regenerando" : "Obteniendo"} mapa conceptual para revisión:`, guionId);
  
  try {
    const response = await axios.get(
      `${url_backend}/planificacion/${guionId}/mapa-conceptual?accion=${accion}`
    );
    
    const mapaRaw = response.data?.mapa_conceptual;
    
    if (mapaRaw && typeof mapaRaw === "object") {
      const mapaProcesado = procesarMapaConceptual(mapaRaw);
      console.log("✅ Mapa obtenido y procesado para revisión");
      return mapaProcesado;
    } else {
      throw new Error('No se pudo generar el mapa conceptual - Respuesta inválida');
    }
  } catch (error) {
    console.error(`❌ Error generando mapa para revisión:`, error);
    throw error;
  }
};
const generarGlosarioParaRevision = async (guionId, accion = "obtener") => {
  console.log(`📚 ${accion === "regenerar" ? "Regenerando" : "Obteniendo"} glosario para revisión:`, guionId);
  
  try {
    const response = await axios.get(
      `${url_backend}/planificacion/${guionId}/glosario?accion=${accion}`
    );
    
    const glosario = response.data?.glosario;
    
    if (glosario && Array.isArray(glosario) && glosario.length > 0) {
      console.log("✅ Glosario obtenido para revisión:", glosario.length, "términos");
      return glosario;
    } else {
      throw new Error('No se pudo generar el glosario - Respuesta inválida');
    }
  } catch (error) {
    console.error(`❌ Error generando glosario para revisión:`, error);
    throw error;
  }
};

// Agrega también para flashcards y glosario si tu backend lo soporta
const generarFlashcardsParaRevision = async (guionId, accion = "obtener") => {
  console.log(`🎴 ${accion === "regenerar" ? "Regenerando" : "Obteniendo"} flashcards para revisión:`, guionId);
  
  try {
    const response = await axios.get(
      `${url_backend}/planificacion/${guionId}/flashcards?accion=${accion}`
    );
    
    const flashcards = response.data?.flashcards;
    
    if (flashcards && Array.isArray(flashcards) && flashcards.length > 0) {
      console.log("✅ Flashcards obtenidas para revisión:", flashcards.length, "tarjetas");
      return flashcards;
    } else {
      throw new Error('No se pudieron generar las flashcards - Respuesta inválida');
    }
  } catch (error) {
    console.error(`❌ Error generando flashcards para revisión:`, error);
    throw error;
  }
};

// Función para renderizar GLOSARIO
const renderizarGlosario = (data) => {
  // El backend devuelve: { glosario: [...] }
  const glosario = data.glosario || data || [];
  
  return (
    <div className="glosario-container">
      <div className="glosario-content">
        {glosario.map((termino, index) => (
          <div key={index} className="termino-card card mb-3 border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-start">
                <div className="termino-indicator bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" 
                     style={{ width: '35px', height: '35px', fontSize: '14px', fontWeight: 'bold' }}>
                  {index + 1}
                </div>
                <div className="flex-grow-1">
                  <h5 className="card-title text-primary mb-2">{termino.termino}</h5>
                  <p className="card-text mb-2">{termino.definicion}</p>
                  {termino.categoria && (
                    <span className="badge bg-secondary">{termino.categoria}</span>
                  )}
                  {termino.ejemplo && (
                    <div className="ejemplo-container mt-2 p-2 bg-light rounded">
                      <small className="text-muted">
                        <strong>Ejemplo:</strong> {termino.ejemplo}
                      </small>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Función para renderizar FLASHCARDS
// ✅ Componente React para flashcards de vista previa
const FlashcardsVistaPrevia = ({ data }) => {
  const flashcards = data.flashcards || data || [];
  
  // ✅ Estados ESPECÍFICOS para vista previa
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // ✅ Funciones CORREGIDAS para vista previa
  const handleFlashcardPrevious = () => {
    setCurrentIndex(prev => prev > 0 ? prev - 1 : flashcards.length - 1);
    setIsFlipped(false);
  };

  const handleFlashcardNext = () => {
    setCurrentIndex(prev => prev < flashcards.length - 1 ? prev + 1 : 0);
    setIsFlipped(false);
  };

  const handleGoToFlashcard = (index) => {
    setCurrentIndex(index);
    setIsFlipped(false);
  };

  if (flashcards.length === 0) {
    return (
      <div className="alert alert-warning text-center">
        No hay flashcards disponibles
      </div>
    );
  }

  return (
    <div className="flashcards-preview-revision">
      {/* Header */}
      <div className="text-center mb-4">
        <div className="flashcards-header bg-primary text-white rounded p-3">
          <h4 className="mb-1">🎴 Flashcards</h4>
          <p className="mb-0 opacity-75">
            <strong>{flashcards.length}</strong> tarjetas interactivas generadas
          </p>
        </div>
      </div>

      {/* Flashcard actual */}
      <div className="flashcard-preview-main text-center mb-4">
        <div className="card mx-auto border-primary" style={{ maxWidth: '500px' }}>
          <div className="card-header bg-primary text-white">
            <small>Flashcard {currentIndex + 1} de {flashcards.length}</small>
          </div>
          <div className="card-body p-4">
            <div className="flashcard-preview-content">
              <h5 className="text-primary mb-3">Pregunta:</h5>
              <p className="fs-5 mb-4">{flashcards[currentIndex]?.pregunta}</p>
              
              <div className="mt-4 p-3 bg-light rounded">
                <h6 className="text-success">Respuesta:</h6>
                <p className="mb-2">{flashcards[currentIndex]?.respuesta}</p>
                {flashcards[currentIndex]?.categoria && (
                  <span className="badge bg-secondary">
                    {flashcards[currentIndex].categoria}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Miniaturas */}
      <div className="flashcards-miniatures mb-4">
        <div className="d-flex flex-wrap gap-2 justify-content-center">
          {flashcards.map((_, index) => (
            <Button
              key={index}
              variant={index === currentIndex ? "primary" : "outline-secondary"}
              size="sm"
              onClick={() => handleGoToFlashcard(index)}
            >
              {index + 1}
            </Button>
          ))}
        </div>
      </div>

      {/* Controles */}
      <div className="flashcards-controls-simple text-center mb-4">
        <div className="d-flex justify-content-center gap-3">
          <Button 
            variant="outline-primary" 
            onClick={handleFlashcardPrevious}
            size="sm"
          >
            ← Anterior
          </Button>
          <Button 
            variant="outline-primary" 
            onClick={handleFlashcardNext}
            size="sm"
          >
            Siguiente →
          </Button>
        </div>
      </div>

      {/* Información */}
      <div className="alert alert-info">
        <div className="text-center">
          <small>
            <strong>📱 Formato interactivo disponible</strong> - Los estudiantes podrán estudiar con flip animations
          </small>
        </div>
      </div>
    </div>
  );
};

// ✅ Función de renderizado ORIGINAL (sin hooks)
const renderizarFlashcards = (data) => {
  return <FlashcardsVistaPrevia data={data} />;
};

// Función para renderizar MAPA CONCEPTUAL
const renderizarMapaConceptual = (data) => {
  return (
    <div style={{ 
      position: 'relative',
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      padding: '20px',
      borderRadius: '10px',
      minHeight: '300px'
    }}>
      {data ? (
        <div>
          {/* EL MAPA COMPLETO */}
          <MapaArbolVertical mapa={data} />
          
        </div>
      ) : (
        <div className="loading-spinner">
          <div className="loading-ring"></div>
          <p className="loading-text">Cargando mapa...</p>
        </div>
      )}
    </div>
  );
};
// Función para renderizar RESUMEN
const renderizarResumen = (data) => {
  return (
    <>
      <p>
        <strong>Tema principal:</strong>{" "}
        {data.tema_principal || "Sin datos válidos"}
      </p>

      <div className="resumen-seccion">
        <h5>Ideas principales</h5>
        {data.ideas_principales?.length ? (
          <ul>
            {data.ideas_principales.map((idea, index) => (
              <li key={index}>{idea}</li>
            ))}
          </ul>
        ) : (
          <p>No se encontraron ideas principales.</p>
        )}
      </div>

      <div className="resumen-seccion">
        <h5>Conceptos clave</h5>
        {data.conceptos_clave?.length ? (
          <ul>
            {data.conceptos_clave.map((concepto, index) => (
              <li key={index}>{concepto}</li>
            ))}
          </ul>
        ) : (
          <p>No hay conceptos clave registrados.</p>
        )}
      </div>

      <div className="resumen-seccion">
        <h5>Conclusión</h5>
        <p>{data.conclusion || "Sin conclusión disponible."}</p>
      </div>
    </>
  );
};

const renderizarContenidoRevision = (material) => {
  if (material.estado === 'error') {
    return (
      <div className="alert alert-danger text-center">
        <h6>❌ Error al generar este material</h6>
        <p>{material.error}</p>
      </div>
    );
  }

  if (!material.data) {
    return (
      <div className="text-center py-4">
        <p>Material generado - Contenido listo para enviar</p>
      </div>
    );
  }

  // Renderiza según el tipo de material
  switch (material.subtipo) {
    

    // ... los otros casos (resumen, mapaConceptual, etc.) se mantienen igual ...
    case 'resumen':
      return (
        <div className="revision-content">
          <h6 className="text-success mb-3">📄 Resumen del Contenido</h6>
          <div className="card border-0 bg-light">
            <div className="card-body">
              {renderizarResumen(material.data)}
            </div>
          </div>
        </div>
      );

    case 'mapaConceptual':
      console.log("🗺️ Renderizando mapa conceptual en revisión:", material.data);
      return (
        <div className="revision-content">
          <h6 className="text-success mb-3">🗺️ Mapa Conceptual</h6>
          <div className="card border-0 bg-light">
            <div className="card-body">
              {renderizarMapaConceptual(material.data)}
            </div>
          </div>
        </div>
      );

    case 'flashcards':
      const totalFlashcards = material.data.flashcards?.length || material.data?.length || 0;
      return (
        <div className="revision-content">
          <h6 className="text-success mb-3">🎴 Flashcards</h6>
          <div className="card border-0 bg-light">
            <div className="card-body">
              {renderizarFlashcards(material.data)}
              <small className="text-muted mt-2 d-block">
                <strong>{totalFlashcards} tarjetas</strong> interactivas listas para estudiar.
              </small>
            </div>
          </div>
        </div>
      );

    case 'glosario':
      const totalTerminos = material.data.glosario?.length || material.data?.length || 0;
      return (
        <div className="revision-content">
          <h6 className="text-success mb-3">📚 Glosario</h6>
          <div className="card border-0 bg-light">
            <div className="card-body">
              {renderizarGlosario(material.data)}
              <small className="text-muted mt-2 d-block">
                <strong>{totalTerminos} términos</strong> clave definidos para los estudiantes.
              </small>
            </div>
          </div>
        </div>
      );
    case 'infografia':
  const estaCargandoInfografia = cargandoInfografiaId === material.guionId;
  // Agrega estos estados al inicio del componente

  return (
    <div className="revision-content">
      <h6 className="text-success mb-3">🎨 Infografía</h6>
      <div className="card border-0 bg-light">
        <div className="card-body text-center">
          {/* IMAGEN CLICKEABLE - solo para ver grande */}
          <div 
            className="border rounded bg-white p-2 mx-auto position-relative" 
            style={{ maxWidth: '100%', cursor: 'pointer' }}
            onClick={() => {
              if (!estaCargandoInfografia) {
                const imageUrl = `data:image/png;base64,${material.data}`;
                setInfografiaPreviaData({
                  url: imageUrl,
                  base64: material.data,
                  guionId: material.guionId,
                  titulo: material.nombre,
                  guionTitulo: material.guionTitulo
                });
                setShowVistaPreviaInfografia(true);
              }
            }}
          >
            {/* ✅ OVERLAY DE CARGA (igual que en tu mapa) */}
            {estaCargandoInfografia && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.1)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1000,
                borderRadius: '10px'
              }}>
                <div className="loading-spinner">
                  <div className="loading-ring"></div>
                  <p className="loading-text" style={{color: 'white'}}>
                    Generando nueva infografía...
                  </p>
                </div>
              </div>
            )}
            
            <img 
              src={`data:image/png;base64,${material.data}`} 
              alt={`Infografía: ${material.nombre}`}
              className="img-fluid rounded"
              style={{ 
                maxHeight: '250px',
                maxWidth: '100%',
                width: 'auto',
                height: 'auto',
                opacity: estaCargandoInfografia ? 0.5 : 1
              }}
            />
            <small className="text-muted d-block mt-2">
              🔍 {estaCargandoInfografia ? 'Generando...' : 'Haz clic para ver en tamaño completo'}
            </small>
          </div>
          
          {/* ✅ INFO DE ESTADO SIN BOTÓN DUPLICADO */}
          <div className="mt-3">
            <small className="text-muted d-block">
            </small>
          </div>
        </div>
      </div>
    </div>
  );
    default:
      return (
        <div className="alert alert-info">
          <strong>✅ Material generado correctamente</strong>
          <p>Listo para enviar a los estudiantes.</p>
        </div>
      );
  }
};
// Función para crear la lista de materiales pendientes
const crearListaMaterialesPendientes = () => {
  const materiales = [];
  const timestamp = Date.now();
  
  guionesSeleccionados.forEach(guionId => {
    const guion = guiones.find(g => g.guion_id === guionId);
    const materialesGuion = materialesPorGuion[guionId];
    
    if (!materialesGuion?.extras) return;
    
    // Contador por tipo para IDs únicos
    let contador = 0;
    
    if (materialesGuion.extras.infografia) {
      materiales.push({
        id: `infografia_${guionId}_${timestamp}_${contador++}`,
        guionId: guionId,
        guionTitulo: guion?.titulo || 'Sin título',
        tipo: 'extra',
        subtipo: 'infografia',
        nombre: `Infografía - ${guion?.titulo || 'Guion'}`,
        estado: 'pendiente'
      });
    }
    
    if (materialesGuion.extras.resumen) {
      materiales.push({
        id: `resumen_${guionId}_${timestamp}_${contador++}`,
        guionId: guionId,
        guionTitulo: guion?.titulo || 'Sin título',
        tipo: 'extra',
        subtipo: 'resumen',
        nombre: `Resumen - ${guion?.titulo || 'Guion'}`,
        estado: 'pendiente'
      });
    }
    
    if (materialesGuion.extras.mapaConceptual) {
      materiales.push({
        id: `mapa_${guionId}_${timestamp}_${contador++}`,
        guionId: guionId,
        guionTitulo: guion?.titulo || 'Sin título',
        tipo: 'extra',
        subtipo: 'mapaConceptual',
        nombre: `Mapa Conceptual - ${guion?.titulo || 'Guion'}`,
        estado: 'pendiente'
      });
    }
    
    if (materialesGuion.extras.flashcards) {
      materiales.push({
        id: `flashcards_${guionId}_${timestamp}_${contador++}`,
        guionId: guionId,
        guionTitulo: guion?.titulo || 'Sin título',
        tipo: 'extra',
        subtipo: 'flashcards',
        nombre: `Flashcards - ${guion?.titulo || 'Guion'}`,
        estado: 'pendiente'
      });
    }
    
    if (materialesGuion.extras.glosario) {
      materiales.push({
        id: `glosario_${guionId}_${timestamp}_${contador++}`,
        guionId: guionId,
        guionTitulo: guion?.titulo || 'Sin título',
        tipo: 'extra',
        subtipo: 'glosario',
        nombre: `Glosario - ${guion?.titulo || 'Guion'}`,
        estado: 'pendiente'
      });
    }
  });
  
  console.log("📋 Materiales pendientes creados:", materiales);
  return materiales;
};
// Esta función SOLO retorna el HTML (sin descargar)
const descargarGlosarioPDF = async (glosarioData, accion = "descargar") => {
  if (!glosarioData || glosarioData.length === 0) {
    throw new Error("No hay glosario para generar");
  }

  const pdf = new jsPDF();
  let yPosition = 25;
  const margin = 20;
  const pageWidth = pdf.internal.pageSize.width - (margin * 2);
  const lineHeight = 5;

  // Colores del tema
  const colors = {
    primary: [110, 0, 140],
    secondary: [52, 152, 219],
    accent: [46, 204, 113],
    light: [245, 240, 255],
    dark: [80, 0, 100],
    gray: [100, 100, 100],
    lightGray: [240, 240, 240]
  };

  // ========== CARGAR LOGO ==========
  let logoBase64 = null;
  try {
    logoBase64 = await cargarLogoBase64();
  } catch (error) {
    console.log("Error al cargar logo:", error);
  }

  // ========== ENCABEZADO PROFESIONAL ==========
  pdf.setFillColor(...colors.primary);
  pdf.rect(0, 0, pdf.internal.pageSize.width, 65, 'F');
  
  // Logo en esquina superior derecha
  if (logoBase64) {
    try {
      pdf.addImage(logoBase64, 'PNG', pdf.internal.pageSize.width - 40, 10, 30, 30);
    } catch (error) {
      console.log("Error al agregar logo al PDF:", error);
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'bold');
      pdf.setTextColor(255, 255, 255, 0.9);
      pdf.text('AI-Want-2-Teach', pdf.internal.pageSize.width - margin, 25, { align: 'right' });
    }
  } else {
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'bold');
    pdf.setTextColor(255, 255, 255, 0.9);
    pdf.text('AI-Want-2-Teach', pdf.internal.pageSize.width - margin, 25, { align: 'right' });
  }

  // Título principal
  pdf.setFontSize(20);
  pdf.setFont(undefined, 'bold');
  pdf.setTextColor(255, 255, 255);
  pdf.text('GLOSARIO DE TÉRMINOS', margin, 30);
  
  // Información institucional
  pdf.setFontSize(9);
  pdf.setTextColor(255, 255, 255, 0.95);
  
  // Línea 1: Profesor y Fecha
  const fechaCompleta = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const infoLinea1 = `${datosGlobalesClase.nombreProfesor ? `Profesor/a: ${datosGlobalesClase.nombreProfesor}` : ''} • ${fechaCompleta}`;
  pdf.text(infoLinea1, margin, 40);
  
  // Línea 2: Materia y Asignatura
  const infoLinea2 = `${datosGlobalesClase.nombreMateria ? `Materia: ${datosGlobalesClase.nombreMateria}` : ''}${datosGlobalesClase.nombreClase ? ` • Clase: ${datosGlobalesClase.nombreClase}` : ''}`;
  pdf.text(infoLinea2, margin, 47);
  
  // Línea 3: Unidad y Estadísticas
  const infoLinea3 = `${datosGlobalesClase.nombreUnidad ? `Unidad: ${datosGlobalesClase.nombreUnidad}` : ''} • ${glosarioData.length} términos definidos`;
  pdf.text(infoLinea3, margin, 54);

  yPosition = 70;

  // ========== TÉRMINOS ==========
  glosarioData.forEach((termino, index) => {
    // Verificar si necesitamos nueva página
    const definicionLines = pdf.splitTextToSize(termino.definicion, pageWidth - 10);
    const definicionHeight = definicionLines.length * lineHeight;
    
    let ejemploHeight = 0;
    let ejemploLines = [];
    if (termino.ejemplo) {
      ejemploLines = pdf.splitTextToSize(termino.ejemplo, pageWidth - 15);
      ejemploHeight = ejemploLines.length * lineHeight;
    }
    
    // Calcular altura total
    const alturaTotal = 10 + 
                       (termino.categoria ? 5 : 0) +
                       definicionHeight +
                       (ejemploLines.length > 0 ? ejemploHeight + 8 : 0) +
                       6;

    if (yPosition + alturaTotal > 270) {
      pdf.addPage();
      yPosition = 25;
      
      // Encabezado de página continua
      pdf.setFillColor(...colors.lightGray);
      pdf.rect(0, 0, pdf.internal.pageSize.width, 15, 'F');
      pdf.setFontSize(9);
      pdf.setTextColor(...colors.gray);
      const tituloContinuacion = `${datosGlobalesClase.nombreMateria || datosGlobalesClase.nombreClase || 'Glosario'} - Pagina ${pdf.internal.getNumberOfPages()}`;
      pdf.text(tituloContinuacion, margin, 10);
      pdf.text('Continuacion', pdf.internal.pageSize.width - margin, 10, { align: 'right' });
      yPosition = 25;
    }

    // Fondo de tarjeta para término
    pdf.setFillColor(...colors.light);
    const fondoHeight = alturaTotal - 2;
    pdf.roundedRect(margin - 5, yPosition - 5, pageWidth + 10, fondoHeight, 3, 3, 'F');

    // 1. NÚMERO Y TÉRMINO
    pdf.setFillColor(...colors.primary);
    pdf.circle(margin, yPosition, 4, 'F');
    pdf.setFontSize(9);
    pdf.setFont(undefined, 'bold');
    pdf.setTextColor(255, 255, 255);
    pdf.text((index + 1).toString(), margin - 1.5, yPosition + 1.5);

    pdf.setFontSize(13);
    pdf.setTextColor(...colors.dark);
    pdf.text(termino.termino, margin + 8, yPosition + 2);
    yPosition += 10;

    // 2. CATEGORÍA
    if (termino.categoria) {
      yPosition -= 3;
      
      pdf.setFontSize(8);
      pdf.setFont(undefined, 'bold');
      pdf.setTextColor(255, 255, 255);
      pdf.setFillColor(...colors.secondary);
      const catWidth = pdf.getTextWidth(termino.categoria) + 6;
      pdf.roundedRect(margin, yPosition, catWidth, 4, 2, 2, 'F');
      pdf.text(termino.categoria, margin + 3, yPosition + 2.8);
      
      yPosition += 6;
    }

    // 3. DEFINICIÓN
    yPosition += 2;
    
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'normal');
    pdf.setTextColor(60, 60, 60);
    pdf.text(definicionLines, margin, yPosition);
    yPosition += definicionHeight;

    // 4. EJEMPLO (si existe)
    if (termino.ejemplo && ejemploLines.length > 0) {
      yPosition += 3;
      
      // Fondo diferenciado para ejemplo
      pdf.setFillColor(248, 249, 252);
      pdf.roundedRect(margin - 3, yPosition - 2, pageWidth + 6, ejemploHeight + 10, 2, 2, 'F');
      
      pdf.setFontSize(9);
      pdf.setFont(undefined, 'bold');
      pdf.setTextColor(...colors.primary);
      pdf.text('Ejemplo Practico:', margin, yPosition + 2);
      yPosition += 5;
      
      pdf.setFont(undefined, 'italic');
      pdf.setTextColor(80, 80, 80);
      pdf.text(ejemploLines, margin + 5, yPosition);
      yPosition += ejemploHeight + 3;
    } else {
      yPosition += 3;
    }

    // 5. LÍNEA SEPARADORA
    if (index < glosarioData.length - 1) {
      pdf.setDrawColor(220, 220, 230);
      pdf.setLineWidth(0.5);
      pdf.line(margin, yPosition, pageWidth + margin, yPosition);
      yPosition += 8;
    }
  });

  // ========== PIE DE PÁGINA PROFESIONAL ==========
  const totalPages = pdf.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    
    // Línea decorativa
    pdf.setDrawColor(...colors.primary);
    pdf.setLineWidth(0.5);
    pdf.line(margin, 280, pageWidth + margin, 280);
    
    // Información del pie
    pdf.setFontSize(8);
    pdf.setTextColor(...colors.gray);
    
    // Izquierda: Información académica
    const infoAcademica = `${datosGlobalesClase.nombreMateria || ''}${datosGlobalesClase.nombreUnidad ? ` • ${datosGlobalesClase.nombreUnidad}` : ''}`;
    pdf.text(infoAcademica, margin, 285);
    
    // Centro: Navegación
    pdf.text(`Pagina ${i} de ${totalPages}`, pdf.internal.pageSize.width / 2, 285, { align: 'center' });
    
    // Derecha: Copyright y sistema
    pdf.text('AI-Want-2-Teach • Material educativo', pdf.internal.pageSize.width - margin, 285, { align: 'right' });
  }

  // ========== ACCIÓN BASADA EN PARÁMETRO ==========
  if (accion === "descargar") {
    // Generar nombre del archivo y descargar
    let nombreAsignatura = datosGlobalesClase.nombreClase || 
                          datosGlobalesClase.nombreMateria || 
                          datosGlobalesClase.nombreUnidad || 
                          "Glosario";
    
    let nombreArchivo = "glosario_general.pdf";
    
    if (nombreAsignatura && nombreAsignatura !== "Glosario") {
      nombreArchivo = `glosario_${nombreAsignatura
        .toLowerCase()
        .replace(/[^a-z0-9áéíóúüñ\s]/g, '')
        .replace(/\s+/g, '_')
        .substring(0, 50)
        .trim()}.pdf`;
    }
    
    console.log("Descargando glosario como:", nombreArchivo);
    pdf.save(nombreArchivo);
    return true;
    
  } else if (accion === "compartir") {
    // Retornar el blob del PDF para compartir
    const pdfBlob = pdf.output('blob');
    return pdfBlob;
  }
};
const formatearInstruccionesComoLista = (texto) => {
  if (!texto) return "No especificados";
  
  if (Array.isArray(texto)) {
    return (
      <ol>
        {texto.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ol>
    );
  }
  
  const textoStr = String(texto).trim();
  
  // CASO 1: Texto con RA1:, RA2:, etc.
  if (textoStr.includes('RA')) {
    // Encontrar todos los items RA
    const itemsRA = textoStr.match(/RA\d+[:.]\s*[^.]*(?:\.[^.]*)*/gi);
    
    if (itemsRA && itemsRA.length > 1) {
      return (
        <ol>
          {itemsRA.map((item, index) => {
            // Limpiar el texto: quitar "RA1:", "RA2:", etc.
            const textoLimpio = item.replace(/^RA\d+[:.]\s*/, '').trim();
            return (
              <li key={index} style={{ marginBottom: '10px' }}>
                {textoLimpio}
                {!textoLimpio.endsWith('.') ? '.' : ''}
              </li>
            );
          })}
        </ol>
      );
    }
  }
  
  // CASO 2: Si el texto tiene saltos de línea
  const lineas = textoStr.split('\n').filter(l => l.trim());
  if (lineas.length > 1) {
    return (
      <ul style={{ listStyleType: 'none', paddingLeft: '0' }}>
        {lineas.map((linea, index) => {
          const lineaTrim = linea.trim();
          // Si la línea empieza con emoji o símbolo, mantenerlo
          const tienePrefijo = /^[📘📝🔍✨👁️⚙️🌐🧩🔬💡✅🌟📊📈📉•\-*]/.test(lineaTrim);
          
          return (
            <li key={index} style={{ 
              marginBottom: '10px',
              paddingLeft: tienePrefijo ? '0' : '20px',
              position: 'relative'
            }}>
              {!tienePrefijo && (
                <span style={{ 
                  position: 'absolute', 
                  left: '0', 
                  color: '#666'
                }}>
                  •
                </span>
              )}
              {lineaTrim}
              {!lineaTrim.match(/[.!?:;]$/) ? '.' : ''}
            </li>
          );
        })}
      </ul>
    );
  }
  
  // CASO 3: Texto plano - separar por puntos inteligentemente
  // Primero, proteger casos especiales
  let textoProtegido = textoStr;
  
  // 1. Proteger abreviaturas comunes
  textoProtegido = textoProtegido.replace(/\b(vs|etc|ej|Dr|Dra|Sr|Sra|Ing|Lic|Mtro)\./gi, '$1_ABR');
  
  // 2. Proteger "p. ej."
  textoProtegido = textoProtegido.replace(/p\. ej\./gi, 'p_EJ_ABR');
  
  // 3. Proteger números decimales
  textoProtegido = textoProtegido.replace(/\b\d+\.\d+/g, m => m.replace('.', '_DEC'));
  
  // Ahora separar por puntos
  const partes = textoProtegido.split('.').map(p => p.trim()).filter(p => p.length > 0);
  
  // Procesar partes
  const items = [];
  let buffer = '';
  
  for (let i = 0; i < partes.length; i++) {
    let parte = partes[i];
    
    // Restaurar
    parte = parte.replace(/_ABR/g, '.');
    parte = parte.replace(/p_EJ_ABR/gi, 'p. ej.');
    parte = parte.replace(/_DEC/g, '.');
    
    // Si es muy corta (1-2 letras), probablemente es parte de una palabra dividida
    if (parte.length <= 2 && /^[a-záéíóúñ]+$/i.test(parte)) {
      if (buffer) {
        buffer += parte;
      } else if (i > 0 && items.length > 0) {
        // Agregar al último item
        items[items.length - 1] = items[items.length - 1] + parte;
      } else {
        buffer = parte;
      }
      continue;
    }
    
    // Si tenemos buffer, agregarlo
    if (buffer) {
      parte = buffer + parte;
      buffer = '';
    }
    
    // Capitalizar si es necesario
    if (parte && /^[a-záéíóúñ]/.test(parte)) {
      parte = parte.charAt(0).toUpperCase() + parte.slice(1);
    }
    
    items.push(parte);
  }
  
  // Agregar cualquier buffer restante
  if (buffer && items.length > 0) {
    items[items.length - 1] = items[items.length - 1] + buffer;
  }
  
  // Filtrar items vacíos
  const itemsFinales = items.filter(item => {
    const soloLetras = item.replace(/[^a-záéíóúñ]/gi, '');
    return soloLetras.length >= 3;
  });
  
  if (itemsFinales.length <= 1) {
    return <p>{textoStr}</p>;
  }
  
  return (
    <ul style={{ listStyleType: 'none', paddingLeft: '0' }}>
      {itemsFinales.map((item, index) => (
        <li key={index} style={{ 
          marginBottom: '10px',
          paddingLeft: '20px',
          position: 'relative'
        }}>
          <span style={{ 
            position: 'absolute', 
            left: '0', 
            color: '#666'
          }}>
            •
          </span>
          {item}
          {!item.endsWith('.') && !item.endsWith(':') && !item.endsWith(';') ? '.' : ''}
        </li>
      ))}
    </ul>
  );
};

// Esta versión es PARA PDF (jsPDF) - NO USA JSX
const formatearInstruccionesComoListaPDF = (texto) => {
    if (!texto || texto.trim() === "") return "No especificado";
    
    const textoStr = String(texto).trim();
    
    // CASO 1: Si ya es un array, devolverlo directamente
    if (Array.isArray(texto)) {
        return texto.map(item => `• ${String(item).trim()}`);
    }
    
    // CASO 2: Texto con RA1:, RA2:, etc.
    if (textoStr.includes('RA')) {
        const itemsRA = textoStr.match(/RA\d+[:.]\s*[^.]*(?:\.[^.]*)*/gi);
        if (itemsRA && itemsRA.length > 1) {
            return itemsRA.map(item => {
                const textoLimpio = item.replace(/^RA\d+[:.]\s*/, '').trim();
                return `• ${textoLimpio}${!textoLimpio.endsWith('.') ? '.' : ''}`;
            });
        }
    }
    
    // CASO 3: Si el texto tiene saltos de línea
    const lineas = textoStr.split('\n').filter(l => l.trim());
    if (lineas.length > 1) {
        return lineas.map(linea => {
            const lineaTrim = linea.trim();
            const tienePrefijo = /^[📘📝🔍✨👁️⚙️🌐🧩🔬💡✅🌟📊📈📉•\-*]/.test(lineaTrim);
            return `${tienePrefijo ? '' : '• '}${lineaTrim}${!lineaTrim.match(/[.!?:;]$/) ? '.' : ''}`;
        });
    }
    
    // CASO 4: Texto plano - separar por puntos
    let textoProtegido = textoStr;
    
    // Proteger abreviaturas
    textoProtegido = textoProtegido.replace(/\b(vs|etc|ej|Dr|Dra|Sr|Sra|Ing|Lic|Mtro)\./gi, '$1_ABR');
    textoProtegido = textoProtegido.replace(/p\. ej\./gi, 'p_EJ_ABR');
    textoProtegido = textoProtegido.replace(/\b\d+\.\d+/g, m => m.replace('.', '_DEC'));
    
    // Separar por puntos
    const partes = textoProtegido.split('.').map(p => p.trim()).filter(p => p.length > 0);
    const items = [];
    let buffer = '';
    
    for (let i = 0; i < partes.length; i++) {
        let parte = partes[i];
        
        // Restaurar
        parte = parte.replace(/_ABR/g, '.');
        parte = parte.replace(/p_EJ_ABR/gi, 'p. ej.');
        parte = parte.replace(/_DEC/g, '.');
        
        if (parte.length <= 2 && /^[a-záéíóúñ]+$/i.test(parte)) {
            if (buffer) {
                buffer += parte;
            } else if (i > 0 && items.length > 0) {
                items[items.length - 1] = items[items.length - 1] + parte;
            } else {
                buffer = parte;
            }
            continue;
        }
        
        if (buffer) {
            parte = buffer + parte;
            buffer = '';
        }
        
        if (parte && /^[a-záéíóúñ]/.test(parte)) {
            parte = parte.charAt(0).toUpperCase() + parte.slice(1);
        }
        
        items.push(parte);
    }
    
    if (buffer && items.length > 0) {
        items[items.length - 1] = items[items.length - 1] + buffer;
    }
    
    const itemsFinales = items.filter(item => {
        const soloLetras = item.replace(/[^a-záéíóúñ]/gi, '');
        return soloLetras.length >= 3;
    });
    
    if (itemsFinales.length <= 1) {
        return textoStr; // Devolver texto plano
    }
    
    return itemsFinales.map(item => `• ${item}${!item.endsWith('.') && !item.endsWith(':') && !item.endsWith(';') ? '.' : ''}`);
};


// Exportar la función principal

const formatearTiempoEstimado = (tiempo) => {
  if (!tiempo) return 'No especificado';
  
  // Si ya tiene unidades, dejarlo como está
  if (typeof tiempo === 'string' && 
      (tiempo.includes('semana') || tiempo.includes('día') || tiempo.includes('hora') || tiempo.includes('minuto'))) {
    return tiempo;
  }
  
  // Si es solo un número, asumir semanas
  const numero = parseInt(tiempo);
  if (!isNaN(numero)) {
    if (numero === 1) return '1 semana';
    return `${numero} semanas`;
  }
  
  // Si no se puede parsear, devolver original
  return tiempo;
};


const [showInfografiaModal, setShowInfografiaModal] = useState(false);
const [infografiaData, setInfografiaData] = useState(null);
const [showVistaPreviaInfografia, setShowVistaPreviaInfografia] = useState(false);
const [infografiaPreviaData, setInfografiaPreviaData] = useState(null);
// 🎨 Función PRINCIPAL - Solo pide la foto y abre el modal
const handleGenerarInfografia = async (guion_id, accion = "obtener") => {
  console.log(`📥 ${accion === "regenerar" ? "Regenerando" : "Obteniendo"} infografía para guion:`, guion_id);
  
  setIsLoading(true);

  try {
    const response = await axios.get(
      `${url_backend}/planificacion/${guion_id}/infografia?accion=${accion}`
    );
    
    console.log("📡 Respuesta del backend:", response);
    
    let imageUrl;
    let base64Data;
    
    if (response.data && response.data.infografia) {
      base64Data = response.data.infografia;
      
      // Determinar tipo de imagen
      if (base64Data.startsWith('/9j/')) {
        imageUrl = `data:image/jpeg;base64,${base64Data}`;
      } else if (base64Data.startsWith('iVBORw0KGgo')) {
        imageUrl = `data:image/png;base64,${base64Data}`;
      } else {
        imageUrl = `data:image/jpeg;base64,${base64Data}`;
      }
    }

    if (!imageUrl) {
      console.error("❌ No se pudo extraer imagen");
      throw new Error("Formato no reconocido");
    }
    
    setInfografiaData({
      url: imageUrl,
      titulo: response.data.titulo || `Infografía Guión ${guion_id}`,
      guionId: guion_id,
      base64: base64Data
    });
    
    // ✅ ABRIR EL MODAL SOLO CUANDO TENEMOS LOS DATOS
    setShowInfografiaModal(true);
    
  } catch (error) {
    console.error("❌ Error al obtener infografía:", error);
    alert(`Error: ${error.response?.data?.detail || error.message}`);
    setInfografiaData(null);
  } finally {
    console.log("🏁 Finalizando carga de infografía");
    setIsLoading(false);
  }
};
// 🔄 Función REHACER - Vuelve a generar
// 🔄 Función REHACER - Con confirmación y cierre del modal
const handleRehacerInfografia = async () => {
  if (window.confirm("¿Estás seguro de regenerar la infografía? Se creará una nueva versión.")) {
    setShowInfografiaModal(false);
    setTimeout(() => {
      handleGenerarInfografia(infografiaData.guionId, "regenerar");
    }, 300);
  }
};

const generarInfografiaParaRevision = async (guionId, accion = "obtener") => {
  console.log(`🎨 ${accion === "regenerar" ? "Regenerando" : "Obteniendo"} infografía para revisión:`, guionId);
  
  try {
    const response = await axios.get(
      `${url_backend}/planificacion/${guionId}/infografia?accion=${accion}`
    );
    
    const infografiaData = response.data?.infografia;
    
    if (infografiaData) {
      console.log("✅ Infografía obtenida para revisión");
      return infografiaData; // Solo el base64
    } else {
      throw new Error('No se pudo generar la infografía - Respuesta inválida');
    }
  } catch (error) {
    console.error(`❌ Error generando infografía para revisión:`, error);
    throw error;
  }
};

// 📥 Función DESCARGAR (solo para uso en el modal)
const handleDescargarInfografia = () => {
  if (!infografiaData || !infografiaData.base64) {
    console.error("❌ No hay datos para descargar");
    alert("No hay infografía para descargar");
    return;
  }
  
  try {
    // Obtener nombre de la clase de los datos globales
    let nombreClase = datosGlobalesClase.nombreClase || 
                     datosGlobalesClase.nombreMateria || 
                     datosGlobalesClase.nombreUnidad || 
                     "infografia";
    
    console.log("🎨 Descargando infografía para:", nombreClase);
    
    // Limpiar nombre para archivo
    const nombreArchivo = `infografia_${nombreClase
      .toLowerCase()
      .replace(/[^a-z0-9áéíóúüñ\s]/g, '')  // Solo letras, números y espacios
      .replace(/\s+/g, '_')                // Espacios a guiones bajos
      .trim()}.png`;
    
    console.log("📁 Nombre del archivo:", nombreArchivo);
    
    // ❗ Si tu base64 viene sin el prefijo data:image/…, puedes añadirlo:
    const base64 = infografiaData.base64.startsWith("data:")
      ? infografiaData.base64
      : `data:image/png;base64,${infografiaData.base64}`;

    // Crear un enlace temporal con el data URL
    const link = document.createElement("a");
    link.href = base64;
    link.download = nombreArchivo; // Nombre personalizado
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    


  } catch (error) {
    console.error("❌ Error descargando con data URL:", error);

    // Intentar fallback con Blob
    try {
      // Obtener nombre para fallback también
      let nombreClase = datosGlobalesClase.nombreClase || 
                       datosGlobalesClase.nombreMateria || 
                       datosGlobalesClase.nombreUnidad || 
                       "infografia";
      
      const nombreArchivo = `infografia_${nombreClase
        .toLowerCase()
        .replace(/[^a-z0-9áéíóúüñ\s]/g, '')
        .replace(/\s+/g, '_')
        .trim()}.png`;
      
      console.log("🔄 Intentando descarga con fallback Blob:", nombreArchivo);
      
      // Fallback: convertir a Blob manualmente
      // Primero, extraer solo la parte base64 (sin prefijo si existe)
      let base64String = infografiaData.base64;
      if (base64String.includes(',')) {
        base64String = base64String.split(',')[1];
      }
      
      const byteString = atob(base64String);
      const byteArrays = [];

      const sliceSize = 512;
      for (let offset = 0; offset < byteString.length; offset += sliceSize) {
        const slice = byteString.slice(offset, offset + sliceSize);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }

      const blob = new Blob(byteArrays, { type: 'image/png' });
      const blobUrl = URL.createObjectURL(blob);

      const link2 = document.createElement('a');
      link2.href = blobUrl;
      link2.download = nombreArchivo; // Mismo nombre personalizado
      link2.style.display = "none";
      document.body.appendChild(link2);
      link2.click();
      document.body.removeChild(link2);

      // Liberar memoria cuando ya no se necesite
      URL.revokeObjectURL(blobUrl);
    } catch (innerError) {
      console.error("❌ Error descargando desde Blob:", innerError);
      alert("Error al descargar la infografía");
    }
  }
};


// 🎨 Función para mostrar vista previa de infografía (en el flujo de revisión)
const mostrarVistaPreviaInfografia = async (guionId, guionTitulo, siguientePaso) => {
  console.log("🎨 Mostrando vista previa de infografía para guion:", guionId);
  
  try {
    const response = await axios.get(`${url_backend}/planificacion/${guionId}/infografia`);
    console.log("📡 Infografía recibida para vista previa:", response.data);
    
    if (response.data.infografia) {
      // Convertir base64 a URL para la imagen
      const imageUrl = `data:image/png;base64,${response.data.infografia}`;
      
      setInfografiaPreviaData({
        url: imageUrl,
        base64: response.data.infografia,
        guionId: guionId,
        titulo: response.data.titulo || "Infografía generada",
        guionTitulo: guionTitulo,
        siguientePaso: siguientePaso // Callback para continuar después de aceptar
      });
      
      setShowVistaPreviaInfografia(true);
      return true;
    }
    
  } catch (error) {
    console.error("❌ Error al generar infografía para vista previa:", error);
    alert('❌ Error al generar la infografía para vista previa');
    return false;
  }
};

// 🔄 Función REHACER para vista previa
// 🔄 Función REHACER para vista previa (en el modal grande)
const handleRehacerInfografiaPrevia = async () => {
  if (!infografiaPreviaData) return;
  
  try {
    console.log(`🔄 Rehaciendo infografía desde modal: ${infografiaPreviaData.guionId}`);
    
    // ✅ Cerrar modal temporalmente
    setShowVistaPreviaInfografia(false);
    
    // ✅ Mostrar alerta de carga
    alert('🔄 Generando nueva versión de la infografía...');
    
    // ✅ Llamar al backend para NUEVA generación
    const response = await axios.get(`${url_backend}/planificacion/${infografiaPreviaData.guionId}/infografia`);
    
    if (response.data.infografia) {
      const nuevaData = response.data.infografia;
      const nuevaImageUrl = `data:image/png;base64,${nuevaData}`;
      
      // ✅ Actualizar el estado si hay materialIndex
      if (infografiaPreviaData.materialIndex !== undefined) {
        setMaterialesRevision(prev => 
          prev.map((item, index) => 
            index === infografiaPreviaData.materialIndex 
              ? { ...item, data: nuevaData }
              : item
          )
        );
        setMaterialesPrevisualizacion(prev => 
          prev.map((item, index) => 
            index === infografiaPreviaData.materialIndex 
              ? { ...item, data: nuevaData }
              : item
          )
        );
      }
      
      // ✅ Mostrar la NUEVA infografía
      setInfografiaPreviaData({
        ...infografiaPreviaData,
        url: nuevaImageUrl,
        base64: nuevaData,
        titulo: response.data.titulo || infografiaPreviaData.titulo
      });
      
      // ✅ Reabrir modal con la NUEVA imagen
      setShowVistaPreviaInfografia(true);
      
      console.log('✅ Infografía rehecha desde modal');
      
    } else {
      alert('❌ No se pudo generar la nueva infografía');
    }
    
  } catch (error) {
    console.error("❌ Error al rehacer infografía desde modal:", error);
    alert(`❌ Error: ${error.message}`);
    // Reabrir modal con la imagen anterior
    setShowVistaPreviaInfografia(true);
  }
};
// Cambia tu estado isLoading para que sea más específico
// O agrega estos estados adicionales:
const [cargandoInfografiaId, setCargandoInfografiaId] = useState(null);
const [metodoEnvio, setMetodoEnvio] = useState('correo'); // 'correo', 'drive', 'url'
const [permisoEdicionDrive, setPermisoEdicionDrive] = useState(false);
const [diasExpiracion, setDiasExpiracion] = useState('7');
const [limiteDescargas, setLimiteDescargas] = useState('0');
// Estados para el nuevo flujo
const [accionSeleccionada, setAccionSeleccionada] = useState('zip'); // 'zip', 'drive', 'url'
const [distribucionSeleccionada, setDistribucionSeleccionada] = useState('correo'); // 'correo', 'descargar', 'copiar', 'qr'
const [drivePermisos, setDrivePermisos] = useState('lector'); // 'lector' o 'editor'
const [mensajeCorreo, setMensajeCorreo] = useState('');
const [incluirInstruccionesQR, setIncluirInstruccionesQR] = useState(true);




const procesarMaterialesSegunSeleccion = async () => {
  try {
    setIsLoading(true);
    console.log("🚀 Procesando materiales según selección...");
    
    // 1. Generar materiales
    const archivosGenerados = await generarMaterialesParaCompartir(materialesPendientes);
    
    if (!archivosGenerados || archivosGenerados.length === 0) {
      alert('❌ No se pudieron generar los materiales');
      setIsLoading(false);
      return;
    }
    
    // 2. Ejecutar según acción seleccionada
    if (accionSeleccionada === 'zip') {
      // Si es ZIP, usa las opciones existentes
      if (distribucionSeleccionada === 'correo') {
        await handleEnviarFinal();  // Envía archivos adjuntos
      } else if (distribucionSeleccionada === 'descargar') {
        await handleDescargarZip();
      }
      
    } else if (accionSeleccionada === 'drive') {
      // Si es Drive, usa la nueva función handleSubirDrive
      // NOTA: handleSubirDrive ahora maneja 'correo' internamente
      await handleSubirDrive();
      
    } else if (accionSeleccionada === 'url') {
      // Opción URL temporal
      alert('⚠️ Opción URL Temporal en desarrollo');
      setIsLoading(false);
      return;
    }
    
    // Nota: handleSubirDrive maneja el cierre del modal según la distribución
    
  } catch (error) {
    console.error('❌ Error procesando materiales:', error);
    alert(`❌ Error: ${error.message}`);
  } finally {
    setIsLoading(false);
  }
};
function App() {
  const handleGoogleSuccess = async (credentialResponse) => {
    // Enviar el token ID a tu backend
    const response = await fetch('${url_backend}/api/google-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: credentialResponse.credential })
    });
    
    const data = await response.json();
    console.log('Usuario autenticado:', data.user);
  };

  return (
    <GoogleOAuthProvider clientId="TU_CLIENT_ID_AQUI">
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={() => console.log('Error de login')}
      />
    </GoogleOAuthProvider>
  );
}
const [showEvaluacionFormativaModal, setShowEvaluacionFormativaModal] = useState(false);
const [evaluacionFormativaTexto, setEvaluacionFormativaTexto] = useState(null);
const [evaluacionFormativaMeta, setEvaluacionFormativaMeta] = useState(null);

const handleEvaluacionFormativa = async (guion_id, momento, tipo) => {
  console.log("📥 Generando evaluación formativa:", { guion_id, momento, tipo });

  setIsLoading(true);
  setCurrentGuionId(guion_id);

  // Limpieza previa
  setEvaluacionFormativaTexto(null);
  setEvaluacionFormativaMeta(null);

  try {
    const response = await axios.get(
      `${url_backend}/planificacion/${guion_id}/evaluacion_formativa`,
      {
        params: { momento, tipo }
      }
    );

    console.log("✅ Evaluación formativa recibida:", response.data);

    const evaluacion = response.data?.evaluacion_formativa;

    if (evaluacion && typeof evaluacion === "object") {
      setEvaluacionFormativaTexto(evaluacion);
      setEvaluacionFormativaMeta(response.data);
      setShowEvaluacionFormativaModal(true);
    } else {
      console.warn("⚠️ Evaluación formativa vacía o malformada");
    }

  } catch (error) {
    console.error("❌ Error al generar evaluación formativa:", error);
    alert(error.response?.data?.detail || error.message);
  } finally {
    setIsLoading(false);
  }
};

return (
    <div className="container-profesor">
        <Header />
        <div className='volver'>
        <Link to="/" className="link-back">🡐 Volver</Link>
        </div>
        <div className='container-body'>
        <div className="Principal">
            <h2>{nombreCurso}</h2>
        </div>
        <div className="content">
            <div className="unidades">
            <div className="unidades-tabs">
                {unidades.map(unidad => (
                <div key={unidad.id} className="unidad-card">
                    <Button
                    className={unidad.id === selectedUnidad ? "unidad-tab active" : "unidad-tab"}
                    onClick={() => handleUnidadClick(unidad.id, unidad.nombre)}
                    >
                    {unidad.nombre}
                    </Button>
                </div> 
                ))}
                {user.tipo === 2 && (
                <div className={`crear-unidad-tab ${showCrearUnidadForm ? 'show-form' : ''}`}>
                <button className="crear-unidad-button" onClick={() => setShowCrearUnidadForm(!showCrearUnidadForm)}>
                    +
                </button>
                <form onSubmit={handleSubmitNuevaUnidad} className="form-nueva-unidad">
                    <input
                    type="text"
                    value={nuevaUnidadNombre}
                    onChange={(e) => setNuevaUnidadNombre(e.target.value)}
                    placeholder="Nombre de la nueva unidad"
                    required
                    className="input-nueva-unidad" // Agrega una clase para aplicar estilos específicos al input
                    />
                    <div className="form-buttons-3">
                    <button className='btn-crear3' type="submit">Crear</button>
                    <button className='btn-cancelar3' type="button" onClick={() => setShowCrearUnidadForm(false)}>Cancelar</button>
                    </div>
                </form>
                </div>
                )}
            </div>
            </div>
    
            {selectedUnidad && (
            <div className="actividades">
                <div className='titulo-actividad'>
                <div className='nombreUnidad'>
                <h3>{getSelectedUnidadNombre()}</h3>

                {user.tipo === 2 && (
                    <div className='editar-unidad'>
                    {editandoUnidadId === selectedUnidad ? (
                        <form onSubmit={handleSubmitEditarUnidad} className="form-editar-unidad">
                        <input
                            type="text"
                            value={editandoUnidadNombre}
                            onChange={(e) => setEditandoUnidadNombre(e.target.value)}
                            placeholder="Nuevo nombre de la unidad"
                            required
                        />
                        <div className="form-buttons">
                            <button type="submit">Guardar</button>
                            <button type="button" onClick={handleCancelarEditarUnidad}>Cancelar</button>
                            <button onClick={() => handleBorrarUnidad(selectedUnidad)}>Borrar Unidad</button>
                        </div>
                        </form>
                    ) : (
                        
                        <button
                            className="editar-unidad-btn"
                            onClick={() => handleEditarUnidad(selectedUnidad, selectedUnidadNombre)}
                        >
                            <img src={Editar} alt="Imagen de editar" />
                        </button>
                        
                    )}
                    </div>
                )}
                </div>
                
                <div className='ver-cosas'>
                                {/* ACA EMPIEZA LA CAGA*/}

                    {/* ACA TERMINA LA CAGA*/}            
                    <div className="ver-botones">
                    <Link to={`/foro/${selectedUnidad}`} className="ver-foro">
                        <img src={Foro} alt="Ícono Foro" className="icono-foro" />
                        Foro de consultas
                    </Link>
                    </div>
                    {
                    user.tipo === 2 && (
                            <div className="ver-botones">
                                <Link to={`/corpus/${selectedUnidad}`} className="ver-corpus">
                                <img src={Docs} alt="Ícono Foro" className="icono-foro" />
                                Material de clases</Link>
                            </div>
                    )
                    }


                </div>
            </div>
                            
                <div className='unidad-buttons'>

                {user.tipo === 2 && (
                <div className="crear-actividad">
                    {!showCrearActividadForm ? (
                    <div>
                        {/* Botón para abrir el modal */}
                        {/*<Button variant="" onClick={openModalAct} className='btn-crear-act'> <div className="icon-circle"></div>Nueva Actividad </Button>
                         */}
                         {/* Botón para abrir el modal - DESHABILITADO */}
                        <Button 
                            variant="" 
                            onClick={openModalAct} 
                            className='btn-crear-act'
                            disabled 
                            style={{ opacity: 0.5, pointerEvents: 'none' }}
                        > 
                            <div className="icon-circle"></div>Nueva Actividad 
                        </Button>
                        {/* Modal */}
                            <div className="modal fade" id="actividadModal" tabIndex="-1" aria-labelledby="actividadModalLabel" aria-hidden="true">
                            <div className="modal-dialog">
                                <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title" id="actividadModalLabel">Nueva Actividad</h5>
                                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div className="modal-body">
                                <form onSubmit={handleSubmitNuevaActividad} className="form-nueva-actividad">
                                    <input
                                        type="text"
                                        value={nuevaActividadTitulo}
                                        onChange={(e) => setNuevaActividadTitulo(e.target.value)}
                                        placeholder="Título de la nueva actividad"
                                        required
                                    />
                                    <textarea
                                        value={nuevaActividadDescripcion}
                                        onChange={(e) => setNuevaActividadDescripcion(e.target.value)}
                                        placeholder="Descripción de la nueva actividad"
                                        required
                                    />
                                    <div>
                                        <label htmlFor="fileUpload">Ingresar PDF de la actividad:</label>
                                        <input
                                            type="file"
                                            id="fileUpload"
                                            accept="application/pdf"  // Aceptar solo archivos PDF
                                            style={{ display: 'none' }}
                                            onChange={handleFileChange}  // Llamar a la función cuando cambie el archivo
                                        />
                                        <button
                                            type="button"
                                            onClick={() => document.getElementById('fileUpload').click()}
                                            className="btn btn-primary"
                                            style={{ marginLeft: '10px' }}
                                        >
                                            Examinar
                                        </button>

                                        <div className="archivo-subido">
                                        {selectedFile && <p style={{marginLeft: '10px' }}>Archivo seleccionado: {selectedFile.name}</p>}</div>
                                    </div>
                                    <select value={nuevaActividadEstado} onChange={handleEstadoChange} required>
                                        <option value="" disabled>Seleccionar estado</option>
                                        <option value="1">Abierto</option>
                                        <option value="2">Oculto</option>
                                    </select>
    
                                    {nuevaActividadEstado === '2' && (
                                        <div className='fechas-actividad'>
                                        <label>Fecha de inicio:</label>
                                        <input
                                            type="date"
                                            value={nuevaActividadFechaInicio}
                                            onChange={(e) => setNuevaActividadFechaInicio(e.target.value)}
                                            required
                                        />
                                        <label>Hora de inicio:</label>
                                        <input
                                            type="time"
                                            value={nuevaActividadHoraInicio}
                                            onChange={(e) => setNuevaActividadHoraInicio(e.target.value)}
                                            required
                                        />
                                        </div>
                                    )}
                                    
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <label style={{ marginRight: '5px' }}>
                                            ¿Desea agregar fecha de cierre?
                                        </label>
                                        <input
                                            type="checkbox"
                                            checked={agregarFechaCierre}
                                            onChange={handleAgregarFechaCierreChange}
                                            className="checkbox-normal"
                                            style={{ width: '16px', height: '16px', margin: 0, padding: 0 }} // Ajusta el tamaño
                                        />
                                    </div>
                                    
                                    {agregarFechaCierre && (
                                        <>
                                        <label>Fecha de cierre:</label>
                                        <input
                                            type="date"
                                            value={nuevaActividadFechaCierre}
                                            onChange={(e) => setNuevaActividadFechaCierre(e.target.value)}
                                            required
                                        />
                                        <label>Hora de cierre:</label>
                                        <input
                                            type="time"
                                            value={nuevaActividadHoraCierre}
                                            onChange={(e) => setNuevaActividadHoraCierre(e.target.value)}
                                            required
                                        />
                                        </>
                                    )}
    
                                    <div className="form-buttons">
                                        <button type="submit" className="btn-crear" data-bs-dismiss="modal">Crear</button>
                                        <button type="button" className="btn-cancelar" data-bs-dismiss="modal">Cancelar</button>
                                    </div>
                                    </form>
                                </div>
                                </div>
                            </div>
                            </div>
                        </div>
    
                    ) : (
                        <form onSubmit={handleSubmitNuevaActividad} className="form-nueva-actividad">
                        <input
                            type="text"
                            value={nuevaActividadTitulo}
                            onChange={(e) => setNuevaActividadTitulo(e.target.value)}
                            placeholder="Título de la nueva actividad"
                            required
                        />
                        <textarea
                            value={nuevaActividadDescripcion}
                            onChange={(e) => setNuevaActividadDescripcion(e.target.value)}
                            placeholder="Descripción de la nueva actividad"
                            required
                        />
                        <div>
                                        <label htmlFor="fileUpload">Ingresar PDF de la actividad:</label>
                                        <input
                                            type="file"
                                            id="fileUpload"
                                            accept="application/pdf"  // Aceptar solo archivos PDF
                                            style={{ display: 'none' }}
                                            onChange={handleFileChange}  // Llamar a la función cuando cambie el archivo
                                        />
                                        <button
                                            type="button"
                                            onClick={() => document.getElementById('fileUpload').click()}
                                            className="btn btn-primary"
                                            style={{ marginLeft: '10px' }}
                                        >
                                            Examinar
                                        </button>

                                        {/* Mostrar el nombre del archivo si está seleccionado */}
                                        {selectedFile && <p style={{ marginLeft: '10px' }}>Archivo seleccionado: {selectedFile.name}</p>}
                                    </div>        
                        <select value={nuevaActividadEstado} onChange={handleEstadoChange} required>
                            <option value="" disabled>Seleccionar estado</option>
                            <option value="1">Abierto</option>
                            <option value="2">Oculto</option>
                        </select>
                  
                        {nuevaActividadEstado === '2' && (
                            <>
                            <label>Fecha de inicio:</label>
                            <input
                                type="date"
                                value={nuevaActividadFechaInicio}
                                onChange={(e) => setNuevaActividadFechaInicio(e.target.value)}
                                required
                            />
                            <label>Hora de inicio:</label>
                            <input
                                type="time"
                                value={nuevaActividadHoraInicio}
                                onChange={(e) => setNuevaActividadHoraInicio(e.target.value)}
                                required
                            />
                            </>
                        )}
                        
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                        <label style={{ marginRight: '5px' }}>
                            ¿Desea agregar fecha de cierre?
                        </label>
                        <input
                            type="checkbox"
                            checked={agregarFechaCierre}
                            onChange={handleAgregarFechaCierreChange}
                            className="checkbox-normal"
                            style={{ width: '16px', height: '16px', margin: 0, padding: 0 }} // Ajusta el tamaño
                            />
                        </div>
                        
                        {agregarFechaCierre && (
                            <>
                            <label>Fecha de cierre:</label>
                            <input
                                type="date"
                                value={nuevaActividadFechaCierre}
                                onChange={(e) => setNuevaActividadFechaCierre(e.target.value)}
                                required
                            />
                            <label>Hora de cierre:</label>
                            <input
                                type="time"
                                value={nuevaActividadHoraCierre}
                                onChange={(e) => setNuevaActividadHoraCierre(e.target.value)}
                                required
                            />
                            </>
                        )}
                        <div className="form-buttons">
                        <button type="submit" className="btn-crear">Crear</button>
                        <button type="button" className="btn-cancelar" onClick={() => setShowCrearActividadForm(false)}>Cancelar</button>
                        </div>
                    </form>
                    )}
                </div>
                )}
                
                {user.tipo === 2 && (
                <div className="crear-evaluacion">
                    {!showCrearEvaluacionForm ? (
                    <div>
                        {/* Botón para abrir el modal */}
                       {/* <Button variant="" onClick={openModalEval} className='btn-crear-eval'>         
                            <div className="icon-circle"></div>
                            Nueva Evaluación 
                        </Button>
                        */}
                        {/* Botón para abrir el modal - DESHABILITADO */}
                <Button 
                    variant="" 
                    onClick={openModalEval} 
                    className='btn-crear-eval'
                    disabled 
                    style={{ opacity: 0.5, pointerEvents: 'none' }}
                >         
                    <div className="icon-circle"></div>
                    Nueva Evaluación 
                </Button>
                        {/* Modal */}
                            <div className="modal fade" id="evaluacionModal" tabIndex="-1" aria-labelledby="evaluacionModalLabel" aria-hidden="true">
                            <div className="modal-dialog">
                                <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title" id="evaluacionModalLabel">Nueva Evaluación</h5>
                                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div className="modal-body">
                                    <form onSubmit={handleSubmitNuevaEvaluacion} className="form-nueva-evaluacion">
                                    <label htmlFor="titulo">Título:</label>
                                    <input
                                        id = "titulo"
                                        name = "titulo"
                                        type="text"
                                        value={nuevaEvaluacionTitulo}
                                        onChange={(e) => setNuevaEvaluacionTitulo(e.target.value)}
                                        placeholder="Título de la Evaluación"
                                        required
                                    />
                                    <label htmlFor="descripcion">Descripción:</label>
                                    <textarea
                                        id = "descripcion"
                                        name = "descripcion"
                                        value={nuevaEvaluacionDescripcion}
                                        onChange={(e) => setNuevaEvaluacionDescripcion(e.target.value)}
                                        placeholder="Descripción de la Evaluación"
                                        required
                                    />
                                    <label htmlFor="preguntas_desarrollo">Cantidad de preguntas de Desarrollo:</label>
                                    <input 
                                        id = "preguntas_desarrollo"
                                        name = "cant_preguntas_desarrollo"
                                        type="number" 
                                        value={nuevaEvaluacionPregDesarrollo}
                                        onChange={(e) => setNuevaEvaluacionPregDesarrollo(e.target.value)}
                                        min="0"
                                        max="100" 
                                        step="1"
                                        placeholder="Cantidad de preguntas de Desarrollo"
                                        required
                                    />
                                    <label htmlFor="preguntas_alternativas">Cantidad de preguntas de Alternativas:</label>
                                    <input 
                                        id = "preguntas_alternativas"
                                        name = "cant_preguntas_alternativas"
                                        type="number" 
                                        value={nuevaEvaluacionPregAlternativas}
                                        onChange={(e) => setNuevaEvaluacionPregAlternativas(e.target.value)}
                                        min="0"
                                        max="100" 
                                        step="1"
                                        placeholder="Cantidad de preguntas de Alternativas"
                                        required
                                    />
                                    <label htmlFor="preguntas_vf">Cantidad de preguntas de Verdadero/Falso:</label>
                                    <input 
                                        id = "preguntas_vf"
                                        name = "cant_preguntas_vf"
                                        type="number" 
                                        value={nuevaEvaluacionPregVF}
                                        onChange={(e) => setNuevaEvaluacionPregVF(e.target.value)}
                                        min="0"
                                        max="100" 
                                        step="1"
                                        placeholder="Cantidad de preguntas de Verdadero/Falso"
                                        required
                                    />
                                     <label htmlFor="versiones">Cantidad de versiones:</label>
                                    <input
                                        id="versiones"
                                        name="versiones"
                                        type="number"
                                        value={nuevaEvaluacionversiones}
                                        onChange={(e) => setNuevaEvaluacionversiones(e.target.value)}
                                        min="1"
                                        max="10"
                                        step="1"
                                        placeholder="Cantidad de versiones"
                                        required
                                    />  
                                    <label htmlFor="ptje_total">Puntaje total:</label>
                                    <input 
                                        id = "ptje_total"
                                        name = "ptje_total"
                                        type="number" 
                                        value={nuevaEvaluacionPtje}
                                        onChange={(e) => setNuevaEvaluacionPtje(e.target.value)}
                                        min="1"
                                        max="100" 
                                        step="1"
                                        placeholder="Puntaje total de la evaluación"
                                        required
                                    />
                                    <div className="form-buttons">
                                        <button type="submit" className="btn-preview"  data-bs-dismiss="modal">Vista Previa</button>
                                        <button type="button" className="btn-cancelar" data-bs-dismiss="modal">Cancelar</button>
                                    </div>
                                    {isLoading && (
                                        <div className="loading-spinner">
                                            <div className="loading-ring"></div>
                                            <p className="loading-text">Cargando...</p>
                                        </div>
                                    )}
    
    
                                    </form>
                                </div>
                                </div>
                            </div>
                            </div>
                        </div>   
                    ) : (
                    <form onSubmit={handleSubmitNuevaEvaluacion} className="form-nueva-evaluacion">
                        <label htmlFor="titulo">Título:</label>
                        <input
                        id = "titulo"
                        name = "titulo"
                        type="text"
                        value={nuevaEvaluacionTitulo}
                        onChange={(e) => setNuevaEvaluacionTitulo(e.target.value)}
                        placeholder="Título de la Evaluación"
                        required
                        />
                        <label htmlFor="descripcion">Descripción:</label>
                        <textarea
                        id = "descripcion"
                        name = "descripcion"
                        value={nuevaEvaluacionDescripcion}
                        onChange={(e) => setNuevaEvaluacionDescripcion(e.target.value)}
                        placeholder="Descripción de la Evaluación"
                        required
                        />
                        <label htmlFor="preguntas_desarrollo">Cantidad de preguntas de Desarrollo:</label>
                        <input 
                        id = "preguntas_desarrollo"
                        name = "cant_preguntas_desarrollo"
                        type="number" 
                        value={nuevaEvaluacionPregDesarrollo}
                        onChange={(e) => setNuevaEvaluacionPregDesarrollo(e.target.value)}
                        min="0"
                        max="100" 
                        step="1"
                        placeholder="Cantidad de preguntas de Desarrollo"
                        required
                        />
                        <label fohtmlForr="preguntas_alternativas">Cantidad de preguntas de Alternativas:</label>
                        <input 
                        id = "preguntas_alternativas"
                        name = "cant_preguntas_alternativas"
                        type="number" 
                        value={nuevaEvaluacionPregAlternativas}
                        onChange={(e) => setNuevaEvaluacionPregAlternativas(e.target.value)}
                        min="0"
                        max="100" 
                        step="1"
                        placeholder="Cantidad de preguntas de Alternativas"
                        required
                        />
                        <label htmlFor="preguntas_vf">Cantidad de preguntas de Verdadero/Falso:</label>
                        <input 
                        id = "preguntas_vf"
                        name = "cant_preguntas_vf"
                        type="number" 
                        value={nuevaEvaluacionPregVF}
                        onChange={(e) => setNuevaEvaluacionPregVF(e.target.value)}
                        min="0"
                        max="100" 
                        step="1"
                        placeholder="Cantidad de preguntas de Verdadero/Falso"
                        required
                        />
                        <label htmlFor="versiones">Cantidad de versiones:</label>
                        <input
                        id="versiones"
                        name="versiones"
                        type="number"
                        value={nuevaEvaluacionversiones}
                        onChange={(e) => setNuevaEvaluacionversiones(e.target.value)}
                        min="1"
                        max="10"
                        step="1"
                        placeholder="Cantidad de versiones"
                        required
                        />  
                        <label htmlFor="ptje_total">Puntaje total:</label>
                        <input 
                        id = "ptje_total"
                        name = "ptje_total"
                        type="number" 
                        value={nuevaEvaluacionPtje}
                        onChange={(e) => setNuevaEvaluacionPtje(e.target.value)}
                        min="1"
                        max="100" 
                        step="1"
                        placeholder="Puntaje total de la evaluación"
                        required
                        />
                        <div className="form-buttons">
                        <button type="submit" className="btn-crear">Crear</button>
                        <button type="button" className="btn-cancelar" onClick={() => setShowCrearEvaluacionForm(false)}>Cancelar</button>
                        </div>
                    </form>
                    )}
                </div>
                )}
                {user.tipo === 2 && (
                    <div className="crear-evaluacion">
                        {/* Botón para abrir el modal */}
                         {/* <Button variant="" onClick={openModalPreguntas} className="btn-crear-eval">
                            <div className="icon-circle"></div>
                            Generar Preguntas
                        </Button> */}
                        <Button 
                        variant="" 
                        onClick={openModalPreguntas} 
                        className="btn-crear-eval"
                        disabled 
                        style={{ opacity: 0.5, pointerEvents: 'none' }}
                    >
                        <div className="icon-circle"></div>
                        Generar Preguntas
                    </Button>
                        {/* Modal de "Generar Preguntas" */}
                        <Modal show={showGenerarPreguntasModal} onHide={closeModalPreguntas} centered>
                            <Modal.Header>
                                <Modal.Title>Generar Preguntas</Modal.Title>
                                <Button variant="outline-secondary" className="btn-close" onClick={closeModalPreguntas}>✖</Button>
                            </Modal.Header>

                            <Modal.Body>
                                {/* FORMULARIO DE GENERACIÓN */}
                                {mostrarFormulario && !isLoading && (
                                    <form onSubmit={handleGenerarPreguntas}>
                                        <label>Desarrollo:</label>
                                        <input type="number" value={cantidadPreguntas.desarrollo} 
                                            onChange={(e) => setCantidadPreguntas({...cantidadPreguntas, desarrollo: e.target.value})} />

                                        <label>Alternativas:</label>
                                        <input type="number" value={cantidadPreguntas.alternativas} 
                                            onChange={(e) => setCantidadPreguntas({...cantidadPreguntas, alternativas: e.target.value})} />

                                        <label>Verdadero/Falso:</label>
                                        <input type="number" value={cantidadPreguntas.verdaderoFalso} 
                                            onChange={(e) => setCantidadPreguntas({...cantidadPreguntas, verdaderoFalso: e.target.value})} />

                                        <label>Dificultad:</label>
                                        <select value={dificultad} onChange={(e) => setDificultad(e.target.value)}>
                                            <option value="facil">Fácil</option>
                                            <option value="intermedio">Intermedio</option>
                                            <option value="avanzado">Avanzado</option>
                                        </select>

                                        <div className="form-buttons">
                                            <Button type="submit" variant="primary">Generar</Button>
                                            <Button variant="danger" onClick={closeModalPreguntas}>Cancelar</Button>
                                        </div>
                                    </form>
                                )}

                                {/* PANTALLA DE CARGA */}
                                {isLoading && (
                                    <div className="loading-spinner">
                                        <div className="loading-ring"></div>
                                        <p className="loading-text">Generando preguntas...</p>
                                    </div>
                                )}

                                {/* VISTA DETALLADA DE PREGUNTAS GENERADAS */}
                                {!mostrarFormulario && !isLoading && preguntasGeneradas.length > 0 && (
                                    <div className="preguntas-generadas">
                                        <h5>Preguntas Generadas:</h5>
                                        {preguntasGeneradas.map((pregunta, index) => (
                                            <div key={index} className="pregunta-item">
                                                <p><strong>Pregunta {index + 1}:</strong></p>
                                                <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                                                    {pregunta}
                                                </pre>
                                                <button className="btn-copy" onClick={() => handleCopyQuestion(pregunta)}>📋 Copiar</button>

                                            </div>
                                        ))}
                                        <Button variant="info" onClick={handleCopyQuestions}>📋 Copiar Todas</Button>
                                    </div>
                                )}
                            </Modal.Body>
                        </Modal>
                        
                    </div>
                )}
                {user.tipo === 2 && (
                    <div className="crear-guion">
                        <Button
                        variant=""
                        onClick={openModalGuion}
                        className="btn-crear-guion"
                        >
                        <div className="icon-circle"></div>
                        Nuevo Guión de Clase
                        </Button>
                    </div>
                    )}

               {/*✅ y este cierra correctamente el condicional*/}


                </div>
                
                                
                {actividades.length > 0 ? (
    <ul className="actividades-list">
        {actividades.map(actividad => (
            shouldShowActividad(actividad) && (
                <li key={actividad.id} className={`actividad-card ${selectedActividad === actividad.id ? 'expanded' : ''}`}>
                    <div className="actividad-content">
                        <div className="actividad-nombre">{actividad.titulo}</div>
                        <div><b>Estado:</b> {getEstadoTexto(actividad.estado)}</div>
                        <button
                            className="expand-button"
                            onClick={() => handleActividadClick(actividad.id, actividad.titulo, actividad.descripcion, actividad.estado, actividad.fecha_inicio, actividad.fecha_cierre, actividad.hora_inicio, actividad.hora_cierre)}
                        >
                            {selectedActividad === actividad.id ? 'Colapsar' : 'Expandir'}
                        </button>
                    </div>
                    {selectedActividad === actividad.id && (
                        <>
                        <div className="actividad-descripcion">     
                                {actividad.fecha_inicio && (
                                    <>
                                        <b>Fecha de Inicio:</b> {formatDate(actividad.fecha_inicio)} {(actividad.hora_inicio)}
                                        <br />
                                    </>
                                )}
                                {actividad.fecha_cierre && (
                                    <>
                                        <b>Fecha de Cierre:</b> {formatDate(actividad.fecha_cierre) } {(actividad.hora_cierre)}
                                    </>
                                )}
                            </div>
                                
                            <div className="actividad-descripcion">{actividad.descripcion}</div>

                            <div className="actividad-actions">
                                {user.tipo === 2 && (
                                    <div className="actividad-options">
                                        {editingActividadId === actividad.id ? (
                                        <div>
                                            <div className='btn-6'>
                                            <button onClick={() => handleEditarActividad(actividad.id, actividad.titulo, actividad.descripcion, actividad.estado)} className="editar-button">Editar</button>
                                            <button onClick={() => handleBorrarActividad(actividad.id)} className="eliminar-button">Eliminar</button>
                                            </div>
                                            <div className='btn-5'>
                                            <div className="ver-botones">
                                                <Link to={`/respuestas/${selectedActividad}`} className="ver-respuestas">Ver respuestas</Link>
                                            </div>
                                            </div>
                                        </div>
                                        ) : (
                                            <>
                                                <div className='btn-6'>
                                                <button onClick={() => handleEditarActividad(actividad.id, actividad.titulo, actividad.descripcion, actividad.estado)} className="editar-button">Editar</button>
                                                <button onClick={() => handleBorrarActividad(actividad.id)} className="eliminar-button">Eliminar</button>
                                                </div>
                                                <div className='btn-5'>
                                                    <div className="ver-botones">
                                                        <Link to={`/respuestas/${selectedActividad}`} className="ver-respuestas">Ver respuestas</Link>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                            {user.tipo === 1 && (
                                <div className='btn-7'>
                                    <div className="respuesta">
                                        {!mostrarRespuesta ? (
                                            <div className='btn-respuesta'>
                                                <button className="tipo1-btn btn-responder" onClick={handleMostrarRespuesta}>Responder</button>
                                            </div>
                                        ) : (
                                            <>
                                                <hr />
                                                <div className='answer'>
                                                <h3>Respuesta</h3>
                                {respuestaActividad.length > 0 ? (
                                    respuestaActividad.map((resp, index) => (
                                        <div key={index}>
                                            <p><b>Archivo:</b> {resp.archivo}</p>
                                            <p><b>Fecha:</b> {formatDate(resp.fecha)}</p>
                                            <p><b>Feedback:</b></p> <p> {processFeedback(resp.feedback)}</p>
                                            <div className='btn-respuesta'>
                                                {actividad.estado !== 3 && (
                                                    <button type="button" onClick={() => handleBorrarRespuesta( resp.respuesta_id)} className="cancelar-button-2">Eliminar Respuesta</button>
                                                )}
                                            </div>
                                            {index < respuestaActividad.length - 1 && <hr />} {/* Separador entre respuestas */}
                                        </div>
                                    ))
                                ) : (
                                    <p>No hay respuestas para esta actividad.</p>
                                )}

                                <hr /> {/* Separador entre las respuestas y el formulario de subida */}

                                {actividad.estado !== 3 && (
                                <div className='resp-examinar'>
                                    <form onSubmit={handleAgregarRespuesta} className="form-responder-actividad">
                                        <label htmlFor="fileUpload">Seleccionar archivo:</label>
                                        <input
                                            type="file"
                                            id="fileUpload"
                                            style={{ display: 'none' }}
                                            onChange={handleFileChange}
                                        />
                                        <button className="btn-examinar-resp" type="button" onClick={() => document.getElementById('fileUpload').click()} style={{ marginLeft: '10px' }}>Examinar</button>
                                        {selectedFile && <p style={{ marginLeft: '10px' }}>Archivo seleccionado: {selectedFile.name}</p>}
                                        <div className="form-buttons-2">
                                            <button type="submit" className="responder-button-2 btn-guardar-resp">Guardar Respuesta</button>
                                            <button type="button" onClick={handleOcultarRespuesta} className="cancelar-button-2 btn-cancelar-resp">Cancelar</button>
                                        </div>
                                        {isLoading && (
                                            <div className="loading-spinner">
                                                <div className="loading-ring"></div>
                                                <p className="loading-text">Cargando...</p>
                                            </div>
                                        )}

                                    </form>
                                </div>
                                )}
                                {actividad.estado == 3 && (
                                    <div><b>La actividad se encuentra cerrada, ya no puedes responder esta actividad</b></div>
                                )}
                            </div>
                            </>
                        )}
                        </div>
                    </div>
                    )}
                </>
            )}
            </li>
        )))}
    </ul>
    ) : (
    <p>No hay actividades disponibles para esta unidad.</p>
    )}
    </div>
)}


{user.tipo === 2 && (
    evaluaciones && evaluaciones.length > 0 && (
        <ul className="actividades-list">
            <br></br><h3>Evaluaciones:</h3>
            {evaluaciones.map(evaluacion => (
                <li key={evaluacion.id} className={`evaluacion-card ${selectedEvaluacion === evaluacion.id ? 'expanded' : ''}`}>
                    <div className="actividad-content">
                        <div className="actividad-nombre">{evaluacion.titulo}</div>
                        <button
                            className="expand-button"
                            onClick={() => {
                                setSelectedEvaluacion(selectedEvaluacion === evaluacion.id ? null : evaluacion.id);
                                setShowOptions(false); // Cierra el cuadro de descargas al colapsar o expandir
                            }}
                        >
                            {selectedEvaluacion === evaluacion.id ? 'Colapsar' : 'Expandir'}
                        </button>
                    </div>
                    {selectedEvaluacion === evaluacion.id && (
                        <div className="actividad-descripcion">
                            <p>{evaluacion.descripcion}</p>
                            <div className="evaluacion-contenedor">
                                <div className="btn-6">
                                    <div style={{ position: 'relative' }}> {/* Contenedor relativo */}
                                        <button
                                            onClick={() => handleResponderEvaluacion(evaluacion.id)}
                                            className="responder-evaluacion-button"
                                        >
                                            Simular Evaluación
                                        </button>
                                        <button
                                            onClick={handleButtonClick}
                                            className="descargar-evaluacion-button"
                                        >
                                            Descargar Evaluación
                                        </button>
                                        <button
                                            onClick={() => handleBorrarEvaluacion(evaluacion.id)}
                                            className="eliminar-evaluacion-button"
                                        >
                                            Eliminar
                                        </button>
                                        {showOptions && (
                                            <div className="options-dropdown">
                                                <button onClick={() => { handleDocsDownload(evaluacion); setShowOptions(false); }}>
                                                    Descargar DOC
                                                </button>
                                                <button onClick={() => { handlePDFDownload(evaluacion); setShowOptions(false); }}>
                                                    Descargar PDF
                                                </button>
                                                <button onClick={() => { handleMoodleExport(evaluacion); setShowOptions(false); }}>
                                                    Exportar a Moodle
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </li>
            ))}
        </ul>
    )
)}


{user.tipo === 2 && guiones && guiones.length > 0 && (
  <div className="guiones-container">
    {/* Título primero */}
    <h3>Guiones de Clase:</h3>
    
    {/* Contenedor para ambos botones */}
    <div className="mb-3 d-flex align-items-center gap-2">
      {/* Botón Compartir Material (existente) */}
      <button
        onClick={() => setShowEnvioModal(true)}
        className="btn compartir-general-button"
        style={{
          backgroundColor: "#28a745",
          borderColor: "#28a745",
          color: "white",
          padding: "8px 16px",
          fontWeight: "600",
          borderRadius: "6px",
          fontSize: "14px"
        }}
      >
        📧 Compartir Material con Estudiantes
      </button>
    </div>

    {/* Lista de guiones */}
    <ul className="actividades-list">
      {guiones.map((guion) => (
        <li
          key={guion.guion_id}
          className={`evaluacion-card ${selectedGuion === guion.guion_id ? 'expanded' : ''}`}
        >
          <div className="actividad-content">
            <div className="actividad-nombre">{guion.titulo}</div>
            <button
              className="expand-button"
              onClick={() => {
                setSelectedGuion(selectedGuion === guion.guion_id ? null : guion.guion_id);
                setShowOptions(false);
              }}
            >
              {selectedGuion === guion.guion_id ? 'Colapsar' : 'Expandir'}
            </button>
          </div>

          {selectedGuion === guion.guion_id && (
            <div className="actividad-descripcion">
              <div className="evaluacion-contenedor">
                <div style={{ position: "relative" }}>
                  <button
                    onClick={() => handleVerPlanificacion(guion)}
                    className="responder-evaluacion-button"
                  >
                    Ver Planificación
                  </button>

                  <button
                    onClick={() => handleDescargarGuionPDF(guion)}
                    className="descargar-evaluacion-button"
                  >
                    Descargar PDF
                  </button>

                  <button
                    onClick={() => handleEliminarGuion(guion.guion_id)}
                    className="eliminar-evaluacion-button"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          )}
        </li>
      ))}
    </ul>

  {/* Loading overlay para eliminar guiones */}
  {isLoading && (
    <div className="loading-overlay">
      <div className="loading-spinner">
        <div className="loading-ring"></div>
        <p className="loading-text">Eliminando...</p>
      </div>
    </div>
  )}
</div>
)}
</div>
</div>
        
        {/* MODAL NUEVA ACTIVIDAD */}
        <div className="modal-container">
        <Modal show={showActividadModal} onHide={closeModalAct}>
        <Modal.Header closeButton>
            <Modal.Title>Nueva actividad</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <form onSubmit={handleSubmitNuevaActividad} className="form-nueva-actividad">       
            <label htmlFor="titulo">Título:</label>
            <input
                type="text"
                value={nuevaActividadTitulo}
                onChange={(e) => setNuevaActividadTitulo(e.target.value)}
                placeholder="Título de la nueva actividad"
                required
            />
            <label htmlFor="titulo">Descripción:</label>
            <textarea
                value={nuevaActividadDescripcion}
                onChange={(e) => setNuevaActividadDescripcion(e.target.value)}
                placeholder="Descripción de la nueva actividad"
                required
            />
            <div className='examinar-button'>
                <label htmlFor="fileUpload">Ingresar PDF de la actividad:</label>
                <input
                    type="file"
                    id="fileUpload"
                    accept="application/pdf"  // Aceptar solo archivos PDF
                    style={{ display: 'none' }}
                    onChange={handleFileChange}  // Llamar a la función cuando cambie el archivo
                />
                <button
                    type="button"
                    onClick={() => document.getElementById('fileUpload').click()}
                    className="btn btn-primary"
                    style={{ marginLeft: '10px' }}
                >
                    Examinar
                </button>

                {/* Mostrar el nombre del archivo si está seleccionado */}
                {selectedFile && <p style={{ marginLeft: '10px' }}>Archivo seleccionado: {selectedFile.name}</p>}
            </div>
        <select value={nuevaActividadEstado} onChange={handleEstadoChange} required>
            <option value="" disabled>Seleccionar estado</option>
            <option value="1">Abierto</option>
            <option value="2">Oculto</option>
        </select>
    
            {nuevaActividadEstado === '2' && (
                <>
                <label>Fecha de inicio:</label>
                <input
                type="date"
                value={nuevaActividadFechaInicio}
                onChange={(e) => setNuevaActividadFechaInicio(e.target.value)}
                required
                />
                <label>Hora de inicio:</label>
                <input
                type="time"
                value={nuevaActividadHoraInicio}
                onChange={(e) => setNuevaActividadHoraInicio(e.target.value)}
                required
            />
            </>
        )}
        
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <label style={{ marginRight: '5px' }}>
                ¿Desea agregar fecha de cierre?
            </label>
            <input
                type="checkbox"
                checked={agregarFechaCierre}
                onChange={handleAgregarFechaCierreChange}
                className="checkbox-normal"
                style={{ width: '16px', height: '16px', margin: 0, padding: 0 }} // Ajusta el tamaño
            />
        </div>
        
        {agregarFechaCierre && (
        <>
            <label>Fecha de cierre:</label>
            <input
            type="date"
            value={nuevaActividadFechaCierre}
            onChange={(e) => setNuevaActividadFechaCierre(e.target.value)}
            required
            />
            <label>Hora de cierre:</label>
            <input
            type="time"
            value={nuevaActividadHoraCierre}
            onChange={(e) => setNuevaActividadHoraCierre(e.target.value)}
            required
            />
        </>
        )}
        </form>
    
        </Modal.Body>
        <Modal.Footer>
            <div className="form-buttons">
            <button type="submit" className="btn btn-primary btn-nueva-act" onClick={handleSubmitNuevaActividad}>Crear</button>
            <button type="button" className="btn btn-secondary  btn-cerrar-act" onClick={closeModalAct}>Cancelar</button>
            </div>
            {isLoading && (
                <div className="loading-spinner">
                    <div className="loading-ring"></div>
                    <p className="loading-text">Cargando...</p>
                </div>
            )}
        </Modal.Footer>
        </Modal>
        </div>
    
        {/* MODAL NUEVA EVALUACION */}
        <Modal show={showEvaluacionModal} onHide={closeModalEval}>
        <Modal.Header closeButton>
            <Modal.Title>Nueva Evaluación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <form onSubmit={handleSubmitNuevaEvaluacion} className="form-nueva-evaluacion">
            <label htmlFor="titulo">Título:</label>
            <input
                id = "titulo"
                name = "titulo"
                type="text"
                value={nuevaEvaluacionTitulo}
                onChange={(e) => setNuevaEvaluacionTitulo(e.target.value)}
                placeholder="Título de la Evaluación"
                required
            />
            <label htmlFor="descripcion">Descripción:</label>
            <textarea
                id = "descripcion"
                name = "descripcion"
                value={nuevaEvaluacionDescripcion}
                onChange={(e) => setNuevaEvaluacionDescripcion(e.target.value)}
                placeholder="Descripción de la Evaluación"
                required
            />
            <label htmlFor="dificultad">Nivel de Dificultad:</label>
            <select
                id="dificultad"
                name="dificultad"
                value={nuevaEvaluacionDificultad}
                onChange={(e) => setNuevaEvaluacionDificultad(e.target.value)}
                required
            >
                <option value="">Seleccione una opción</option>
                <option value="Facil">Facil</option>
                <option value="Intermedio">Intermedio</option>
                <option value="Avanzado">Avanzado</option>
            </select>
            <label htmlFor="preguntas_desarrollo">Cantidad de preguntas de Desarrollo:</label>
            <input 
                id = "preguntas_desarrollo"
                name = "cant_preguntas_desarrollo"
                type="number" 
                value={nuevaEvaluacionPregDesarrollo}
                onChange={(e) => setNuevaEvaluacionPregDesarrollo(e.target.value)}
                min="0"
                max="100" 
                step="1"
                placeholder="Cantidad de preguntas de Desarrollo"
                required
            />
            <label htmlFor="preguntas_alternativas">Cantidad de preguntas de Alternativas:</label>
            <input 
                id = "preguntas_alternativas"
                name = "cant_preguntas_alternativas"
                type="number" 
                value={nuevaEvaluacionPregAlternativas}
                onChange={(e) => setNuevaEvaluacionPregAlternativas(e.target.value)}
                min="0"
                max="100" 
                step="1"
                placeholder="Cantidad de preguntas de Alternativas"
                required
            />
            <label htmlFor="preguntas_vf">Cantidad de preguntas de Verdadero/Falso:</label>
            <input 
                id = "preguntas_vf"
                name = "cant_preguntas_vf"
                type="number" 
                value={nuevaEvaluacionPregVF}
                onChange={(e) => setNuevaEvaluacionPregVF(e.target.value)}
                min="0"
                max="100" 
                step="1"
                placeholder="Cantidad de preguntas de Verdadero/Falso"
                required
            />
             <label htmlFor="versiones">Cantidad de versiones:</label>
            <input
                id="versiones"
                name="versiones"
                type="number"
                value={nuevaEvaluacionversiones}
                onChange={(e) => setNuevaEvaluacionversiones(e.target.value)}
                min="1"
                max="10"
                step="1"
                placeholder="Cantidad de versiones"
                required
            />  
            </form>
        </Modal.Body>
        <Modal.Footer>
            <div className="form-buttons">
            <button type="button" className="btn btn-primary btn-vista-previa" onClick={handleSubmitNuevaEvaluacion}>Vista Previa</button>
            <button type="button" className="btn btn-secondary  btn-cerrar-eval" onClick={closeModalEval}>Cancelar</button>
            {isLoading && (
                <div className="loading-spinner">
                    <div className="loading-ring"></div>
                    <p className="loading-text">Cargando...</p>
                </div>
            )}
    
    
            </div>
        </Modal.Footer>
        </Modal>
    
    <Modal show={showPreviewModal} onHide={closePreviewModal} size="lg">
        <Modal.Header closeButton>
            <Modal.Title>Vista Previa de la Evaluación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <div className="modal-body">
                {/* Mostrar título y descripción */}
                <p><strong>Título:</strong> {preguntasEvaluacion?.evaluacion?.titulo || 'Título no disponible'}</p>
                <p><strong>Descripción:</strong> {preguntasEvaluacion?.evaluacion?.descripcion || 'Descripción no disponible'}</p>
    
                {/* Renderizar preguntas asociadas a la evaluación */}
                <div className="preguntas-container">
                    {preguntasEvaluacion?.preguntas && (
                        <>
                            <h5>Preguntas de Alternativas</h5>
                            {preguntasEvaluacion.preguntas.alternativas.length > 0 ? (
                                preguntasEvaluacion.preguntas.alternativas.map((pregunta, index) => (
                                    <div key={index} className="pregunta-item">
                                        <p><strong>Enunciado:</strong> {pregunta.enunciado}</p>
                                        <p>A) {pregunta.respuesta_a}</p>
                                        <p>B) {pregunta.respuesta_b}</p>
                                        <p>C) {pregunta.respuesta_c}</p>
                                        <p>D) {pregunta.respuesta_d}</p>
                                        {pregunta.respuesta_e && <p>E) {pregunta.respuesta_e}</p>}
                                        <p><strong>Correcta:</strong> {pregunta.correcta}</p>
                                        <p><strong>Puntaje:</strong> {pregunta.puntaje || 0}</p> {/* Mostrar puntaje */}
                                        <button 
                                            className="btn-danger"
                                            onClick={() => handleBorrarPreguntaAlternativa(pregunta.id)}
                                        >
                                            Eliminar Pregunta
                                        </button>
                                        <button 
                                            className="btn-warning"
                                            onClick={() => handleOpenEditModal(pregunta, 'alternativa')}
                                        >
                                            Editar Pregunta
                                        </button>
                                        <button 
                                            className="btn-regenerar"
                                            onClick={() => handleRegenerarPregunta(pregunta, 'alternativa',preguntasEvaluacion.evaluacion.thread)}
                                        >
                                            Regenerar Pregunta
                                        </button>
                                    </div>
                                ))
                            ) : <p>No hay preguntas de alternativas.</p>}
    
                            <h5>Preguntas de Verdadero/Falso</h5>
                            {preguntasEvaluacion.preguntas.vf.length > 0 ? (
                                preguntasEvaluacion.preguntas.vf.map((pregunta, index) => (
                                    <div key={index} className="pregunta-item">
                                        <p><strong>Enunciado:</strong> {pregunta.enunciado}</p>
                                        <p><strong>Correcta:</strong> {pregunta.correcta}</p>
                                        <p><strong>Puntaje:</strong> {pregunta.puntaje || 0}</p> {/* Mostrar puntaje */}
                                        <button 
                                            className="btn-danger"
                                            onClick={() => handleBorrarPreguntaVF(pregunta.id)}
                                        >
                                            Eliminar Pregunta
                                        </button>
                                        <button 
                                            className="btn-warning"
                                            onClick={() => handleOpenEditModal(pregunta, 'vf')}
                                        >
                                            Editar Pregunta
                                        </button>
                                        <button 
                                            className="btn-regenerar"
                                            onClick={() => handleRegenerarPregunta(pregunta, 'vf',preguntasEvaluacion.evaluacion.thread)}
                                        >
                                            Regenerar Pregunta
                                        </button>
                                    </div>
                                ))
                            ) : <p>No hay preguntas de Verdadero/Falso.</p>}
    
                            <h5>Preguntas de Desarrollo</h5>
                            {preguntasEvaluacion.preguntas.desarrollo.length > 0 ? (
                                preguntasEvaluacion.preguntas.desarrollo.map((pregunta, index) => (
                                    <div key={index} className="pregunta-item">
                                        <p><strong>Enunciado:</strong> {pregunta.enunciado}</p>
                                        <p><strong>Correcta:</strong> {pregunta.respuesta}</p>
                                        <p><strong>Puntaje:</strong> {pregunta.puntaje || 0}</p> {/* Mostrar puntaje */}
                                        <p></p>
                                        <button 
                                            className="btn-danger"
                                            onClick={() => handleBorrarPreguntaDesarrollo(pregunta.id)}
                                        >
                                            Eliminar Pregunta
                                        </button>
                                        <button 
                                            className="btn-warning"
                                            onClick={() => handleOpenEditModal(pregunta, 'desarrollo')}
                                        >
                                            Editar Pregunta
                                        </button>
                                        <button 
                                            className="btn-regenerar"
                                            onClick={() => handleRegenerarPregunta(pregunta,'desarrollo',preguntasEvaluacion.evaluacion.thread)}
                                        >
                                            Regenerar Pregunta
                                        </button>
                                    </div>
                                ))
                            ) : <p>No hay preguntas de desarrollo.</p>}
                        </>
                    )}
                    {isLoading && (
                         <div className="loading-spinner">
                        <div className="loading-ring"></div>
                        <p className="loading-text">Regenerando pregunta...</p>
                        </div>
                    )}
                </div>
            </div>
        </Modal.Body>
        <Modal.Footer className="sticky-footer">
            <div className="form-buttons">
            <button type="button" className="btn-primary btn-cerrar-preview" onClick={closePreviewModal}>Confirmar</button>
                <button 
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                        handleBorrarEvaluacion(selectedEvaluacion);
                        closePreviewModal(); // Cerrar el modal después de eliminar
                    }}
                >
                    Cancelar
                </button>
            </div>
        </Modal.Footer>
    </Modal>
    
    
    
    
    
            {/* MODAL editar actividad */}
        <Modal show={showEditActModal} onHide={closeModalEditAct}>
        <Modal.Header closeButton>
            <Modal.Title>Editar Actividad</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <form onSubmit={handleSubmitEditarActividad}>
        <input
        type="text"
        value={editingActividadTitulo}
        onChange={(e) => setEditingActividadTitulo(e.target.value)}
        placeholder="Nuevo título de la actividad"
        required
        />
        <textarea
        value={editingActividadDescripcion}
        onChange={(e) => setEditingActividadDescripcion(e.target.value)}
        placeholder="Nueva descripción de la actividad"
        required
        />
        <select value={editingActividadEstado} onChange={(e) => setEditingActividadEstado(e.target.value)} required>
            <option value="" disabled>Seleccionar estado</option>
            <option value="1">Abierto</option>
            <option value="2">Oculto</option>
            <option value="3">Cerrado</option>
        </select> 
    
        <div className="form-buttons-2">
            <button type="submit" className="editar-button">Guardar</button>
            <button type="button" onClick={closeModalEditAct} className="cancelar-button">Cancelar</button>
        </div>
    
        </form>
        </Modal.Body>
        </Modal>
    
        <Modal show={showEditModal} onHide={handleCloseEditModal} size="lg">
        <Modal.Header closeButton>
            <Modal.Title>Editar Pregunta</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <div className="modal-body">
                {/* Renderizar campos según el tipo de pregunta */}
                {editQuestionType === 'alternativa' && preguntaEditada && (
                    <div>
                        <label>Enunciado:</label>
                        <input
                            type="text"
                            value={preguntaEditada.enunciado}
                            onChange={(e) => setPreguntaEditada({ ...preguntaEditada, enunciado: e.target.value })}
                        />
                        <label>Respuesta A:</label>
                        <input
                            type="text"
                            value={preguntaEditada.respuesta_a}
                            onChange={(e) => setPreguntaEditada({ ...preguntaEditada, respuesta_a: e.target.value })}
                        />
                        <label>Respuesta B:</label>
                        <input
                            type="text"
                            value={preguntaEditada.respuesta_b}
                            onChange={(e) => setPreguntaEditada({ ...preguntaEditada, respuesta_b: e.target.value })}
                        />
                        <label>Respuesta C:</label>
                        <input
                            type="text"
                            value={preguntaEditada.respuesta_c}
                            onChange={(e) => setPreguntaEditada({ ...preguntaEditada, respuesta_c: e.target.value })}
                        />
                        <label>Respuesta D:</label>
                        <input
                            type="text"
                            value={preguntaEditada.respuesta_d}
                            onChange={(e) => setPreguntaEditada({ ...preguntaEditada, respuesta_d: e.target.value })}
                        />
                        <label>Respuesta E (opcional):</label>
                        <input
                            type="text"
                            value={preguntaEditada.respuesta_e || ''}
                            onChange={(e) => setPreguntaEditada({ ...preguntaEditada, respuesta_e: e.target.value })}
                        />
                        <label>Respuesta Correcta:</label>
                        <input
                            type="text"
                            value={preguntaEditada.correcta}
                            onChange={(e) => setPreguntaEditada({ ...preguntaEditada, correcta: e.target.value })}
                        />
                        <label>Puntaje:</label>
                        <input
                            type="number"
                            value={preguntaEditada.puntaje || 0}
                            onChange={(e) => setPreguntaEditada({ ...preguntaEditada, puntaje: e.target.value })}
                            min="0"
                        />
                    </div>
                )}
                {editQuestionType === 'vf' && preguntaEditada && (
                    <div>
                        <label>Enunciado:</label>
                        <input
                            type="text"
                            value={preguntaEditada.enunciado}
                            onChange={(e) => setPreguntaEditada({ ...preguntaEditada, enunciado: e.target.value })}
                        />
                        <label>Correcta:</label>
                        <input
                            type="text"
                            value={preguntaEditada.correcta}
                            onChange={(e) => setPreguntaEditada({ ...preguntaEditada, correcta: e.target.value })}
                        />
                        <label>Puntaje:</label>
                        <input
                            type="number"
                            value={preguntaEditada.puntaje || 0}
                            onChange={(e) => setPreguntaEditada({ ...preguntaEditada, puntaje: e.target.value })}
                            min="0"
                        />
                    </div>
                )}
                {editQuestionType === 'desarrollo' && preguntaEditada && (
                    <div>
                        <label>Enunciado:</label>
                        <input
                            type="text"
                            value={preguntaEditada.enunciado}
                            onChange={(e) => setPreguntaEditada({ ...preguntaEditada, enunciado: e.target.value })}
                        />
                        <label>Correcta:</label>
                        <input
                            type="text"
                            value={preguntaEditada.respuesta}
                            onChange={(e) => setPreguntaEditada({ ...preguntaEditada, respuesta: e.target.value })}
                        />
                        <label>Puntaje:</label>
                        <input
                            type="number"
                            value={preguntaEditada.puntaje || 0}
                            onChange={(e) => setPreguntaEditada({ ...preguntaEditada, puntaje: e.target.value })}
                            min="0"
                        />
                    </div>
                )}
            </div>
        </Modal.Body>
        <Modal.Footer>
            <div className="form-buttons">
                <button type="button" className="btn btn-secondary" onClick={handleCloseEditModal}>Cancelar</button>
                <button type="button" className="btn btn-primary" onClick={handleEditarPregunta}>Guardar Cambios</button>
            </div>
        </Modal.Footer>
    </Modal>

    {/*#######################################################################################################*/}
    {/*############                                                                                           */}
    {/*############     Modal guion de clase                                                                  */}
    {/*############                                                                                           */}
    {/*#######################################################################################################*/}
<Modal
    show={showGuionModal}
    onHide={() => setShowGuionModal(false)}
    size="lg"
    centered
>
    <Modal.Header closeButton>
        <Modal.Title>Nuevo Guión de Clase</Modal.Title>
    </Modal.Header>
  
    <Modal.Body>
        <form className="form-nuevo-guion">
            <label htmlFor="titulo">Título del Guión:</label>
            <input
                id="titulo"
                type="text"
                value={nuevoGuionTitulo}
                onChange={(e) => setNuevoGuionTitulo(e.target.value)}
                placeholder="Ejemplo: Guión Clase 1 - Introducción a la IA"
                required
            />

            <label htmlFor="ra">Resultados de Aprendizaje (RA):</label>
            <input
                id="ra"
                type="text"
                value={nuevoGuionRA}
                onChange={(e) => setNuevoGuionRA(e.target.value)}
                placeholder="Ingrese los RA"
                required
            />

            <label htmlFor="contenido">Contenido Temático:</label>
            <textarea
                id="contenido"
                value={nuevoGuionContenido}
                onChange={(e) => setNuevoGuionContenido(e.target.value)}
                placeholder="Describa el contenido temático"
                required
            />

            {/* NUEVOS CAMPOS - ENTRE CONTENIDO TEMÁTICO Y ESTILO DE CLASE */}
            <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                    <label htmlFor="duracion">Duración (minutos):</label>
                    <input
                        id="duracion"
                        type="number"
                        value={nuevoGuionDuracion}
                        onChange={(e) => setNuevoGuionDuracion(e.target.value)}
                        placeholder="Ej: 45"
                        min="1"
                        style={{ width: '100%' }}
                        required
                    />
                </div>
                <div style={{ flex: 1 }}>
                    <label htmlFor="semana">Semana:</label>
                    <input
                        id="semana"
                        type="number"
                        value={nuevoGuionSemana}
                        onChange={(e) => setNuevoGuionSemana(e.target.value)}
                        placeholder="Ej: 3"
                        min="1"
                        style={{ width: '100%' }}
                        required
                    />
                </div>
            </div>

            <label htmlFor="estilo">Estilo de Clase:</label>
            <select
                id="estilo"
                value={nuevoGuionEstilo}
                onChange={(e) => {
                    const valor = e.target.value;
                    setNuevoGuionEstilo(valor);
                    setDescripcionEstilo(descripcionesClases[valor] || "");
                }}
                required
            >
                <option value="" disabled>Seleccionar estilo</option>
                <option value="expositiva">Expositiva</option>
                <option value="gamificada">Gamificada</option>
                <option value="proyectos">Basada en Proyectos</option>
                <option value="colaborativa">Colaborativa</option>
            </select>

            {descripcionEstilo && (
                <p className="descripcion-clase">{descripcionEstilo}</p>
            )}

            <label>Adjuntar Recursos:</label>
            <input
                type="file"
                ref={fileInputRef}
                accept=".ppt,.pptx,.pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/pdf"

                style={{ display: "none" }}
                onChange={(e) => setSelectedGuionFile(e.target.files[0])}
            />

            <button
                type="button"
                className="btn btn-primary"
                style={{
                    backgroundColor: "#6C00AE",
                    border: "none",
                    marginBottom: "10px",
                }}
                onClick={() => fileInputRef.current?.click()}
            >
                Examinar
            </button>
            {selectedGuionFile && (
                <p style={{ marginLeft: "10px" }}>
                    Archivo seleccionado: {selectedGuionFile.name}
                </p>
            )}
        </form>
    </Modal.Body>

    <Modal.Footer>
        <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmitNuevoGuion}
            disabled={isLoading}
            style={{ backgroundColor: "#6C00AE", border: "none" }}
        >
            {isLoading ? "Creando..." : "Crear Guión"}
        </button>
        <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowGuionModal(false)}
            disabled={isLoading}
        >
            Cancelar
        </button>
    </Modal.Footer>
    
    {isLoading && (
        <div className="loading-overlay">
            <div className="loading-spinner">
                <div className="loading-ring"></div>
                <p className="loading-text">Generando Guion...</p>
            </div>
        </div>
    )}
</Modal>
{/*#######################################################################################################*/}
{/*#######################################################################################################*/}
{/*#######################################################################################################*/}

    {/*#######################################################################################################*/}
    {/*############                                                                                           */}
    {/*############     Modal planificacion                                                                   */}
    {/*############                                                                                           */}
    {/*#######################################################################################################*/}
<Modal
  show={showPlanificacionModal}
  onHide={closeModalPlanificacion}
  size="lg"
  centered
  scrollable
  backdrop="static"
>
  <Modal.Header closeButton className="bg-primary text-white">
    <Modal.Title className="fw-semibold mb-0">
      📘 {nuevoGuionPlanificacion?.titulo || "Planificación de Clase"}
    </Modal.Title>
  </Modal.Header>

  <Modal.Body>
    {!nuevoGuionPlanificacion ? (
      <p className="text-muted mb-0">Cargando planificación…</p>
    ) : (
      <Tabs
        activeKey={stepPlanificacion}
        onSelect={(k) => setStepPlanificacion(Number(k))}
        className="mb-3"
      >
        {/* ================= IDENTIFICACIÓN ================= */}
        <Tab eventKey={0} title="Identificación">
          <div className="card shadow-sm mb-3">
            <div className="card-header bg-primary text-white">
              <h6 className="mb-0">📋 Información General</h6>
            </div>

            <div className="card-body">
              <p className="mb-1">
                <strong>Asignatura:</strong> {nuevoGuionPlanificacion.nombre_curso || "No especificado"}
              </p>

              <p className="mb-1">
                <strong>Unidad / Semana:</strong>{" "}
                {nuevoGuionPlanificacion.identificacion_clase?.unidad_semana_clase || "No especificado"}
              </p>

              <p className="mb-1">
                <strong>Duración:</strong>{" "}
                {nuevoGuionPlanificacion.identificacion_clase?.duracion_sesion || "No especificado"}
              </p>

              <p className="mb-3">
                <strong>Resultado de Aprendizaje:</strong>{" "}
                {nuevoGuionPlanificacion.identificacion_clase?.resultado_aprendizaje ||
                  nuevoGuionPlanificacion.resultado_aprendizaje ||
                  "No especificado"}
              </p>

              <div>
                <strong>Contenidos:</strong>
                <div className="mt-2 ms-3">
                  {(nuevoGuionPlanificacion.identificacion_clase?.contenidos_clase || "")
                    .split("\n")
                    .map((l) => l.trim())
                    .filter((l) => l.length > 0 && l !== "•")
                    .map((l, idx) => (
                      <p key={idx} className="mb-1">
                        • {l.replace(/^•\s*/, "")}
                      </p>
                    ))}

                  {(!nuevoGuionPlanificacion.identificacion_clase?.contenidos_clase ||
                    nuevoGuionPlanificacion.identificacion_clase?.contenidos_clase?.trim() === "") && (
                    <p className="text-muted mb-0">No especificados</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Tab>

        {/* ================= SECUENCIA ================= */}
        <Tab eventKey={1} title="Secuencia">
          {nuevoGuionPlanificacion.secuencia_actividades ? (
            <>
              {/* INICIO */}
              <div className="card shadow-sm mb-3">
                <div className="card-header bg-warning text-dark d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">🚀 Inicio</h6>
                  <span className="badge bg-dark">
                    ⏱ {nuevoGuionPlanificacion.secuencia_actividades?.inicio?.tiempo_estimado || "—"}
                  </span>
                </div>
                <div className="card-body">
                  <p className="mb-1">
                    <strong>Propósito pedagógico:</strong>{" "}
                    {nuevoGuionPlanificacion.secuencia_actividades?.inicio?.proposito_pedagogico || "No especificado"}
                  </p>
                  <p className="mb-2">
                    <strong>Actividad principal:</strong>{" "}
                    {nuevoGuionPlanificacion.secuencia_actividades?.inicio?.actividad_principal || "No especificada"}
                  </p>
                  {nuevoGuionPlanificacion.secuencia_actividades?.inicio?.pregunta_gatillante && (
                    <p className="mb-2">
                      <strong>Pregunta gatillante:</strong>{" "}
                      {nuevoGuionPlanificacion.secuencia_actividades.inicio.pregunta_gatillante}
                    </p>
                  )}

                  <div className="row mt-3">
                    <div className="col-md-6">
                      <h6>👨‍🏫 Pasos del docente</h6>
                      <ul className="mb-0">
                        {(nuevoGuionPlanificacion.secuencia_actividades?.inicio?.pasos_docente || []).map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                        {(nuevoGuionPlanificacion.secuencia_actividades?.inicio?.pasos_docente || []).length === 0 && (
                          <li className="text-muted">No especificados</li>
                        )}
                      </ul>
                    </div>

                    <div className="col-md-6">
                      <h6>👩‍🎓 Pasos del estudiante</h6>
                      <ul className="mb-0">
                        {(nuevoGuionPlanificacion.secuencia_actividades?.inicio?.pasos_estudiantes || []).map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                        {(nuevoGuionPlanificacion.secuencia_actividades?.inicio?.pasos_estudiantes || []).length === 0 && (
                          <li className="text-muted">No especificados</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* DESARROLLO */}
              <div className="card shadow-sm mb-3">
                <div className="card-header bg-info text-white d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">📚 Desarrollo</h6>
                  <span className="badge bg-light text-dark">
                    ⏱ {nuevoGuionPlanificacion.secuencia_actividades?.desarrollo?.tiempo_estimado || "—"}
                  </span>
                </div>
                <div className="card-body">
                  <p className="mb-1">
                    <strong>Propósito:</strong>{" "}
                    {nuevoGuionPlanificacion.secuencia_actividades?.desarrollo?.proposito_pedagogico || "No especificado"}
                  </p>

                  {nuevoGuionPlanificacion.secuencia_actividades?.desarrollo?.exposicion_guiada && (
                    <p className="mb-2">
                      <strong>Exposición guiada:</strong>{" "}
                      {nuevoGuionPlanificacion.secuencia_actividades?.desarrollo?.exposicion_guiada}
                    </p>
                  )}

                  <h6 className="mt-3">🧩 Actividades principales</h6>
                  <ul>
                    {(nuevoGuionPlanificacion.secuencia_actividades?.desarrollo?.actividades_principales || []).map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                    {(nuevoGuionPlanificacion.secuencia_actividades?.desarrollo?.actividades_principales || []).length === 0 && (
                      <li className="text-muted">No especificadas</li>
                    )}
                  </ul>

                  <div className="row mt-3">
                    <div className="col-md-6">
                      <h6>👨‍🏫 Pasos del docente</h6>
                      <ul className="mb-0">
                        {(nuevoGuionPlanificacion.secuencia_actividades?.desarrollo?.pasos_docente || []).map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                        {(nuevoGuionPlanificacion.secuencia_actividades?.desarrollo?.pasos_docente || []).length === 0 && (
                          <li className="text-muted">No especificados</li>
                        )}
                      </ul>
                    </div>

                    <div className="col-md-6">
                      <h6>👩‍🎓 Pasos del estudiante</h6>
                      <ul className="mb-0">
                        {(nuevoGuionPlanificacion.secuencia_actividades?.desarrollo?.pasos_estudiantes || []).map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                        {(nuevoGuionPlanificacion.secuencia_actividades?.desarrollo?.pasos_estudiantes || []).length === 0 && (
                          <li className="text-muted">No especificados</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* CIERRE */}
              <div className="card shadow-sm">
                <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">✅ Cierre</h6>
                  <span className="badge bg-light text-dark">
                    ⏱ {nuevoGuionPlanificacion.secuencia_actividades?.cierre?.tiempo_estimado || "—"}
                  </span>
                </div>
                <div className="card-body">
                  <p className="mb-1">
                    <strong>Propósito:</strong>{" "}
                    {nuevoGuionPlanificacion.secuencia_actividades?.cierre?.proposito_pedagogico || "No especificado"}
                  </p>

                  <p className="mb-1">
                    <strong>Síntesis:</strong>{" "}
                    {nuevoGuionPlanificacion.secuencia_actividades?.cierre?.sintesis_clase || "No especificada"}
                  </p>

                  <p className="mb-2">
                    <strong>Actividad integradora:</strong>{" "}
                    {nuevoGuionPlanificacion.secuencia_actividades?.cierre?.actividad_integradora || "No especificada"}
                  </p>

                  {nuevoGuionPlanificacion.secuencia_actividades?.cierre?.tarea_siguiente_clase && (
                    <p className="mb-2">
                      <strong>Tarea próxima clase:</strong>{" "}
                      {nuevoGuionPlanificacion.secuencia_actividades?.cierre?.tarea_siguiente_clase}
                    </p>
                  )}

                  <div className="row mt-3">
                    <div className="col-md-6">
                      <h6>👨‍🏫 Pasos del docente</h6>
                      <ul className="mb-0">
                        {(nuevoGuionPlanificacion.secuencia_actividades?.cierre?.pasos_docente || []).map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                        {(nuevoGuionPlanificacion.secuencia_actividades?.cierre?.pasos_docente || []).length === 0 && (
                          <li className="text-muted">No especificados</li>
                        )}
                      </ul>
                    </div>

                    <div className="col-md-6">
                      <h6>👩‍🎓 Pasos del estudiante</h6>
                      <ul className="mb-0">
                        {(nuevoGuionPlanificacion.secuencia_actividades?.cierre?.pasos_estudiantes || []).map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                        {(nuevoGuionPlanificacion.secuencia_actividades?.cierre?.pasos_estudiantes || []).length === 0 && (
                          <li className="text-muted">No especificados</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <p className="text-muted">No hay secuencia disponible.</p>
          )}
        </Tab>

        {/* ================= ESTRATEGIAS ================= */}
        <Tab eventKey={2} title="Estrategias">
  {nuevoGuionPlanificacion.estrategias_didacticas?.length > 0 ? (
    <div className="row">
      {nuevoGuionPlanificacion.estrategias_didacticas.map((e, idx) => (
        <div key={idx} className="col-md-6 mb-3">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-info text-white">
              <h6 className="mb-0">🎯 {e.nombre || "Estrategia didáctica"}</h6>
            </div>

            <div className="card-body">
              <p className="mb-2">
                <strong>Descripción:</strong>{" "}
                {renderPasoAPaso(e.descripcion)}
              </p>

              {e.alineacion_ra && (
                <div className="mt-2 p-2 bg-light rounded">
                  <small>
                    <strong>Alineación con RA:</strong> {e.alineacion_ra}
                  </small>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <p className="text-muted">No hay estrategias registradas.</p>
  )}
</Tab>


        {/* ================= EVALUACIONES ================= */}
        <Tab eventKey={3} title="Evaluaciones">
          {nuevoGuionPlanificacion.evaluaciones_formativas?.length > 0 ? (
            nuevoGuionPlanificacion.evaluaciones_formativas.map((ev, idx) => (
              <div key={idx} className="card shadow-sm mb-3">
                <div className="card-header bg-danger text-white d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">📝 {ev.momento?.toUpperCase() || "MOMENTO"}</h6>
                  <span className="badge bg-light text-dark">{ev.duracion_estimada || "—"}</span>
                </div>
                <div className="card-body">
                  <p className="mb-2">
                    <strong>Tipo:</strong> {(ev.tipo || "").replace(/_/g, " ")}
                  </p>
                  <p className="mb-2">
                    <strong>Actividad:</strong> {ev.actividad || "No especificada"}
                  </p>
                  <p className="mb-2">
                    <strong>Criterio de observación:</strong> {ev.criterio_observacion || "No especificado"}
                  </p>
                  <p className="mb-0">
                    <small className="text-muted">
                      <strong>Retroalimentación sugerida:</strong> {ev.retroalimentacion_sugerida || "—"}
                    </small>
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted">No hay evaluaciones registradas.</p>
          )}
        </Tab>

        {/* ================= BIBLIOGRAFÍA ================= */}
        <Tab eventKey={4} title="Bibliografía">
          {nuevoGuionPlanificacion.bibliografia_material?.length > 0 ? (
            nuevoGuionPlanificacion.bibliografia_material.map((b, idx) => (
              <div key={idx} className="card shadow-sm mb-3">
                <div className="card-header bg-secondary text-white d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">
                    📚 {b.tipo === "BIBLIOGRAFIA" ? "Bibliografía" : "Material complementario"}
                  </h6>
                  <span className="badge bg-light text-dark">{b.tipo || "—"}</span>
                </div>
                <div className="card-body">
                  <p className="mb-2">
                    <strong>Referencia:</strong> {b.referencia || "No especificada"}
                  </p>
                  <p className="mb-0">
                    <strong>Uso recomendado:</strong> {b.uso_recomendado || "No especificado"}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted">No hay bibliografía registrada.</p>
          )}
        </Tab>

        {/* ================= RECURSOS (extras) ================= */}
        <Tab eventKey={5} title="Recursos">
          <div className="text-center mt-3">
            <p className="text-muted mb-4">
              Genera recursos automáticos a partir de esta planificación
            </p>

            <div className="d-flex justify-content-center flex-wrap gap-2">
              <Button variant="primary" onClick={() => handleResumen(nuevoGuionPlanificacion.guion_id)}>
                📝 Resumen
              </Button>

              <Button variant="info" onClick={() => handleGenerarMapaConceptual(nuevoGuionPlanificacion.guion_id)}>
                🗺️ Mapa conceptual
              </Button>

              <Button variant="success" onClick={() => handleGenerarFlashcards(nuevoGuionPlanificacion.guion_id)}>
                🎴 Flashcards
              </Button>

              <Button variant="warning" onClick={() => handleGenerarGlosario(nuevoGuionPlanificacion.guion_id)}>
                📚 Glosario
              </Button>

              <Button variant="danger" onClick={() => handleGenerarInfografia(nuevoGuionPlanificacion.guion_id)}>
                🎨 Infografía
              </Button>
            </div>
          </div>
        </Tab>
      </Tabs>
    )}
  </Modal.Body>

  <Modal.Footer className="d-flex justify-content-between">
    <div className="d-flex gap-2">
      <Button
        variant="outline-secondary"
        onClick={() => setStepPlanificacion((s) => Math.max(s - 1, 0))}
        disabled={stepPlanificacion === 0}
      >
        Anterior
      </Button>

      <Button
        variant="outline-secondary"
        onClick={() => setStepPlanificacion((s) => Math.min(s + 1, 5))}
        disabled={stepPlanificacion === 5}
      >
        Siguiente
      </Button>
    </div>

    <Button variant="secondary" onClick={closeModalPlanificacion}>
      Cerrar
    </Button>
  </Modal.Footer>

  {isLoading && (
    <div className="loading-overlay">
      <div className="loading-spinner">
        <div className="loading-ring"></div>
        <p className="loading-text">Generando...</p>
      </div>
    </div>
  )}
</Modal>

    {/*#######################################################################################################*/}
    {/*#######################################################################################################*/}   
    {/*#######################################################################################################*/}


    {/*#######################################################################################################*/}
    {/*############                                                                                           */}
    {/*############     MODAL RESUMEN                                                                         */}
    {/*############                                                                                           */}
    {/*#######################################################################################################*/}

<div className="modal-container">
  <Modal show={showResumenModal} onHide={() => setShowResumenModal(false)} size="lg">
    <Modal.Header closeButton>
      <div className="w-100">
        {/* Título principal con más margen inferior */}
        <Modal.Title className="mb-3">Resumen de la Clase</Modal.Title>
        
        {/* Información en horizontal con buena separación */}
        {!isLoading && resumenData?.resumen && (
          <div className="modal-subtitle d-flex flex-wrap gap-3 align-items-center">
            {/* Unidad formateada */}
            {resumenData?.unidad_nombre && (
              <span className="text-muted">
                <i className="bi bi-journal-text me-1"></i>
                {(() => {
                  const unidad = resumenData.unidad_nombre;
                  const match = unidad.match(/^Unidad\s+\d+[\s:-]*(.*)/i);
                  if (match && match[1]) {
                    return match[1].trim();
                  }
                  return unidad;
                })()}
              </span>
            )}
            
            {/* Separador visual */}
            {resumenData?.unidad_nombre && resumenData?.profesor && (
              <span className="text-muted">•</span>
            )}
            
            {/* Profesor */}
            {resumenData?.profesor && (
              <span className="text-muted">
                <i className="bi bi-person-circle me-1"></i>
                {resumenData.profesor}
              </span>
            )}
            
            {/* Separador visual */}
            {(resumenData?.unidad_nombre || resumenData?.profesor) && resumenData?.nombre_asignatura && (
              <span className="text-muted">•</span>
            )}
            
            {/* Asignatura */}
            {resumenData?.nombre_asignatura && (
              <span className="text-muted">
                <i className="bi bi-book me-1"></i>
                {resumenData.nombre_asignatura}
              </span>
            )}
          </div>
        )}
      </div>
    </Modal.Header>

    <Modal.Body style={{ position: 'relative' }}>
      {/* Loading overlay cuando hay contenido y está cargando (PDF) */}
      {isLoading && resumenTexto && (
        <div className="loading-overlay">
          <div className="loading-spinner">
            <div className="loading-ring"></div>
            <p className="loading-text">Generando PDF...</p>
          </div>
        </div>
      )}
      
      {/* Contenido principal */}
      <div className="modal-body">
        {isLoading && !resumenTexto ? (
          // Loading inicial cuando no hay resumen todavía
          <div className="loading-spinner">
            <div className="loading-ring"></div>
            <p className="loading-text">Cargando resumen...</p>
          </div>
        ) : resumenTexto ? (
          <>
            <p>
              <strong>Tema principal:</strong>{" "}
              {resumenTexto.tema_principal || "Sin datos válidos"}
            </p>

            <div className="resumen-seccion">
              <h5>Ideas principales</h5>
              {resumenTexto.ideas_principales?.length ? (
                <ul>
                  {resumenTexto.ideas_principales.map((idea, index) => (
                    <li key={index}>{idea}</li>
                  ))}
                </ul>
              ) : (
                <p>No se encontraron ideas principales.</p>
              )}
            </div>

            <div className="resumen-seccion">
              <h5>Conceptos clave</h5>
              {resumenTexto.conceptos_clave?.length ? (
                <ul>
                  {resumenTexto.conceptos_clave.map((concepto, index) => (
                    <li key={index}>{concepto}</li>
                  ))}
                </ul>
              ) : (
                <p>No hay conceptos clave registrados.</p>
              )}
            </div>

            <div className="resumen-seccion">
              <h5>Conclusión</h5>
              <p>{resumenTexto.conclusion || "Sin conclusión disponible."}</p>
            </div>
          </>
        ) : (
          <p>No hay resumen disponible para esta planificación.</p>
        )}
      </div>
    </Modal.Body>

    <Modal.Footer className="sticky-footer">
      <div className="form-buttons d-flex justify-content-between w-100">
        <div>
          {resumenTexto && !isLoading && (
            <button
              type="button"
              className="btn btn-warning me-2"
              onClick={() => {
                if (window.confirm("¿Estás seguro de regenerar el resumen? Se creará una nueva versión.")) {
                  setShowResumenModal(false);
                  setTimeout(() => {
                    handleResumen(currentGuionId, "regenerar");
                  }, 300);
                }
              }}
              disabled={isLoading}
            >
              <i className="bi bi-arrow-clockwise me-1"></i>
              Rehacer Resumen
            </button>
          )}
        </div>
        
        <div>
          {resumenTexto && (
            <button
              type="button"
              className="btn btn-primary me-2"
              onClick={async () => {
                if (resumenTexto) {
                  setIsLoading(true); // Activa loading overlay
                  try {
                    await generatePDFResumen(resumenTexto, "descargar");
                  } catch (error) {
                    console.error("Error al generar PDF:", error);
                    alert("Error al generar el PDF");
                  } finally {
                    setIsLoading(false); // Desactiva loading overlay
                  }
                }
              }}
              disabled={isLoading}
            >
              <i className="bi bi-download me-1"></i>
              Descargar PDF
            </button>
          )}
          
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowResumenModal(false)}
            disabled={isLoading}
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal.Footer>
  </Modal>
</div>

{/*#######################################################################################################*/}
{/*#######################################################################################################*/}
{/*#######################################################################################################*/}


    {/*#######################################################################################################*/}
    {/*############                                                                                           */}
    {/*############     Modal mapa mental                                                                     */}
    {/*############                                                                                           */}
    {/*#######################################################################################################*/}

{/* Modal del Mapa Conceptual */}
<Modal show={showMapaModal} onHide={() => setShowMapaModal(false)} size="xl" centered>
  <Modal.Header closeButton style={{ backgroundColor: '#6E008C', color: 'white' }}>
    <Modal.Title>
      🌳 Mapa Conceptual
    </Modal.Title>
  </Modal.Header>
  
  <Modal.Body style={{ 
    maxHeight: '70vh', 
    overflowY: 'auto',
    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
    position: 'relative'
  }}>
    
    {/* Loading overlay solo para PDF - igual que en resumen */}
    {isLoading && mapaProcesado ? (
      <div className="loading-overlay">
        <div className="loading-spinner">
          <div className="loading-ring"></div>
          <p className="loading-text">Generando PDF...</p>
        </div>
      </div>
    ) : null}
    
    {isLoading && !mapaProcesado ? (
      // Loading inicial cuando no hay mapa todavía
      <div className="loading-spinner">
        <div className="loading-ring"></div>
        <p className="loading-text">Cargando mapa conceptual...</p>
      </div>
    ) : mapaProcesado ? (
      <div>
        <MapaArbolVertical mapa={mapaProcesado} />
        
        <div className="mt-4 p-4 bg-white rounded shadow border">
          <div className="text-center">
            <div className="d-flex justify-content-center gap-3 flex-wrap">
              {/* ORDEN CORRECTO: Cerrar | Rehacer | Descargar */}
              
              <button
                className="btn btn-danger"
                onClick={() => setShowMapaModal(false)}
                disabled={isLoading}
              >
                <i className="bi bi-x-circle me-2"></i>
                Cerrar
              </button>
              
              <button
                className="btn btn-warning"
                onClick={() => {
                  if (window.confirm("¿Estás seguro de regenerar el mapa conceptual? Se creará una nueva versión.")) {
                    setShowMapaModal(false);
                    setTimeout(() => {
                      handleGenerarMapaConceptual(currentGuionId, "regenerar");
                    }, 300);
                  }
                }}
                disabled={isLoading}
              >
                <i className="bi bi-arrow-clockwise me-2"></i>
                Rehacer Mapa
              </button>
              
              <button
                className="btn btn-primary"
                onClick={async () => {
                  if (mapaProcesado) {
                    setIsLoading(true); // Activa loading overlay
                    try {
                      await generarPDFConMermaidLocal(mapaProcesado);
                    } catch (error) {
                      console.error("Error al generar PDF:", error);
                      alert("Error al generar el PDF");
                    } finally {
                      setIsLoading(false); // Desactiva loading overlay
                    }
                  }
                }}
                disabled={isLoading}
              >
                <i className="bi bi-download me-2"></i>
                Descargar PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    ) : (
      <p>No hay mapa conceptual disponible para esta planificación.</p>
    )}
    
  </Modal.Body>
</Modal>
    {/*#######################################################################################################*/}
    {/*#######################################################################################################*/}
    {/*#######################################################################################################*/}



    {/*#######################################################################################################*/}
    {/*############                                                                                           */}
    {/*############     Modal flashcards                                                                      */}
    {/*############                                                                                           */}
    {/*#######################################################################################################*/}
<Modal 
  show={showFlashcardsModal} 
  onHide={() => {
    setShowFlashcardsModal(false);
    setIsFlashcardFlipped(false);
  }} 
  size="lg" 
  centered
  className="flashcards-modal"
>
  <Modal.Header closeButton className="border-0">
    <Modal.Title className="w-100 text-center">
      🎴 Flashcards Interactivas
      {flashcardsData && (
        <div className="text-muted small mt-1">
          {flashcardsData.length} tarjetas disponibles
        </div>
      )}
    </Modal.Title>
  </Modal.Header>
  
  <Modal.Body style={{ position: 'relative' }}>
    {/* Loading overlay cuando hay contenido y está cargando (HTML) */}
    {isLoading && flashcardsData && (
      <div className="loading-overlay">
        <div className="loading-spinner">
          <div className="loading-ring"></div>
          <p className="loading-text">Generando HTML...</p>
        </div>
      </div>
    )}
    
    {isLoading && !flashcardsData ? (
      // Loading inicial cuando no hay flashcards todavía
      <div className="loading-spinner">
        <div className="loading-ring"></div>
        <p className="loading-text">Cargando flashcards...</p>
      </div>
    ) : flashcardsData ? (
      <div className="flashcards-viewer">
        {/* Controles de navegación */}
        <div className="flashcards-controls">
          <Button 
            variant="outline-primary" 
            onClick={handleFlashcardPrevious}
            className="px-4"
            disabled={isLoading}
          >
            ← Anterior
          </Button>
          
          <span className="flashcards-counter">
            {currentFlashcardIndex + 1} / {flashcardsData.length}
          </span>
          
          <Button 
            variant="outline-primary" 
            onClick={handleFlashcardNext}
            className="px-4"
            disabled={isLoading}
          >
            Siguiente →
          </Button>
        </div>

        {/* Flashcard principal */}
        <div 
          className={`flashcard ${isFlashcardFlipped ? 'flipped' : ''}`}
          onClick={() => setIsFlashcardFlipped(!isFlashcardFlipped)}
        >
          <div className="flashcard-inner">
            {/* Cara frontal */}
            <div className="flashcard-front">
              <div className="flashcard-content">
                {flashcardsData[currentFlashcardIndex]?.pregunta || 'Pregunta no disponible'}
              </div>
              <div className="flashcard-hint">Click para ver la respuesta</div>
            </div>
            
            {/* Cara posterior */}
            <div className="flashcard-back">
              <div className="flashcard-content">
                {flashcardsData[currentFlashcardIndex]?.respuesta || 'Respuesta no disponible'}
              </div>
              {flashcardsData[currentFlashcardIndex]?.categoria && (
                <div className="flashcard-category">
                  {flashcardsData[currentFlashcardIndex].categoria}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Miniaturas de navegación rápida */}
        <div className="flashcards-miniatures">
          <div className="d-flex flex-wrap gap-2 justify-content-center">
            {flashcardsData.map((_, index) => (
              <Button
                key={index}
                variant={index === currentFlashcardIndex ? "primary" : "outline-secondary"}
                size="sm"
                onClick={() => handleGoToFlashcard(index)}
                className="mini-card"
                style={{ 
                  width: '40px', 
                  height: '40px',
                  borderRadius: '8px',
                  fontWeight: 'bold'
                }}
                disabled={isLoading}
              >
                {index + 1}
              </Button>
            ))}
          </div>
        </div>

        {/* Instrucciones */}
        <div className="text-center text-muted small mt-3">
          💡 Usa las flechas ← → para navegar, Click para voltear, ESC para salir
        </div>

        {/* Acciones */}
        <div className="flashcards-actions mt-4">
          <div className="d-flex gap-2 justify-content-center flex-wrap">
            {/* ✅ BOTÓN REHACER - IDÉNTICO AL DEL RESUMEN */}
            <button
              type="button"
              className="btn btn-warning"
              onClick={() => {
                if (window.confirm("¿Estás seguro de regenerar las flashcards? Se crearán nuevas tarjetas.")) {
                  setShowFlashcardsModal(false);
                  setTimeout(() => {
                    handleGenerarFlashcards(currentGuionId, "regenerar");
                  }, 300);
                }
              }}
              disabled={isLoading}
            >
              <i className="bi bi-arrow-clockwise me-1"></i>
              Rehacer Flashcards
            </button>
            
            {/* ✅ BOTÓN DESCARGAR - IDÉNTICO AL DEL RESUMEN */}
            <button
              type="button"
              className="btn btn-primary"
              onClick={async () => {
                if (flashcardsData) {
                  setIsLoading(true); // Activa loading overlay
                  try {
                    await generarHTMLFlashcards(flashcardsData, 'descargar');
                  } catch (error) {
                    console.error("Error al generar HTML:", error);
                    alert("Error al generar el HTML");
                  } finally {
                    setIsLoading(false); // Desactiva loading overlay
                  }
                }
              }}
              disabled={isLoading}
            >
              <i className="bi bi-download me-1"></i>
              Descargar HTML
            </button>
            
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setShowFlashcardsModal(false);
                setIsFlashcardFlipped(false);
              }}
              disabled={isLoading}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    ) : (
      <p>No hay flashcards disponibles para esta planificación.</p>
    )}
  </Modal.Body>
</Modal>
{/*#######################################################################################################*/}
{/*#######################################################################################################*/}
{/*#######################################################################################################*/}

    {/*#######################################################################################################*/}
    {/*############                                                                                           */}
    {/*############     Modal glosario                                                                        */}
    {/*############                                                                                           */}
    {/*#######################################################################################################*/}
{/* 📚 Modal para mostrar glosario */}
<Modal show={showGlosarioModal} onHide={() => setShowGlosarioModal(false)} size="lg" centered>
  <Modal.Header closeButton>
    <Modal.Title>📚 Glosario de Términos Clave</Modal.Title>
  </Modal.Header>
  
  <Modal.Body style={{ position: 'relative' }}>
    {/* Loading overlay cuando hay contenido y está cargando (PDF/HTML) */}
    {isLoading && glosarioData && (
      <div className="loading-overlay">
        <div className="loading-spinner">
          <div className="loading-ring"></div>
          <p className="loading-text">Generando documento...</p>
        </div>
      </div>
    )}
    
    {isLoading && !glosarioData ? (
      // Loading inicial cuando no hay glosario todavía
      <div className="loading-spinner">
        <div className="loading-ring"></div>
        <p className="loading-text">Cargando glosario...</p>
      </div>
    ) : glosarioData ? (
      <div className="glosario-container">
        <div className="glosario-header text-center mb-4">
          <h4 className="text-primary">Términos Fundamentales</h4>
          <p className="text-muted">Definiciones clave del contenido educativo</p>
        </div>
        
        <div className="glosario-content">
          {glosarioData.map((termino, index) => (
            <div key={index} className="termino-card card mb-3 border-0 shadow-sm">
              <div className="card-body">
                <div className="d-flex align-items-start">
                  <div className="termino-indicator bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" 
                       style={{ width: '35px', height: '35px', fontSize: '14px', fontWeight: 'bold' }}>
                    {index + 1}
                  </div>
                  <div className="flex-grow-1">
                    <h5 className="card-title text-primary mb-2">{termino.termino}</h5>
                    <p className="card-text mb-2">{termino.definicion}</p>
                    {termino.categoria && (
                      <span className="badge bg-secondary">{termino.categoria}</span>
                    )}
                    {termino.ejemplo && (
                      <div className="ejemplo-container mt-2 p-2 bg-light rounded">
                        <small className="text-muted">
                          <strong>Ejemplo:</strong> {termino.ejemplo}
                        </small>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Acciones del glosario */}
        <div className="glosario-actions mt-4 text-center">
          <div className="d-flex gap-2 justify-content-center flex-wrap">
            {/* ✅ BOTÓN REHACER - IDÉNTICO AL DEL RESUMEN */}
            <button
              type="button"
              className="btn btn-warning"
              onClick={() => {
                if (window.confirm("¿Estás seguro de regenerar el glosario? Se crearán nuevos términos.")) {
                  setShowGlosarioModal(false);
                  setTimeout(() => {
                    handleGenerarGlosario(currentGuionId, "regenerar");
                  }, 300);
                }
              }}
              disabled={isLoading}
            >
              <i className="bi bi-arrow-clockwise me-1"></i>
              Rehacer Glosario
            </button>
            
            {/* ✅ BOTONES DE DESCARGA - CON LOADING */}
            <button
              type="button"
              className="btn btn-primary"
              onClick={async () => {
                if (glosarioData) {
                  setIsLoading(true);
                  try {
                     descargarGlosarioHTML();
                  } catch (error) {
                    console.error("Error al generar HTML:", error);
                    alert("Error al generar el HTML");
                  } finally {
                    setIsLoading(false);
                  }
                }
              }}
              disabled={isLoading}
            >
              <i className="bi bi-download me-1"></i>
              Descargar HTML
            </button>
          
            <button
              type="button"
              className="btn btn-danger"
              onClick={async () => {
                if (glosarioData) {
                  setIsLoading(true);
                  try {
                    await descargarGlosarioPDF(glosarioData, "descargar");
                  } catch (error) {
                    console.error("Error al generar PDF:", error);
                    alert("Error al generar el PDF");
                  } finally {
                    setIsLoading(false);
                  }
                }
              }}
              disabled={isLoading}
            >
              <i className="bi bi-download me-1"></i>
              Descargar PDF
            </button>
                        
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowGlosarioModal(false)}
              disabled={isLoading}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    ) : (
      <p>No hay glosario disponible para esta planificación.</p>
    )}
  </Modal.Body>
</Modal>
{/*#######################################################################################################*/}
{/*#######################################################################################################*/}
{/*#######################################################################################################*/}



    {/*#######################################################################################################*/}
    {/*############                                                                                           */}
    {/*############     Modal compartir material                                                             */}
    {/*############                                                                                           */}
    {/*#######################################################################################################*/}
<Modal show={showEnvioModal} onHide={closeEnvioModal} size="lg" centered>
  <Modal.Header closeButton>
    <Modal.Title>📧 Compartir Material con Estudiantes</Modal.Title>
  </Modal.Header>

  <Modal.Body>
    {/* ✅ VERIFICACIÓN DE INICIALIZACIÓN */}
    {Object.keys(materialesPorGuion).length === 0 ? (
      <div className="alert alert-warning">
        <strong>⚠️ Cargando materiales...</strong>
      </div>
    ) : (
      <Tabs
        activeKey={stepEnvio}
        onSelect={(k) => setStepEnvio(Number(k))}
        className="mb-3"
        // ✅ DESHABILITAR la posibilidad de cambiar tabs manualmente
        id="controlled-tab-example"
      >
        {/* --- PASO 1: Selección de Guiones y Materiales --- */}
        <Tab 
          eventKey={0} 
          title={
            <span className={stepEnvio >= 0 ? "text-primary" : "text-muted"}>
              📚 Guiones y Materiales
            </span>
          }
          // ✅ DESHABILITAR el click en el tab
          tabClassName={stepEnvio === 0 ? "active" : ""}
          disabled={stepEnvio !== 0}
        >
          <div className="mb-4">
            <h6>Selecciona los guiones y materiales a compartir:</h6>
            <p className="text-muted">Marca los guiones y elige qué materiales enviar para cada uno</p>
          </div>

          <div className="card">
            <div className="card-body">
              {guiones.map((guion) => (
                <div key={guion.guion_id} className="mb-3 border-bottom pb-3">
                  {/* Checkbox principal del guión */}
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={guionesSeleccionados.includes(guion.guion_id)}
                      onChange={() => toggleGuionSeleccionado(guion.guion_id)}
                      id={`guion-${guion.guion_id}`}
                    />
                    <label 
                      className="form-check-label" 
                      htmlFor={`guion-${guion.guion_id}`}
                      style={{ fontWeight: "500" }}
                    >
                      {guion.titulo}
                    </label>
                    {guion.descripcion && (
                      <small className="text-muted d-block ms-4">
                        {guion.descripcion}
                      </small>
                    )}
                  </div>

                  {/* Lista de materiales que se expande al seleccionar el guión */}
                  {guionesSeleccionados.includes(guion.guion_id) && (
                    <div className="ms-4 mt-2 p-3 border rounded bg-light">
                      <small className="text-muted d-block mb-2">
                        📁 Selecciona materiales para <strong>{guion.titulo}</strong>:
                      </small>

                      {/* Material Extra */}
                      <div>
                        <strong className="text-success">🎴 Material de Apoyo:</strong>
                        <div className="ms-3 mt-1">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={materialesPorGuion[guion.guion_id]?.extras?.resumen || false}
                              onChange={() => toggleMaterialGuion(guion.guion_id, 'extras', 'resumen')}
                              id={`resumen-${guion.guion_id}`}
                            />
                            <label className="form-check-label" htmlFor={`resumen-${guion.guion_id}`}>
                              Resumen
                            </label>
                          </div>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={materialesPorGuion[guion.guion_id]?.extras?.mapaConceptual || false}
                              onChange={() => toggleMaterialGuion(guion.guion_id, 'extras', 'mapaConceptual')}
                              id={`mapa-${guion.guion_id}`}
                            />
                            <label className="form-check-label" htmlFor={`mapa-${guion.guion_id}`}>
                              Mapa Conceptual
                            </label>
                          </div>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={materialesPorGuion[guion.guion_id]?.extras?.flashcards || false}
                              onChange={() => toggleMaterialGuion(guion.guion_id, 'extras', 'flashcards')}
                              id={`flashcards-${guion.guion_id}`}
                            />
                            <label className="form-check-label" htmlFor={`flashcards-${guion.guion_id}`}>
                              Flashcards
                            </label>
                          </div>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={materialesPorGuion[guion.guion_id]?.extras?.glosario || false}
                              onChange={() => toggleMaterialGuion(guion.guion_id, 'extras', 'glosario')}
                              id={`glosario-${guion.guion_id}`}
                            />
                            <label className="form-check-label" htmlFor={`glosario-${guion.guion_id}`}>
                              Glosario
                            </label>
                          </div>
                          {/* ✅ NUEVO: Infografía */}
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={materialesPorGuion[guion.guion_id]?.extras?.infografia || false}
                              onChange={() => toggleMaterialGuion(guion.guion_id, 'extras', 'infografia')}
                              id={`infografia-${guion.guion_id}`}
                            />
                            <label className="form-check-label" htmlFor={`infografia-${guion.guion_id}`}>
                              Infografía
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {guionesSeleccionados.length > 0 && (
            <div className="alert alert-info mt-3">
              <strong>✅ {guionesSeleccionados.length} guion(es) seleccionado(s)</strong>
              <div className="mt-1">
                <small>
                  Cada guión puede tener materiales diferentes seleccionados
                </small>
              </div>
            </div>
          )}
        </Tab>

         {/* --- PASO 1: Preparar Material --- */}
        <Tab 
          eventKey={1} 
          title={
            <span className={stepEnvio >= 1 ? "text-primary" : "text-muted"}>
              ⚙️ Preparar Material
            </span>
          }
          disabled={stepEnvio !== 1}
        >
          <div className="mb-4">
            <h5>¿Qué quieres hacer con los materiales seleccionados?</h5>
            <p className="text-muted">Elige cómo deseas preparar los materiales</p>
          </div>

          {/* USAR ESTA VERSIÓN - Opción 4 */}
          <div className="row row-cols-1 row-cols-md-2 g-4">
            <div className="col">
              <div 
                className={`card h-100 cursor-pointer ${accionSeleccionada === 'zip' ? 'border-primary shadow' : ''}`}
                onClick={() => setAccionSeleccionada('zip')}
                style={{ cursor: 'pointer' }}
              >
                <div className="card-body text-center">
                  <div className="display-4 mb-3">📦</div>
                  <h5 className="card-title">Descargar ZIP</h5>
                  <p className="card-text text-muted small">
                    Crea un archivo ZIP para compartir manualmente
                  </p>
                </div>
                <div className="card-footer text-center">
                  {accionSeleccionada === 'zip' ? '✅ Seleccionado' : 'Seleccionar'}
                </div>
              </div>
            </div>

            <div className="col">
              <div 
                className={`card h-100 cursor-pointer ${accionSeleccionada === 'drive' ? 'border-primary shadow' : ''}`}
                onClick={() => setAccionSeleccionada('drive')}
                style={{ cursor: 'pointer' }}
              >
                <div className="card-body text-center">
                  <div className="display-4 mb-3">☁️</div>
                  <h5 className="card-title">Google Drive</h5>
                  <p className="card-text text-muted small">
                    Sube a Drive y obtén un link para compartir
                  </p>
                </div>
                <div className="card-footer text-center">
                  {accionSeleccionada === 'drive' ? '✅ Seleccionado' : 'Seleccionar'}
                </div>
              </div>
            </div>
          </div>

        
        </Tab>

        {/* --- PASO 2: Distribuir --- */}
        <Tab 
          eventKey={2} 
          title={
            <span className={stepEnvio >= 2 ? "text-primary" : "text-muted"}>
              📤 Distribuir
            </span>
          }
          disabled={stepEnvio !== 2}
        >
          <div className="mb-4">
            <h5>¿Cómo quieres distribuir los materiales?</h5>
            <p className="text-muted">Elige el método de entrega a tus estudiantes</p>
          </div>

          <div className="row g-3">
            {/* Distribución para ZIP */}
            {accionSeleccionada === 'zip' && (
              <>
                <div className="col-md-6">
                  <div 
                    className={`card h-100 cursor-pointer ${distribucionSeleccionada === 'correo' ? 'border-primary shadow' : ''}`}
                    onClick={() => setDistribucionSeleccionada('correo')}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="card-body text-center">
                      <div className="display-4 mb-3">📧</div>
                      <h5 className="card-title">Enviar por correo</h5>
                      <p className="card-text text-muted small">
                        Los estudiantes recibirán el ZIP por correo
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div 
                    className={`card h-100 cursor-pointer ${distribucionSeleccionada === 'descargar' ? 'border-primary shadow' : ''}`}
                    onClick={() => setDistribucionSeleccionada('descargar')}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="card-body text-center">
                      <div className="display-4 mb-3">💾</div>
                      <h5 className="card-title">Descargar tú mismo</h5>
                      <p className="card-text text-muted small">
                        Descarga y compártelo manualmente
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Distribución para Drive/URL */}
            {(accionSeleccionada === 'drive' || accionSeleccionada === 'url') && (
              <>
                <div className="col-md-4">
                  <div 
                    className={`card h-100 cursor-pointer ${distribucionSeleccionada === 'correo' ? 'border-primary shadow' : ''}`}
                    onClick={() => setDistribucionSeleccionada('correo')}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="card-body text-center">
                      <div className="display-4 mb-3">📧</div>
                      <h5 className="card-title">Enviar link por correo</h5>
                      <p className="card-text text-muted small">
                        Enviar el enlace por correo a los estudiantes
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div 
                    className={`card h-100 cursor-pointer ${distribucionSeleccionada === 'copiar' ? 'border-primary shadow' : ''}`}
                    onClick={() => setDistribucionSeleccionada('copiar')}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="card-body text-center">
                      <div className="display-4 mb-3">📋</div>
                      <h5 className="card-title">Copiar link</h5>
                      <p className="card-text text-muted small">
                        Obtén el enlace para compartirlo
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div 
                    className={`card h-100 cursor-pointer ${distribucionSeleccionada === 'qr' ? 'border-primary shadow' : ''}`}
                    onClick={() => setDistribucionSeleccionada('qr')}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="card-body text-center">
                      <div className="display-4 mb-3">📱</div>
                      <h5 className="card-title">Código QR</h5>
                      <p className="card-text text-muted small">
                        Genera un código QR para clase
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* ✅ SOLO mostrar destinatarios si se eligió CORREO */}
          {distribucionSeleccionada === 'correo' && (
            <div className="card mt-3">
              <div className="card-body">
                <h6>📧 Destinatarios</h6>
                <label htmlFor="emails" className="form-label">
                  Correos de Estudiantes (uno por línea)
                </label>
                <textarea
                  id="emails"
                  className="form-control"
                  rows="6"
                  value={emailsEstudiantes}
                  onChange={(e) => setEmailsEstudiantes(e.target.value)}
                  placeholder="ejemplo1@correo.com&#10;ejemplo2@correo.com&#10;ejemplo3@correo.com"
                />
                <div className="form-text">
                  {emailsEstudiantes.split('\n').filter(email => email.trim() !== "").length} destinatarios detectados
                </div>
              </div>
            </div>
          )}

          
        </Tab>

        {/* --- PASO 3: Vista Previa del Correo (SOLO para correo) --- */}
        {/* Este paso es CONDICIONAL: solo se muestra si eligió CORREO */}
        {distribucionSeleccionada === 'correo' && (
          <Tab 
            eventKey={3} 
            title={
              <span className={stepEnvio >= 3 ? "text-primary" : "text-muted"}>
                👁️ Vista Previa
              </span>
            }
            disabled={stepEnvio !== 3}
          >
            <div className="mb-4">
              <h5>📧 Vista Previa del Correo</h5>
              <p className="text-muted">Revisa cómo quedará el correo para tus estudiantes</p>
            </div>

            {/* ✅ CARD CON RESUMEN - REEMPLAZA VISTAPREVIADATA */}
            <div className="card mb-3">
              <div className="card-header bg-light">
                <h6 className="mb-0">📋 Resumen del Envío</h6>
              </div>
              <div className="card-body">
                <p><strong>📚 Guiones seleccionados ({guionesSeleccionados.length}):</strong></p>
                <ul className="mb-3">
                  {guiones
                    .filter(g => guionesSeleccionados.includes(g.guion_id))
                    .map((guion, idx) => (
                      <li key={idx}>
                        <strong>{guion.titulo}</strong>
                        {guion.descripcion && (
                          <small className="text-muted d-block">- {guion.descripcion}</small>
                        )}
                      </li>
                    ))}
                </ul>
                
                <p><strong>📁 Materiales generados ({materialesRevision?.filter(m => m.estado === 'generado')?.length || 0}):</strong></p>
                <ul className="mb-3">
                  {materialesRevision
                    ?.filter(m => m.estado === 'generado')
                    .map((material, idx) => {
                      // Determinar el formato según el tipo de material
                      let formato = 'PDF'; // valor por defecto
                      
                      if (material.subtipo === 'infografia') {
                        formato = 'PNG';
                      } else if (material.subtipo === 'flashcards') {
                        formato = 'HTML';
                      } else if (['resumen', 'glosario', 'mapaConceptual'].includes(material.subtipo)) {
                        formato = 'PDF';
                      }
                      
                      return (
                        <li key={idx}>
                          {material.subtipo === 'resumen' && '📄 '}
                          {material.subtipo === 'mapaConceptual' && '🗺️ '}
                          {material.subtipo === 'flashcards' && '🎴 '}
                          {material.subtipo === 'glosario' && '📚 '}
                          {material.subtipo === 'infografia' && '🎨 '}
                          {material.guionTitulo} - {material.subtipo}
                          <small className="text-muted"> ({formato})</small>
                        </li>
                      );
                    })}
                </ul>
                
                <p><strong>👥 Destinatarios:</strong> {emailsEstudiantes.split('\n').filter(email => email.trim() !== "").length} estudiantes</p>
              </div>
            </div>

            {/* ✅ VISTA PREVIA DEL CORREO EDITABLE */}
            <div className="card">
              <div className="card-header bg-light">
                <h6 className="mb-0">✉️ Contenido del Correo</h6>
              </div>
              <div className="card-body">
                <div className="email-preview border rounded p-3 bg-white">
                  <div className="border-bottom pb-3 mb-3">
                    <p className="mb-1"><strong>De:</strong> {user.email || 'iwanttoteach123@gmail.com'}</p>
                    <p className="mb-1"><strong>Para:</strong> Estudiantes del curso</p>
                    <p className="mb-0"><strong>Asunto:</strong> Material de estudio - {user.nombre}</p>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label fw-bold mb-2">
                      💬 Mensaje para los estudiantes:
                    </label>
                    
                    <textarea
                      className="form-control"
                      rows="8"
                      value={mensajeCorreo}
                      onChange={(e) => setMensajeCorreo(e.target.value)}
                      placeholder={`Estimados estudiantes,

Les comparto recursos pedagógicos complementarios para apoyar su aprendizaje de la materia.

Estos materiales están diseñados para ayudarlos a profundizar en los temas y reforzar su comprensión.

¡Mucho éxito en sus estudios!

Atentamente,
${user.nombre}
${user.unidad || "Departamento de Informática"}`}
                      style={{ 
                        fontSize: '14px', 
                        lineHeight: '1.6',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px'
                      }}
                    />
                    
                    <small className="text-muted mt-2 d-block">
                      Edita este mensaje según lo que quieras comunicar a tus estudiantes
                    </small>
                  </div>
                  
                  <div className="border-top pt-3">
                    <p className="text-muted small mb-2">
                      <strong>📎 Material adjunto/incluido:</strong>
                    </p>
                    <ul className="list-unstyled small">
                      {accionSeleccionada === 'zip' && (
                        <li>✅ Archivo ZIP con todos los materiales organizados por guión</li>
                      )}
                      {accionSeleccionada === 'drive' && (
                        <li>✅ Enlace directo a Google Drive con acceso a todos los archivos</li>
                      )}
                      {accionSeleccionada === 'url' && (
                        <li>✅ Enlace de descarga directa disponible por {diasExpiracion} días</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Tab>
        )}

        {/* --- PASO FINAL: Confirmar (dinámico) --- */}
        {/* Si es CORREO: paso 4, si NO es CORREO: paso 3 */}
        <Tab 
          eventKey={distribucionSeleccionada === 'correo' ? 4 : 3} 
          title={
            <span className={stepEnvio >= (distribucionSeleccionada === 'correo' ? 4 : 3) ? "text-primary" : "text-muted"}>
              ✅ Confirmar
            </span>
          }
          disabled={
            (distribucionSeleccionada === 'correo' && stepEnvio !== 4) ||
            (distribucionSeleccionada !== 'correo' && stepEnvio !== 3)
          }
        >
          <div className="text-center py-4">
            <div className="mb-4">
              <span className="display-4 text-success">✅</span>
              <h4 className="mt-3">¿Estás listo para proceder?</h4>
              <p className="text-muted">Revisa que todo esté correcto</p>
            </div>

            <div className="card mb-4">
              <div className="card-body text-start">
                <h6>📋 Resumen Final</h6>
                <ul className="list-unstyled">
                  <li>📚 <strong>Guiones:</strong> {guionesSeleccionados.length}</li>
                  <li>📁 <strong>Materiales:</strong> {materialesRevision?.filter(m => m.estado === 'generado')?.length || 0}</li>
                  <li>⚙️ <strong>Acción:</strong> 
                    {accionSeleccionada === 'zip' && ' Crear ZIP'}
                    {accionSeleccionada === 'drive' && ' Subir a Google Drive'}
                    {accionSeleccionada === 'url' && ' Generar URL Temporal'}
                  </li>
                  <li>📤 <strong>Distribución:</strong> 
                    {distribucionSeleccionada === 'correo' && ' Enviar por correo'}
                    {distribucionSeleccionada === 'descargar' && ' Descargar tú mismo'}
                    {distribucionSeleccionada === 'copiar' && ' Copiar link'}
                    {distribucionSeleccionada === 'qr' && ' Generar código QR'}
                  </li>
                  
                  {distribucionSeleccionada === 'correo' && (
                    <>
                      <li>👥 <strong>Estudiantes:</strong> {emailsEstudiantes.split('\n').filter(email => email.trim() !== "").length}</li>
                      <li>👨‍🏫 <strong>Profesor:</strong> {user.nombre}</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
            
            <div className="alert alert-warning">
              <strong>⚠️ Importante:</strong> Una vez procesado, los materiales se generarán según tu selección.
            </div>
          </div>
        </Tab>
      </Tabs>
    )}
  </Modal.Body>

  <Modal.Footer>
    <Button
      variant="secondary"
      onClick={() => {
        if (stepEnvio > 0) {
          setStepEnvio(stepEnvio - 1);
        }
      }}
      disabled={stepEnvio === 0 || isLoading}
    >
      Anterior
    </Button>

    {/* ✅ LÓGICA DE NAVEGACIÓN SIMPLIFICADA */}
    {(stepEnvio < (distribucionSeleccionada === 'correo' ? 4 : 3)) ? (
      <Button
        variant="primary"
        onClick={() => {
          if (stepEnvio === 0) {
            // Validaciones del paso 0
            if (guionesSeleccionados.length === 0) {
              alert('Por favor selecciona al menos un guión');
              return;
            }
            
            const algunMaterialSeleccionado = guionesSeleccionados.some(guionId => {
              const materiales = materialesPorGuion[guionId];
              return (
                materiales?.extras?.resumen ||
                materiales?.extras?.mapaConceptual ||
                materiales?.extras?.flashcards ||
                materiales?.extras?.glosario ||
                materiales?.extras?.infografia
              );
            });
            
            if (!algunMaterialSeleccionado) {
              alert('Por favor selecciona al menos un tipo de material');
              return;
            }
            
             const nuevosMaterialesPendientes = crearListaMaterialesPendientes();
            setMaterialesPendientes(nuevosMaterialesPendientes);
            iniciarRevisionMasiva(nuevosMaterialesPendientes);
            setShowVentanaIndividualModal(true);
            return;
          }
          
          if (stepEnvio === 1) {
            if (!accionSeleccionada) {
              alert('Por favor selecciona cómo preparar los materiales');
              return;
            }
            setStepEnvio(2);
          }
          
          if (stepEnvio === 2) {
            if (!distribucionSeleccionada) {
              alert('Por favor selecciona un método de distribución');
              return;
            }
            
            if (distribucionSeleccionada === 'correo') {
              const emailsValidos = emailsEstudiantes.split('\n').filter(email => email.trim() !== "");
              if (emailsValidos.length === 0) {
                alert('Por favor ingresa al menos un correo electrónico');
                return;
              }
              setStepEnvio(3);
            } else {
              setStepEnvio(3);
            }
          }
          
          if (stepEnvio === 3 && distribucionSeleccionada === 'correo') {
            setStepEnvio(4);
          }
        }}
      >
        {stepEnvio === 0 ? 'Siguiente: Revisar Materiales' :
         stepEnvio === 1 ? 'Siguiente: Distribuir' :
         stepEnvio === 2 && distribucionSeleccionada === 'correo' ? 'Siguiente: Vista Previa' :
         stepEnvio === 2 && distribucionSeleccionada !== 'correo' ? 'Siguiente: Confirmar' :
         'Siguiente: Confirmar'}
      </Button>
    ) : (
      <Button
        variant="success"
        onClick={async () => {
          // ✅ NUEVA FUNCIÓN QUE MANEJA TODAS LAS OPCIONES
          await procesarMaterialesSegunSeleccion();
        }}
        className="fw-bold"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="d-flex align-items-center justify-content-center">
            <div className="spinner-border spinner-border-sm me-2" role="status">
              <span className="visually-hidden">Procesando...</span>
            </div>
            Procesando...
          </div>
        ) : (
          <>
            {distribucionSeleccionada === 'descargar' && '⬇️ Descargar Material'}
            {distribucionSeleccionada === 'copiar' && '📋 Generar y Copiar Link'}
            {distribucionSeleccionada === 'qr' && '📱 Generar Código QR'}
            {(distribucionSeleccionada === 'correo') && '📧 Enviar a Estudiantes'}
          </>
        )}
      </Button>
    )}

    <Button variant="outline-danger" onClick={closeEnvioModal} disabled={isLoading}>
      Cancelar
    </Button>
  </Modal.Footer>
</Modal>
{/*#######################################################################################################*/}
{/*#######################################################################################################*/}
{/*#######################################################################################################*/}


    {/*#######################################################################################################*/}
    {/*############                                                                                           */}
    {/*############     Modal vista previa compartir                                                          */}
    {/*############                                                                                           */}
    {/*#######################################################################################################*/}



<Modal show={showVentanaIndividualModal} onHide={() => setShowVentanaIndividualModal(false)} size="xl" centered>
  <Modal.Header closeButton className="bg-light">
    <Modal.Title>
      👁️ Revisión de Materiales 
      <small className="text-muted ms-2">
        {materialesRevision.length > 0 ? 
          `(${materialActualRevision + 1} de ${materialesRevision.length})` : 
          '(Generando materiales...)'
        }
      </small>
    </Modal.Title>
  </Modal.Header>

  <Modal.Body style={{ minHeight: '500px' }}>
    {generandoRevision || materialesRevision.length === 0 ? (
      <div className="text-center py-2">
        <div className="loading-spinner">
          <div className="loading-ring"></div>
          <p className="loading-text">
            {generandoRevision ? 'Generando materiales...' : 'Cargando materiales...'}
          </p>
        </div>
        
        {/* ✅ BARRA DE PROGRESO SIMPLE */}
        {generandoRevision && (
          <div className="mt-4 px-4">
            <div className="d-flex justify-content-between mb-2">
              <small>Progreso general</small>
              <small>
                {materialesRevision.filter(m => m.estado === 'generado' || m.estado === 'error').length} 
                / {materialesRevision.length}
              </small>
            </div>
            <div className="progress" style={{height: '8px'}}>
              <div 
                className="progress-bar progress-bar-striped progress-bar-animated" 
                style={{ 
                  width: `${(materialesRevision.filter(m => m.estado === 'generado' || m.estado === 'error').length / materialesRevision.length) * 100}%` 
                }}
              ></div>
            </div>
            <small className="text-muted mt-2 d-block">
              {materialesRevision.some(m => m.estado === 'pendiente') 
                ? `Generando material... (${materialesRevision.filter(m => m.estado === 'generado' || m.estado === 'error').length + 1}/${materialesRevision.length})`
                : 'Todos los materiales generados'
              }
            </small>
          </div>
        )}
      </div>
    ) : materialesRevision.length > 0 ? (
      <div>
        {/* ✅ Navegación rápida - Puntos indicadores */}
        {materialesRevision.length > 1 && (
          <div className="d-flex justify-content-center gap-1 mb-3">
            {materialesRevision.map((material, index) => (
              <button
                key={index}
                type="button"
                className={`btn btn-sm ${index === materialActualRevision ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setMaterialActualRevision(index)}
                style={{ 
                  width: '30px', 
                  height: '30px', 
                  padding: 0,
                  borderRadius: '50%',
                  fontSize: '12px'
                }}
                disabled={generandoRevision}
                title={`${material.nombre} (${material.estado === 'generado' ? '✅' : material.estado === 'error' ? '❌' : '⏳'})`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        )}

        {/* Header del material actual */}
        <div className="mb-4 p-3 bg-primary text-white rounded">
          <h5 className="mb-1">
            {materialesRevision[materialActualRevision]?.subtipo === 'resumen' && '📄 Resumen'}
            {materialesRevision[materialActualRevision]?.subtipo === 'mapaConceptual' && '🗺️ Mapa Conceptual'}
            {materialesRevision[materialActualRevision]?.subtipo === 'flashcards' && '🎴 Flashcards'}
            {materialesRevision[materialActualRevision]?.subtipo === 'glosario' && '📚 Glosario'}
            {materialesRevision[materialActualRevision]?.subtipo === 'infografia' && '🎨 Infografía'} {/* ✅ AGREGADO */}
          </h5>
          <p className="mb-0 opacity-75">
            <strong>Guion:</strong> {materialesRevision[materialActualRevision]?.guionTitulo}
            {materialesRevision[materialActualRevision]?.estado === 'generado' && 
              ' ✅ Generado'}
            {materialesRevision[materialActualRevision]?.estado === 'error' && 
              ' ❌ Error'}
            {materialesRevision[materialActualRevision]?.estado === 'pendiente' && 
              ' ⏳ Pendiente'}
          </p>
        </div>

        {/* Contenido del material actual */}
        <div className="material-content-container">
          {materialesRevision[materialActualRevision]?.estado === 'error' ? (
            <div className="alert alert-danger text-center">
              <h6>❌ Error al generar este material</h6>
              <p>{materialesRevision[materialActualRevision]?.error}</p>
            </div>
          ) : materialesRevision[materialActualRevision]?.estado === 'generado' ? (
            <>
              
              <div className="material-preview">
                {renderizarContenidoRevision(materialesRevision[materialActualRevision])}
              </div>
            </>
          ) : (
            <div className="text-center py-5">
              <p>Preparando material...</p>
            </div>
          )}
        </div>

        {/* Barra de progreso - MOSTRAR NAVEGACIÓN MANUAL */}
        <div className="mt-4">
          <div className="d-flex justify-content-between mb-2">
            <small>
              <strong>Material {materialActualRevision + 1}</strong> de {materialesRevision.length}
            </small>
            <small className="text-muted">
              {materialesRevision.filter(m => m.estado === 'generado').length}/{materialesRevision.length} generados
            </small>
          </div>
          <div className="progress" style={{height: '8px'}}>
            <div 
              className="progress-bar" 
              style={{ 
                width: `${((materialActualRevision + 1) / materialesRevision.length) * 100}%` 
              }}
            ></div>
          </div>
          <div className="d-flex justify-content-between mt-1">
            <small className="text-muted">
              {materialActualRevision > 0 && '◀ Usa los botones para navegar'}
            </small>
            <small className="text-muted">
              {materialActualRevision < materialesRevision.length - 1 ? '▶ Siguiente material' : '✅ Último material'}
            </small>
          </div>
        </div>
      </div>
    ) : (
      <div className="text-center py-5">
        <p>No hay materiales para revisar</p>
      </div>
    )}
  </Modal.Body>

  <Modal.Footer>
  <div className="d-flex justify-content-between w-100">
    {/* ✅ IZQUIERDA: Cancelar y Rehacer */}
    <div className="d-flex gap-2">
      <Button 
        variant="outline-secondary" 
        onClick={() => setShowVentanaIndividualModal(false)}
      >
        ❌ Cancelar
      </Button>
      
      {/* BOTÓN REHACER - AHORA A LA IZQUIERDA */}
      {materialesRevision[materialActualRevision]?.estado === 'generado' && (
        <Button 
          variant="warning"
          onClick={async () => {
            const materialActual = materialesRevision[materialActualRevision];
            if (window.confirm(`¿Estás seguro de regenerar este ${materialActual.subtipo}? Se creará una nueva versión.`)) {
              try {
                setGenerandoRevision(true);
                
                // ✅ ESPECIAL PARA INFOGRAFÍA
                if (materialActual.subtipo === 'infografia') {
                  setCargandoInfografiaId(materialActual.guionId);
                }
                
                await regenerarMaterialEnRevision(
                  materialActual.id,
                  materialActual.guionId,
                  materialActual.subtipo
                );
                
              } catch (error) {
                alert(`Error al regenerar: ${error.message}`);
              } finally {
                setGenerandoRevision(false);
                if (materialActual.subtipo === 'infografia') {
                  setCargandoInfografiaId(null);
                }
              }
            }
          }}
          disabled={generandoRevision}
        >
          <i className="bi bi-arrow-clockwise me-1"></i>
          Rehacer
        </Button>
      )}
    </div>
    
    {/* ✅ DERECHA: Navegación (Anterior/Siguiente) */}
    <div className="d-flex gap-2">
      {/* BOTÓN ANTERIOR */}
      {materialActualRevision > 0 && (
        <Button 
          variant="outline-primary"
          onClick={() => setMaterialActualRevision(prev => prev - 1)}
          disabled={generandoRevision}
        >
          ◀ Anterior
        </Button>
      )}
      
      <Button 
        variant="primary"
        onClick={() => {
          if (materialActualRevision < materialesRevision.length - 1) {
            setMaterialActualRevision(prev => prev + 1);
          } else {
            console.log("✅ Finalizando revisión, materiales:", materialesRevision);
            
            const materialesGenerados = materialesRevision.filter(m => 
              m.estado === 'generado' && m.data !== null
            );
            const materialesConError = materialesRevision.filter(m => 
              m.estado === 'error'
            );
            
            console.log(`📊 Resumen: ${materialesGenerados.length} generados, ${materialesConError.length} con error`);
            
            // ✅ 1. ACTUALIZAR materialesPendientes CON LOS MATERIALES YA GENERADOS
            setMaterialesPendientes(materialesRevision);
            
            // ✅ 2. CERRAR MODAL DE REVISIÓN
            setShowVentanaIndividualModal(false);
            
            
              
              

              // ✅ 4. FLUJO NORMAL (TU CÓDIGO ORIGINAL)
            console.log("🔍 FLUJO NORMAL: No es URL temporal");
              
              // ✅ 4.1. GENERAR LA VISTA PREVIA GENERAL
            generarVistaPrevia();
              
              // ✅ 4.2. PASAR AL PASO 1 (VISTA PREVIA GENERAL)
            setStepEnvio(1);
              
            if (materialesConError.length > 0) {
                setTimeout(() => {
                  alert(`⚠️ ${materialesConError.length} material(es) no se pudieron generar.\n\n` +
                        `✅ ${materialesGenerados.length} material(es) listos para enviar.\n\n` +
                        `Los materiales con error no se incluirán en el envío.`);
                }, 300);
              }
            }
          }
        }
        disabled={generandoRevision || materialesRevision.length === 0}
      >
        {materialActualRevision < materialesRevision.length - 1 ? 
          `Siguiente (${materialActualRevision + 2}/${materialesRevision.length}) ▶` : 
          '✅ Finalizar Revisión'
        }
      </Button>
    </div>
  </div>
</Modal.Footer>
</Modal>
{/*#######################################################################################################*/}
{/*#######################################################################################################*/}
{/*#######################################################################################################*/}

    {/*#######################################################################################################*/}
    {/*############                                                                                           */}
    {/*############     Modal infografia                                                        */}
    {/*############                                                                                           */}
    {/*#######################################################################################################*/}

<Modal show={showInfografiaModal} onHide={() => setShowInfografiaModal(false)} size="xl" centered>
  <Modal.Header closeButton>
    <Modal.Title>🎨 Infografía - {infografiaData?.titulo || "Generada"}</Modal.Title>
  </Modal.Header>

  <Modal.Body className="text-center">
    <div
      className="modal-body"
      style={{
        minHeight: isLoading ? "350px" : "auto",
        transition: "min-height 0.3s ease"
      }}
    >
      {isLoading ? (
        <div className="loading-spinner">
          <div className="loading-ring"></div>
          <p className="loading-text">Generando nueva infografía...</p>
        </div>
      ) : infografiaData ? (
        <img 
          src={infografiaData.url} 
          alt={`Infografía: ${infografiaData.titulo}`}
          className="img-fluid rounded border"
          style={{ maxHeight: '150vh' }}
        />
      ) : (
        <p>No se pudo cargar la infografía.</p>
      )}
    </div>
  </Modal.Body>

  <Modal.Footer>
    <button className="btn btn-outline-secondary" onClick={() => setShowInfografiaModal(false)}>
      Cerrar
    </button>
    <button 
      className="btn btn-warning" 
      onClick={handleRehacerInfografia}
      disabled={isLoading} // Deshabilitar mientras carga
    >
      {isLoading ? (
        <>
          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          Generando...
        </>
      ) : (
        '🔄 Rehacer'
      )}
    </button>
    <button 
      className="btn btn-primary" 
      onClick={() => handleDescargarInfografia('descargar')}
      disabled={isLoading || !infografiaData} // Deshabilitar si está cargando o no hay datos
    >
      📥 Descargar PNG
    </button>
  </Modal.Footer>
</Modal>


{/*#######################################################################################################*/}
{/*#######################################################################################################*/}
{/*#######################################################################################################*/}

{/*#######################################################################################################*/}
{/*############                                                                                           */}
{/*############     Modal Vista Previa Infografía                                                        */}
{/*############                                                                                           */}
{/*#######################################################################################################*/}
<Modal 
  show={showVistaPreviaInfografia} 
  onHide={() => setShowVistaPreviaInfografia(false)} 
  size="lg"  // ✅ Cambiado de "xl" a "lg"
  centered
>
  <Modal.Header closeButton className="bg-primary text-white py-2">
    <Modal.Title className="h5 mb-0">
      🎨 Infografía - {infografiaPreviaData?.titulo || "Vista previa"}
    </Modal.Title>
  </Modal.Header>

  <Modal.Body className="p-2 bg-dark" style={{ maxHeight: '70vh', overflow: 'auto' }}>
    {infografiaPreviaData ? (
      <div className="text-center">
        {/* ✅ CONTENEDOR MÁS COMPACTO */}
        <div 
          className="border rounded bg-white d-inline-block p-1"
          style={{ 
            maxWidth: '100%',
            maxHeight: '60vh',  // ✅ Reducido
            overflow: 'auto'
          }}
        >
          <img 
            src={infografiaPreviaData.url} 
            alt={`Infografía: ${infografiaPreviaData.titulo}`}
            className="img-fluid"
            style={{ 
              maxWidth: '100%',
              height: 'auto',
              display: 'block'
            }}
          />
        </div>
        
        {/* ✅ INFO MÁS PEQUEÑA */}
        <div className="mt-2 bg-light p-2 rounded">
          <p className="mb-0 small">
            <strong>Guion:</strong> {infografiaPreviaData.guionTitulo}
          </p>
          <small className="text-muted">
            Desplázate si la imagen es muy grande.
          </small>
        </div>
      </div>
    ) : (
      <div className="text-center py-3">
        <div className="spinner-border spinner-border-sm text-primary mb-2" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mb-0">Cargando infografía...</p>
      </div>
    )}
  </Modal.Body>

  <Modal.Footer className="py-2">
    <div className="d-flex justify-content-between w-100">
      {/* ✅ OPCIÓN 1: Solo Cerrar */}
      <Button 
        variant="secondary" 
        onClick={() => setShowVistaPreviaInfografia(false)}
        size="sm"
      >
        ✕ Cerrar
      </Button>
      
    </div>
  </Modal.Footer>
</Modal>

{/*#######################################################################################################*/}
{/*#######################################################################################################*/}
{/*#######################################################################################################*/}

{/*#######################################################################################################*/}
{/*############                                                                                           */}
{/*############     Modal GOOGLE DRIVE                                                                    */}
{/*############                                                                                           */}
{/*#######################################################################################################*/}

{/* ===== NUEVO: Modal para Google Drive ===== */}
      {/* ¡ESTO ES LO QUE FALTA! */}
<Modal show={!!modalDriveLink} onHide={() => setModalDriveLink(null)} centered>
  <Modal.Header closeButton>
    <Modal.Title>
      <span className="text-success">✅</span> Material en Google Drive
    </Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <div className="text-center mb-4">
      <div className="display-4 text-primary mb-3">☁️</div>
      <h4>¡Archivo subido exitosamente!</h4>
      <p className="text-muted">
        Comparte este enlace con tus estudiantes
      </p>
    </div>
    
    <div className="card mb-3">
      <div className="card-body">
        <p><strong>📁 Archivo:</strong> {modalDriveFileName}</p>
        <p><strong>📦 Tamaño:</strong> {modalDriveFileSize?.toFixed(2)} MB</p>
        <p><strong>🔒 Permisos:</strong> Solo lectura (pueden ver y descargar)</p>
        <small className="text-muted">
          * Los estudiantes no podrán editar ni comentar archivos PDF/PNG/HTML
        </small>
      </div>
    </div>
    
    <div className="mb-3">
      <label className="form-label fw-bold">🔗 Enlace de Google Drive:</label>
      <div className="input-group">
        <input 
          type="text" 
          className="form-control" 
          value={modalDriveLink || ''}
          readOnly
          onClick={(e) => e.target.select()}
        />
      </div>
    </div>
    
    <div className="d-grid gap-2">
      <a 
        href={modalDriveLink || '#'}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-success"
      >
        <i className="bi bi-eye me-2"></i>
        Ver en Drive
      </a>
      <button 
        className="btn btn-outline-secondary"
        onClick={() => setModalDriveLink(null)}
      >
        Cerrar
      </button>
    </div>
  </Modal.Body>
</Modal>
      {/* ===== FIN DEL NUEVO MODAL ===== */}

<Modal show={showQrModal} onHide={() => setShowQrModal(false)} size="lg" centered>
    <Modal.Header closeButton>
      <Modal.Title>📱 Código QR para Material</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <div className="text-center">
        <h5>Escanea este código para acceder al material</h5>
        <img 
          src={qrImageUrl} 
          alt="Código QR" 
          className="img-fluid mb-3"
          style={{ maxWidth: '300px', border: '1px solid #ddd', padding: '10px' }}
        />
        
        <div className="mb-3">
          <small className="text-muted">
            Enlace: <a href={qrDriveLink} target="_blank" rel="noopener">{qrDriveLink}</a>
          </small>
        </div>
        
        <div className="alert alert-info">
          <strong>📋 Cómo usar el QR:</strong>
          <ul className="mb-0 mt-2">
            <li><strong>Descarga el código QR</strong> como imagen PNG</li>
            <li><strong>Comparte la imagen</strong> en tu plataforma educativa (Aula Virtual, Teams, Classroom, etc.)</li>
            <li><strong>Los estudiantes escanean</strong> con la cámara de su celular</li>
            <li><strong>Acceden automáticamente</strong> al material en Google Drive</li>
          </ul>
        </div>
        
        <div className="alert alert-warning mt-3">
          <small>
            <strong>💡 Tip:</strong> También puedes imprimir el QR y pegarlo en la sala de clases o compartirlo en presentaciones.
          </small>
        </div>
      </div>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={() => setShowQrModal(false)}>
        Cerrar
      </Button>

      <Button 
        variant="primary"
        onClick={descargarQRComoPNG}
      >
        📥 Descargar QR como PNG
      </Button>
    </Modal.Footer>
  </Modal>


<div className="modal-container">
  <Modal
    show={showEvaluacionFormativaModal}
    onHide={() => setShowEvaluacionFormativaModal(false)}
    size="lg"
  >
    <Modal.Header closeButton>
      <Modal.Title>Evaluación Formativa</Modal.Title>
    </Modal.Header>

    <Modal.Body style={{ position: "relative" }}>
      {/* Loading inicial */}
      {isLoading && !evaluacionFormativaTexto ? (
        <div className="loading-spinner">
          <div className="loading-ring"></div>
          <p className="loading-text">Generando evaluación formativa...</p>
        </div>
      ) : evaluacionFormativaTexto ? (
        <div className="modal-body">

          <p>
            <strong>Instrucción al estudiante:</strong><br />
            {evaluacionFormativaTexto.instruccion_estudiante}
          </p>

          <div className="resumen-seccion">
            <h5>Actividad concreta</h5>
            <p>{evaluacionFormativaTexto.actividad_concreta}</p>
          </div>

          <div className="resumen-seccion">
            <h5>Producto esperado</h5>
            <p>{evaluacionFormativaTexto.producto_esperado}</p>
          </div>

          <div className="resumen-seccion">
            <h5>Criterios verificables</h5>
            {evaluacionFormativaTexto.criterios_verificables?.length ? (
              <ul>
                {evaluacionFormativaTexto.criterios_verificables.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            ) : (
              <p>No se especificaron criterios.</p>
            )}
          </div>

          <div className="resumen-seccion">
            <h5>Tiempo estimado</h5>
            <p>{evaluacionFormativaTexto.tiempo_estimado}</p>
          </div>

          <div className="resumen-seccion">
            <h5>Retroalimentación modelo</h5>
            <p>{evaluacionFormativaTexto.retroalimentacion_modelo}</p>
          </div>

        </div>
      ) : (
        <p>No hay evaluación formativa disponible.</p>
      )}
    </Modal.Body>

    <Modal.Footer className="sticky-footer">
      <div className="form-buttons d-flex justify-content-between w-100">
        <div />

        <div>
          {evaluacionFormativaTexto && (
            <button
              type="button"
              className="btn btn-primary me-2"
              onClick={() => {
                alert("Descarga PDF se implementa después");
              }}
              disabled={isLoading}
            >
              <i className="bi bi-download me-1"></i>
              Descargar PDF
            </button>
          )}

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowEvaluacionFormativaModal(false)}
            disabled={isLoading}
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal.Footer>
  </Modal>
</div>


{/*#######################################################################################################*/}
{/*#######################################################################################################*/}
{/*#######################################################################################################*/}
    </div>
    )
    
    
    
    };
    
export default CursoProfesor;
