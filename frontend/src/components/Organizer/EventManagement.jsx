import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader } from 'lucide-react';
import { eventsAPI } from '../../utils/api';
import StakeholderForms from './StakeholderForms';
import RegistrationsList from './RegistrationsList';
import EmailAnnouncements from './EmailAnnouncements';
import Analytics from './Analytics';
import QRScanner from './QRScanner';

function EventManagement() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('forms');

  useEffect(() => {
    fetchEvent();
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
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Event Not Found</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-600 hover:underline"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-blue-600 hover:underline mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Events
      </button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{event.title}</h1>
        <p className="text-gray-600">
          {new Date(event.date).toLocaleDateString()} • {event.location}
        </p>
      </div>

      {/* TABS - Added Scanner Tab */}
      <div className="flex gap-4 mb-6 border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('forms')}
          className={`px-4 py-2 font-semibold whitespace-nowrap ${
            activeTab === 'forms'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Stakeholder Forms
        </button>
        <button
          onClick={() => setActiveTab('registrations')}
          className={`px-4 py-2 font-semibold whitespace-nowrap ${
            activeTab === 'registrations'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Registrations
        </button>
        {/* ✅ ADDED SCANNER TAB BUTTON */}
        <button
          onClick={() => setActiveTab('scanner')}
          className={`px-4 py-2 font-semibold whitespace-nowrap ${
            activeTab === 'scanner'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Check-in Scanner
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 font-semibold whitespace-nowrap ${
            activeTab === 'analytics'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Analytics
        </button>
        <button
          onClick={() => setActiveTab('email')}
          className={`px-4 py-2 font-semibold whitespace-nowrap ${
            activeTab === 'email'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Send Email
        </button>
      </div>

      {/* TAB CONTENT */}
      <div>
        {activeTab === 'forms' && <StakeholderForms eventId={eventId} />}
        {activeTab === 'registrations' && <RegistrationsList eventId={eventId} />}
        {activeTab === 'scanner' && <QRScanner eventId={eventId} />}
        {activeTab === 'analytics' && <Analytics eventId={eventId} />}
        {activeTab === 'email' && <EmailAnnouncements eventId={eventId} />}
      </div>
    </div>
  );
}

export default EventManagement;