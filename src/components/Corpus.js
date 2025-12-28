import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Header from './Header';
import Plus from '../assets/plus.png';
import '../styles/Corpus.css';
import { url_backend } from '../Config';
const Corpus = () => {
  const { unidadId } = useParams();
  const [corpus, setCorpus] = useState([]);
  const [cursoId, setCursoId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState([]); // Cambiado a array
  const [successMessage, setSuccessMessage] = useState('');
  const [showCrearCorpusForm, setShowCrearCorpusForm] = useState(false);
  const [isUploadingNew, setIsUploadingNew] = useState(false);
  const [isUpdatingFile, setIsUpdatingFile] = useState(false);

  useEffect(() => {
    fetchCorpus();
  }, [unidadId]);

  const fetchCorpus = async () => {
    try {
      const response = await axios.get(`${url_backend}/unidad/${unidadId}/corpus`);
      setCorpus(response.data.corpus || []);
      setCursoId(response.data.curso_id);
    } catch (error) {
      console.error('Error fetching corpus:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event) => {
    setSelectedFiles(Array.from(event.target.files)); // Convert FileList to an array
  };

  const handleAgregarCorpus = async (event) => {
    event.preventDefault();
    if (selectedFiles.length > 0) {
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });

      setIsUploadingNew(true);

      try {
        const response = await axios.post(`${url_backend}/upload-and-create-assistant/${unidadId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        const nuevosCorpus = response.data.corpus_id_list.map((id, index) => ({
          id,
          titulo: selectedFiles[index].name,
          material: ''
        }));
        setCorpus(prevCorpus => [...prevCorpus, ...nuevosCorpus]);
        setSuccessMessage(response.data.message);
        setShowCrearCorpusForm(false);
        setSelectedFiles([]);
      } catch (error) {
        console.error('Error uploading file and creating assistant:', error);
      } finally {
        setIsUploadingNew(false);
      }
    } else {
      console.warn('Ningún archivo seleccionado.');
    }
  };

  const toggleCorpus = (id) => {
    setCorpus(corpus.map(c => {
      if (c.id === id) {
        return { ...c, expanded: !c.expanded };
      }
      return c;
    }));
  };

  const handleEliminarCorpus = async (corpusId) => {
    const confirmDelete = window.confirm("¿Estás seguro de que quieres eliminar este recurso?");
    if (confirmDelete) {
      try {
        const response = await fetch(`${url_backend}/corpus/${corpusId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          await fetchCorpus();
        } else {
          console.error('Error al borrar el recurso:', response.statusText);
        }
      } catch (error) {
        console.error('Error al borrar el recurso:', error);
      }
    }
  };

  const handleActualizarCorpus = (corpusId) => {
    document.getElementById(`fileUpload-${corpusId}`).click();
  };

  const handleFileChanges = async (event, corpusId) => {
    const newFile = event.target.files[0];
    setIsUpdatingFile(true); // Iniciar animación de carga

    if (newFile) {
      const formData = new FormData();
      formData.append('file', newFile);
      formData.append('unidadId', unidadId);
      
      try {
        const response = await axios.put(`${url_backend}/corpus/${corpusId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        await fetchCorpus(); // Refrescar la lista de corpus
        setSelectedFiles([]);
      } catch (error) {
        console.error('Error updating corpus:', error);
      } finally {
        setIsUpdatingFile(false);
      }
    } else {
      setIsUpdatingFile(false);
      console.warn('Ningún archivo seleccionado.');
    }
  };

  return (
    <div className="container-corpus">
      <Header />
      <div className='volver'>
        {!loading && cursoId && (
          <Link to={`/curso-profesor/${cursoId}`} className="link-back">← Volver</Link>
        )}
      </div>
      <div className='container-body-corpus'>
        <div className="Principal">
          <p>Recursos para la unidad</p>
        </div>
        <div className="crear-corpus">
          {!showCrearCorpusForm ? (
            <button type="button" className="btn btn-agregar" data-bs-toggle="modal" data-bs-target="#exampleModal" onClick={() => setShowCrearCorpusForm(true)}>
              <img src={Plus} alt="Ícono Más" className="icono-plus" />
              Agregar Recurso
            </button>
          ) : (
            <form onSubmit={handleAgregarCorpus} style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
            <label htmlFor="fileUpload">Seleccionar archivo:</label>
            <input
              type="file"
              id="fileUpload"
              style={{ display: 'none' }}
              onChange={handleFileChange}
              multiple // Permite selección de múltiples archivos
            />
            <button
              type="button"
              onClick={() => document.getElementById('fileUpload').click()}
              className="btn-examinar"
              style={{ marginLeft: '10px' }}
            >
              Examinar
            </button>
            {selectedFiles.length > 0 && (
              <div style={{ marginLeft: '10px' }}>
                {selectedFiles.map((file, index) => (
                  <p key={index}>Archivo seleccionado: {file.name}</p>
                ))}
              </div>
            )}
            <div className="form-buttons">
              <button type="submit" className="btn-agregar2">Guardar</button>
              <button type="button" className="btn-cancelar2" onClick={() => setShowCrearCorpusForm(false)}>Cancelar</button>
            </div>
          </form>
          )}
          {isUploadingNew && (
            <div className="loading-spinner">
              <div className="loading-ring"></div>
              <p className="loading-text">Subiendo archivo...</p>
            </div>
          )}
        </div>
        {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}

        <ul className="corpus-list">
          {corpus.map(c => (
            <li key={c.id} className="corpus-item">
              <div className="corpus-card">
                <div className="corpus-line"></div>
                <div className="corpus-content">
                  <div className='titulo-corpus'>
                    {c.titulo}
                  </div>
                  
                  <button className="btn-primary btn-actualizar-corpus" onClick={() => handleActualizarCorpus(c.id)}>
                    Actualizar material
                  </button>
                  <button className="btn-danger btn-eliminar-corpus" onClick={() => handleEliminarCorpus(c.id)}>
                    Eliminar material
                  </button>
                  {/* Input para seleccionar el archivo */}
                  <input
                    type="file"
                    id={`fileUpload-${c.id}`} // Input asociado al corpus_id
                    style={{ display: 'none' }} // Oculto hasta que se haga clic en el botón
                    onChange={(event) => handleFileChanges(event, c.id)} // Al cambiar, llama a la función con el corpus_id
                  />
                </div>
                {isUpdatingFile && (
                  <div className="loading-spinner">
                    <div className="loading-ring"></div>
                    <p className="loading-text">Actualizando archivo...</p>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Corpus;