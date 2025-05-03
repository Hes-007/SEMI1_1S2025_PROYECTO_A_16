import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import AuthContext from '../../context/AuthContext';
import { authService } from '../../services/api';
import { useAlert } from '../../components/common/Alert'; // ✅ Hook para alertas
import { ButtonSpinner } from '../../components/common/Spinner';
import './Auth.css';

// ✅ Esquema de validación del formulario
const validationSchema = Yup.object({
  email: Yup.string()
    .email('Formato de correo inválido')
    .required('El correo es obligatorio'),
  password: Yup.string()
    .required('La contraseña es obligatoria')
});

const Login = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const { alert } = useAlert(); // ✅ Inicializa hook de alertas

  const initialValues = {
    email: '',
    password: ''
  };

  // Maneja el envío del formulario de login
  const handleSubmit = async (values, { setSubmitting }) => {
    setLoading(true);

    try {
      const response = await authService.login(values);

      if (response.data.status === 'success') {
        const { token, ...userData } = response.data.data;
        login(userData, token);

        // Redirige según el rol
        if (userData.rol === 'paciente') {
          navigate('/patient/doctors');
        } else if (userData.rol === 'medico') {
          navigate('/doctor/appointments');
        }
      }
    } catch (err) {
      console.error('Error al iniciar sesión:', err);
      console.log('RESPONSE ERROR:', err.response?.data);

      const resData = err.response?.data;

      // Validaciones tipo Joi o Sequelize
      if (resData?.errors) {
        const validationMessages = resData.errors.map(e => `• ${e.message}`).join('\n');
        alert.error(validationMessages, {
          title: 'Validación de datos'
        });
      }
      // Mensaje directo del backend (ej. credenciales inválidas)
      else if (resData?.message) {
        alert.error(resData.message, {
          title: 'Error de autenticación'
        });
      }
      // Fallback genérico (problemas de red u otro)
      else {
        alert.error('Ocurrió un error inesperado. Intenta más tarde.', {
          title: 'Error de red'
        });
      }

    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Lado izquierdo - imagen o contenido de fondo */}
      <div className="auth-background">
        <div className="auth-background-content">
          <h1>SaludPlus</h1>
          <p>Tu salud es nuestra prioridad. Accede a servicios médicos de calidad con solo unos clics.</p>
        </div>
      </div>

      {/* Lado derecho - formulario de login */}
      <div className="auth-form-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Inicia sesión en SaludPlus</h2>
            <p>Ingresa tus credenciales para acceder a tu cuenta</p>
          </div>

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="auth-form">
                <div className="form-group">
                  <label htmlFor="email" className="form-label">Correo electrónico</label>
                  <Field
                    type="email"
                    id="email"
                    name="email"
                    className="form-control"
                    placeholder="Ingresa tu correo"
                  />
                  <ErrorMessage name="email" component="div" className="form-error" />
                </div>

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

                <ButtonSpinner
                  type="submit"
                  className="btn-primary w-100"
                  loading={loading}
                  disabled={isSubmitting}
                >
                  Iniciar Sesión
                </ButtonSpinner>
              </Form>
            )}
          </Formik>

          <div className="auth-footer">
            <p>¿No tienes una cuenta? <Link to="/register">Regístrate aquí</Link></p>
            <p><Link to="/admin-login">Acceso para administradores</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;