import { useState } from 'react';
import { Calendar, Users, Mail } from 'lucide-react';

function App() {
  const [count, setCount] = useState(0);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Test Card */}
        <div className="bg-white rounded-lg shadow-2xl p-8 mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Event Management System
          </h1>
          <p className="text-gray-600 mb-6">
            Testing Tailwind CSS and Icons
          </p>
          
          {/* Test Icons */}
          <div className="flex gap-4 mb-6">
            <Calendar className="w-8 h-8 text-blue-600" />
            <Users className="w-8 h-8 text-green-600" />
            <Mail className="w-8 h-8 text-purple-600" />
          </div>

          {/* Test Button */}
          <button
            onClick={() => setCount(count + 1)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition shadow-lg"
          >
            Clicked {count} times
          </button>
        </div>

        {/* Test Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <Calendar className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">Events</h3>
            <p className="text-gray-600">Manage your events</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <Users className="w-12 h-12 text-green-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">Participants</h3>
            <p className="text-gray-600">Track registrations</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <Mail className="w-12 h-12 text-purple-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">Emails</h3>
            <p className="text-gray-600">Send announcements</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;