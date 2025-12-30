import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-4 py-2 bg-white text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-200 transition shadow-sm"
      title={i18n.language === 'en' ? 'Switch to Arabic' : 'التبديل إلى الإنجليزية'}
    >
      <Globe className="w-4 h-4" />
      <span className="font-medium">
        {i18n.language === 'en' ? 'عربي' : 'English'}
      </span>
    </button>
  );
}

export default LanguageSwitcher;