import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from '../contexts/UserContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Asegúrate de importar useNavigate
import Header from './Header';
import Editar from '../assets/editar.png';
import Perfil2 from '../assets/perfil2.png';
import '../styles/Perfil.css';
import { url_backend } from '../Config';
const Perfil = () => {
    const { user, setUser, logout } = useContext(UserContext);
    const [isEditing, setIsEditing] = useState(false);
    const [direccion, setDireccion] = useState('');
    const [numeroCel, setNumeroCel] = useState('');
    const navigate = useNavigate(); // Usaremos useNavigate para redirigir al login

    useEffect(() => {
        if (user) {
            setDireccion(user.direccion || '');
            setNumeroCel(user.numero_cel || '');
        }
    }, [user]);

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleSaveClick = async () => {
        try {
            const response = await axios.put(`${url_backend}/perfil/${user.id}`, {
                direccion: direccion,
                numero_cel: numeroCel
            });

            if (response.data.message === "Perfil actualizado exitosamente") {
                setUser((prevUser) => ({
                    ...prevUser,
                    direccion: direccion,
                    numero_cel: numeroCel
                }));
                alert("Perfil actualizado correctamente");
                setIsEditing(false);
            } else {
                alert("Error al actualizar el perfil");
            }
        } catch (error) {
            console.error("Error al actualizar el perfil:", error);
            alert("Error al actualizar el perfil");
        }
    };

    const handleCancelClick = () => {
        setIsEditing(false);
        setDireccion(user.direccion);
        setNumeroCel(user.numero_cel);
    };

    const handleDeleteClick = async () => {
        const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar tu perfil? Esta acción es permanente.");
        if (confirmDelete) {
            try {
                const response = await axios.delete(`${url_backend}/perfil/${user.id}`);

                if (response.data.message === "Usuario eliminado exitosamente") {
                    alert("Perfil eliminado correctamente");
                    logout(); // Cierra sesión
                    navigate('/login'); // Redirige al login
                } else {
                    alert("Error al eliminar el perfil");
                }
            } catch (error) {
                console.error("Error al eliminar el perfil:", error);
                alert("Error al eliminar el perfil");
            }
        }
    };

    if (!user) {
        return <p>Cargando perfil...</p>;
    }

    return (
        <div className="perfil-container-home">
            <Header />
            <div className="perfil-container-body">
                <div className="perfil-content">
                    <div className="profile-image-container">
                        <img src={Perfil2} alt="Profile Image"/>
                    </div>
                    <div className='perfil-derecha'>
                        <h2>Mi Perfil</h2>
                        <div className="perfil-details">
                            <div className="perfil-item">
                                <strong>Nombre:</strong> <p>{user.nombre}</p>
                            </div>
                            <div className="perfil-item">
                                <strong>Correo:</strong> <p>{user.correo}</p>
                            </div>
                            <div className="perfil-item">
                                <strong>Dirección: </strong>
                                <p>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={direccion}
                                            onChange={(e) => setDireccion(e.target.value)}
                                        />
                                    ) : (
                                        user.direccion
                                    )}
                                </p>
                            </div>
                            <div className="perfil-item">
                                <strong>Número de Teléfono: </strong>
                                <p>
                                    {isEditing ? (<input
                                            type="text"
                                            value={numeroCel}
                                            onChange={(e) => setNumeroCel(e.target.value)}
                                        />

                                    ) : (
                                        user.numero_cel
                                    )}
                                </p>
                            </div>
                            <div>
                                {isEditing ? (
                                    <div>
                                        <button onClick={handleDeleteClick} className="btn-delete">Eliminar Perfil</button>
                                    </div>
                                ) : (                                
                                <div></div>)}
                            </div>
                        </div>
                    </div>
                    <div className="perfil-actions">
                            {isEditing ? (
                                <div >
                                    <div className='guardar-cancelar'> 
                                        <button onClick={handleSaveClick} className="btn-save">Guardar</button>
                                        <button onClick={handleCancelClick} className="btn-cancel">Cancelar</button>
                                    </div>
                                    
                                </div>
                                
                            ) : (
                                <div>
                                    <div onClick={handleEditClick} className="btn-edit">
                                        <img src={Editar} alt="Editar curso" />Editar
                                    </div>
                                </div>

                            )}
                        </div>
                </div>
            </div>
        </div>
    );
};

export default Perfil;
