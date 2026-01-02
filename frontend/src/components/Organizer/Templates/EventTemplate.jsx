import { useState, useEffect } from 'react';
import { FileText, Plus, Trash2, CheckCircle, Loader } from 'lucide-react';
import { templatesAPI } from '../../../utils/api';

function EventTemplates({ eventId, onApplyTemplate }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await templatesAPI.getAll();
      setTemplates(response.data.templates || []);
    } catch (err) {
      console.error('Error fetching templates:', err);
      setError('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      await templatesAPI.create({ name: templateName, eventId });
      setShowSaveForm(false);
      setTemplateName('');
      fetchTemplates();
    } catch (err) {
      console.error('Error saving template:', err);
      setError(err.response?.data?.message || 'Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const handleApplyTemplate = async (templateId) => {
    if (!window.confirm('Apply this template? This will replace current settings.')) return;

    try {
      await templatesAPI.apply(templateId, eventId);
      alert('Template applied successfully!');
      if (onApplyTemplate) onApplyTemplate();
    } catch (err) {
      console.error('Error applying template:', err);
      alert('Failed to apply template');
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (!window.confirm('Delete this template?')) return;

    try {
      await templatesAPI.delete(templateId);
      fetchTemplates();
    } catch (err) {
      console.error('Error deleting template:', err);
      alert('Failed to delete template');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Event Templates</h2>
          <p className="text-sm text-gray-600 mt-1">
            Save your current event setup as a template or apply existing templates
          </p>
        </div>
        {eventId && (
          <button
            onClick={() => setShowSaveForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            Save as Template
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Save Template Form */}
      {showSaveForm && (
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6 border-2 border-blue-200">
          <h3 className="text-lg font-bold mb-4">Save Current Event as Template</h3>
          <form onSubmit={handleSaveTemplate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template Name *
              </label>
              <input
                type="text"
                placeholder="e.g., Annual Conference Template"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                This will save all stakeholder forms, capacity settings, and configurations
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
              >
                {saving ? 'Saving...' : 'Save Template'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSaveForm(false);
                  setTemplateName('');
                  setError('');
                }}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Templates Grid */}
      {templates.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500 text-lg mb-2">No templates yet</p>
          <p className="text-sm text-gray-400">
            Save your current event setup as a template to reuse it later
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div
              key={template._id}
              className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition border border-gray-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-800 truncate">
                      {template.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Used {template.usageCount || 0} times
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Stakeholder Groups:</span>
                  <span className="font-semibold text-gray-800">
                    {template.templateData?.stakeholderGroups?.length || 0}
                  </span>
                </div>
                {template.templateData?.capacity && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Capacity:</span>
                    <span className="font-semibold text-gray-800">
                      {template.templateData.capacity}
                    </span>
                  </div>
                )}
                <div className="text-xs text-gray-400 pt-2 border-t border-gray-100">
                  Created {new Date(template.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="flex gap-2">
                {eventId && (
                  <button
                    onClick={() => handleApplyTemplate(template._id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Apply
                  </button>
                )}
                <button
                  onClick={() => handleDeleteTemplate(template._id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Delete template"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default EventTemplates;