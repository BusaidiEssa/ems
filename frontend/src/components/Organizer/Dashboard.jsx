import { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppContext from '../../context/AppContext';
import Sidebar from './Sidebar';
import EventsList from './EventsList';
import EventManagement from './EventManagement';
import GlobalAnalytics from './GlobalAnalytics';
import GlobalRegistrations from './GlobalRegistrations';
import UserSettings from './UserSettings'; // ADD THIS

function Dashboard() {
  const { currentUser } = useContext(AppContext);

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<EventsList />} />
          <Route path="/event/:eventId/*" element={<EventManagement />} />
          <Route path="/analytics" element={<GlobalAnalytics />} />
          <Route path="/registrations" element={<GlobalRegistrations />} />
          <Route path="/settings" element={<UserSettings />} /> 
        </Routes>
      </div>
    </div>
  );
}

export default Dashboard;