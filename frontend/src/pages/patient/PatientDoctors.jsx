import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { patientService, utilityService } from '../../services/api';
import Spinner from '../../components/common/Spinner';
import Alert from '../../components/common/Alert';
import './Patient.css';

const PatientDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');

  // Cargar todos los médicos al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Obtener todos los médicos
        const doctorsResponse = await patientService.getAllDoctors();
        setDoctors(doctorsResponse.data.data);
        
        // Obtener especialidades
        // Nota: Usando especialidades predefinidas por ahora, pero en una app real las obtendrías de la API
        setSpecialties([
          { id: 1, nombre: 'Medicina General' },
          { id: 2, nombre: 'Pediatría' },
          { id: 3, nombre: 'Cardiología' },
          { id: 4, nombre: 'Dermatología' },
          { id: 5, nombre: 'Ginecología' },
          { id: 6, nombre: 'Oftalmología' },
          { id: 7, nombre: 'Traumatología' },
          { id: 8, nombre: 'Psiquiatría' }
        ]);
      } catch (err) {
        console.error('Error al obtener médicos:', err);
        setError('Error al cargar médicos. Por favor intente más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Manejar cambio de filtro de especialidad
  const handleSpecialtyChange = async (e) => {
    const specialtyId = e.target.value;
    setSelectedSpecialty(specialtyId);
    
    try {
      setLoading(true);
      
      if (specialtyId) {
        // Filtrar por especialidad
        const response = await patientService.searchDoctorsBySpecialty(specialtyId);
        setDoctors(response.data.data);
      } else {
        // Obtener todos los médicos si no hay especialidad seleccionada
        const response = await patientService.getAllDoctors();
        setDoctors(response.data.data);
      }
    } catch (err) {
      console.error('Error al filtrar médicos:', err);
      setError('Error al filtrar médicos. Por favor intente más tarde.');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar médicos por término de búsqueda (nombre o especialidad)
  const filteredDoctors = searchTerm
    ? doctors.filter(doctor => 
        doctor.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.especialidad?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : doctors;

  return (
    <div className="patient-doctors-container">
      <h1 className="page-title">Buscar un Médico</h1>
      
      {error && (
        <Alert 
          message={error} 
          type="error" 
          title="Error"
          showIcon={true}
        />
      )}
      
      <div className="doctors-filters">
        <div className="search-bar">
          <label htmlFor="doctorSearch" className="form-label">Buscar un Médico</label>
          <div className="input-group">
            <span className="input-group-text">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </span>
            <input
              id="doctorSearch"
              type="text"
              placeholder="Buscar por nombre o especialidad"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control"
            />
          </div>
        </div>
        
        <div className="specialty-filter">
          <label htmlFor="specialtyFilter" className="form-label">Filtrar por Especialidad</label>
          <select
            id="specialtyFilter"
            value={selectedSpecialty}
            onChange={handleSpecialtyChange}
            className="form-control"
          >
            <option value="">Todas las Especialidades</option>
            {specialties.map(specialty => (
              <option key={specialty.id} value={specialty.id}>
                {specialty.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {loading ? (
        <div className="doctors-loading">
          <Spinner type="ripple" size="large" />
          <p>Cargando médicos...</p>
        </div>
      ) : filteredDoctors.length > 0 ? (
        <div className="doctors-grid">
          {filteredDoctors.map(doctor => (
            <div className="doctor-card" key={doctor.id}>
              <div className="doctor-card-image">
                <img 
                  src={doctor.foto_url || 'https://via.placeholder.com/150?text=Doctor'} 
                  alt={doctor.nombre_completo}
                />
              </div>
              <div className="doctor-card-body">
                <h3 className="doctor-name">{doctor.nombre_completo}</h3>
                <p className="doctor-specialty">{doctor.especialidad}</p>
                <p className="doctor-location">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}>
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  {doctor.direccion_clinica}
                </p>
                <Link to={`/patient/doctors/${doctor.id}`} className="btn btn-primary w-100">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  Reservar Cita
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="doctors-empty">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1rem', opacity: 0.5 }}>
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <h3 style={{ marginBottom: '0.75rem', color: 'var(--text-primary)' }}>No Se Encontraron Médicos</h3>
          <p>No se encontraron médicos que coincidan con su búsqueda. Intente cambiar los filtros.</p>
        </div>
      )}
    </div>
  );
};

export default PatientDoctors;