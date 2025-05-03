import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { patientService } from '../../services/api';
import Spinner from '../../components/common/Spinner';
import Alert from '../../components/common/Alert';
import './Patient.css';

const PatientAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [cancelingId, setCancelingId] = useState(null);

  // Cargar citas activas al montar el componente
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const response = await patientService.getActiveAppointments();
        setAppointments(response.data.data);
      } catch (err) {
        console.error('Error al obtener citas:', err);
        setError('Error al cargar citas. Por favor intente más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // Manejar cancelación de cita
  const handleCancelAppointment = async (appointmentId) => {
    if (!confirm('¿Está seguro que desea cancelar esta cita?')) {
      return;
    }
    
    try {
      setCancelingId(appointmentId);
      const response = await patientService.cancelAppointment(appointmentId);
      
      if (response.data.status === 'success') {
        setSuccess('Cita cancelada con éxito');
        
        // Eliminar la cita cancelada de la lista
        setAppointments(prevAppointments => 
          prevAppointments.filter(appointment => appointment.id !== appointmentId)
        );
        
        // Limpiar mensaje de éxito después de un retraso
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      }
    } catch (err) {
      console.error('Error al cancelar cita:', err);
      
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Error al cancelar cita. Por favor intente más tarde.');
      }
      
      // Limpiar mensaje de error después de un retraso
      setTimeout(() => {
        setError(null);
      }, 3000);
    } finally {
      setCancelingId(null);
    }
  };

  // Formatear fecha para mostrar
  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  // Formatear hora para mostrar
  const formatTime = (timeString) => {
    return timeString.slice(0, 5);
  };

  return (
    <div className="appointments-container">
      <h1 className="page-title">Mis Citas</h1>
      
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
        <div className="appointments-loading">
          <Spinner type="ripple" size="large" />
          <p>Cargando citas...</p>
        </div>
      ) : appointments.length > 0 ? (
        <div className="appointments-list">
          {appointments.map(appointment => (
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
              </div>
              
              <div className="appointment-actions">
                <span className="appointment-status status-pending">Pendiente</span>
                <button 
                  className="btn btn-danger"
                  onClick={() => handleCancelAppointment(appointment.id)}
                  disabled={cancelingId === appointment.id}
                >
                  {cancelingId === appointment.id ? (
                    <span className="spinner-inline me-2"></span>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  )}
                  Cancelar
                </button>
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
          <h3 style={{ marginBottom: '0.75rem', color: 'var(--text-primary)' }}>No Hay Citas Activas</h3>
          <p>No tienes citas activas en este momento.</p>
          <Link to="/patient/doctors" className="btn btn-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            Buscar un Médico
          </Link>
        </div>
      )}
    </div>
  );
};

export default PatientAppointments;