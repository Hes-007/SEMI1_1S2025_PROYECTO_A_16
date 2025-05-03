import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/api';
import Spinner from '../../components/common/Spinner';
import Alert from '../../components/common/Alert';
import AuthContext from '../../context/AuthContext';
import './Admin.css';

const AdminPending = () => {
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [pendingPatients, setPendingPatients] = useState([]);
  const [activeTab, setActiveTab] = useState('doctors');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar si el usuario es administrador
    if (!currentUser || !currentUser.isAdmin) {
      console.log('NO ES ADMIN', currentUser);
      navigate('/admin-login');
      return;
    }
    
    if (activeTab === 'doctors') {
      fetchPendingDoctors();
    } else {
      fetchPendingPatients();
    }
  }, [currentUser, navigate, activeTab]);

  const fetchPendingDoctors = async () => {
    try {
      setLoading(true);
      const response = await adminService.getPendingDoctors();
      // Extraer datos de la estructura específica basada en la respuesta de la API
      const doctorsData = response.data.data || [];
      setPendingDoctors(doctorsData);
      setLoading(false);
    } catch (err) {
      setError('Error al obtener solicitudes pendientes de médicos');
      setLoading(false);
      console.error(err);
    }
  };

  const fetchPendingPatients = async () => {
    try {
      setLoading(true);
      const response = await adminService.getPendingPatients();
      // Extraer datos de la estructura específica basada en la respuesta de la API
      const patientsData = response.data.data || [];
      setPendingPatients(patientsData);
      setLoading(false);
    } catch (err) {
      setError('Error al obtener solicitudes pendientes de pacientes');
      setLoading(false);
      console.error(err);
    }
  };

  const handleApproveDoctor = async (doctorId) => {
    try {
      setLoading(true);
      await adminService.approveDoctor(doctorId);
      setSuccess('¡Médico aprobado con éxito!');
      // Eliminar el médico aprobado de la lista
      setPendingDoctors(pendingDoctors.filter(doctor => doctor.id !== doctorId));
      setLoading(false);
      
      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Error al aprobar médico');
      setLoading(false);
      console.error(err);
    }
  };

  const handleRejectDoctor = async (doctorId) => {
    try {
      setLoading(true);
      await adminService.rejectDoctor(doctorId);
      setSuccess('¡Médico rechazado con éxito!');
      // Eliminar el médico rechazado de la lista
      setPendingDoctors(pendingDoctors.filter(doctor => doctor.id !== doctorId));
      setLoading(false);
      
      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Error al rechazar médico');
      setLoading(false);
      console.error(err);
    }
  };

  const handleApprovePatient = async (patientId) => {
    try {
      setLoading(true);
      await adminService.approvePatient(patientId);
      setSuccess('¡Paciente aprobado con éxito!');
      // Eliminar el paciente aprobado de la lista
      setPendingPatients(pendingPatients.filter(patient => patient.id !== patientId));
      setLoading(false);
      
      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Error al aprobar paciente');
      setLoading(false);
      console.error(err);
    }
  };

  const handleRejectPatient = async (patientId) => {
    try {
      setLoading(true);
      await adminService.rejectPatient(patientId);
      setSuccess('¡Paciente rechazado con éxito!');
      // Eliminar el paciente rechazado de la lista
      setPendingPatients(pendingPatients.filter(patient => patient.id !== patientId));
      setLoading(false);
      
      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Error al rechazar paciente');
      setLoading(false);
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="admin-container">
        <div className="admin-loading">
          <Spinner type="ripple" size="large" />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1 className="admin-title">Aprobaciones Pendientes</h1>
        <p className="admin-subtitle">Gestionar solicitudes de registro de médicos y pacientes</p>
      </div>
      
      {/* Navegación por pestañas */}
      <div className="admin-panel-tabs">
        <div 
          className={`admin-panel-tab ${activeTab === 'doctors' ? 'active' : ''}`}
          onClick={() => setActiveTab('doctors')}
        >
          <span>Médicos</span>
        </div>
        <div 
          className={`admin-panel-tab ${activeTab === 'patients' ? 'active' : ''}`}
          onClick={() => setActiveTab('patients')}
        >
          <span>Pacientes</span>
        </div>
      </div>
      
      {error && (
        <Alert 
          type="error"
          message={error}
          title="Error"
          showIcon={true}
        />
      )}
      
      {success && (
        <Alert 
          type="success"
          message={success}
          title="Éxito"
          showIcon={true}
          duration={3000}
        />
      )}
      
      {activeTab === 'doctors' && (
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Solicitudes Pendientes de Médicos</h2>
            <span className="status-badge status-pending">
              {pendingDoctors.length} Pendientes
            </span>
          </div>
          
          {pendingDoctors.length === 0 ? (
            <div className="admin-empty">
              <div className="admin-empty-icon">👨‍⚕️</div>
              <h3 className="admin-empty-title">No Hay Solicitudes Pendientes</h3>
              <p className="admin-empty-text">
                No hay solicitudes de registro de médicos pendientes en este momento.
              </p>
            </div>
          ) : (
            <div className="admin-table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Correo</th>
                    <th>Especialidad</th>
                    <th>Número de Colegiado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingDoctors.map((doctor) => (
                    <tr key={doctor.id}>
                      <td>{doctor.nombre} {doctor.apellido}</td>
                      <td>{doctor.email}</td>
                      <td>{doctor.especialidad || 'N/A'}</td>
                      <td>{doctor.numero_colegiado || 'N/A'}</td>
                      <td>
                        <div className="admin-table-actions">
                          <button
                            onClick={() => handleApproveDoctor(doctor.id)}
                            className="admin-btn admin-btn-approve"
                          >
                            Aprobar
                          </button>
                          <button
                            onClick={() => handleRejectDoctor(doctor.id)}
                            className="admin-btn admin-btn-reject"
                          >
                            Rechazar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'patients' && (
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Solicitudes Pendientes de Pacientes</h2>
            <span className="status-badge status-pending">
              {pendingPatients.length} Pendientes
            </span>
          </div>
          
          {pendingPatients.length === 0 ? (
            <div className="admin-empty">
              <div className="admin-empty-icon">👨‍👩‍👧‍👦</div>
              <h3 className="admin-empty-title">No Hay Solicitudes Pendientes</h3>
              <p className="admin-empty-text">
                No hay solicitudes de registro de pacientes pendientes en este momento.
              </p>
            </div>
          ) : (
            <div className="admin-table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Correo</th>
                    <th>DPI</th>
                    <th>Teléfono</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingPatients.map((patient) => (
                    <tr key={patient.id}>
                      <td>{patient.nombre} {patient.apellido}</td>
                      <td>{patient.email}</td>
                      <td>{patient.dpi || 'N/A'}</td>
                      <td>{patient.telefono || 'N/A'}</td>
                      <td>
                        <div className="admin-table-actions">
                          <button
                            onClick={() => handleApprovePatient(patient.id)}
                            className="admin-btn admin-btn-approve"
                          >
                            Aprobar
                          </button>
                          <button
                            onClick={() => handleRejectPatient(patient.id)}
                            className="admin-btn admin-btn-reject"
                          >
                            Rechazar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPending;