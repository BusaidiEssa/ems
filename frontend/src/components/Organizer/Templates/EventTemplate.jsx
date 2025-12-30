import { useState, useEffect } from 'react';
import { FileText, Plus, Trash2, CheckCircle, Loader } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { templatesAPI } from '../../utils/api';

function EventTemplates({ eventId, onApplyTemplate }) {
  const { t } = useTranslation();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await templatesAPI.getAll();
      setTemplates(response.data.templates);
    } catch (err) {
      console.error('Error fetching templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await templatesAPI.create({ name: templateName, eventId });
      setShowSaveForm(false);
      setTemplateName('');
      fetchTemplates();
    } catch (err) {
      console.error('Error saving template:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleApplyTemplate = async (templateId) => {
    if (!confirm(t('templates.confirmApply'))) return;

    try {
      await templatesAPI.apply(templateId, eventId);
      alert(t('templates.appliedSuccess'));
      if (onApplyTemplate) onApplyTemplate();
    } catch (err) {
      console.error('Error applying template:', err);
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (!confirm(t('templates.delete') + '?')) return;

    try {
      await templatesAPI.delete(templateId);
      fetchTemplates();
    } catch (err) {
      console.error('Error deleting template:', err);
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
        <h2 className="text-2xl font-bold text-gray-800">{t('templates.title')}</h2>
        {eventId && (
          <button
            onClick={() => setShowSaveForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            {t('templates.saveAsTemplate')}
          </button>
        )}
      </div>

      {/* Save Template Form */}
      {showSaveForm && (
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <h3 className="text-lg font-bold mb-4">{t('templates.saveAsTemplate')}</h3>
          <form onSubmit={handleSaveTemplate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('templates.templateName')}
              </label>
              <input
                type="text"
                placeholder="e.g., Annual Conference Template"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? t('common.loading') : t('templates.save')}
              </button>
              <button
                type="button"
                onClick={() => setShowSaveForm(false)}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
              >
                {t('common.cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div
            key={template._id}
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{template.name}</h3>
                  <p className="text-xs text-gray-500">
                    {t('common.used')} {template.usageCount} {t('common.times')}
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600">
                <strong>Groups:</strong> {template.templateData.stakeholderGroups?.length || 0}
              </p>
              {template.templateData.capacity && (
                <p className="text-sm text-gray-600">
                  <strong>Capacity:</strong> {template.templateData.capacity}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              {eventId && (
                <button
                  onClick={() => handleApplyTemplate(template._id)}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4" />
                  {t('templates.useTemplate')}
                </button>
              )}
              <button
                onClick={() => handleDeleteTemplate(template._id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">{t('templates.noTemplates')}</p>
          <p className="text-sm text-gray-400 mt-2">{t('templates.createFirst')}</p>
        </div>
      )}
    </div>
  );
}

export default EventTemplates;  