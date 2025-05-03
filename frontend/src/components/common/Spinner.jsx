import React from 'react';
import './Spinner.css';

const Spinner = ({ 
  size = 'medium', 
  fullPage = false, 
  type = 'border',
  text = 'Cargando...', // Texto visible para el usuario
  subText = '',
  animatedText = true
}) => {
  const spinnerClasses = `spinner spinner-${size} ${fullPage ? 'spinner-fullpage' : ''}`;
  
  // Diferentes tipos de spinner visual
  const renderSpinner = () => {
    switch (type) {
      case 'border':
        return (
          <div className="spinner-border" role="status">
            {/* Texto accesible, pero oculto visualmente */}
            <span className="visually-hidden">Cargando...</span>
          </div>
        );
      case 'pulse':
        return (
          <div className="spinner-pulse" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        );
      case 'dots':
        return (
          <div className="spinner-dots" role="status">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
            <span className="visually-hidden">Cargando...</span>
          </div>
        );
      case 'ripple':
        return (
          <div className="spinner-ripple" role="status">
            <div></div>
            <div></div>
            <span className="visually-hidden">Cargando...</span>
          </div>
        );
      default:
        return (
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        );
    }
  };

  return (
    <div className={spinnerClasses}>
      {renderSpinner()}
      
      {/* Mostrar texto adicional si es pantalla completa */}
      {fullPage && (
        <>
          <p className={`spinner-text ${animatedText ? 'spinner-text-animated' : ''}`}>
            {text}
          </p>
          {subText && <p className="spinner-subtext">{subText}</p>}
        </>
      )}
    </div>
  );
};

// Componente de botón con estado de carga
export const ButtonSpinner = ({ loading, children, className, ...props }) => {
  return (
    <button className={`btn ${className || ''}`} disabled={loading} {...props}>
      {loading ? (
        <>
          <span className="spinner-inline me-2"></span>
          Cargando...
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Spinner;