import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { patientService } from '../../services/api';
import Spinner from '../../components/common/Spinner';
import Alert from '../../components/common/Alert';
import './Patient.css';

// Esquema de validación para reserva de citas
const appointmentSchema = Yup.object({
  fecha: Yup.date()
    .required('La fecha es obligatoria')
    .min(new Date(), 'La fecha no puede ser en el pasado'),
  hora: Yup.string()
    .required('La hora es obligatoria'),
  motivo: Yup.string()
    .required('El motivo es obligatorio')
    .min(10, 'El motivo debe tener al menos 10 caracteres')
});

const DoctorDetails = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  
  const [doctor, setDoctor] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [selectedDate, setSelectedDate] = useState('');
  const [availability, setAvailability] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  
  // Cargar detalles del médico al montar el componente
  useEffect(() => {
    const fetchDoctorDetails = async () => {
      try {
        setLoading(true);
        
        // Obtener horario del médico
        const scheduleResponse = await patientService.getDoctorSchedule(doctorId);
        setDoctor(scheduleResponse.data.data.doctor);
        setSchedule(scheduleResponse.data.data.horarios);
      } catch (err) {
        console.error('Error al obtener detalles del médico:', err);
        setError('Error al cargar los detalles del médico. Por favor intente más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorDetails();
  }, [doctorId]);

  // Verificar disponibilidad cuando cambia la fecha
  const handleDateChange = async (date) => {
    setSelectedDate(date);
    setSelectedTime('');
    
    if (!date) {
      setAvailability(null);
      return;
    }
    
    try {
      setLoadingAvailability(true);
      const response = await patientService.getDoctorAvailability(doctorId, date);
      setAvailability(response.data.data);
    } catch (err) {
      console.error('Error al obtener disponibilidad:', err);
      setError('Error al cargar disponibilidad. Por favor intente más tarde.');
      setAvailability(null);
    } finally {
      setLoadingAvailability(false);
    }
  };

  // Manejar selección de horario
  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  // Manejar reserva de cita
  const handleBookAppointment = async (values, { resetForm }) => {
    try {
      setLoading(true);
      setError(null);
      
      const appointmentData = {
        medico_id: doctorId,
        fecha: values.fecha,
        hora: values.hora,
        motivo: values.motivo
      };
      
      const response = await patientService.createAppointment(appointmentData);
      
      if (response.data.status === 'success') {
        setSuccess('¡Cita reservada con éxito!');
        resetForm();
        setSelectedDate('');
        setSelectedTime('');
        setAvailability(null);
        
        // Redireccionar a la página de citas después de un retraso
        setTimeout(() => {
          navigate('/patient/appointments');
        }, 2000);
      }
    } catch (err) {
      console.error('Error al reservar cita:', err);
      
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Error al reservar cita. Por favor intente más tarde.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Preparar días de la semana para mostrar
  const getDaysOfWeek = () => {
    const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const workingDays = schedule.map(s => s.dia_semana);
    
    return daysOfWeek.map((day, index) => ({
      index,
      name: day,
      available: workingDays.includes(index)
    }));
  };

  // Generar fechas para los próximos 30 días
  const getAvailableDates = () => {
    const dates = [];
    const workingDays = schedule.map(s => s.dia_semana);
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      
      // Solo incluir fechas en las que el médico trabaja
      if (workingDays.includes(date.getDay())) {
        dates.push({
          date,
          formatted: date.toISOString().split('T')[0],
          day: date.getDay(),
          display: date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
        });
      }
    }
    
    return dates;
  };

  // Valores iniciales para el formulario de reserva de citas
  const initialValues = {
    fecha: selectedDate,
    hora: selectedTime,
    motivo: ''
  };

  if (loading) {
    return (
      <div className="doctors-loading">
        <Spinner type="ripple" size="large" />
        <p>Cargando detalles del médico...</p>
      </div>
    );
  }

  if (error && !doctor) {
    return (
      <Alert 
        message={error} 
        type="error" 
        title="Error"
        showIcon={true}
      />
    );
  }

  const availableDates = getAvailableDates();
  const daysOfWeek = getDaysOfWeek();

  return (
    <div className="doctor-details-container">
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
      
      {doctor && (
        <>
          <div className="doctor-details-header">
            <div className="doctor-details-image">
              <img 
                src={doctor.foto_url || 'https://via.placeholder.com/150?text=Doctor'} 
                alt={doctor.nombre_completo} 
              />
            </div>
            <div className="doctor-details-info">
              <h2 className="doctor-details-name">{doctor.nombre_completo}</h2>
              <p className="doctor-details-specialty">{doctor.especialidad}</p>
              
              <div className="doctor-details-meta">
                <div className="doctor-details-meta-item">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <span>{doctor.direccion_clinica}</span>
                </div>
              </div>
              
              <div className="doctor-details-schedule">
                <h3>Días Laborales</h3>
                <div className="schedule-days">
                  {daysOfWeek.map(day => (
                    <div 
                      key={day.index} 
                      className={`schedule-day ${day.available ? 'active' : ''}`}
                    >
                      {day.name.slice(0, 3)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="doctor-details-schedule-container">
            <h3 className="schedule-title">Reservar una Cita</h3>
            
            <div className="schedule-form">
              <Formik
                initialValues={initialValues}
                validationSchema={appointmentSchema}
                onSubmit={handleBookAppointment}
                enableReinitialize
              >
                {({ setFieldValue, values }) => (
                  <Form>
                    <div className="form-group">
                      <label htmlFor="fecha" className="form-label">Seleccionar Fecha</label>
                      <Field
                        as="select"
                        id="fecha"
                        name="fecha"
                        className="form-control"
                        onChange={(e) => {
                          const selectedValue = e.target.value;
                          setFieldValue('fecha', selectedValue);
                          setFieldValue('hora', '');
                          handleDateChange(selectedValue);
                        }}
                      >
                        <option value="">Seleccionar fecha</option>
                        {availableDates.map(date => (
                          <option key={date.formatted} value={date.formatted}>
                            {date.display} ({daysOfWeek[date.day].name})
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage name="fecha" component="div" className="form-error" />
                    </div>
                    
                    {loadingAvailability ? (
                      <div className="text-center py-3">
                        <Spinner type="dots" size="small" />
                        <p>Cargando horarios disponibles...</p>
                      </div>
                    ) : availability ? (
                      <>
                        {availability.atiende ? (
                          <>
                            <div className="form-group">
                              <label className="form-label">Seleccionar Hora</label>
                              <div className="schedule-slots">
                                {availability.horarios_disponibles.length > 0 ? (
                                  availability.horarios_disponibles.map(time => (
                                    <div
                                      key={time}
                                      className={`schedule-slot ${selectedTime === time ? 'selected' : ''}`}
                                      onClick={() => {
                                        handleTimeSelect(time);
                                        setFieldValue('hora', time);
                                      }}
                                    >
                                      {time}
                                    </div>
                                  ))
                                ) : (
                                  <p>No hay horarios disponibles para esta fecha</p>
                                )}
                                
                                {availability.horarios_ocupados.map(time => (
                                  <div key={time} className="schedule-slot booked">
                                    {time}
                                  </div>
                                ))}
                              </div>
                              <ErrorMessage name="hora" component="div" className="form-error" />
                            </div>
                            
                            <div className="form-group">
                              <label htmlFor="motivo" className="form-label">Motivo de la Visita</label>
                              <Field
                                as="textarea"
                                id="motivo"
                                name="motivo"
                                className="form-control"
                                placeholder="Por favor describa sus síntomas o motivo de la cita"
                                rows={4}
                              />
                              <ErrorMessage name="motivo" component="div" className="form-error" />
                            </div>
                            
                            <button
                              type="submit"
                              className="btn btn-primary"
                              disabled={!selectedDate || !selectedTime || loading}
                            >
                              {loading ? (
                                <>
                                  <span className="spinner-inline me-2"></span>
                                  Reservando...
                                </>
                              ) : (
                                <>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                  </svg>
                                  Reservar Cita
                                </>
                              )}
                            </button>
                          </>
                        ) : (
                          <Alert 
                            message={`El médico no atiende en esta fecha`} 
                            type="info"
                            showIcon={true} 
                          />
                        )}
                      </>
                    ) : selectedDate ? (
                      <Alert 
                        message="Por favor seleccione una fecha para ver horarios disponibles" 
                        type="info"
                        showIcon={true}
                      />
                    ) : null}
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
export default DoctorDetails;