import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (token) {
          // Configura axios para incluir el token en los headers
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          try {
            // Decodifica el token para verificar su expiración
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000;
            
            if (decoded.exp < currentTime) {
              // Token expirado
              handleLogout();
              setError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
            } else {
              // Token válido - establece los datos del usuario desde el token
              setCurrentUser({
                id: decoded.id,
                email: decoded.email,
                role: decoded.rol,
                isAdmin: decoded.isAdmin
              });
            }
          } catch (decodeError) {
            console.error('Error al decodificar el token:', decodeError);
            handleLogout();
            setError('Error de autenticación. Por favor, inicia sesión nuevamente.');
          }
        }
      } catch (err) {
        console.error('Error al inicializar la autenticación:', err);
        setError('Ocurrió un error al iniciar la autenticación.');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [token]);

  // Función para manejar el inicio de sesión
  const handleLogin = (userData, authToken) => {
    setToken(authToken);
    setCurrentUser(userData);
    setError(null);
    localStorage.setItem('token', authToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
  };

  // Función para cerrar sesión y limpiar datos
  const handleLogout = () => {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    navigate('/login');
  };

  const contextValue = {
    currentUser,
    token,
    loading,
    error,
    setError,
    login: handleLogin,
    logout: handleLogout,
    isAuthenticated: !!token
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;