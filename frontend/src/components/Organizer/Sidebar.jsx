import { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Calendar, 
  LogOut, 
  User, 
  BarChart3, 
  Users,
  Globe 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AppContext from '../../context/AppContext';
import LanguageSwitcher from '../Common/LanguageSwitcher';

function Sidebar() {
  const { currentUser, logout } = useContext(AppContext);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const menuItems = [
    {
      path: '/dashboard',
      label: t('nav.myEvents', 'My Events'),
      icon: Calendar,
      exact: true
    },
    {
      path: '/dashboard/analytics',
      label: 'Global Analytics',
      icon: BarChart3,
      exact: false
    },
    {
      path: '/dashboard/registrations',
      label: 'All Registrations',
      icon: Users,
      exact: false
    }
  ];

  return (
    <div className="w-64 bg-gray-800 text-white flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-2xl font-bold">EMS</h2>
        <p className="text-xs text-gray-400 mt-1">Event Management System</p>
        
        <div className="mt-4 p-3 bg-gray-700 rounded-lg">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{currentUser?.name}</p>
              <p className="text-xs text-gray-400 truncate">{currentUser?.email}</p>
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <LanguageSwitcher />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = item.exact 
              ? location.pathname === item.path
              : isActive(item.path);
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  active
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-gray-700 text-gray-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 transition text-red-400"
        >
          <LogOut className="w-5 h-5" />
          <span>{t('nav.logout', 'Logout')}</span>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;