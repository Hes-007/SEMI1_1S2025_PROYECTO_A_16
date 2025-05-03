import { useEffect, useState } from "react";
import { adminService } from "../../services/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import Alert from '../../components/common/Alert';
import Spinner from '../../components/common/Spinner';
import "./Admin.css";

const AdminReports = () => {
  const [report1, setReport1] = useState([]);
  const [report2, setReport2] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const [doctorsReport, specialtiesReport] = await Promise.all([
          adminService.getDoctorsWithMostPatients(),
          adminService.getMostPopularSpecialties()
        ]);
        
        setReport1(Array.isArray(doctorsReport.data.data) ? doctorsReport.data.data : []);
        setReport2(Array.isArray(specialtiesReport.data.data) ? specialtiesReport.data.data : []);
        setLoading(false);
      } catch (err) {
        setError("Error al cargar los informes");
        setLoading(false);
        console.error(err);
      }
    };
    
    fetchReports();
  }, []);

  const renderChart = (data, labelKey, valueKey, title) => (
    <div className="admin-card">
      <div className="admin-card-header">
        <h2 className="admin-card-title">{title}</h2>
      </div>
      
      <div className="admin-card-body">
        {data.length === 0 ? (
          <div className="admin-empty">
            <div className="admin-empty-icon">📊</div>
            <h3 className="admin-empty-title">No Hay Datos Disponibles</h3>
            <p className="admin-empty-text">
              Actualmente no hay datos disponibles para este informe.
            </p>
          </div>
        ) : (
          <div className="admin-chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey={labelKey} 
                  tick={{ fill: 'var(--text-secondary)' }}
                  axisLine={{ stroke: 'var(--border-color)' }}
                />
                <YAxis 
                  tick={{ fill: 'var(--text-secondary)' }}
                  axisLine={{ stroke: 'var(--border-color)' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--bg-dark)', 
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--border-radius)',
                    color: 'var(--text-primary)'
                  }}
                />
                <Bar 
                  dataKey={valueKey} 
                  fill="var(--primary-color)" 
                  radius={[4, 4, 0, 0]}
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );

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
        <h1 className="admin-title">Informes del Sistema</h1>
        <p className="admin-subtitle">Ver estadísticas y métricas de rendimiento</p>
      </div>
      
      {error && (
        <Alert 
          type="error"
          message={error}
          title="Error al Cargar Informes"
          showIcon={true}
        />
      )}
      
      {/* Tarjetas de estadísticas */}
      <div className="admin-stats">
        <div className="admin-stat-card">
          <div className="admin-stat-value">{report1.length}</div>
          <div className="admin-stat-label">Médicos Activos</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-value">{report2.length}</div>
          <div className="admin-stat-label">Especialidades Médicas</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-value">
            {report1.reduce((sum, doctor) => sum + (doctor.total_pacientes_atendidos || 0), 0)}
          </div>
          <div className="admin-stat-label">Total Pacientes Atendidos</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-value">
            {report2.reduce((sum, specialty) => sum + (specialty.total_citas || 0), 0)}
          </div>
          <div className="admin-stat-label">Total Citas</div>
        </div>
      </div>
      
      {renderChart(report1, "nombre_completo", "total_pacientes_atendidos", "Médicos con Más Pacientes")}
      {renderChart(report2, "nombre", "total_citas", "Especialidades Más Populares")}
    </div>
  );
};

export default AdminReports;