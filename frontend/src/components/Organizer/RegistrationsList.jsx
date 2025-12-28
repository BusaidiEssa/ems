import { useState, useEffect } from 'react';
import { Loader, Eye } from 'lucide-react';
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
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRegistrations = selectedGroup === 'all'
    ? registrations
    : registrations.filter(r => r.stakeholderGroupId._id === selectedGroup);

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
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Groups</option>
          {groups.map(group => (
            <option key={group._id} value={group._id}>{group.name}</option>
          ))}
        </select>
      </div>

      {filteredRegistrations.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">No registrations yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Group</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredRegistrations.map(reg => {
                const nameValue = reg.formData?.Name || reg.formData?.name || 'N/A';
                const emailValue = reg.formData?.Email || reg.formData?.email || 'N/A';

                return (
                  <tr key={reg._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{nameValue}</td>
                    <td className="px-6 py-4">{emailValue}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {reg.stakeholderGroupId.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        reg.checkedIn ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {reg.checkedIn ? '✓ Checked In' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(reg.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default RegistrationsList;