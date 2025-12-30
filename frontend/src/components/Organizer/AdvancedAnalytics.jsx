import { useState, useEffect } from 'react';
import { TrendingUp, Users, CheckCircle, Clock, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { analyticsAPI } from '../../utils/api';

function AdvancedAnalytics({ eventId }) {
  const { t } = useTranslation();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [eventId]);

  const fetchAnalytics = async () => {
    try {
      const response = await analyticsAPI.getEventAnalytics(eventId);
      setAnalytics(response.data.analytics);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Loading analytics...</div>;
  if (!analytics) return <div className="p-8">No data available</div>;

  const { summary, registrationsByGroup, dailyTrend, peakRegistrationHour, averageCheckInTime } = analytics;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{t('analytics.title')}</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          <Download className="w-5 h-5" />
          {t('analytics.export')}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-semibold">{t('analytics.totalRegistrations')}</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{summary.totalRegistrations}</p>
            </div>
            <Users className="w-12 h-12 text-blue-500 opacity-80" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-semibold">{t('analytics.checkedIn')}</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{summary.checkedIn}</p>
              <p className="text-green-600 text-xs mt-1">{summary.checkInRate}% {t('analytics.checkInRate')}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-500 opacity-80" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-semibold">{t('analytics.pendingCheckIn')}</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{summary.pending}</p>
            </div>
            <Clock className="w-12 h-12 text-yellow-500 opacity-80" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-semibold">{t('analytics.peakRegistrationTime')}</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{peakRegistrationHour}:00</p>
              <p className="text-purple-600 text-xs mt-1">{averageCheckInTime} min avg</p>
            </div>
            <TrendingUp className="w-12 h-12 text-purple-500 opacity-80" />
          </div>
        </div>
      </div>

      {/* Registrations by Group */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4">{t('analytics.registrationsByGroup')}</h3>
        <div className="space-y-4">
          {registrationsByGroup.map((group, index) => (
            <div key={index}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-700">{group.groupName}</span>
                <span className="text-sm text-gray-600">
                  {group.total} ({group.percentage}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${group.percentage}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Checked in: {group.checkedIn}</span>
                <span>Pending: {group.total - group.checkedIn}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Trend Chart */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-4">{t('analytics.registrationTrend')}</h3>
        <div className="flex items-end justify-between h-64 gap-2">
          {dailyTrend.map((day, index) => {
            const maxCount = Math.max(...dailyTrend.map(d => d.count), 1);
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
    </div>
  );
}

export default AdvancedAnalytics;
