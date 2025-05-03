import { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Spinner from './components/common/Spinner';
import AuthContext from './context/AuthContext';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminLogin from './pages/auth/AdminLogin';

// Patient pages
import PatientDoctors from './pages/patient/PatientDoctors';
import PatientAppointments from './pages/patient/PatientAppointments';
import PatientHistory from './pages/patient/PatientHistory';
import PatientProfile from './pages/patient/PatientProfile';
import DoctorDetails from './pages/patient/DoctorDetails';

// Doctor pages
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import DoctorSchedule from './pages/doctor/DoctorSchedule';
import DoctorHistory from './pages/doctor/DoctorHistory';
import DoctorProfile from './pages/doctor/DoctorProfile';

// Admin pages
import AdminPending from './pages/admin/AdminPending';
import AdminUsers from './pages/admin/AdminUsers';
import AdminReports from './pages/admin/AdminReports';

// Protected route wrapper
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { currentUser, loading, isAuthenticated } = useContext(AuthContext);

  if (loading) {
    return <Spinner fullPage />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles.length > 0 && 
      !allowedRoles.includes(currentUser?.role) && 
      !currentUser?.isAdmin) {
    // Redirect based on user role if they try to access unauthorized route
    if (currentUser?.role === 'paciente') {
      return <Navigate to="/patient/doctors" />;
    } else if (currentUser?.role === 'medico') {
      return <Navigate to="/doctor/appointments" />;
    } else if (currentUser?.isAdmin) {
      return <Navigate to="/admin/pending" />;
    } else {
      return <Navigate to="/" />;
    }
  }

  return children;
};

function App() {
  const { loading, currentUser } = useContext(AuthContext);

  // Handle initial redirection based on role
  const getHomePage = () => {
    if (!currentUser) return <Navigate to="/login" />;
    
    if (currentUser.role === 'paciente') {
      return <Navigate to="/patient/doctors" />;
    } else if (currentUser.role === 'medico') {
      return <Navigate to="/doctor/appointments" />;
    } else if (currentUser.isAdmin) {
      return <Navigate to="/admin/pending" />;
    }
    
    return <Navigate to="/login" />;
  };

  if (loading) {
    return <Spinner fullPage />;
  }

  return (
    <>
      <Navbar />
      <main className="container py-4">
        <Routes>
          {/* Home route with redirection */}
          <Route path="/" element={getHomePage()} />

          {/* Auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin-login" element={<AdminLogin />} />

          {/* Patient routes */}
          <Route 
            path="/patient/doctors" 
            element={
              <ProtectedRoute allowedRoles={['paciente']}>
                <PatientDoctors />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/patient/doctors/:doctorId" 
            element={
              <ProtectedRoute allowedRoles={['paciente']}>
                <DoctorDetails />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/patient/appointments" 
            element={
              <ProtectedRoute allowedRoles={['paciente']}>
                <PatientAppointments />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/patient/history" 
            element={
              <ProtectedRoute allowedRoles={['paciente']}>
                <PatientHistory />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/patient/profile" 
            element={
              <ProtectedRoute allowedRoles={['paciente']}>
                <PatientProfile />
              </ProtectedRoute>
            } 
          />

          {/* Doctor routes */}
          <Route 
            path="/doctor/appointments" 
            element={
              <ProtectedRoute allowedRoles={['medico']}>
                <DoctorAppointments />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/doctor/schedule" 
            element={
              <ProtectedRoute allowedRoles={['medico']}>
                <DoctorSchedule />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/doctor/history" 
            element={
              <ProtectedRoute allowedRoles={['medico']}>
                <DoctorHistory />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/doctor/profile" 
            element={
              <ProtectedRoute allowedRoles={['medico']}>
                <DoctorProfile />
              </ProtectedRoute>
            } 
          />

          {/* Admin routes */}
          <Route 
            path="/admin/pending" 
            element={
              <ProtectedRoute allowedRoles={[]}>
                {/* Only admin can access, checked by isAdmin in ProtectedRoute */}
                <AdminPending />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/users" 
            element={
              <ProtectedRoute allowedRoles={[]}>
                <AdminUsers />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/reports" 
            element={
              <ProtectedRoute allowedRoles={[]}>
                <AdminReports />
              </ProtectedRoute>
            } 
          />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </>
  );
}

export default App;