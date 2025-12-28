// src/App.js

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import Login from './components/Login';
import Home from './components/Home';
import ProtectedRoute from './components/ProtectedRoute';
import CursoProfesor from './components/CursoProfesor';
import Respuestas from './components/Respuestas';
import Corpus from './components/Corpus';
import './App.css';
import Registro from './components/Registro';
import Perfil from './components/Perfil';
import Foro from './components/Foro';
import Notificaciones from './components/notificaciones';
import ReporteDeError from './components/ReporteDeError';
import Admin from './components/admin';
import Calendario from './components/calendario';
import ResponderEvaluacion from './components/ResponderEvaluacion'; // Nueva importación
import '@fortawesome/fontawesome-free/css/all.min.css';

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/reportedeerror" element={<ReporteDeError />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/notificaciones" element={<Notificaciones />} />
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/curso-profesor/:cursoId" element={<ProtectedRoute><CursoProfesor /></ProtectedRoute>} />
          <Route path="/respuestas/:actividadId" element={<ProtectedRoute><Respuestas /></ProtectedRoute>} />
          <Route path="/corpus/:unidadId" element={<ProtectedRoute><Corpus /></ProtectedRoute>} />
          <Route path="/foro/:unidadId" element={<ProtectedRoute><Foro /></ProtectedRoute>} />
          <Route path="/calendario" element={<ProtectedRoute><Calendario /></ProtectedRoute>} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requiredUserType={3}>
                <Admin />
              </ProtectedRoute>
            } 
          />
          <Route path="/responder-evaluacion/:evaluacionId" element={<ResponderEvaluacion />} /> {/* Nueva ruta para responder evaluación */}
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
