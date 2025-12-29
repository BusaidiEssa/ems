import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Copy, Check } from 'lucide-react';
import { stakeholderGroupsAPI } from '../../utils/api';

function StakeholderForms({ eventId }) {
  const [groups, setGroups] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [groupName, setGroupName] = useState('');
  const [fields, setFields] = useState([
    { id: Date.now(), name: 'Name', type: 'text', required: true, options: [] },
    { id: Date.now() + 1, name: 'Email', type: 'email', required: true, options: [] }
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
      console.error('Error:', err);
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

    //  checkbox also requires options
    const fieldsNeedingOptions = fields.filter(f =>
      (f.type === 'select' || f.type === 'radio' || f.type === 'checkbox') &&
      (!f.options || f.options.length === 0)
    );

    if (fieldsNeedingOptions.length > 0) {
      setError('Dropdown, Radio and Checkbox fields must have at least one option');
      return;
    }

    try {
      const groupData = { eventId, name: groupName, fields };

      if (editingGroup) {
        const response = await stakeholderGroupsAPI.update(editingGroup._id, groupData);
        setGroups(groups.map(g =>
          g._id === editingGroup._id ? response.data.group : g
        ));
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
      { id: Date.now(), name: 'Name', type: 'text', required: true, options: [] },
      { id: Date.now() + 1, name: 'Email', type: 'email', required: true, options: [] }
    ]);
    setError('');
  };

  const handleEdit = (group) => {
    setEditingGroup(group);
    setGroupName(group.name);
    setFields(group.fields.map(f => ({
      ...f,
      id: f._id || Date.now() + Math.random(),
      options: f.options || []
    })));
    setShowCreateForm(true);
  };

  const handleDelete = async (groupId) => {
    if (!window.confirm('Delete this group?')) return;
    try {
      await stakeholderGroupsAPI.delete(groupId);
      setGroups(groups.filter(g => g._id !== groupId));
    } catch {
      alert('Failed to delete');
    }
  };

  const addField = () => {
    setFields([...fields, {
      id: Date.now(),
      name: '',
      type: 'text',
      required: false,
      options: []
    }]);
  };

  const updateField = (id, key, value) => {
    setFields(fields.map(f => f.id === id ? { ...f, [key]: value } : f));
  };

  const removeField = (id) => {
    if (fields.length <= 2) {
      alert('Must have at least 2 fields');
      return;
    }
    setFields(fields.filter(f => f.id !== id));
  };

  const addOption = (fieldId) => {
    setFields(fields.map(f =>
      f.id === fieldId
        ? { ...f, options: [...(f.options || []), ''] }
        : f
    ));
  };

  const updateOption = (fieldId, optionIndex, value) => {
    setFields(fields.map(f => {
      if (f.id === fieldId) {
        const newOptions = [...(f.options || [])];
        newOptions[optionIndex] = value;
        return { ...f, options: newOptions };
      }
      return f;
    }));
  };

  const removeOption = (fieldId, optionIndex) => {
    setFields(fields.map(f =>
      f.id === fieldId
        ? { ...f, options: (f.options || []).filter((_, i) => i !== optionIndex) }
        : f
    ));
  };

  const copyLink = () => {
    const link = `${window.location.origin}/register/${eventId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Stakeholder Groups</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Create Form
        </button>
      </div>

      {groups.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <p className="font-semibold mb-2">Public Registration Link:</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={`${window.location.origin}/register/${eventId}`}
              readOnly
              className="flex-1 px-3 py-2 bg-white border rounded"
            />
            <button
              onClick={copyLink}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}

      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <h3 className="text-xl font-bold mb-4">
            {editingGroup ? 'Edit' : 'Create'} Stakeholder Group
          </h3>

          <form onSubmit={handleSaveGroup} className="space-y-4">
            <div>
              <label className="block font-semibold mb-2">Group Name *</label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block font-semibold mb-2">Form Fields</label>
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="border border-gray-200 p-4 rounded-lg bg-gray-50">
                    <div className="flex gap-2 items-start mb-3">
                      <input
                        type="text"
                        placeholder="Field Name"
                        value={field.name}
                        onChange={(e) => updateField(field.id, 'name', e.target.value)}
                        className="flex-1 px-3 py-2 border rounded"
                        required
                      />
                      <select
                        value={field.type}
                        onChange={(e) => {
                          updateField(field.id, 'type', e.target.value);
                          //  checkbox initializes options
                          if (
                            (e.target.value === 'select' ||
                             e.target.value === 'radio' ||
                             e.target.value === 'checkbox') &&
                            !field.options?.length
                          ) {
                            updateField(field.id, 'options', ['Option 1']);
                          }
                        }}
                        className="px-3 py-2 border rounded"
                      >
                        <option value="text">Text</option>
                        <option value="email">Email</option>
                        <option value="number">Number</option>
                        <option value="tel">Phone</option>
                        <option value="date">Date</option>
                        <option value="time">Time</option>
                        <option value="textarea">Textarea</option>
                        <option value="select">Dropdown</option>
                        <option value="radio">Radio Buttons</option>
                        <option value="checkbox">Checkbox</option>
                      </select>
                      <label className="flex items-center gap-1 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) => updateField(field.id, 'required', e.target.checked)}
                        />
                        Required
                      </label>
                      {index > 1 && (
                        <button
                          type="button"
                          onClick={() => removeField(field.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/*  options shown for checkbox */}
                    {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && (
                      <div className="ml-4 mt-3 space-y-2">
                        <p className="text-sm font-semibold text-gray-700">Options:</p>
                        {(field.options || []).map((option, optIndex) => (
                          <div key={optIndex} className="flex gap-2">
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => updateOption(field.id, optIndex, e.target.value)}
                              className="flex-1 px-3 py-2 border rounded text-sm"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => removeOption(field.id, optIndex)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addOption(field.id)}
                          className="text-sm text-blue-600 hover:bg-blue-50 px-3 py-1 rounded"
                        >
                          + Add Option
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addField}
                className="mt-3 flex items-center gap-2 text-blue-600 hover:bg-blue-50 px-3 py-2 rounded"
              >
                <Plus className="w-4 h-4" />
                Add Field
              </button>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                {editingGroup ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 px-6 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {groups.map(group => (
          <div key={group._id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">{group.name}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(group)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(group._id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="space-y-2">
              {group.fields.map((field, idx) => (
                <div key={idx} className="text-sm text-gray-600">
                  • {field.name} ({field.type})
                  {field.required && <span className="text-red-500">*</span>}
                  {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && field.options && (
                    <span className="text-xs text-gray-400 ml-2">
                      [{field.options.join(', ')}]
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StakeholderForms;
