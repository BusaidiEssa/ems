import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Award,
  Loader,
  Download,
  Filter
} from 'lucide-react';
import { eventsAPI, registrationsAPI } from '../../utils/api';

function GlobalAnalytics() {
  const [events, setEvents] = useState([]);
  const [allRegistrations, setAllRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('all'); // all, month, week

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const eventsResponse = await eventsAPI.getAll();
      const eventsData = eventsResponse.data.events;
      setEvents(eventsData);

      // Fetch registrations for all events
      const registrationsPromises = eventsData.map(event => 
        registrationsAPI.getByEvent(event._id)
          .then(res => res.data.registrations)
          .catch(() => [])
      );
      
      const allRegs = await Promise.all(registrationsPromises);
      setAllRegistrations(allRegs.flat());
    } catch (err) {
      console.error('Error fetching data:', err);
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

  // Calculate metrics
  const totalEvents = events.length;
  const totalRegistrations = allRegistrations.length;
  const totalCheckedIn = allRegistrations.filter(r => r.checkedIn).length;
  const checkInRate = totalRegistrations > 0 
    ? ((totalCheckedIn / totalRegistrations) * 100).toFixed(1) 
    : 0;

  // Upcoming events
  const now = new Date();
  const upcomingEvents = events.filter(e => new Date(e.date) >= now).length;
  const pastEvents = events.filter(e => new Date(e.date) < now).length;

  // Events by month (last 6 months)
  const last6Months = [...Array(6)].map((_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    return {
      month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      events: events.filter(e => {
        const eventDate = new Date(e.date);
        return eventDate.getMonth() === date.getMonth() && 
               eventDate.getFullYear() === date.getFullYear();
      }).length,
      registrations: allRegistrations.filter(r => {
        const regDate = new Date(r.createdAt);
        return regDate.getMonth() === date.getMonth() && 
               regDate.getFullYear() === date.getFullYear();
      }).length
    };
  });

  // Top performing events
  const eventsWithStats = events.map(event => {
    const eventRegs = allRegistrations.filter(r => r.eventId === event._id);
    const eventCheckedIn = eventRegs.filter(r => r.checkedIn).length;
    return {
      ...event,
      registrations: eventRegs.length,
      checkedIn: eventCheckedIn,
      checkInRate: eventRegs.length > 0 
        ? ((eventCheckedIn / eventRegs.length) * 100).toFixed(1)
        : 0
    };
  }).sort((a, b) => b.registrations - a.registrations);

  const topEvents = eventsWithStats.slice(0, 5);

  // Registrations trend (last 30 days)
  const last30Days = [...Array(30)].map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const dateStr = date.toISOString().split('T')[0];
    const count = allRegistrations.filter(r => 
      r.createdAt.split('T')[0] === dateStr
    ).length;
    return {
      date: date.getDate(),
      count
    };
  });

  const exportData = () => {
    const csv = [
      ['Event', 'Date', 'Location', 'Registrations', 'Checked In', 'Check-in Rate'],
      ...eventsWithStats.map(e => [
        e.title,
        new Date(e.date).toLocaleDateString(),
        e.location,
        e.registrations,
        e.checkedIn,
        e.checkInRate + '%'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Global Analytics</h1>
          <p className="text-gray-600 mt-1">Overview of all your events and registrations</p>
        </div>
        <div className="flex gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Time</option>
            <option value="month">Last Month</option>
            <option value="week">Last Week</option>
          </select>
          <button
            onClick={exportData}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            <Download className="w-5 h-5" />
            Export
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-semibold">Total Events</p>
              <p className="text-4xl font-bold mt-2">{totalEvents}</p>
              <p className="text-blue-100 text-xs mt-2">
                {upcomingEvents} upcoming • {pastEvents} past
              </p>
            </div>
            <Calendar className="w-12 h-12 text-blue-200 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-semibold">Total Registrations</p>
              <p className="text-4xl font-bold mt-2">{totalRegistrations}</p>
              <p className="text-purple-100 text-xs mt-2">
                Across all events
              </p>
            </div>
            <Users className="w-12 h-12 text-purple-200 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-semibold">Total Checked In</p>
              <p className="text-4xl font-bold mt-2">{totalCheckedIn}</p>
              <p className="text-green-100 text-xs mt-2">
                {checkInRate}% check-in rate
              </p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-200 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-semibold">Pending Check-in</p>
              <p className="text-4xl font-bold mt-2">{totalRegistrations - totalCheckedIn}</p>
              <p className="text-orange-100 text-xs mt-2">
                Awaiting check-in
              </p>
            </div>
            <Clock className="w-12 h-12 text-orange-200 opacity-80" />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Events & Registrations Trend */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-4">6-Month Trend</h3>
          <div className="flex items-end justify-between h-64 gap-2">
            {last6Months.map((month, index) => {
              const maxValue = Math.max(...last6Months.map(m => Math.max(m.events, m.registrations)), 1);
              const eventsHeight = (month.events / maxValue) * 100;
              const regsHeight = (month.registrations / maxValue) * 100;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex gap-1 items-end h-48">
                    <div 
                      className="flex-1 bg-blue-500 rounded-t hover:bg-blue-600 transition relative group"
                      style={{ height: `${Math.max(eventsHeight, 5)}%` }}
                    >
                      <span className="text-white text-xs font-bold absolute -top-6 left-1/2 transform -translate-x-1/2">
                        {month.events}
                      </span>
                      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                        {month.events} events
                      </div>
                    </div>
                    <div 
                      className="flex-1 bg-purple-500 rounded-t hover:bg-purple-600 transition relative group"
                      style={{ height: `${Math.max(regsHeight, 5)}%` }}
                    >
                      <span className="text-white text-xs font-bold absolute -top-6 left-1/2 transform -translate-x-1/2">
                        {month.registrations}
                      </span>
                      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                        {month.registrations} regs
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-600 font-medium">{month.month}</span>
                </div>
              );
            })}
          </div>
          <div className="flex justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-gray-600">Events</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded"></div>
              <span className="text-gray-600">Registrations</span>
            </div>
          </div>
        </div>

        {/* Registrations Daily Trend */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Daily Registrations (30 Days)</h3>
          <div className="flex items-end justify-between h-64 gap-1">
            {last30Days.map((day, index) => {
              const maxCount = Math.max(...last30Days.map(d => d.count), 1);
              const height = (day.count / maxCount) * 100;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t hover:from-green-600 hover:to-green-500 transition relative group"
                    style={{ height: `${Math.max(height, 3)}%` }}
                  >
                    {day.count > 0 && (
                      <>
                        <span className="text-white text-xs font-bold absolute -top-5 left-1/2 transform -translate-x-1/2">
                          {day.count}
                        </span>
                        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                          Day {day.date}: {day.count}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-center mt-4 text-sm text-gray-600">
            Last 30 days • Average: {(last30Days.reduce((sum, d) => sum + d.count, 0) / 30).toFixed(1)} per day
          </div>
        </div>
      </div>

      {/* Top Performing Events */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-6 h-6 text-yellow-500" />
          <h3 className="text-xl font-bold text-gray-800">Top Performing Events</h3>
        </div>
        
        {topEvents.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No events yet</p>
        ) : (
          <div className="space-y-4">
            {topEvents.map((event, index) => (
              <div key={event._id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <div className={`text-2xl font-bold ${
                  index === 0 ? 'text-yellow-500' :
                  index === 1 ? 'text-gray-400' :
                  index === 2 ? 'text-orange-600' :
                  'text-gray-400'
                }`}>
                  #{index + 1}
                </div>
                
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800">{event.title}</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(event.date).toLocaleDateString()} • {event.location}
                  </p>
                </div>

                <div className="flex gap-6 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{event.registrations}</div>
                    <div className="text-xs text-gray-500">Registrations</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{event.checkedIn}</div>
                    <div className="text-xs text-gray-500">Checked In</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{event.checkInRate}%</div>
                    <div className="text-xs text-gray-500">Rate</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default GlobalAnalytics;