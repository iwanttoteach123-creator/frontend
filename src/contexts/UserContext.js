// src/contexts/UserContext.js
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { url_backend } from '../Config';
export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [cursos, setCursos] = useState([]);

  // Cargar usuario desde localStorage al inicio
  useEffect(() => {
    const storedUser = localStorage.getItem('user'); // Cambiar el key a 'user'
    const storedCursos = localStorage.getItem('cursos');
    
    if (storedUser) {
      setUser(JSON.parse(storedUser)); // Asegúrate de parsear el usuario si almacenas un objeto
    }
    
    if (storedCursos) {
      setCursos(JSON.parse(storedCursos));
    }
  }, []);

  // Función para iniciar sesión y obtener cursos
  const login = async (correo, clave) => {
    try {
      const response = await axios.post(`${url_backend}/login`, { correo, clave }, { withCredentials: true });
      const userData = response.data.user;
      
      // Guardar el usuario y los cursos en el estado y localStorage
      setUser(userData);
      setCursos(userData.cursos);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('cursos', JSON.stringify(userData.cursos));
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      throw error; // Lanza el error para que Login lo maneje
    }
  };

  const logout = async () => {
    try {
      console.log('Enviando solicitud de cierre de sesión...');
      await axios.post(`${url_backend}/logout`, {}, { withCredentials: true });

      // Mostrar el contenido de localStorage antes de limpiar
      console.log('Contenido de localStorage antes de limpiar:', localStorage);

      // Limpiar los datos del localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('cursos');

      // Mostrar el contenido de localStorage después de limpiar
      console.log('Contenido de localStorage después de limpiar:', localStorage);

      // Actualizar el estado del usuario en el contexto
      setUser(null);
      setCursos([]);
      
      console.log('Sesión cerrada con éxito.');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, cursos, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};
