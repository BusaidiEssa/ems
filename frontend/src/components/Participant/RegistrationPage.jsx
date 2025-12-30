// THe form the particpant sees

import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Globe, Users, CheckCircle, Loader, ArrowLeft, AlertCircle } from 'lucide-react';
import AppContext from '../../context/AppContext';
import { eventsAPI, stakeholderGroupsAPI, registrationsAPI } from '../../utils/api';

function RegistrationPage() {
  const { eventId } = useParams();
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
      console.error('Error:', err);
      setError('Failed to load event');
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

      if (response.data.success) {
        setQrCode(response.data.registration.qrCode);
        setRegistered(true);
      } else {
        throw new Error(response.data.message);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Registration failed');
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
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Event Not Found</h1>
        </div>
      </div>
    );
  }

  if (registered) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-500 to-blue-600 p-4">
        <div className="bg-white p-8 rounded-lg shadow-2xl max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Success!</h1>
          
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-700"><strong>Type:</strong> {selectedGroup.name}</p>
            <p className="text-gray-700"><strong>Event:</strong> {event.title}</p>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg mb-6">
            <p className="text-sm font-semibold mb-3">Your QR Code</p>
            <img src={qrCode} alt="QR Code" className="mx-auto w-64 h-64" />
            <p className="text-xs text-gray-600 mt-3">Save this QR code for check-in</p>
          </div>

          <div className="mb-6 p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-800">
              📧 Confirmation email sent!
            </p>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
          >
            Register Another
          </button>
        </div>
      </div>
    );
  }

  if (!selectedGroup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-blue-600 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="bg-white px-6 py-4 rounded-lg shadow-lg flex-1 mr-4">
              <h1 className="text-3xl font-bold text-gray-800">{event.title}</h1>
              <p className="text-gray-600 mt-2">
                📅 {new Date(event.date).toLocaleDateString()}
              </p>
              <p className="text-gray-600">📍 {event.location}</p>
            </div>

            <button
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className="bg-white flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg hover:bg-gray-50"
            >
              <Globe className="w-5 h-5" />
              {language === 'en' ? 'عربي' : 'English'}
            </button>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-2xl">
            <h2 className="text-2xl font-bold text-center mb-6">Select Registration Type</h2>

            {groups.length === 0 ? (
              <p className="text-center text-gray-500">No registration available</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {groups.map(group => (
                  <button
                    key={group._id}
                    onClick={() => setSelectedGroup(group)}
                    className="p-6 border-2 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-center"
                  >
                    <Users className="w-12 h-12 mx-auto mb-3 text-blue-600" />
                    <h3 className="text-xl font-bold">{group.name}</h3>
                    <p className="text-sm text-gray-500">{group.fields.length} fields</p>
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
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-blue-600 p-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => {
            setSelectedGroup(null);
            setFormData({});
            setError('');
          }}
          className="mb-4 text-white hover:underline flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="bg-white p-8 rounded-lg shadow-2xl">
          <h2 className="text-2xl font-bold mb-2">{selectedGroup.name} Registration</h2>
          <p className="text-gray-600 mb-6">{event.title}</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="text-red-700 font-semibold">Error</p>
              </div>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {selectedGroup.fields.map(field => (
              <div key={field._id || field.name}>
                <label className="block text-sm font-semibold mb-2">
                  {field.name} {field.required && <span className="text-red-500">*</span>}
                </label>

                {/* Textarea */}
                {field.type === 'textarea' && (
                  <textarea
                    value={formData[field.name] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows="4"
                    required={field.required}
                  />
                )}

                {/* Select / Dropdown */}
                {field.type === 'select' && (
                  <select
                    value={formData[field.name] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required={field.required}
                  >
                    <option value="">Select an option</option>
                    {(field.options || []).map((option, idx) => (
                      <option key={idx} value={option}>{option}</option>
                    ))}
                  </select>
                )}

                {/* Radio Buttons */}
                {field.type === 'radio' && (
                  <div className="space-y-2">
                    {(field.options || []).map((option, idx) => (
                      <label key={idx} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={field.name}
                          value={option}
                          checked={formData[field.name] === option}
                          onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                          className="w-4 h-4"
                          required={field.required}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* Multiple Checkboxes */}
                {field.type === 'checkbox' && Array.isArray(field.options) && (
                  <div className="space-y-2">
                    {field.options.map((option, idx) => (
                      <label key={idx} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name={field.name}
                          value={option}
                          checked={Array.isArray(formData[field.name]) && formData[field.name].includes(option)}
                          onChange={(e) => {
                            const currentValues = Array.isArray(formData[field.name])
                              ? formData[field.name]
                              : [];
                            if (e.target.checked) {
                              // add option
                              setFormData({ ...formData, [field.name]: [...currentValues, option] });
                            } else {
                              // remove option
                              setFormData({
                                ...formData,
                                [field.name]: currentValues.filter((val) => val !== option),
                              });
                            }
                          }}
                          className="w-5 h-5"
                          required={field.required && (!formData[field.name] || formData[field.name].length === 0)}
                        />
                        <span className="text-sm">{option}</span>
                      </label>
                    ))}
                  </div>
                )}


                {/* Date input */}
                {field.type === 'date' && (
                  <input
                    type="date"
                    value={formData[field.name] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required={field.required}
                  />
                )}

                {/* Regular inputs */}
                {!['textarea', 'select', 'radio', 'checkbox', 'date'].includes(field.type) && (
                  <input
                    type={field.type}
                    value={formData[field.name] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required={field.required}
                  />
                )}
              </div>
            ))}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 font-bold text-lg disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {submitting ? (
                <>
                  <Loader className="w-6 h-6 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="w-6 h-6" />
                  Complete Registration
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RegistrationPage;
