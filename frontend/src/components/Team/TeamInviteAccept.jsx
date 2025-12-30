// frontend/src/components/Team/TeamInviteAccept.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { teamAPI } from '../../utils/api';

function TeamInviteAccept() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    // Validate token exists
    if (!token) {
      setError('Invalid invitation link');
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [token]);

  const handleAccept = async () => {
    setAccepting(true);
    setError('');

    try {
      const response = await teamAPI.acceptInvite(token);
      setSuccess(true);
      
      // Redirect to event after 2 seconds
      setTimeout(() => {
        navigate(`/dashboard/event/${response.data.event._id}`);
      }, 2000);
    } catch (err) {
      console.error('Error accepting invitation:', err);
      setError(err.response?.data?.message || 'Failed to accept invitation. The link may have expired.');
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="bg-white p-8 rounded-lg shadow-2xl max-w-md w-full">
        {success ? (
          // Success State
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Invitation Accepted!
            </h1>
            <p className="text-gray-600">
              You've successfully joined the team. Redirecting to the event...
            </p>
          </div>
        ) : error ? (
          // Error State
          <div className="text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Invalid Invitation
            </h1>
            <p className="text-red-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          // Accept Invitation State
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-12 h-12 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Team Invitation
            </h1>
            <p className="text-gray-600 mb-6">
              You've been invited to join an event team. Click below to accept the invitation and start collaborating.
            </p>
            
            <button
              onClick={handleAccept}
              disabled={accepting}
              className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {accepting ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Accepting...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Accept Invitation
                </>
              )}
            </button>

            <button
              onClick={() => navigate('/dashboard')}
              className="w-full mt-3 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default TeamInviteAccept;