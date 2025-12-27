import { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Loader } from 'lucide-react';
import AppContext from './context/AppContext';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import Dashboard from './components/Organizer/Dashboard';
import RegistrationPage from './components/Participant/RegistrationPage';

function App() {
  const { currentUser, loading } = useContext(AppContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={!currentUser ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/signup" element={!currentUser ? <Signup /> : <Navigate to="/dashboard" />} />
        <Route path="/register/:eventId" element={<RegistrationPage />} />

        {/* Protected Routes */}
        <Route path="/dashboard/*" element={currentUser ? <Dashboard /> : <Navigate to="/login" />} />

        {/* Default Route */}
        <Route path="/" element={<Navigate to={currentUser ? "/dashboard" : "/login"} />} />
        
        {/* 404 */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;