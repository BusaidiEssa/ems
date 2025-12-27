import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Globe, Users, CheckCircle, Loader, ArrowLeft } from 'lucide-react';
import AppContext from '../../context/AppContext';
import { eventsAPI, stakeholderGroupsAPI, registrationsAPI } from '../../utils/api';

function RegistrationPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { language, setLanguage } = useContext(AppContext);
  const [event, setEvent] = useState(null);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [eventId]);

  const fetchData = async () => {
    try {
      const [eventResponse, groupsResponse] = await Promise.all([
        eventsAPI.getOne(eventId),
        stakeholderGroupsAPI.getByEvent(eventId)
      ]);

      setEvent(eventResponse.data.event);
      setGroups(groupsResponse.data.groups);
    } catch (err) {
      setError('Failed to load event information');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const response = await registrationsAPI.create({
        eventId,
        stakeholderGroupId: selectedGroup._id,
        formData
      });

      setQrCode(response.data.registration.qrCode);
      setRegistered(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-blue-600">
        <Loader className="w-12 h-12 animate-spin text-white" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-500 to-pink-600 p-4">
        <div className="bg-white p-8 rounded-lg shadow-2xl text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Event Not Found</h1>
          <p className="text-gray-600 mb-4">The event you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  if (registered) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-500 to-blue-600 p-4">
        <div className="bg-white p-8 rounded-lg shadow-2xl max-w-md w-full text-center">
          <div className="mb-4">
            <CheckCircle className="w-20 h-20 mx-auto text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Registration Successful!
          </h1>
          <p className="text-gray-600 mb-2">
            Registered as: <strong>{selectedGroup.name}</strong>
          </p>
          <p className="text-gray-600 mb-6">
            Event: <strong>{event.title}</strong>
          </p>

          <div className="bg-gray-100 p-6 rounded-lg mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-3">
              Your QR Code for Check-in:
            </p>
            <img
              src={qrCode}
              alt="Registration QR Code"
              className="mx-auto w-48 h-48 border-4 border-gray-300 rounded-lg"
            />
            <p className="text-xs text-gray-500 mt-3">
              Save this QR code and show it at the event entrance
            </p>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Register Another Person
          </button>
        </div>
      </div>
    );
  }

  if (!selectedGroup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-blue-600 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="bg-white px-6 py-4 rounded-lg shadow-lg">
              <h1 className="text-3xl font-bold text-gray-800">{event.title}</h1>
              <p className="text-gray-600 mt-1">
                {new Date(event.date).toLocaleDateString()} • {event.location}
              </p>
              <p className="text-gray-600 text-sm mt-2">{event.description}</p>
            </div>
            <button
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className="bg-white flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg hover:bg-gray-50 transition"
            >
              <Globe className="w-5 h-5" />
              {language === 'en' ? 'عربي' : 'English'}
            </button>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Select Registration Type
            </h2>

            {groups.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  Registration is not available for this event yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groups.map((group) => (
                  <button
                    key={group._id}
                    onClick={() => setSelectedGroup(group)}
                    className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-center group"
                  >
                    <Users className="w-12 h-12 mx-auto mb-3 text-blue-600 group-hover:scale-110 transition-transform" />
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {group.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {group.fields.length} fields to fill
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-blue-600 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => setSelectedGroup(null)}
          className="mb-4 text-white hover:underline flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to selection
        </button>

        <div className="bg-white p-8 rounded-lg shadow-2xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {selectedGroup.name} Registration
          </h2>
          <p className="text-gray-600 mb-6">{event.title}</p>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {selectedGroup.fields.map((field) => (
              <div key={field._id || field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {field.name} {field.required && <span className="text-red-500">*</span>}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    value={formData[field.name] || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, [field.name]: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    required={field.required}
                  />
                ) : (
                  <input
                    type={field.type}
                    value={formData[field.name] || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, [field.name]: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required={field.required}
                  />
                )}
              </div>
            ))}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Complete Registration'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RegistrationPage;