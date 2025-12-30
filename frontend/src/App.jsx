import { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AppContext from './context/AppContext';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import Dashboard from './components/Organizer/Dashboard';
import RegistrationPage from './components/Participant/RegistrationPage';
import TeamInviteAccept from './components/Team/TeamInviteAccept';

function App() {
  const { currentUser, loading } = useContext(AppContext);
  const { i18n } = useTranslation();

  // Set document direction based on language
  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

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
        <Route path="/team/accept/:token" element={currentUser ? <TeamInviteAccept /> : <Navigate to="/login" />} />

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