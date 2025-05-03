import { useState, useEffect } from 'react';
import { patientService } from '../../services/api';
import Spinner from '../../components/common/Spinner';
import Alert from '../../components/common/Alert';
import './Patient.css';

const PatientHistory = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'attended', 'canceled'

  // Cargar historial de citas al montar el componente
  useEffect(() => {
    const fetchAppointmentHistory = async () => {
      try {
        setLoading(true);
        const response = await patientService.getAppointmentHistory();
        setAppointments(response.data.data);
      } catch (err) {
        console.error('Error al obtener historial de citas:', err);
        setError('Error al cargar historial de citas. Por favor intente más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointmentHistory();
  }, []);

  // Formatear fecha para mostrar
  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  // Formatear hora para mostrar
  const formatTime = (timeString) => {
    return timeString.slice(0, 5);
  };

  // Filtrar citas basado en el filtro seleccionado
  const filteredAppointments = appointments.filter(appointment => {
    if (filter === 'all') return true;
    if (filter === 'attended') return appointment.estado === 'atendida';
    if (filter === 'canceled') return appointment.estado.includes('cancelada');
    return true;
  });

  // Obtener clase de estado para la cita
  const getStatusClass = (status) => {
    if (status === 'atendida') return 'status-attended';
    if (status.includes('cancelada')) return 'status-canceled';
    return '';
  };

  // Obtener texto de estado para mostrar
  const getStatusText = (status) => {
    if (status === 'atendida') return 'Atendida';
    if (status === 'cancelada_paciente') return 'Cancelada por Ti';
    if (status === 'cancelada_medico') return 'Cancelada por Médico';
    return status;
  };

  return (
    <div className="appointments-container">
      <h1 className="page-title">Historial de Citas</h1>
      
      {error && (
        <Alert 
          message={error} 
          type="error" 
          title="Error"
          showIcon={true}
        />
      )}
      
      <div className="appointments-tabs">
        <div 
          className={`appointments-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Todas
        </div>
        <div 
          className={`appointments-tab ${filter === 'attended' ? 'active' : ''}`}
          onClick={() => setFilter('attended')}
        >
          Atendidas
        </div>
        <div 
          className={`appointments-tab ${filter === 'canceled' ? 'active' : ''}`}
          onClick={() => setFilter('canceled')}
        >
          Canceladas
        </div>
      </div>
      
      {loading ? (
        <div className="appointments-loading">
          <Spinner type="ripple" size="large" />
          <p>Cargando historial de citas...</p>
        </div>
      ) : filteredAppointments.length > 0 ? (
        <div className="appointments-list">
          {filteredAppointments.map(appointment => (
            <div className="appointment-card" key={appointment.id}>
              <div className="appointment-doctor-image">
                <img 
                  src={appointment.medico.foto_url || 'https://via.placeholder.com/80?text=Doctor'} 
                  alt={appointment.medico.nombre_completo} 
                />
              </div>
              
              <div className="appointment-details">
                <div className="appointment-date">
                  {formatDate(appointment.fecha)} a las {formatTime(appointment.hora)}
                </div>
                <h3 className="appointment-doctor-name">{appointment.medico.nombre_completo}</h3>
                <div className="appointment-doctor-specialty">{appointment.medico.especialidad}</div>
                <div className="appointment-location">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  {appointment.medico.direccion_clinica}
                </div>
                <p className="mt-3"><strong>Motivo:</strong> {appointment.motivo}</p>
                
                {appointment.tratamiento && (
                  <div className="treatment-section">
                    <h4 className="treatment-title">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}>
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                      </svg>
                      Tratamiento
                    </h4>
                    <p className="treatment-content">{appointment.tratamiento}</p>
                  </div>
                )}
              </div>
              
              <div className="appointment-actions">
                <span className={`appointment-status ${getStatusClass(appointment.estado)}`}>
                  {getStatusText(appointment.estado)}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="appointments-empty">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1rem', opacity: 0.5 }}>
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <h3 style={{ marginBottom: '0.75rem', color: 'var(--text-primary)' }}>No Hay Historial de Citas</h3>
          <p>No tienes citas pasadas que coincidan con el filtro seleccionado.</p>
        </div>
      )}
    </div>
  );
};

export default PatientHistory;