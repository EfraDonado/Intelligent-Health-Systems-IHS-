import { cx } from "../utils/classNames";

const tabs = [
  { id: "help", label: "Ayuda" },
  { id: "wellness", label: "Bienestar" },
  { id: "faq", label: "FAQ" },
];

export default function ChatbotTabs({ value, onChange }) {
  return (
    <div className="flex rounded-full border border-ink/10 bg-ink/5 p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cx(
            "flex-1 rounded-full px-3 py-1.5 text-xs font-semibold transition",
            value === tab.id
              ? "bg-white text-ink shadow-soft"
              : "text-ink/60 hover:text-ink"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
