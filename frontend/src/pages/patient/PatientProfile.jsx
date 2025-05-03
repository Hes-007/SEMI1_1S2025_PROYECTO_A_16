import { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { patientService } from '../../services/api';
import Spinner from '../../components/common/Spinner';
import Alert from '../../components/common/Alert';
import './Patient.css';

// Esquema de validación para actualización de perfil
const profileSchema = Yup.object({
  nombre: Yup.string()
    .required('El nombre es obligatorio')
    .min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellido: Yup.string()
    .required('El apellido es obligatorio')
    .min(2, 'El apellido debe tener al menos 2 caracteres'),
  genero: Yup.string()
    .required('El género es obligatorio')
    .oneOf(['masculino', 'femenino', 'otro'], 'Selección de género inválida'),
  direccion: Yup.string()
    .required('La dirección es obligatoria')
    .min(5, 'La dirección debe tener al menos 5 caracteres'),
  telefono: Yup.string()
    .required('El número de teléfono es obligatorio')
    .matches(/^\d{8}$/, 'El número de teléfono debe tener 8 dígitos'),
  fecha_nacimiento: Yup.date()
    .required('La fecha de nacimiento es obligatoria')
    .max(new Date(), 'La fecha de nacimiento no puede ser en el futuro'),
  foto_url: Yup.string().url('Debe ser una URL válida').nullable(),
});

const PatientProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Cargar perfil del paciente al montar el componente
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await patientService.getProfile();
        setProfile(response.data.data);
      } catch (err) {
        console.error('Error al obtener perfil:', err);
        setError('Error al cargar tu perfil. Por favor intenta más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Manejar actualización de perfil
  const handleUpdateProfile = async (values) => {
    try {
      setSaving(true);
      setError(null);
      
      const response = await patientService.updateProfile(values);
      
      if (response.data.status === 'success') {
        setSuccess('¡Perfil actualizado con éxito!');
        setProfile({
          ...profile,
          ...response.data.data
        });
        
        // Limpiar mensaje de éxito después de un retraso
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      }
    } catch (err) {
      console.error('Error al actualizar perfil:', err);
      
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Error al actualizar perfil. Por favor intenta más tarde.');
      }
      
      // Limpiar mensaje de error después de un retraso
      setTimeout(() => {
        setError(null);
      }, 3000);
    } finally {
      setSaving(false);
    }
  };

  // Formatear fecha para campo de entrada
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <Spinner type="ripple" size="large" />
        <p>Cargando tu perfil...</p>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <Alert 
        message={error} 
        type="error" 
        title="Error"
        showIcon={true}
      />
    );
  }

  return (
    <div className="patient-profile-container">
      <h1 className="page-title">Mi Perfil</h1>
      
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
      
      {profile && (
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-image">
              <img 
                src={profile.foto_url || 'https://via.placeholder.com/120?text=Profile'} 
                alt={`${profile.nombre} ${profile.apellido}`} 
              />
            </div>
            <div className="profile-info">
              <h2 className="profile-name">{profile.nombre} {profile.apellido}</h2>
              <p className="profile-email">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                {profile.email}
              </p>
            </div>
          </div>
          
          <div className="profile-section">
            <h3 className="profile-section-title">Información Personal</h3>
            
            <Formik
              initialValues={{
                nombre: profile.nombre || '',
                apellido: profile.apellido || '',
                genero: profile.genero || '',
                direccion: profile.direccion || '',
                telefono: profile.telefono || '',
                fecha_nacimiento: formatDateForInput(profile.fecha_nacimiento) || '',
                foto_url: profile.foto_url || ''
              }}
              validationSchema={profileSchema}
              onSubmit={handleUpdateProfile}
            >
              {({ isSubmitting }) => (
                <Form className="profile-form">
                  <div className="form-group">
                    <label htmlFor="nombre" className="form-label">Nombre</label>
                    <Field
                      type="text"
                      id="nombre"
                      name="nombre"
                      className="form-control"
                    />
                    <ErrorMessage name="nombre" component="div" className="form-error" />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="apellido" className="form-label">Apellido</label>
                    <Field
                      type="text"
                      id="apellido"
                      name="apellido"
                      className="form-control"
                    />
                    <ErrorMessage name="apellido" component="div" className="form-error" />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="genero" className="form-label">Género</label>
                    <Field
                      as="select"
                      id="genero"
                      name="genero"
                      className="form-control"
                    >
                      <option value="">Seleccionar género</option>
                      <option value="masculino">Masculino</option>
                      <option value="femenino">Femenino</option>
                      <option value="otro">Otro</option>
                    </Field>
                    <ErrorMessage name="genero" component="div" className="form-error" />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="fecha_nacimiento" className="form-label">Fecha de Nacimiento</label>
                    <Field
                      type="date"
                      id="fecha_nacimiento"
                      name="fecha_nacimiento"
                      className="form-control"
                    />
                    <ErrorMessage name="fecha_nacimiento" component="div" className="form-error" />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="telefono" className="form-label">Número de Teléfono</label>
                    <Field
                      type="text"
                      id="telefono"
                      name="telefono"
                      className="form-control"
                    />
                    <ErrorMessage name="telefono" component="div" className="form-error" />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="direccion" className="form-label">Dirección</label>
                    <Field
                      type="text"
                      id="direccion"
                      name="direccion"
                      className="form-control"
                    />
                    <ErrorMessage name="direccion" component="div" className="form-error" />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="foto_url" className="form-label">URL de Foto de Perfil</label>
                    <Field
                      type="text"
                      id="foto_url"
                      name="foto_url"
                      className="form-control"
                    />
                    <ErrorMessage name="foto_url" component="div" className="form-error" />
                  </div>
                  
                  <div className="mt-4">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isSubmitting || saving}
                    >
                      {saving ? (
                        <>
                          <span className="spinner-inline me-2"></span>
                          Actualizando...
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                            <polyline points="17 21 17 13 7 13 7 21"></polyline>
                            <polyline points="7 3 7 8 15 8"></polyline>
                          </svg>
                          Actualizar Perfil
                        </>
                      )}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
          
          <div className="profile-section">
            <h3 className="profile-section-title">Información de la Cuenta</h3>
            <div className="profile-info-grid">
              <div className="profile-info-item">
                <div className="profile-info-label">Correo Electrónico:</div>
                <div className="profile-info-value">{profile.email}</div>
              </div>
              <div className="profile-info-item">
                <div className="profile-info-label">DPI:</div>
                <div className="profile-info-value">{profile.dpi}</div>
              </div>
              <div className="profile-info-item">
                <div className="profile-info-label">Fecha de Nacimiento:</div>
                <div className="profile-info-value">{new Date(profile.fecha_nacimiento).toLocaleDateString('es-ES')}</div>
              </div>
              <div className="profile-info-item">
                <div className="profile-info-label">Miembro Desde:</div>
                <div className="profile-info-value">{new Date(profile.fecha_registro).toLocaleDateString('es-ES')}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientProfile;