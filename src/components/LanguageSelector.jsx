import React from 'react';
import { Globe } from 'lucide-react';

const LanguageSelector = ({ language, setLanguage }) => {
  const languages = ['English', 'Hindi', 'Kannada', 'Tamil', 'Telugu'];

  return (
    <div className="relative inline-block w-48">
      <div className="flex items-center absolute inset-y-0 left-0 pl-3 pointer-events-none text-indigo-500">
        <Globe size={18} />
      </div>
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="block w-full pl-10 pr-4 py-2 text-sm font-medium text-slate-700 bg-white/50 border border-slate-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-800/50 dark:border-slate-600 dark:text-slate-200 glass transition-colors cursor-pointer"
      >
        {languages.map((lang) => (
          <option key={lang} value={lang}>
            {lang}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </div>
  );
};

export default LanguageSelector;
