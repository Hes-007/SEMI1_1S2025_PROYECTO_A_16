import { useEffect, useState } from "react";
import { adminService } from "../../services/api";
import Alert from '../../components/common/Alert';
import Spinner from '../../components/common/Spinner';
import "./Admin.css";

const AdminUsers = () => {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('doctors');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const [p, d] = await Promise.all([
        adminService.getAllPatients(),
        adminService.getAllDoctors(),
      ]);
      
      setPatients(Array.isArray(p.data.data) ? p.data.data : []);
      setDoctors(Array.isArray(d.data.data) ? d.data.data : []);
      setLoading(false);
    } catch (err) {
      setError("Error al obtener usuarios");
      setLoading(false);
      console.error(err);
    }
  };

  const handleDeactivate = async (id, role) => {
    try {
      setLoading(true);
      const fn = role === "patients" ? adminService.deactivatePatient : adminService.deactivateDoctor;
      await fn(id);
      setSuccess(`${role === "patients" ? "Paciente" : "Médico"} desactivado con éxito`);
      
      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(null), 3000);
      
      fetchUsers();
    } catch (err) {
      setError(`Error al desactivar ${role === "patients" ? "paciente" : "médico"}`);
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
        <h1 className="admin-title">Gestión de Usuarios</h1>
        <p className="admin-subtitle">Administrar pacientes y médicos en el sistema</p>
      </div>
      
      {/* Navegación por pestañas */}
      <div className="admin-panel-tabs">
        <div 
          className={`admin-panel-tab ${activeTab === 'doctors' ? 'active' : ''}`}
          onClick={() => setActiveTab('doctors')}
        >
          <span>Médicos ({doctors.length})</span>
        </div>
        <div 
          className={`admin-panel-tab ${activeTab === 'patients' ? 'active' : ''}`}
          onClick={() => setActiveTab('patients')}
        >
          <span>Pacientes ({patients.length})</span>
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
      
      {/* Tarjetas de estadísticas */}
      <div className="admin-stats">
        <div className="admin-stat-card">
          <div className="admin-stat-value">{doctors.length}</div>
          <div className="admin-stat-label">Total Médicos</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-value">{patients.length}</div>
          <div className="admin-stat-label">Total Pacientes</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-value">
            {doctors.filter(d => d.estado === "activo").length}
          </div>
          <div className="admin-stat-label">Médicos Activos</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-value">
            {patients.filter(p => p.estado === "activo").length}
          </div>
          <div className="admin-stat-label">Pacientes Activos</div>
        </div>
      </div>
      
      {activeTab === 'doctors' && (
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Médicos Registrados</h2>
          </div>
          
          {doctors.length === 0 ? (
            <div className="admin-empty">
              <div className="admin-empty-icon">👨‍⚕️</div>
              <h3 className="admin-empty-title">No Hay Médicos Disponibles</h3>
              <p className="admin-empty-text">
                No hay médicos registrados en el sistema.
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
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.map((doctor) => (
                    <tr key={doctor.id}>
                      <td>{doctor.nombre} {doctor.apellido}</td>
                      <td>{doctor.email}</td>
                      <td>{doctor.especialidad || 'N/A'}</td>
                      <td>
                        <span className={`status-badge ${doctor.estado === "activo" ? "status-active" : "status-inactive"}`}>
                          {doctor.estado === "activo" ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td>
                        <div className="admin-table-actions">
                          <button
                            className="admin-btn admin-btn-reject"
                            onClick={() => handleDeactivate(doctor.id, "doctors")}
                            disabled={doctor.estado !== "activo"}
                          >
                            Desactivar
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
            <h2 className="admin-card-title">Pacientes Registrados</h2>
          </div>
          
          {patients.length === 0 ? (
            <div className="admin-empty">
              <div className="admin-empty-icon">👨‍👩‍👧‍👦</div>
              <h3 className="admin-empty-title">No Hay Pacientes Disponibles</h3>
              <p className="admin-empty-text">
                No hay pacientes registrados en el sistema.
              </p>
            </div>
          ) : (
            <div className="admin-table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Correo</th>
                    <th>Teléfono</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((patient) => (
                    <tr key={patient.id}>
                      <td>{patient.nombre} {patient.apellido}</td>
                      <td>{patient.email}</td>
                      <td>{patient.telefono || 'N/A'}</td>
                      <td>
                        <span className={`status-badge ${patient.estado === "activo" ? "status-active" : "status-inactive"}`}>
                          {patient.estado === "activo" ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td>
                        <div className="admin-table-actions">
                          <button
                            className="admin-btn admin-btn-reject"
                            onClick={() => handleDeactivate(patient.id, "patients")}
                            disabled={patient.estado !== "activo"}
                          >
                            Desactivar
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

export default AdminUsers;