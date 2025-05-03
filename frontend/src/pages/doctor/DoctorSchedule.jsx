import { useState, useEffect } from 'react';
import { doctorService } from '../../services/api';
import Spinner from '../../components/common/Spinner';
import Alert from '../../components/common/Alert';
import './Doctor.css';

const DoctorSchedule = () => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Estado de selección de días
  const [selectedDays, setSelectedDays] = useState({
    0: false, // Domingo
    1: false, // Lunes
    2: false, // Martes
    3: false, // Miércoles
    4: false, // Jueves
    5: false, // Viernes
    6: false  // Sábado
  });
  
  // Estado de selección de horario (igual para todos los días)
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('17:00');

  // Cargar horario actual al montar el componente
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        const response = await doctorService.getSchedule();
        const scheduleData = response.data.data;
        
        setSchedule(scheduleData);
        
        // Actualizar días seleccionados basado en horario actual
        const newSelectedDays = { ...selectedDays };
        scheduleData.forEach(day => {
          newSelectedDays[day.dia_semana] = true;
        });
        setSelectedDays(newSelectedDays);
        
        // Si hay al menos un día programado, configurar los horarios del primero
        if (scheduleData.length > 0) {
          // Quitamos los segundos si existen
          const startTime = scheduleData[0].hora_inicio.split(':').slice(0, 2).join(':');
          const endTime = scheduleData[0].hora_fin.split(':').slice(0, 2).join(':');
          
          setStartTime(startTime);
          setEndTime(endTime);
        }
      } catch (err) {
        console.error('Error al obtener horario:', err);
        setError('Error al cargar tu horario. Por favor intenta más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  // Manejar cambios en la selección de días
  const handleDayChange = (day, checked) => {
    setSelectedDays(prev => ({
      ...prev,
      [day]: checked
    }));
  };

  // Manejar cambios de horario
  const handleStartTimeChange = (e) => {
    setStartTime(e.target.value);
  };

  const handleEndTimeChange = (e) => {
    setEndTime(e.target.value);
  };

  // Preparar datos de horario para guardar
  const prepareScheduleData = () => {
    const horarios = [];
    
    // Para cada día seleccionado, agregar una entrada de horario
    Object.entries(selectedDays).forEach(([day, selected]) => {
      if (selected) {
        horarios.push({
          dia_semana: parseInt(day),
          hora_inicio: startTime,
          hora_fin: endTime
        });
      }
    });
    
    // Aseguramos que devolvemos el formato correcto: un objeto con propiedad horarios
    return { horarios };
  };

  // Manejar guardado de horario
  const handleSaveSchedule = async () => {
    const scheduleData = prepareScheduleData();
    
    if (scheduleData.horarios.length === 0) {
      setError('Por favor selecciona al menos un día');
      return;
    }
    
    // Para depuración
    console.log('Datos a enviar:', JSON.stringify(scheduleData));
    
    try {
      setSaving(true);
      setError(null);
      
      const response = await doctorService.setSchedule(scheduleData);
      
      if (response.data.status === 'success') {
        setSuccess('¡Horario actualizado con éxito!');
        setSchedule(response.data.data);
        
        // Limpiar mensaje de éxito después de un retraso
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      }
    } catch (err) {
      console.error('Error al guardar horario:', err);
      
      if (err.response?.data?.errors) {
        // Mostrar errores específicos de validación
        const validationErrors = err.response.data.errors;
        console.log('Errores de validación:', validationErrors);
        
        const errorMessages = validationErrors.map(e => `${e.field}: ${e.message}`).join(', ');
        setError(`Error de validación: ${errorMessages}`);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Error al actualizar horario. Por favor intenta más tarde.');
      }
      
      // Limpiar mensaje de error después de un retraso
      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setSaving(false);
    }
  };

  // Nombres de días para mostrar
  const daysOfWeek = [
    'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
  ];

  // Formatear hora para mostrar
  const formatTime = (timeString) => {
    if (!timeString) return '';
    
    try {
      const [hours, minutes] = timeString.split(':');
      const time = new Date();
      time.setHours(parseInt(hours));
      time.setMinutes(parseInt(minutes));
      
      return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return timeString;
    }
  };

  return (
    <div className="doctor-schedule-container">
      <h1 className="page-title">Administrar Tu Horario</h1>
      
      {error && (
        <Alert 
          message={error} 
          type="error" 
          title="Error"
          showIcon={true}
        />
      )}
      
      {success && (
        <Alert 
          message={success} 
          type="success" 
          title="Éxito"
          showIcon={true}
          duration={3000}
        />
      )}
      
      {loading ? (
        <div className="schedule-loading">
          <Spinner type="ripple" size="large" />
          <p>Cargando tu horario...</p>
        </div>
      ) : (
        <>
          <div className="schedule-card">
            <h3>Establecer Tus Horas de Trabajo</h3>
            <p className="mb-3">Selecciona los días en que deseas trabajar y establece las horas para esos días.</p>
            
            <div className="day-selector">
              {daysOfWeek.map((day, index) => (
                <div className="day-checkbox" key={index}>
                  <input
                    type="checkbox"
                    id={`day-${index}`}
                    checked={selectedDays[index]}
                    onChange={(e) => handleDayChange(index, e.target.checked)}
                  />
                  <label htmlFor={`day-${index}`}>{day}</label>
                </div>
              ))}
            </div>
            
            <div className="time-selectors">
              <div className="form-group">
                <label htmlFor="startTime" className="form-label">Hora de Inicio</label>
                <input
                  type="time"
                  id="startTime"
                  className="form-control"
                  value={startTime}
                  onChange={handleStartTimeChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="endTime" className="form-label">Hora de Fin</label>
                <input
                  type="time"
                  id="endTime"
                  className="form-control"
                  value={endTime}
                  onChange={handleEndTimeChange}
                />
              </div>
            </div>
            
            <button
              className="btn btn-primary"
              onClick={handleSaveSchedule}
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="spinner-inline me-2"></span>
                  Guardando...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                    <polyline points="7 3 7 8 15 8"></polyline>
                  </svg>
                  Guardar Horario
                </>
              )}
            </button>
          </div>
          
          <div className="current-schedule">
            <h3>Horario Actual</h3>
            
            {schedule.length > 0 ? (
              <table className="schedule-table">
                <thead>
                  <tr>
                    <th>Día</th>
                    <th>Hora de Inicio</th>
                    <th>Hora de Fin</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((day) => (
                    <tr key={day.id || day.dia_semana}>
                      <td>{daysOfWeek[day.dia_semana]}</td>
                      <td>{formatTime(day.hora_inicio)}</td>
                      <td>{formatTime(day.hora_fin)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="no-schedule">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1rem', opacity: 0.5 }}>
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <h3 style={{ marginBottom: '0.75rem', color: 'var(--text-primary)' }}>No Hay Horario Establecido</h3>
                <p>No has establecido ningún horario todavía. Por favor selecciona tus días y horas de trabajo arriba.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DoctorSchedule;