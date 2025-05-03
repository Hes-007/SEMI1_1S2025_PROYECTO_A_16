import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { currentUser, isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Cierra el menú móvil al cambiar de ruta
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Cierra el dropdown al hacer clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest('.user-dropdown')) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Obtener iniciales del usuario para el avatar
  const getUserInitials = () => {
    if (!currentUser?.name) return '?';

    const nameParts = currentUser.name.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return nameParts[0][0].toUpperCase();
  };

  // Verifica si un link está activo
  const isActive = (path) => {
    return location.pathname.startsWith(path) ? 'active' : '';
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-brand">
          <Link to="/">
            <h1>SaludPlus</h1>
          </Link>
        </div>

        {/* Botón para mostrar/ocultar el menú en móvil */}
        <button 
          className="mobile-menu-toggle" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Alternar navegación"
        >
          {mobileMenuOpen ? (
            // Icono de "cerrar"
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          ) : (
            // Icono de "menú"
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          )}
        </button>

        <div className={`navbar-menu ${mobileMenuOpen ? 'active' : ''}`}>
          {isAuthenticated ? (
            <>
              {currentUser?.role === 'paciente' && (
                <div className="navbar-links">
                  <Link to="/patient/doctors" className={isActive('/patient/doctors')}>Doctores</Link>
                  <Link to="/patient/appointments" className={isActive('/patient/appointments')}>Mis Citas</Link>
                  <Link to="/patient/history" className={isActive('/patient/history')}>Historial</Link>
                  <Link to="/patient/profile" className={isActive('/patient/profile')}>Perfil</Link>
                </div>
              )}

              {currentUser?.role === 'medico' && (
                <div className="navbar-links">
                  <Link to="/doctor/appointments" className={isActive('/doctor/appointments')}>Citas</Link>
                  <Link to="/doctor/schedule" className={isActive('/doctor/schedule')}>Mi Agenda</Link>
                  <Link to="/doctor/history" className={isActive('/doctor/history')}>Historial</Link>
                  <Link to="/doctor/profile" className={isActive('/doctor/profile')}>Perfil</Link>
                </div>
              )}

              {currentUser?.isAdmin && (
                <div className="navbar-links">
                  <Link to="/admin/pending" className={isActive('/admin/pending')}>Aprobaciones Pendientes</Link>
                  <Link to="/admin/users" className={isActive('/admin/users')}>Gestionar Usuarios</Link>
                  <Link to="/admin/reports" className={isActive('/admin/reports')}>Reportes</Link>
                </div>
              )}

              <div className="navbar-buttons">
                <div className="user-dropdown">
                  <button 
                    className="user-dropdown-toggle" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setDropdownOpen(!dropdownOpen);
                    }}
                  >
                    <div className="user-avatar">
                      {getUserInitials()}
                    </div>
                    <span className="user-email">{currentUser?.email}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>
                  <div className={`user-dropdown-menu ${dropdownOpen ? 'show' : ''}`}>
                    {(currentUser?.role === 'paciente' || currentUser?.role === 'medico') && (
                      <Link 
                        to={currentUser?.role === 'paciente' ? "/patient/profile" : "/doctor/profile"} 
                        className="user-dropdown-item"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        Mi Perfil
                      </Link>
                    )}
                    <div className="user-dropdown-divider"></div>
                    <button className="user-dropdown-item" onClick={handleLogout}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                      </svg>
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="navbar-buttons">
              <Link to="/login" className="btn btn-outline-primary me-2">
                Iniciar Sesión
              </Link>
              <Link to="/register" className="btn btn-primary">
                Registrarse
              </Link>
            </div>
          )}
        </div>

        {/* Capa de fondo para cerrar el menú móvil */}
        {mobileMenuOpen && (
          <div 
            className="navbar-overlay active" 
            onClick={() => setMobileMenuOpen(false)}
          ></div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;