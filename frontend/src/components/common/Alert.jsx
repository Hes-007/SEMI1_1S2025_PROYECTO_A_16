import React, { useState, useEffect, useRef } from 'react';
import './Alert.css';

// Íconos para los diferentes tipos de alerta
const AlertIcon = ({ type }) => {
  switch (type) {
    case 'success':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      );
    case 'warning':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      );
    case 'error':
    case 'danger':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
      );
    case 'info':
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      );
  }
};

const Alert = ({ 
  message, 
  type = 'info', 
  duration = 5000, 
  onClose,
  position = 'default',
  title = null,
  showIcon = true
}) => {
  const [visible, setVisible] = useState(true);
  const alertRef = useRef(null);
  
  // Guardar la duración de la animación como variable CSS
  useEffect(() => {
    if (alertRef.current && duration > 0) {
      alertRef.current.style.setProperty('--alert-duration', `${duration}ms`);
    }
  }, [duration]);

  // Ocultar la alerta automáticamente después del tiempo indicado
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  if (!visible || !message) {
    return null;
  }

  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose();
  };

  // Determinar la clase según la posición
  let positionClass = '';
  if (position !== 'default') {
    positionClass = `alert-toast alert-toast-${position}`;
  }

  return (
    <div 
      ref={alertRef}
      className={`alert alert-${type} ${positionClass}`}
      style={{ '--alert-duration': `${duration}ms` }}
      role="alert"
    >
      <div className="alert-content">
        {showIcon && <AlertIcon type={type} />}
        <div className="alert-text">
          {/* Asegúrate de que `title` y `message` estén en español al usarlos */}
          {title && <div className="alert-title">{title}</div>}
          <div className="alert-message">{message}</div>
        </div>
      </div>
      <button 
        type="button" 
        className="alert-close"
        onClick={handleClose}
        aria-label="Cerrar"
      >
        &times;
      </button>
    </div>
  );
};

// Contexto para manejar múltiples alertas
export const AlertContext = React.createContext({
  addAlert: () => {},
  removeAlert: () => {}
});

// Proveedor de alertas para envolver tu aplicación
export const AlertProvider = ({ children, position = 'top-right' }) => {
  const [alerts, setAlerts] = useState([]);
  
  // Agrega una nueva alerta
  const addAlert = (alert) => {
    const id = Date.now();
    setAlerts(prev => [...prev, { id, ...alert }]);
    return id;
  };
  
  // Elimina una alerta por ID
  const removeAlert = (id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };
  
  return (
    <AlertContext.Provider value={{ addAlert, removeAlert }}>
      {children}
      <div className={`alert-container alert-container-${position}`}>
        {alerts.map(alert => (
          <Alert
            key={alert.id}
            message={alert.message}
            type={alert.type || 'info'}
            duration={alert.duration || 5000}
            onClose={() => removeAlert(alert.id)}
            title={alert.title}
            position="default" // La posición se maneja a nivel de contenedor
          />
        ))}
      </div>
    </AlertContext.Provider>
  );
};

// Hook personalizado para usar alertas
export const useAlert = () => {
  const context = React.useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  
  const { addAlert, removeAlert } = context;
  
  // Atajos para crear diferentes tipos de alerta
  const alert = {
    success: (message, options = {}) => addAlert({ message, type: 'success', ...options }),
    info: (message, options = {}) => addAlert({ message, type: 'info', ...options }),
    warning: (message, options = {}) => addAlert({ message, type: 'warning', ...options }),
    error: (message, options = {}) => addAlert({ message, type: 'error', ...options })
  };
  
  return { alert, removeAlert };
};

export default Alert;