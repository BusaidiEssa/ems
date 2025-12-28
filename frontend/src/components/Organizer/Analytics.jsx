import { useState, useEffect } from 'react';
import { Loader, TrendingUp, Users, CheckCircle, Clock } from 'lucide-react';
import { registrationsAPI, stakeholderGroupsAPI } from '../../utils/api';

function Analytics({ eventId }) {
  const [registrations, setRegistrations] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const totalRegistrations = registrations.length;
  const checkedIn = registrations.filter(r => r.checkedIn).length;
  const pending = totalRegistrations - checkedIn;
  const checkInRate = totalRegistrations > 0 ? ((checkedIn / totalRegistrations) * 100).toFixed(1) : 0;

  // Group registrations by stakeholder group
  const groupStats = groups.map(group => {
    const count = registrations.filter(r => r.stakeholderGroupId._id === group._id).length;
    const checkedInCount = registrations.filter(
      r => r.stakeholderGroupId._id === group._id && r.checkedIn
    ).length;
    return {
      name: group.name,
      total: count,
      checkedIn: checkedInCount,
      percentage: totalRegistrations > 0 ? ((count / totalRegistrations) * 100).toFixed(1) : 0
    };
  });

  // Registrations by date (last 7 days trend)
  const last7Days = [...Array(7)].map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const dailyRegistrations = last7Days.map(date => {
    const count = registrations.filter(r => 
      r.createdAt.split('T')[0] === date
    ).length;
    return { date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), count };
  });

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Analytics Dashboard</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-semibold">Total Registrations</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{totalRegistrations}</p>
            </div>
            <Users className="w-12 h-12 text-blue-500 opacity-80" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-semibold">Checked In</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{checkedIn}</p>
              <p className="text-green-600 text-xs mt-1">{checkInRate}% check-in rate</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-500 opacity-80" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-semibold">Pending Check-in</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{pending}</p>
            </div>
            <Clock className="w-12 h-12 text-yellow-500 opacity-80" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-semibold">Stakeholder Groups</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{groups.length}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-purple-500 opacity-80" />
          </div>
        </div>
      </div>

      {/* Registrations by Group */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Registrations by Group</h3>
        <div className="space-y-4">
          {groupStats.map((stat, index) => (
            <div key={index}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-700">{stat.name}</span>
                <span className="text-sm text-gray-600">
                  {stat.total} ({stat.percentage}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${stat.percentage}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Checked in: {stat.checkedIn}</span>
                <span>Pending: {stat.total - stat.checkedIn}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Registration Trend */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Registration Trend (Last 7 Days)</h3>
        <div className="flex items-end justify-between h-64 gap-2">
          {dailyRegistrations.map((day, index) => {
            const maxCount = Math.max(...dailyRegistrations.map(d => d.count), 1);
            const height = (day.count / maxCount) * 100;
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-blue-100 rounded-t-lg flex items-end justify-center relative group">
                  <div
                    className="w-full bg-blue-600 rounded-t-lg transition-all duration-300 hover:bg-blue-700 flex items-end justify-center"
                    style={{ height: `${Math.max(height, 5)}%` }}
                  >
                    <span className="text-white text-xs font-bold mb-1">{day.count}</span>
                  </div>
                  <div className="absolute -top-8 bg-gray-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    {day.count} registrations
                  </div>
                </div>
                <span className="text-xs text-gray-600 mt-2">{day.date}</span>
              </div>
            );
          })}
        </div>
      </div>

      {totalRegistrations === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow mt-8">
          <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">No registration data available yet</p>
        </div>
      )}
    </div>
  );
}

export default Analytics;