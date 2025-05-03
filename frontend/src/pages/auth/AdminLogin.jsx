import { useState, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import AuthContext from '../../context/AuthContext';
import { authService } from '../../services/api';
import Alert from '../../components/common/Alert';
import { ButtonSpinner } from '../../components/common/Spinner';
import './Auth.css';

// Esquema de validación para el primer paso (usuario/contraseña)
const firstStepSchema = Yup.object({
  username: Yup.string().required('El usuario es obligatorio'),
  password: Yup.string().required('La contraseña es obligatoria')
});

const AdminLogin = () => {
  const [step, setStep] = useState(1); // 1: usuario y contraseña, 2: segunda autenticación
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [firstAuthToken, setFirstAuthToken] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const initialValues = {
    username: '',
    password: ''
  };

  // Maneja el primer paso de autenticación
  const handleFirstStep = async (values, { setSubmitting }) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.adminLogin(values);
      
      // Verifica si requiere segundo factor
      if (response.data.status === 'success' && response.data.data.requiresSecondAuth) {
        setFirstAuthToken(response.data.data.token);
        setStep(2);
      }
    } catch (err) {
      console.error('Error en login admin:', err);
      
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Inicio de sesión fallido. Verifica tus credenciales.');
      }
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  // Maneja selección de archivo para segundo factor
  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  // Dispara el click del input de archivo
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Maneja el segundo paso de autenticación
  const handleSecondAuth = async () => {
    if (!selectedFile || !firstAuthToken) {
      setError('Por favor selecciona el archivo de autenticación');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('auth2', selectedFile);
    
    try {
      const headers = {
        'Authorization': `Bearer ${firstAuthToken}`,
        'Content-Type': 'multipart/form-data'
      };
      
      const response = await authService.adminSecondAuth(formData, { headers });
      
      if (response.data.status === 'success') {
        const { token, ...userData } = response.data.data;
        
        login({ ...userData, isAdmin: true }, token);
        navigate('/admin/pending'); // Redirige al panel admin
      }
    } catch (err) {
      console.error('Error en segundo factor admin:', err);
      
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Fallo en la autenticación. Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Lado izquierdo - imagen de fondo */}
      <div className="auth-background">
        <div className="auth-background-content">
          <h1>Portal de Administrador</h1>
          <p>Acceso seguro al sistema de administración de SaludPlus. Solo personal autorizado.</p>
        </div>
      </div>
      
      {/* Lado derecho - formulario login */}
      <div className="auth-form-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Iniciar sesión como administrador</h2>
            <p>Ingresa tus credenciales para acceder al panel administrativo</p>
          </div>
          
          {error && (
            <Alert 
              message={error} 
              type="error" 
              title="Error de Autenticación"
              showIcon={true}
              duration={0} // No se oculta automáticamente
            />
          )}
          
          {step === 1 ? (
            // Paso 1: usuario y contraseña
            <Formik
              initialValues={initialValues}
              validationSchema={firstStepSchema}
              onSubmit={handleFirstStep}
            >
              {({ isSubmitting }) => (
                <Form className="auth-form">
                  <div className="form-group">
                    <label htmlFor="username" className="form-label">Usuario</label>
                    <Field
                      type="text"
                      id="username"
                      name="username"
                      className="form-control"
                      placeholder="Ingrese su usuario"
                    />
                    <ErrorMessage name="username" component="div" className="form-error" />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="password" className="form-label">Contraseña</label>
                    <Field
                      type="password"
                      id="password"
                      name="password"
                      className="form-control"
                      placeholder="Ingrese su contraseña"
                    />
                    <ErrorMessage name="password" component="div" className="form-error" />
                  </div>
                  
                  <ButtonSpinner
                    type="submit"
                    className="btn-primary w-100"
                    loading={loading}
                    disabled={isSubmitting}
                  >
                    Continuar
                  </ButtonSpinner>
                </Form>
              )}
            </Formik>
          ) : (
            // Paso 2: autenticación con archivo
            <div className="admin-auth-container">
              <div className="admin-auth-step">
                <div className="admin-auth-step-header">
                  <div className="admin-auth-step-number">2</div>
                  <div className="admin-auth-step-title">Autenticación en dos pasos</div>
                </div>
                
                <p className="mb-3">Sube el archivo <strong>auth2.ayd1</strong> para completar la autenticación.</p>
                
                <div className="admin-auth-file-input" onClick={triggerFileInput}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".ayd1"
                    onChange={handleFileChange}
                    hidden
                  />
                  <div className="admin-auth-file-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                  </div>
                  <div className="admin-auth-file-text">
                    {selectedFile ? (
                      <div className="admin-auth-file-name">{selectedFile.name}</div>
                    ) : (
                      <span>Haz clic para subir el archivo auth2.ayd1</span>
                    )}
                  </div>
                </div>
                
                <ButtonSpinner
                  type="button"
                  className="btn-primary w-100"
                  onClick={handleSecondAuth}
                  loading={loading}
                  disabled={!selectedFile}
                >
                  Autenticar
                </ButtonSpinner>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;