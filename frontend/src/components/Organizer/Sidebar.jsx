import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, LogOut, User } from 'lucide-react';
import AppContext from '../../context/AppContext';

function Sidebar() {
  const { currentUser, logout } = useContext(AppContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="w-64 bg-gray-800 text-white flex flex-col">
      <div className="p-6">
        <h2 className="text-2xl font-bold">EMS Dashboard</h2>
        <div className="mt-4 p-3 bg-gray-700 rounded-lg">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{currentUser?.name}</p>
              <p className="text-xs text-gray-400 truncate">{currentUser?.email}</p>
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition mb-2"
        >
          <Calendar className="w-5 h-5" />
          <span>My Events</span>
        </button>
      </nav>

      <div className="p-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 transition text-red-400"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;