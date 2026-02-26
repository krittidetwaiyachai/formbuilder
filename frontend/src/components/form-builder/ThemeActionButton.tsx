import { useTranslation } from "react-i18next";

interface ThemeActionButtonProps {
  setIsThemeModalOpen: (isOpen: boolean) => void;
}

export default function ThemeActionButton({
  setIsThemeModalOpen,
}: ThemeActionButtonProps) {
  const { t } = useTranslation();

  return (
    <div className="absolute top-6 right-8 z-30 hidden md:block">
      <div className="relative w-16 h-16">
        <div
          className="absolute inset-0 opacity-80"
          style={{
            background:
              "linear-gradient(135deg, #ffc9de, #e4c1f9, #c1d5f9, #c1f9e4, #f9f1c1)",
            borderRadius: "60% 40% 50% 50% / 50% 60% 40% 50%",
            animation:
              "morph 3s ease-in-out infinite, gradientShift 2s ease infinite",
          }}
        />

        <button
          onClick={() => setIsThemeModalOpen(true)}
          className="absolute inset-1 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group flex items-center justify-center"
          title={t("builder.theme.settings_title")}
        >
          <svg
            className="w-7 h-7 relative z-10 transition-transform duration-300 group-hover:rotate-6"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.512 2 12 2Z"
              fill="#f8f8f8"
              stroke="#e0e0e0"
              strokeWidth="1.5"
            />
            <circle cx="7.5" cy="10" r="2" fill="#ffc9de" />
            <circle cx="11" cy="6.5" r="2" fill="#e4c1f9" />
            <circle cx="16" cy="9" r="2" fill="#c1d5f9" />
            <circle cx="9" cy="14" r="1.5" fill="#c1f9e4" />
          </svg>
        </button>
      </div>
      <style>{`
            @keyframes morph {
                0%, 100% { border-radius: 60% 40% 50% 50% / 50% 60% 40% 50%; }
                25% { border-radius: 50% 60% 40% 50% / 40% 50% 60% 50%; }
                50% { border-radius: 40% 50% 60% 50% / 50% 40% 50% 60%; }
                75% { border-radius: 50% 40% 50% 60% / 60% 50% 40% 50%; }
            }
            @keyframes gradientShift {
                0%, 100% { filter: hue-rotate(0deg); }
                50% { filter: hue-rotate(30deg); }
            }
            `}</style>
    </div>
  );
}
