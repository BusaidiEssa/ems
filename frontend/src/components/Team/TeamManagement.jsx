import { useState, useEffect } from 'react';
import { Users, Mail, Shield, Trash2, UserPlus, Loader } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { teamAPI } from '../../utils/api';

function TeamManagement({ eventId }) {
  const { t } = useTranslation();
  const [teamMembers, setTeamMembers] = useState([]);
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteData, setInviteData] = useState({ email: '', role: 'viewer' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTeam();
  }, [eventId]);

  const fetchTeam = async () => {
    try {
      const response = await teamAPI.getTeamMembers(eventId);
      setTeamMembers(response.data.teamMembers);
      setPendingInvitations(response.data.pendingInvitations);
    } catch (err) {
      console.error('Error fetching team:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      await teamAPI.inviteMember(eventId, inviteData);
      setShowInviteForm(false);
      setInviteData({ email: '', role: 'viewer' });
      fetchTeam();
    } catch (err) {
      console.error('Error inviting member:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!confirm('Remove this team member?')) return;
    
    try {
      await teamAPI.removeMember(eventId, userId);
      fetchTeam();
    } catch (err) {
      console.error('Error removing member:', err);
    }
  };

  if (loading) return <div className="p-8"><Loader className="w-8 h-8 animate-spin" /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{t('team.title')}</h2>
        <button
          onClick={() => setShowInviteForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <UserPlus className="w-5 h-5" />
          {t('team.addMember')}
        </button>
      </div>

      {/* Invite Form */}
      {showInviteForm && (
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <h3 className="text-lg font-bold mb-4">{t('team.inviteEmail')}</h3>
          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.email')}
              </label>
              <input
                type="email"
                value={inviteData.email}
                onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('team.role')}
              </label>
              <select
                value={inviteData.role}
                onChange={(e) => setInviteData({ ...inviteData, role: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="viewer">{t('team.viewer')} - {t('team.canView')}</option>
                <option value="editor">{t('team.editor')} - {t('team.canEdit')}</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {submitting ? t('common.loading') : t('team.invite')}
              </button>
              <button
                type="button"
                onClick={() => setShowInviteForm(false)}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
              >
                {t('common.cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Team Members */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
        <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <h3 className="text-lg font-bold">{t('team.members')} ({teamMembers.length})</h3>
        </div>
        
        <div className="divide-y">
          {teamMembers.map((member) => (
            <div key={member._id} className="p-4 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{member.userId.name}</p>
                  <p className="text-sm text-gray-600">{member.userId.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  member.role === 'owner' ? 'bg-purple-100 text-purple-700' :
                  member.role === 'editor' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {member.role}
                </span>
                
                {member.role !== 'owner' && (
                  <button
                    onClick={() => handleRemoveMember(member.userId._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Invitations */}
      {pendingInvitations.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 bg-yellow-50 border-b">
            <h3 className="text-lg font-bold text-gray-800">{t('team.pending')} ({pendingInvitations.length})</h3>
          </div>
          
          <div className="divide-y">
            {pendingInvitations.map((invite) => (
              <div key={invite._id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-semibold text-gray-800">{invite.email}</p>
                    <p className="text-sm text-gray-600">Invited {new Date(invite.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
                  {invite.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {teamMembers.length === 0 && !showInviteForm && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">{t('team.noMembers')}</p>
          <p className="text-sm text-gray-400 mt-2">{t('team.inviteFirst')}</p>
        </div>
      )}
    </div>
  );
}

export default TeamManagement;