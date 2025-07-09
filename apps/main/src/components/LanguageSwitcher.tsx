import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import React, { useState } from "react";

const options = [
  { code: "en", label: "EN" },
  { code: "ru", label: "RU" },
];

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);

  const changeLanguage = (lng: string) => {
    void i18n.changeLanguage(lng);
    setOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        data-testid="lang-toggle"
        onClick={() => setOpen(!open)}
        className="btn-secondary px-2 py-2"
      >
        <Globe className="w-5 h-5" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-24 rounded-md shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
          {options.map((opt) => (
            <button
              key={opt.code}
              data-testid={`lang-${opt.code}`}
              onClick={() => changeLanguage(opt.code)}
              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-slate-700"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
