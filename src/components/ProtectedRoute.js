// src/components/ProtectedRoute.js
import React, { useContext, useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import axios from 'axios';
import { url_backend } from '../Config';
const ProtectedRoute = ({ children, requiredUserType }) => {
  const { user, setUser } = useContext(UserContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserAuthentication = async () => {
      // Si el usuario no está en el contexto, intentar obtenerlo de localStorage
      if (!user) {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
          setUser(storedUser); // Si existe en localStorage, actualizar el contexto
        }
      }
      setLoading(false);
    };

    checkUserAuthentication();
  }, [user, setUser]);

  if (loading) {
    return <div>Loading...</div>; // Cargando hasta obtener el usuario
  }

  // Si no hay usuario autenticado, redirigir a la página de login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Verificar si el tipo de usuario coincide con el requerido
  if (requiredUserType && user.tipo !== requiredUserType) {
    return <Navigate to="/" />; // Si el tipo no coincide, redirige al Home o cualquier otra página
  }

  return <>{children}</>; // Si todo es válido, renderiza los hijos
};

export default ProtectedRoute;
