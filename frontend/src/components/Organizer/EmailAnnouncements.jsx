import { useState, useEffect } from 'react';
import { Mail, Send, Loader } from 'lucide-react';
import { stakeholderGroupsAPI, emailsAPI } from '../../utils/api';

function EmailAnnouncements({ eventId }) {
  const [groups, setGroups] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchGroups();
  }, [eventId]);

  const fetchGroups = async () => {
    try {
      const response = await stakeholderGroupsAPI.getByEvent(eventId);
      setGroups(response.data.groups);
    } catch (err) {
      console.error('Error fetching groups:', err);
    }
  };

  const toggleGroup = (groupId) => {
    setSelectedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (selectedGroups.length === 0) {
      setError('Please select at least one stakeholder group');
      return;
    }

    if (!subject.trim() || !message.trim()) {
      setError('Subject and message are required');
      return;
    }

    setLoading(true);

    try {
      const response = await emailsAPI.send({
        eventId,
        groupIds: selectedGroups,
        subject,
        message
      });

      setSuccess(`Email sent successfully to ${response.data.emailsSent} recipient(s)!`);
      setSubject('');
      setMessage('');
      setSelectedGroups([]);

      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Send Email Announcement</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
          <Mail className="w-5 h-5" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center gap-2">
          <Mail className="w-5 h-5" />
          {success}
        </div>
      )}

      <form onSubmit={handleSend} className="bg-white p-6 rounded-lg shadow-lg">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Stakeholder Groups *
          </label>
          {groups.length === 0 ? (
            <p className="text-gray-500 text-sm">
              No stakeholder groups available. Create forms first.
            </p>
          ) : (
            <div className="space-y-2">
              {groups.map((group) => (
                <label
                  key={group._id}
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition"
                >
                  <input
                    type="checkbox"
                    checked={selectedGroups.includes(group._id)}
                    onChange={() => toggleGroup(group._id)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="font-medium text-gray-800">{group.name}</span>
                  <span className="text-sm text-gray-500">
                    ({group.fields.length} fields)
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Subject *
          </label>
          <input
            type="text"
            placeholder="Important Event Update"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message *
          </label>
          <textarea
            placeholder="Write your announcement here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            rows="8"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            This message will be sent to all registrants in the selected groups
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || groups.length === 0}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Send Email
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default EmailAnnouncements;