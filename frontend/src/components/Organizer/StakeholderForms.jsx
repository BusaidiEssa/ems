import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Copy, Check } from 'lucide-react';
import { stakeholderGroupsAPI } from '../../utils/api';

function StakeholderForms({ eventId }) {
  const [groups, setGroups] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [groupName, setGroupName] = useState('');
  const [fields, setFields] = useState([
    { id: Date.now(), name: 'Name', type: 'text', required: true },
    { id: Date.now() + 1, name: 'Email', type: 'email', required: true }
  ]);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

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

  const handleSaveGroup = async (e) => {
    e.preventDefault();
    setError('');

    if (!groupName.trim()) {
      setError('Group name is required');
      return;
    }

    if (fields.some(f => !f.name.trim())) {
      setError('All fields must have a name');
      return;
    }

    try {
      const groupData = { eventId, name: groupName, fields };

      if (editingGroup) {
        const response = await stakeholderGroupsAPI.update(editingGroup._id, groupData);
        setGroups(groups.map(g => g._id === editingGroup._id ? response.data.group : g));
      } else {
        const response = await stakeholderGroupsAPI.create(groupData);
        setGroups([...groups, response.data.group]);
      }

      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save group');
    }
  };

  const resetForm = () => {
    setShowCreateForm(false);
    setEditingGroup(null);
    setGroupName('');
    setFields([
      { id: Date.now(), name: 'Name', type: 'text', required: true },
      { id: Date.now() + 1, name: 'Email', type: 'email', required: true }
    ]);
    setError('');
  };

  const handleEdit = (group) => {
    setEditingGroup(group);
    setGroupName(group.name);
    setFields(group.fields.map(f => ({ ...f, id: f._id || Date.now() + Math.random() })));
    setShowCreateForm(true);
  };

  const handleDelete = async (groupId) => {
    if (!window.confirm('Delete this stakeholder group? All registrations will be affected.')) {
      return;
    }

    try {
      await stakeholderGroupsAPI.delete(groupId);
      setGroups(groups.filter(g => g._id !== groupId));
    } catch (err) {
      alert('Failed to delete group');
    }
  };

  const addField = () => {
    setFields([...fields, { id: Date.now(), name: '', type: 'text', required: false }]);
  };

  const updateField = (id, key, value) => {
    setFields(fields.map(f => f.id === id ? { ...f, [key]: value } : f));
  };

  const removeField = (id) => {
    if (fields.length <= 2) {
      alert('You must have at least 2 fields (Name and Email)');
      return;
    }
    setFields(fields.filter(f => f.id !== id));
  };

  const copyRegistrationLink = () => {
    const link = `${window.location.origin}/register/${eventId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Stakeholder Groups</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          Create Form
        </button>
      </div>

      {groups.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <p className="font-semibold mb-2 text-gray-700">Public Registration Link:</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={`${window.location.origin}/register/${eventId}`}
              readOnly
              className="flex-1 px-3 py-2 bg-white border border-blue-200 rounded text-sm"
            />
            <button
              onClick={copyRegistrationLink}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6 border border-gray-200">
          <h3 className="text-xl font-bold mb-4 text-gray-800">
            {editingGroup ? 'Edit' : 'Create'} Stakeholder Group
          </h3>

          <form onSubmit={handleSaveGroup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Group Name *
              </label>
              <input
                type="text"
                placeholder="e.g., Attendee, Presenter, Vendor, Volunteer"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Form Fields
              </label>
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 items-center bg-gray-50 p-3 rounded-lg">
                    <input
                      type="text"
                      placeholder="Field Name"
                      value={field.name}
                      onChange={(e) => updateField(field.id, 'name', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded"
                      required
                    />
                    <select
                      value={field.type}
                      onChange={(e) => updateField(field.id, 'type', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded"
                    >
                      <option value="text">Text</option>
                      <option value="email">Email</option>
                      <option value="number">Number</option>
                      <option value="tel">Phone</option>
                      <option value="textarea">Textarea</option>
                      <option value="date">Date</option>
                    </select>
                    <label className="flex items-center gap-1 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => updateField(field.id, 'required', e.target.checked)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Required</span>
                    </label>
                    {index > 1 && (
                      <button
                        type="button"
                        onClick={() => removeField(field.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addField}
                className="mt-3 flex items-center gap-2 text-blue-600 hover:bg-blue-50 px-3 py-2 rounded transition"
              >
                <Plus className="w-4 h-4" />
                Add Field
              </button>
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
              >
                {editingGroup ? 'Update' : 'Create'} Group
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map((group) => (
          <div key={group._id} className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-800">{group.name}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(group)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(group._id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600 font-semibold">Fields:</p>
              {group.fields.map((field, idx) => (
                <div key={idx} className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded">
                  • {field.name} <span className="text-gray-400">({field.type})</span>
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {groups.length === 0 && !showCreateForm && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="text-gray-400 mb-4">
            <Plus className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No Stakeholder Groups Yet
          </h3>
          <p className="text-gray-500 mb-4">
            Create forms for different types of participants
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Create First Form
          </button>
        </div>
      )}
    </div>
  );
}

export default StakeholderForms;