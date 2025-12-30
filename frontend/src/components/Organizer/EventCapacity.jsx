import { useState } from 'react';
import { Users, AlertCircle, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function EventCapacity({ event, currentRegistrations, onUpdate }) {
  const { t } = useTranslation();
  const [capacity, setCapacity] = useState(event.capacity || '');
  const [waitlistEnabled, setWaitlistEnabled] = useState(event.waitlistEnabled || false);
  const [registrationDeadline, setRegistrationDeadline] = useState(
    event.registrationDeadline ? new Date(event.registrationDeadline).toISOString().split('T')[0] : ''
  );

  const availableSpots = capacity ? capacity - currentRegistrations : null;
  const isFull = capacity && currentRegistrations >= capacity;
  const fillPercentage = capacity ? (currentRegistrations / capacity) * 100 : 0;

  const handleSave = () => {
    onUpdate({
      capacity: capacity || null,
      waitlistEnabled,
      registrationDeadline: registrationDeadline || null
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Users className="w-6 h-6" />
        {t('events.capacity')}
      </h3>

      {/* Current Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">{t('registrations.title')}</span>
          <span className="text-2xl font-bold text-blue-600">
            {currentRegistrations} {capacity && `/ ${capacity}`}
          </span>
        </div>
        
        {capacity && (
          <>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <div
                className={`h-3 rounded-full transition-all ${
                  fillPercentage >= 100 ? 'bg-red-600' : fillPercentage >= 80 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(fillPercentage, 100)}%` }}
              ></div>
            </div>
            
            {isFull ? (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>Event is at full capacity</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <CheckCircle className="w-4 h-4" />
                <span>{availableSpots} spots available</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Settings */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('events.capacity')}
          </label>
          <input
            type="number"
            min="0"
            placeholder={t('events.unlimited')}
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Leave empty for unlimited capacity
          </p>
        </div>

        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={waitlistEnabled}
              onChange={(e) => setWaitlistEnabled(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium text-gray-700">
              Enable Waitlist (when full)
            </span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('events.registrationDeadline')}
          </label>
          <input
            type="date"
            value={registrationDeadline}
            onChange={(e) => setRegistrationDeadline(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
        >
          {t('common.save')}
        </button>
      </div>
    </div>
  );
}

export default EventCapacity;