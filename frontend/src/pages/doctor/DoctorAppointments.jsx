import { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { doctorService } from '../../services/api';
import Spinner from '../../components/common/Spinner';
import Alert from '../../components/common/Alert';
import './Doctor.css';

// Esquema de validación para tratamiento
const treatmentSchema = Yup.object({
  tratamiento: Yup.string()
    .required('El tratamiento es obligatorio')
    .min(10, 'El tratamiento debe tener al menos 10 caracteres')
});

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showTreatmentForm, setShowTreatmentForm] = useState(false);

  // Cargar citas pendientes al montar el componente
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const response = await doctorService.getPendingAppointments();
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
    if (!confirm('¿Está seguro que desea cancelar esta cita? El paciente será notificado.')) {
      return;
    }
    
    try {
      setActionLoading(true);
      setSelectedAppointment(appointmentId);
      
      const response = await doctorService.cancelAppointment(appointmentId);
      
      if (response.data.status === 'success') {
        setSuccess('Cita cancelada con éxito. El paciente ha sido notificado.');
        
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
      setActionLoading(false);
      setSelectedAppointment(null);
    }
  };

  // Abrir formulario de tratamiento para una cita
  const openTreatmentForm = (appointmentId) => {
    setSelectedAppointment(appointmentId);
    setShowTreatmentForm(true);
  };

  // Manejar envío de tratamiento y marcar cita como atendida
  const handleSubmitTreatment = async (values, { resetForm }) => {
    try {
      setActionLoading(true);
      
      const response = await doctorService.attendAppointment(selectedAppointment, values);
      
      if (response.data.status === 'success') {
        setSuccess('Cita marcada como atendida y tratamiento guardado.');
        
        // Eliminar la cita atendida de la lista
        setAppointments(prevAppointments => 
          prevAppointments.filter(appointment => appointment.id !== selectedAppointment)
        );
        
        // Cerrar el formulario y reiniciar
        setShowTreatmentForm(false);
        setSelectedAppointment(null);
        resetForm();
        
        // Limpiar mensaje de éxito después de un retraso
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      }
    } catch (err) {
      console.error('Error al atender cita:', err);
      
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Error al atender cita. Por favor intente más tarde.');
      }
      
      // Limpiar mensaje de error después de un retraso
      setTimeout(() => {
        setError(null);
      }, 3000);
    } finally {
      setActionLoading(false);
    }
  };

  // Cancelar envío de formulario de tratamiento
  const cancelTreatmentForm = () => {
    setShowTreatmentForm(false);
    setSelectedAppointment(null);
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

  // Ordenar citas por fecha y hora (más reciente primero)
  const sortedAppointments = [...appointments].sort((a, b) => {
    const dateA = new Date(`${a.fecha}T${a.hora}`);
    const dateB = new Date(`${b.fecha}T${b.hora}`);
    return dateA - dateB;
  });

  return (
    <div className="doctor-appointments-container">
      <h1 className="page-title">Citas Pendientes</h1>
      
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
      ) : sortedAppointments.length > 0 ? (
        <div className="appointments-list">
          {sortedAppointments.map(appointment => (
            <div className="appointment-card" key={appointment.id}>
              <div className="appointment-patient-image">
                <img 
                  src={appointment.paciente.foto_url || 'https://via.placeholder.com/80?text=Patient'} 
                  alt={appointment.paciente.nombre_completo} 
                />
              </div>
              
              <div className="appointment-details">
                <div className="appointment-date">
                  {formatDate(appointment.fecha)} a las {formatTime(appointment.hora)}
                </div>
                <h3 className="appointment-patient-name">{appointment.paciente.nombre_completo}</h3>
                <div className="appointment-patient-contact">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  {appointment.paciente.telefono}
                </div>
                <p className="mt-3"><strong>Motivo de la Visita:</strong> {appointment.motivo}</p>
              </div>
              
              <div className="appointment-actions">
                <button 
                  className="btn btn-success"
                  onClick={() => openTreatmentForm(appointment.id)}
                  disabled={actionLoading && selectedAppointment === appointment.id}
                >
                  {actionLoading && selectedAppointment === appointment.id ? (
                    <span className="spinner-inline me-2"></span>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2">
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                    </svg>
                  )}
                  Atender
                </button>
                <button 
                  className="btn btn-danger"
                  onClick={() => handleCancelAppointment(appointment.id)}
                  disabled={actionLoading && selectedAppointment === appointment.id}
                >
                  {actionLoading && selectedAppointment === appointment.id ? (
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
          <h3 style={{ marginBottom: '0.75rem', color: 'var(--text-primary)' }}>No Hay Citas Pendientes</h3>
          <p>No tienes citas pendientes en este momento.</p>
        </div>
      )}
      
      {/* Modal de formulario de tratamiento */}
      {showTreatmentForm && (
        <div className="treatment-modal-overlay" onClick={cancelTreatmentForm}>
          <div className="treatment-modal" onClick={e => e.stopPropagation()}>
            <div className="treatment-modal-header">
              <h3>Ingresar Detalles del Tratamiento</h3>
              <button 
                className="treatment-modal-close"
                onClick={cancelTreatmentForm}
                disabled={actionLoading}
              >
                &times;
              </button>
            </div>
            
            <Formik
              initialValues={{ tratamiento: '' }}
              validationSchema={treatmentSchema}
              onSubmit={handleSubmitTreatment}
            >
              {({ isSubmitting }) => (
                <Form className="treatment-form">
                  <div className="form-group">
                    <label htmlFor="tratamiento" className="form-label">Tratamiento</label>
                    <Field
                      as="textarea"
                      id="tratamiento"
                      name="tratamiento"
                      className="form-control"
                      placeholder="Ingrese detalles del tratamiento, prescripciones, recomendaciones, etc."
                      rows={5}
                    />
                    <ErrorMessage name="tratamiento" component="div" className="form-error" />
                  </div>
                  
                  <div className="treatment-form-actions">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={cancelTreatmentForm}
                      disabled={actionLoading}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isSubmitting || actionLoading}
                    >
                      {actionLoading ? (
                        <>
                          <span className="spinner-inline me-2"></span>
                          Guardando...
                        </>
                      ) : 'Guardar Tratamiento y Completar'}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;