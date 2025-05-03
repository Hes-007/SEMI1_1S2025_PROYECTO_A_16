import { useState, useEffect } from 'react';
import { doctorService } from '../../services/api';
import Spinner from '../../components/common/Spinner';
import Alert from '../../components/common/Alert';
import './Doctor.css';

const DoctorHistory = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'attended', 'canceled'
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Cargar historial de citas al montar el componente
  useEffect(() => {
    const fetchAppointmentHistory = async () => {
      try {
        setLoading(true);
        const response = await doctorService.getAppointmentHistory();
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

  // Filtrar citas basado en criterios seleccionados
  const filteredAppointments = appointments.filter(appointment => {
    // Filtrar por estado
    if (filter === 'attended' && appointment.estado !== 'atendida') return false;
    if (filter === 'canceled' && !appointment.estado.includes('cancelada')) return false;
    
    // Filtrar por término de búsqueda (nombre del paciente)
    if (searchTerm && !appointment.paciente.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Filtrar por fecha
    if (dateFilter) {
      return appointment.fecha === dateFilter;
    }
    
    return true;
  });

  // Ordenar citas por fecha (más reciente primero)
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    const dateA = new Date(`${a.fecha}T${a.hora}`);
    const dateB = new Date(`${b.fecha}T${b.hora}`);
    return dateB - dateA;
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
    if (status === 'cancelada_paciente') return 'Cancelada por Paciente';
    if (status === 'cancelada_medico') return 'Cancelada por Ti';
    return status;
  };

  return (
    <div className="doctor-history-container">
      <h1 className="page-title">Historial de Citas</h1>
      
      {error && (
        <Alert 
          message={error} 
          type="error" 
          title="Error"
          showIcon={true}
        />
      )}
      
      <div className="filter-controls">
        <div className="filter-control">
          <label htmlFor="statusFilter" className="form-label">Estado</label>
          <select
            id="statusFilter"
            className="form-control"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">Todas</option>
            <option value="attended">Atendidas</option>
            <option value="canceled">Canceladas</option>
          </select>
        </div>
        
        <div className="filter-control">
          <label htmlFor="dateFilter" className="form-label">Fecha</label>
          <input
            type="date"
            id="dateFilter"
            className="form-control"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
        
        <div className="filter-control">
          <label htmlFor="searchFilter" className="form-label">Buscar Paciente</label>
          <input
            type="text"
            id="searchFilter"
            className="form-control"
            placeholder="Buscar por nombre del paciente"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {loading ? (
        <div className="appointments-loading">
          <Spinner type="ripple" size="large" />
          <p>Cargando historial de citas...</p>
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
                <p className="mt-3"><strong>Motivo:</strong> {appointment.motivo}</p>
                
                {appointment.tratamiento && (
                  <div className="treatment-section">
                    <h4 className="treatment-title">Tratamiento</h4>
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
          <h3 style={{ marginBottom: '0.75rem', color: 'var(--text-primary)' }}>No Se Encontraron Resultados</h3>
          <p>No se encontró historial de citas que coincida con tus filtros.</p>
          <button 
            className="btn btn-outline-primary mt-3"
            onClick={() => {
              setFilter('all');
              setSearchTerm('');
              setDateFilter('');
            }}
          >
            Limpiar Filtros
          </button>
        </div>
      )}
    </div>
  );
};

export default DoctorHistory;