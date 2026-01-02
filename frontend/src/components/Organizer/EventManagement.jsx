import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Loader, 
  FileText, 
  Users, 
  QrCode, 
  BarChart3, 
  Settings, 
  UserPlus, 
  Copy, 
  Mail 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { eventsAPI, registrationsAPI } from '../../utils/api';
import StakeholderForms from './StakeholderForms';
import RegistrationsList from './RegistrationsList';
import EmailAnnouncements from './EmailAnnouncements';
import Analytics from './Analytics';
import QRScanner from './QRScanner';
import TeamManagement from '../Team/TeamManagement';
import EventCapacity from './EventCapacity';
import EventTemplates from './Templates/EventTemplate';

function EventManagement() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('forms');
  const [registrationCount, setRegistrationCount] = useState(0);

  useEffect(() => {
    fetchEvent();
    fetchRegistrationCount();
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      const response = await eventsAPI.getOne(eventId);
      setEvent(response.data.event);
    } catch (err) {
      console.error('Error fetching event:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrationCount = async () => {
    try {
      const response = await registrationsAPI.getByEvent(eventId);
      setRegistrationCount(response.data.registrations.length);
    } catch (err) {
      console.error('Error fetching registrations:', err);
    }
  };

  const handleCapacityUpdate = async (capacityData) => {
    try {
      const response = await eventsAPI.update(eventId, capacityData);
      setEvent(response.data.event);
      alert('Event capacity settings updated successfully!');
    } catch (err) {
      console.error('Error updating capacity:', err);
      alert('Failed to update capacity settings');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {t('events.notFound', 'Event Not Found')}
          </h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-600 hover:underline"
          >
            {t('common.back', 'Back to Dashboard')}
          </button>
        </div>
      </div>
    );
  }

  const menuSections = [
    {
      title: 'Event Setup',
      items: [
        { id: 'forms', label: t('stakeholder.title', 'Stakeholder Forms'), icon: FileText },
        { id: 'capacity', label: t('events.capacity', 'Capacity Settings'), icon: Settings },
        { id: 'templates', label: t('templates.title', 'Templates'), icon: Copy },
      ]
    },
    {
      title: 'Management',
      items: [
        { id: 'registrations', label: t('registrations.title', 'Registrations'), icon: Users },
        { id: 'scanner', label: t('scanner.title', 'Check-in Scanner'), icon: QrCode },
        { id: 'team', label: t('team.title', 'Team Management'), icon: UserPlus },
      ]
    },
    {
      title: 'Communication & Analytics',
      items: [
        { id: 'email', label: t('email.title', 'Send Email'), icon: Mail },
        { id: 'analytics', label: t('analytics.title', 'Analytics'), icon: BarChart3 },
      ]
    }
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">{t('common.back', 'Back to Events')}</span>
          </button>
          
          <h1 className="text-xl font-bold mb-1 truncate">{event.title}</h1>
          <p className="text-sm text-gray-400">
            {new Date(event.date).toLocaleDateString()}
          </p>
          <p className="text-sm text-gray-400">{event.location}</p>
        </div>

        {/* Menu Items - Grouped by Sections */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {menuSections.map((section, sectionIdx) => (
            <div key={sectionIdx} className="mb-6">
              <div className="px-3 mb-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {section.title}
                </span>
              </div>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer Stats */}
        <div className="p-4 border-t border-gray-700 bg-gray-800">
          <div className="text-xs text-gray-400 mb-2">Quick Stats</div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Registrations:</span>
              <span className="text-white font-semibold">{registrationCount}</span>
            </div>
            {event.capacity && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Capacity:</span>
                <span className="text-white font-semibold">{event.capacity}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="p-8">
          {activeTab === 'forms' && <StakeholderForms eventId={eventId} />}
          {activeTab === 'registrations' && <RegistrationsList eventId={eventId} />}
          {activeTab === 'scanner' && <QRScanner eventId={eventId} />}
          {activeTab === 'analytics' && <Analytics eventId={eventId} />}
          {activeTab === 'capacity' && (
            <EventCapacity 
              event={event} 
              currentRegistrations={registrationCount}
              onUpdate={handleCapacityUpdate}
            />
          )}
          {activeTab === 'team' && <TeamManagement eventId={eventId} />}
          {activeTab === 'templates' && (
            <EventTemplates 
              eventId={eventId}
              onApplyTemplate={fetchEvent}
            />
          )}
          {activeTab === 'email' && <EmailAnnouncements eventId={eventId} />}
        </div>
      </div>
    </div>
  );
}

export default EventManagement;