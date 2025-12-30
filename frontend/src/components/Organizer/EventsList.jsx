import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Plus, Loader, Trash2, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { eventsAPI } from '../../utils/api';

function EventsList() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    location: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await eventsAPI.getAll();
      setEvents(response.data.events);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await eventsAPI.create(formData);
      if (response.data.success) {
        setEvents([response.data.event, ...events]);
        setShowCreateForm(false);
        setFormData({ title: '', date: '', location: '', description: '' });
      }
    } catch (err) {
      setError(err.response?.data?.message || t('common.error'));
    }
  };

  const handleDelete = async (eventId) => {
    setDeleting(true);
    setError('');
    
    try {
      await eventsAPI.delete(eventId);
      setEvents(events.filter(e => e._id !== eventId));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Delete error:', err);
      setError(err.response?.data?.message || t('common.error'));
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{t('events.title')}</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          {t('events.createEvent')}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <h2 className="text-xl font-bold mb-4">{t('events.createNewEvent')}</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('events.eventTitle')} *
              </label>
              <input
                type="text"
                placeholder="Tech Conference 2024"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('events.eventDate')} *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('events.location')} *
              </label>
              <input
                type="text"
                placeholder="Convention Center, City"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('events.description')} *
              </label>
              <textarea
                placeholder={t('events.description')}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows="3"
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
              >
                {t('events.createEvent')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setError('');
                }}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                {t('events.cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div
            key={event._id}
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition relative group"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDeleteConfirm(event);
              }}
              className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition opacity-0 group-hover:opacity-100"
              title={t('events.deleteEvent')}
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <div
              onClick={() => navigate(`/dashboard/event/${event._id}`)}
              className="cursor-pointer"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-2 pr-10">{event.title}</h3>
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">
                  {new Date(event.date).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 mb-3">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{event.location}</span>
              </div>
              <p className="text-gray-500 text-sm line-clamp-2">{event.description}</p>
            </div>
          </div>
        ))}
      </div>

      {events.length === 0 && !showCreateForm && (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            {t('events.noEvents')}
          </h3>
          <p className="text-gray-500 mb-4">
            {t('events.createFirstEvent')}
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            {t('events.createEvent')}
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">{t('events.deleteEvent')}</h3>
            </div>

            <p className="text-gray-600 mb-2">
              {t('events.confirmDelete')} <strong>"{deleteConfirm.title}"</strong>?
            </p>
            <p className="text-sm text-red-600 mb-6">
              ⚠️ {t('events.deleteWarning')}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(deleteConfirm._id)}
                disabled={deleting}
                className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    {t('events.deleting')}
                  </>
                ) : (
                  <>
                    <Trash2 className="w-5 h-5" />
                    {t('events.deleteEvent')}
                  </>
                )}
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-300 transition font-semibold disabled:opacity-50"
              >
                {t('events.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EventsList;