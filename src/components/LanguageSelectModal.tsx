import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { LANGUAGES, type Language } from "@/lib/puzzle-engine";
import { type Difficulty } from "@/lib/puzzle-engine";
import { useLanguage } from "@/contexts/LanguageContext";

interface Props {
  mode: Difficulty;
  onClose: () => void;
}

export default function LanguageSelectModal({ mode, onClose }: Props) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  function handleLanguageSelect(lang: Language) {
    navigate(`/play/${mode}/${lang}`);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="card-surface rounded-2xl p-8 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold">{t.modesUI.selectLanguage}</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          {t.modesUI.selectLanguageDesc}
        </p>
        <div className="space-y-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.id}
              onClick={() => handleLanguageSelect(lang.id as Language)}
              className="w-full text-left px-4 py-3 rounded-lg border border-border bg-card/40 hover:bg-primary/10 hover:border-primary/40 transition-all"
            >
              <span className="font-medium">{lang.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
