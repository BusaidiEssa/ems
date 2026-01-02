import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Loader, 
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  Calendar,
  MapPin,
  User,
  Mail,
  RefreshCw
} from 'lucide-react';
import { eventsAPI, registrationsAPI } from '../../utils/api';

function GlobalRegistrations() {
  const [events, setEvents] = useState([]);
  const [allRegistrations, setAllRegistrations] = useState([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterRegistrations();
  }, [searchTerm, selectedEvent, selectedStatus, allRegistrations]);

  const fetchData = async () => {
    try {
      const eventsResponse = await eventsAPI.getAll();
      const eventsData = eventsResponse.data.events;
      setEvents(eventsData);

      // Fetch registrations for all events
      const registrationsPromises = eventsData.map(event => 
        registrationsAPI.getByEvent(event._id)
          .then(res => ({
            eventId: event._id,
            eventTitle: event.title,
            eventDate: event.date,
            eventLocation: event.location,
            registrations: res.data.registrations
          }))
          .catch(() => ({
            eventId: event._id,
            eventTitle: event.title,
            eventDate: event.date,
            eventLocation: event.location,
            registrations: []
          }))
      );
      
      const eventsWithRegs = await Promise.all(registrationsPromises);
      
      // Flatten all registrations with event info
      const allRegs = eventsWithRegs.flatMap(e => 
        e.registrations.map(reg => ({
          ...reg,
          eventTitle: e.eventTitle,
          eventDate: e.eventDate,
          eventLocation: e.eventLocation
        }))
      );
      
      setAllRegistrations(allRegs);
      setFilteredRegistrations(allRegs);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterRegistrations = () => {
    let filtered = [...allRegistrations];

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(reg => {
        const name = (reg.formData?.Name || reg.formData?.name || '').toLowerCase();
        const email = (reg.formData?.Email || reg.formData?.email || '').toLowerCase();
        const eventTitle = (reg.eventTitle || '').toLowerCase();
        return name.includes(search) || email.includes(search) || eventTitle.includes(search);
      });
    }

    // Event filter
    if (selectedEvent !== 'all') {
      filtered = filtered.filter(reg => reg.eventId === selectedEvent);
    }

    // Status filter
    if (selectedStatus === 'checked-in') {
      filtered = filtered.filter(reg => reg.checkedIn);
    } else if (selectedStatus === 'pending') {
      filtered = filtered.filter(reg => !reg.checkedIn);
    }

    setFilteredRegistrations(filtered);
  };

  const handleToggleCheckIn = async (reg) => {
    try {
      await registrationsAPI.toggleCheckIn(reg._id);
      fetchData();
    } catch (err) {
      console.error('Error toggling check-in:', err);
      alert('Failed to update check-in status');
    }
  };

  const handleDelete = async (reg) => {
    if (!window.confirm(`Delete registration for ${reg.formData?.Name || reg.formData?.name}?`)) {
      return;
    }

    try {
      // Note: You'll need to add a delete endpoint in your backend
      alert('Delete functionality needs to be implemented in backend');
      // await registrationsAPI.delete(reg._id);
      // fetchData();
    } catch (err) {
      console.error('Error deleting registration:', err);
      alert('Failed to delete registration');
    }
  };

  const viewDetails = (reg) => {
    setSelectedRegistration(reg);
    setShowDetailsModal(true);
  };

  const exportToCSV = () => {
    const headers = ['Event', 'Date', 'Name', 'Email', 'Group', 'Status', 'Registered On'];
    const rows = filteredRegistrations.map(reg => [
      reg.eventTitle,
      new Date(reg.eventDate).toLocaleDateString(),
      reg.formData?.Name || reg.formData?.name || 'N/A',
      reg.formData?.Email || reg.formData?.email || 'N/A',
      reg.stakeholderGroupId?.name || 'N/A',
      reg.checkedIn ? 'Checked In' : 'Pending',
      new Date(reg.createdAt).toLocaleDateString()
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `registrations-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const stats = {
    total: filteredRegistrations.length,
    checkedIn: filteredRegistrations.filter(r => r.checkedIn).length,
    pending: filteredRegistrations.filter(r => !r.checkedIn).length
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">All Registrations</h1>
          <p className="text-gray-600 mt-1">Manage registrations across all events</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchData}
            className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
          >
            <RefreshCw className="w-5 h-5" />
            Refresh
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            <Download className="w-5 h-5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Total Registrations</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <User className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Checked In</p>
              <p className="text-2xl font-bold text-gray-800">{stats.checkedIn}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-800">{stats.pending}</p>
            </div>
            <XCircle className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or event..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Event Filter */}
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Events</option>
            {events.map(event => (
              <option key={event._id} value={event._id}>{event.title}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="checked-in">Checked In</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Registrations Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {filteredRegistrations.length === 0 ? (
          <div className="text-center py-12">
            <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No registrations found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Participant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Group</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredRegistrations.map(reg => {
                  const name = reg.formData?.Name || reg.formData?.name || 'N/A';
                  const email = reg.formData?.Email || reg.formData?.email || 'N/A';

                  return (
                    <tr key={reg._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{name}</p>
                            <p className="text-sm text-gray-600">{email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-800">{reg.eventTitle}</p>
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(reg.eventDate).toLocaleDateString()}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                          {reg.stakeholderGroupId?.name || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          reg.checkedIn 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {reg.checkedIn ? '✓ Checked In' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(reg.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => viewDetails(reg)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleCheckIn(reg)}
                            className={`p-2 rounded transition ${
                              reg.checkedIn
                                ? 'text-orange-600 hover:bg-orange-50'
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                            title={reg.checkedIn ? 'Undo Check-in' : 'Check In'}
                          >
                            {reg.checkedIn ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleDelete(reg)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedRegistration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <h3 className="text-xl font-bold">Registration Details</h3>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Event Info */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-bold text-gray-800 mb-2">Event Information</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Event:</strong> {selectedRegistration.eventTitle}</p>
                  <p className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(selectedRegistration.eventDate).toLocaleDateString()}
                  </p>
                  <p className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {selectedRegistration.eventLocation}
                  </p>
                </div>
              </div>

              {/* Participant Info */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-bold text-gray-800 mb-2">Participant Information</h4>
                <div className="space-y-2 text-sm">
                  {Object.entries(selectedRegistration.formData || {}).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-600">{key}:</span>
                      <span className="font-medium text-gray-800">
                        {Array.isArray(value) ? value.join(', ') : value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-bold text-gray-800 mb-2">Status</h4>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Check-in Status:</strong>{' '}
                    <span className={selectedRegistration.checkedIn ? 'text-green-600' : 'text-orange-600'}>
                      {selectedRegistration.checkedIn ? '✓ Checked In' : 'Pending'}
                    </span>
                  </p>
                  <p><strong>Registered:</strong> {new Date(selectedRegistration.createdAt).toLocaleString()}</p>
                  <p><strong>Group:</strong> {selectedRegistration.stakeholderGroupId?.name}</p>
                </div>
              </div>

              {/* QR Code */}
              {selectedRegistration.qrCode && (
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <h4 className="font-bold text-gray-800 mb-2">QR Code</h4>
                  <img 
                    src={selectedRegistration.qrCode} 
                    alt="QR Code" 
                    className="w-48 h-48 mx-auto border-2 border-gray-300 rounded"
                  />
                </div>
              )}
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GlobalRegistrations;