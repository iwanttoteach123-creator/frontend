import React, { useState, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import Header from '../components/Header';
import '../styles/Calendario.css';
import { url_backend } from '../Config';
const Calendario = () => {
  const [actividades, setActividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedActividad, setSelectedActividad] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const getDaysOfMonth = (month) => {
    const startOfCurrentMonth = startOfMonth(month);
    const endOfCurrentMonth = endOfMonth(month);
    return eachDayOfInterval({
      start: startOfCurrentMonth,
      end: endOfCurrentMonth
    });
  };

  const getActivitiesForDate = (date) => {
    return actividades.filter((actividad) => {
      const actividadStartDate = new Date(actividad.fecha_inicio);
      const actividadEndDate = actividad.fecha_cierre ? new Date(actividad.fecha_cierre) : null;

      return (
        format(actividadStartDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd') ||
        (actividadEndDate && format(actividadEndDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))
      );
    });
  };

  useEffect(() => {
    const getActividades = async () => {
      const userId = 1;
      try {
        const response = await fetch(`${url_backend}/usuario/${userId}/actividades`);
        if (!response.ok) {
          throw new Error('Error al obtener actividades');
        }

        const data = await response.json();
        if (data && Array.isArray(data)) {
          setActividades(data);
        } else {
          throw new Error('No se encontraron actividades');
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    getActividades();
  }, []);

  const changeMonth = (direction) => {
    const newMonth = direction === 'next'
      ? addMonths(currentMonth, 1)
      : subMonths(currentMonth, 1);

    setCurrentMonth(newMonth);
  };

  const openModal = (actividad) => {
    setSelectedActividad(actividad);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedActividad(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const daysOfMonth = getDaysOfMonth(currentMonth);

  return (
    <div>
      <Header />
      <div className="calendar-header">
        <h1>Calendario</h1>
    </div>


      <div className="calendario-navigation">
        <button className="calendario-arrow" onClick={() => changeMonth('prev')}>&#8592;</button>
        <h2 className="calendario-title">{format(currentMonth, 'MMMM yyyy')}</h2>
        <button className="calendario-arrow" onClick={() => changeMonth('next')}>&#8594;</button>
      </div>

      <div className="calendar-month">
        <div className="calendar-grid">
          {daysOfMonth.map((day) => {
            const activitiesForDay = getActivitiesForDate(day);
            return (
              <div key={day} className="calendar-day">
                <div className="day-number">{format(day, 'd')}</div>
                <div className="activities">
                  {activitiesForDay.map((actividad) => {
                    const actividadStartDate = new Date(actividad.fecha_inicio);
                    const actividadEndDate = actividad.fecha_cierre ? new Date(actividad.fecha_cierre) : null;
                    return (
                      <>
                        {format(actividadStartDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd') && (
                          <div
                            key={`start-${actividad.actividad_id}`}
                            className="activity start"
                            onClick={() => openModal(actividad)}
                          >
                            <span>{actividad.actividad_titulo} (Inicio)</span>
                          </div>
                        )}
                        {actividadEndDate && format(actividadEndDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd') && (
                          <div
                            key={`end-${actividad.actividad_id}`}
                            className="activity end"
                            onClick={() => openModal(actividad)}
                          >
                            <span>{actividad.actividad_titulo} (Cierre)</span>
                          </div>
                        )}
                      </>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {modalOpen && selectedActividad && (
  <div className="calendario-modal">
    <div className="calendario-modal-content">
      <h2 className="calendario-modal-title">{selectedActividad.curso_nombre}</h2>
      <div className="calendario-modal-info">
        <p><strong>Unidad:</strong> {selectedActividad.unidad_nombre}</p>
        <p><strong>Título:</strong> {selectedActividad.actividad_titulo}</p>
        <p><strong>Descripción:</strong> {selectedActividad.actividad_descripcion}</p>
        <p><strong>Fecha de inicio:</strong> {format(new Date(selectedActividad.fecha_inicio), 'dd/MM/yyyy')}</p>
        <p><strong>Fecha de cierre:</strong> {selectedActividad.fecha_cierre ? format(new Date(selectedActividad.fecha_cierre), 'dd/MM/yyyy') : 'N/A'}</p>
        <p><strong>Hora de inicio:</strong> {selectedActividad.hora_inicio}</p>
        <p><strong>Hora de cierre:</strong> {selectedActividad.hora_cierre}</p>
      </div>
      <button onClick={closeModal} className="calendario-modal-close-button">Cerrar</button>
    </div>
  </div>
)}

    </div>
  );
};

export default Calendario;
