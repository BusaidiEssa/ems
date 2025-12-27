import { useState, useEffect } from 'react';
import { Loader, CheckCircle, XCircle } from 'lucide-react';
import { registrationsAPI, stakeholderGroupsAPI } from '../../utils/api';

function RegistrationsList({ eventId }) {
  const [registrations, setRegistrations] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState('all');

  useEffect(() => {
    fetchData();
  }, [eventId]);

  const fetchData = async () => {
    try {
      const [regsResponse, groupsResponse] = await Promise.all([
        registrationsAPI.getByEvent(eventId),
        stakeholderGroupsAPI.getByEvent(eventId)
      ]);
      
      setRegistrations(regsResponse.data.registrations);
      setGroups(groupsResponse.data.groups);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleCheckIn = async (regId) => {
    try {
      const response = await registrationsAPI.toggleCheckIn(regId);
      setRegistrations(registrations.map(reg => 
        reg._id === regId ? response.data.registration : reg
      ));
    } catch (err) {
      alert('Failed to update check-in status');
    }
  };

  const filteredRegistrations = selectedGroup === 'all'
    ? registrations
    : registrations.filter(reg => reg.stakeholderGroupId._id === selectedGroup);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Registrations ({filteredRegistrations.length})
        </h2>
        <select
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Groups</option>
          {groups.map((group) => (
            <option key={group._id} value={group._id}>
              {group.name}
            </option>
          ))}
        </select>
      </div>

      {filteredRegistrations.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">No registrations yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Group
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    QR Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check-In
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registered
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRegistrations.map((reg) => {
                  const nameValue = reg.formData?.Name || reg.formData?.name || 'N/A';
                  const emailValue = reg.formData?.Email || reg.formData.email || 'N/A';

                  return (
                    <tr key={reg._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {nameValue}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {emailValue}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {reg.stakeholderGroupId.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <img 
                          src={reg.qrCode} 
                          alt="QR Code" 
                          className="w-12 h-12 cursor-pointer hover:scale-150 transition-transform"
                          title="Click to enlarge"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleCheckIn(reg._id)}
                          className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold transition ${
                            reg.checkedIn
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }`}
                        >
                          {reg.checkedIn ? (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              Checked In
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4" />
                              Not Checked In
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(reg.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredRegistrations.length > 0 && (
        <div className="mt-4 flex gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Checked In: {registrations.filter(r => r.checkedIn).length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            <span>Pending: {registrations.filter(r => !r.checkedIn).length}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default RegistrationsList;