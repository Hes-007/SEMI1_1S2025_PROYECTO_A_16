import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { authService } from '../../services/api';
import Alert from '../../components/common/Alert';
import { ButtonSpinner } from '../../components/common/Spinner';
import './Auth.css';

// Esquema para registro de pacientes
const patientSchema = Yup.object({
  nombre: Yup.string()
    .required('El nombre es obligatorio')
    .min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellido: Yup.string()
    .required('El apellido es obligatorio')
    .min(2, 'El apellido debe tener al menos 2 caracteres'),
  dpi: Yup.string()
    .required('El DPI es obligatorio')
    .matches(/^\d{13}$/, 'El DPI debe tener 13 dígitos'),
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
  email: Yup.string()
    .email('Formato de correo electrónico inválido')
    .required('El correo electrónico es obligatorio'),
  password: Yup.string()
    .required('La contraseña es obligatoria')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
      'La contraseña debe tener al menos 8 caracteres e incluir al menos una letra mayúscula, una letra minúscula y un número'
    ),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Las contraseñas deben coincidir')
    .required('Por favor confirma tu contraseña'),
  foto_url: Yup.string().url('Debe ser una URL válida').nullable(),
});

// Esquema para registro de médicos
const doctorSchema = Yup.object({
  nombre: Yup.string()
    .required('El nombre es obligatorio')
    .min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellido: Yup.string()
    .required('El apellido es obligatorio')
    .min(2, 'El apellido debe tener al menos 2 caracteres'),
  dpi: Yup.string()
    .required('El DPI es obligatorio')
    .matches(/^\d{13}$/, 'El DPI debe tener 13 dígitos'),
  genero: Yup.string()
    .required('El género es obligatorio')
    .oneOf(['masculino', 'femenino', 'otro'], 'Selección de género inválida'),
  direccion: Yup.string()
    .required('La dirección es obligatoria')
    .min(5, 'La dirección debe tener al menos 5 caracteres'),
  direccion_clinica: Yup.string()
    .required('La dirección de la clínica es obligatoria')
    .min(5, 'La dirección de la clínica debe tener al menos 5 caracteres'),
  telefono: Yup.string()
    .required('El número de teléfono es obligatorio')
    .matches(/^\d{8}$/, 'El número de teléfono debe tener 8 dígitos'),
  fecha_nacimiento: Yup.date()
    .required('La fecha de nacimiento es obligatoria')
    .max(new Date(), 'La fecha de nacimiento no puede ser en el futuro'),
  numero_colegiado: Yup.string()
    .required('El número de colegiado es obligatorio')
    .min(4, 'El número de colegiado debe tener al menos 4 caracteres'),
  especialidad_id: Yup.number()
    .required('La especialidad es obligatoria')
    .positive('Por favor selecciona una especialidad'),
  email: Yup.string()
    .email('Formato de correo electrónico inválido')
    .required('El correo electrónico es obligatorio'),
  password: Yup.string()
    .required('La contraseña es obligatoria')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
      'La contraseña debe tener al menos 8 caracteres e incluir al menos una letra mayúscula, una letra minúscula y un número'
    ),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Las contraseñas deben coincidir')
    .required('Por favor confirma tu contraseña'),
  foto_url: Yup.string()
    .url('Debe ser una URL válida')
    .required('La URL de la foto de perfil es obligatoria'),
});

const Register = () => {
  const [mode, setMode] = useState('patient');
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [specialties, setSpecialties] = useState([
    { id: 1, nombre: 'Medicina General' },
    { id: 2, nombre: 'Pediatría' },
    { id: 3, nombre: 'Cardiología' },
    { id: 4, nombre: 'Dermatología' },
    { id: 5, nombre: 'Ginecología' },
    { id: 6, nombre: 'Oftalmología' },
    { id: 7, nombre: 'Traumatología' },
    { id: 8, nombre: 'Psiquiatría' }
  ]);
  
  const navigate = useNavigate();

  // Valores iniciales para registro de paciente
  const patientInitialValues = {
    nombre: '',
    apellido: '',
    dpi: '',
    genero: '',
    direccion: '',
    telefono: '',
    fecha_nacimiento: '',
    email: '',
    password: '',
    confirmPassword: '',
    foto_url: ''
  };

  // Valores iniciales para registro de médico
  const doctorInitialValues = {
    nombre: '',
    apellido: '',
    dpi: '',
    genero: '',
    direccion: '',
    direccion_clinica: '',
    telefono: '',
    fecha_nacimiento: '',
    numero_colegiado: '',
    especialidad_id: '',
    email: '',
    password: '',
    confirmPassword: '',
    foto_url: ''
  };

  // Manejar cambio entre modos de registro de paciente y médico
  const handleModeChange = (newMode) => {
    setMode(newMode);
    setError(null);
    setSuccess(null);
  };

  // Manejar envío del formulario para registro de paciente
  const handlePatientSubmit = async (values, { resetForm }) => {
    setLoading(true);
    setError(null);
    
    try {
      // Eliminar confirmPassword ya que no es necesario para la API
      const { confirmPassword, ...patientData } = values;
      
      const response = await authService.register.patient(patientData);
      
      if (response.data.status === 'success') {
        setSuccess('¡Registro exitoso! Por favor espera la aprobación del administrador.');
        resetForm();
        
        // Redireccionar a la página de inicio de sesión después de un retraso
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err) {
      console.error('Error de registro de paciente:', err);
      
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('El registro falló. Por favor intenta nuevamente más tarde.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Manejar envío del formulario para registro de médico
  const handleDoctorSubmit = async (values, { resetForm }) => {
    setLoading(true);
    setError(null);
    
    try {
      // Eliminar confirmPassword ya que no es necesario para la API
      const { confirmPassword, ...doctorData } = values;
      
      const response = await authService.register.doctor(doctorData);
      
      if (response.data.status === 'success') {
        setSuccess('¡Registro exitoso! Por favor espera la aprobación del administrador.');
        resetForm();
        
        // Redireccionar a la página de inicio de sesión después de un retraso
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err) {
      console.error('Error de registro de médico:', err);
      
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('El registro falló. Por favor intenta nuevamente más tarde.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Lado izquierdo - Imagen de fondo */}
      <div className="auth-background">
        <div className="auth-background-content">
          <h1>SaludPlus</h1>
          <p>Únete a nuestra comunidad de profesionales de la salud y pacientes. Regístrate hoy para acceder a nuestros servicios.</p>
        </div>
      </div>
      
      {/* Lado derecho - Formulario de registro */}
      <div className="auth-form-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Registro en SaludPlus</h2>
            <p>Crea una cuenta para comenzar a usar nuestros servicios</p>
          </div>
          
          {/* Pestañas para cambiar entre registro de paciente y médico */}
          <div className="auth-tabs">
            <div 
              className={`auth-tab ${mode === 'patient' ? 'active' : ''}`} 
              onClick={() => handleModeChange('patient')}
            >
              Paciente
            </div>
            <div 
              className={`auth-tab ${mode === 'doctor' ? 'active' : ''}`} 
              onClick={() => handleModeChange('doctor')}
            >
              Médico
            </div>
          </div>
          
          {success && (
            <Alert 
              message={success} 
              type="success" 
              title="Registro Exitoso"
              showIcon={true}
              duration={3000}
            />
          )}
          
          {error && (
            <Alert 
              message={error} 
              type="error" 
              title="Error de Registro"
              showIcon={true}
            />
          )}
          
          {mode === 'patient' ? (
            <Formik
              initialValues={patientInitialValues}
              validationSchema={patientSchema}
              onSubmit={handlePatientSubmit}
            >
              {({ isSubmitting }) => (
                <Form className="auth-form">
                  <div className="row">
                    <div className="col">
                      <div className="form-group">
                        <label htmlFor="nombre" className="form-label">Nombre</label>
                        <Field
                          type="text"
                          id="nombre"
                          name="nombre"
                          className="form-control"
                          placeholder="Ingresa tu nombre"
                        />
                        <ErrorMessage name="nombre" component="div" className="form-error" />
                      </div>
                    </div>
                    <div className="col">
                      <div className="form-group">
                        <label htmlFor="apellido" className="form-label">Apellido</label>
                        <Field
                          type="text"
                          id="apellido"
                          name="apellido"
                          className="form-control"
                          placeholder="Ingresa tu apellido"
                        />
                        <ErrorMessage name="apellido" component="div" className="form-error" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col">
                      <div className="form-group">
                        <label htmlFor="dpi" className="form-label">DPI</label>
                        <Field
                          type="text"
                          id="dpi"
                          name="dpi"
                          className="form-control"
                          placeholder="Ingresa tu DPI de 13 dígitos"
                        />
                        <ErrorMessage name="dpi" component="div" className="form-error" />
                      </div>
                    </div>
                    <div className="col">
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
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="direccion" className="form-label">Dirección</label>
                    <Field
                      type="text"
                      id="direccion"
                      name="direccion"
                      className="form-control"
                      placeholder="Ingresa tu dirección"
                    />
                    <ErrorMessage name="direccion" component="div" className="form-error" />
                  </div>
                  
                  <div className="row">
                    <div className="col">
                      <div className="form-group">
                        <label htmlFor="telefono" className="form-label">Número de Teléfono</label>
                        <Field
                          type="text"
                          id="telefono"
                          name="telefono"
                          className="form-control"
                          placeholder="Ingresa tu número de teléfono de 8 dígitos"
                        />
                        <ErrorMessage name="telefono" component="div" className="form-error" />
                      </div>
                    </div>
                    <div className="col">
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
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email" className="form-label">Correo Electrónico</label>
                    <Field
                      type="email"
                      id="email"
                      name="email"
                      className="form-control"
                      placeholder="Ingresa tu correo electrónico"
                    />
                    <ErrorMessage name="email" component="div" className="form-error" />
                  </div>
                  
                  <div className="row">
                    <div className="col">
                      <div className="form-group">
                        <label htmlFor="password" className="form-label">Contraseña</label>
                        <Field
                          type="password"
                          id="password"
                          name="password"
                          className="form-control"
                          placeholder="Ingresa tu contraseña"
                        />
                        <ErrorMessage name="password" component="div" className="form-error" />
                      </div>
                    </div>
                    <div className="col">
                      <div className="form-group">
                        <label htmlFor="confirmPassword" className="form-label">Confirmar Contraseña</label>
                        <Field
                          type="password"
                          id="confirmPassword"
                          name="confirmPassword"
                          className="form-control"
                          placeholder="Confirma tu contraseña"
                        />
                        <ErrorMessage name="confirmPassword" component="div" className="form-error" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="foto_url" className="form-label">URL de Foto de Perfil (Opcional)</label>
                    <Field
                      type="text"
                      id="foto_url"
                      name="foto_url"
                      className="form-control"
                      placeholder="Ingresa URL para tu foto de perfil"
                    />
                    <ErrorMessage name="foto_url" component="div" className="form-error" />
                  </div>
                  
                  <ButtonSpinner
                    type="submit"
                    className="btn-primary w-100"
                    loading={loading}
                    disabled={isSubmitting}
                  >
                    Registrarse como Paciente
                  </ButtonSpinner>
                </Form>
              )}
            </Formik>
          ) : (
            <Formik
              initialValues={doctorInitialValues}
              validationSchema={doctorSchema}
              onSubmit={handleDoctorSubmit}
            >
              {({ isSubmitting }) => (
                <Form className="auth-form">
                  <div className="row">
                    <div className="col">
                      <div className="form-group">
                        <label htmlFor="nombre" className="form-label">Nombre</label>
                        <Field
                          type="text"
                          id="nombre"
                          name="nombre"
                          className="form-control"
                          placeholder="Ingresa tu nombre"
                        />
                        <ErrorMessage name="nombre" component="div" className="form-error" />
                      </div>
                    </div>
                    <div className="col">
                      <div className="form-group">
                        <label htmlFor="apellido" className="form-label">Apellido</label>
                        <Field
                          type="text"
                          id="apellido"
                          name="apellido"
                          className="form-control"
                          placeholder="Ingresa tu apellido"
                        />
                        <ErrorMessage name="apellido" component="div" className="form-error" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col">
                      <div className="form-group">
                        <label htmlFor="dpi" className="form-label">DPI</label>
                        <Field
                          type="text"
                          id="dpi"
                          name="dpi"
                          className="form-control"
                          placeholder="Ingresa tu DPI de 13 dígitos"
                        />
                        <ErrorMessage name="dpi" component="div" className="form-error" />
                      </div>
                    </div>
                    <div className="col">
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
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="direccion" className="form-label">Dirección Personal</label>
                    <Field
                      type="text"
                      id="direccion"
                      name="direccion"
                      className="form-control"
                      placeholder="Ingresa tu dirección personal"
                    />
                    <ErrorMessage name="direccion" component="div" className="form-error" />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="direccion_clinica" className="form-label">Dirección de Clínica</label>
                    <Field
                      type="text"
                      id="direccion_clinica"
                      name="direccion_clinica"
                      className="form-control"
                      placeholder="Ingresa la dirección de tu clínica"
                    />
                    <ErrorMessage name="direccion_clinica" component="div" className="form-error" />
                  </div>
                  
                  <div className="row">
                    <div className="col">
                      <div className="form-group">
                        <label htmlFor="telefono" className="form-label">Número de Teléfono</label>
                        <Field
                          type="text"
                          id="telefono"
                          name="telefono"
                          className="form-control"
                          placeholder="Ingresa tu número de teléfono de 8 dígitos"
                        />
                        <ErrorMessage name="telefono" component="div" className="form-error" />
                      </div>
                    </div>
                    <div className="col">
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
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col">
                      <div className="form-group">
                        <label htmlFor="numero_colegiado" className="form-label">Número de Colegiado</label>
                        <Field
                          type="text"
                          id="numero_colegiado"
                          name="numero_colegiado"
                          className="form-control"
                          placeholder="Ingresa tu número de colegiado"
                        />
                        <ErrorMessage name="numero_colegiado" component="div" className="form-error" />
                      </div>
                    </div>
                    <div className="col">
                      <div className="form-group">
                        <label htmlFor="especialidad_id" className="form-label">Especialidad</label>
                        <Field
                          as="select"
                          id="especialidad_id"
                          name="especialidad_id"
                          className="form-control"
                        >
                          <option value="">Seleccionar especialidad</option>
                          {specialties.map(specialty => (
                            <option key={specialty.id} value={specialty.id}>
                              {specialty.nombre}
                            </option>
                          ))}
                        </Field>
                        <ErrorMessage name="especialidad_id" component="div" className="form-error" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email" className="form-label">Correo Electrónico</label>
                    <Field
                      type="email"
                      id="email"
                      name="email"
                      className="form-control"
                      placeholder="Ingresa tu correo electrónico"
                    />
                    <ErrorMessage name="email" component="div" className="form-error" />
                  </div>
                  
                  <div className="row">
                    <div className="col">
                      <div className="form-group">
                        <label htmlFor="password" className="form-label">Contraseña</label>
                        <Field
                          type="password"
                          id="password"
                          name="password"
                          className="form-control"
                          placeholder="Ingresa tu contraseña"
                        />
                        <ErrorMessage name="password" component="div" className="form-error" />
                      </div>
                    </div>
                    <div className="col">
                      <div className="form-group">
                        <label htmlFor="confirmPassword" className="form-label">Confirmar Contraseña</label>
                        <Field
                          type="password"
                          id="confirmPassword"
                          name="confirmPassword"
                          className="form-control"
                          placeholder="Confirma tu contraseña"
                        />
                        <ErrorMessage name="confirmPassword" component="div" className="form-error" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="foto_url" className="form-label">URL de Foto de Perfil</label>
                    <Field
                      type="text"
                      id="foto_url"
                      name="foto_url"
                      className="form-control"
                      placeholder="Ingresa URL para tu foto de perfil"
                    />
                    <ErrorMessage name="foto_url" component="div" className="form-error" />
                  </div>
                  
                  <ButtonSpinner
                    type="submit"
                    className="btn-primary w-100"
                    loading={loading}
                    disabled={isSubmitting}
                  >
                    Registrarse como Médico
                  </ButtonSpinner>
                </Form>
              )}
            </Formik>
          )}
          
          <div className="auth-footer">
            <p>¿Ya tienes una cuenta? <Link to="/login">Inicia sesión aquí</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;