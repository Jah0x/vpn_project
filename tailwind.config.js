/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./index.html"],
  darkMode: "class", // Поддержка темной темы через класс
  theme: {
    extend: {
      // Кастомные цвета
      colors: {
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        success: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
        },
        danger: {
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
          800: "#991b1b",
          900: "#7f1d1d",
        },
        warning: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
        },
        // Кастомные серые цвета для темной темы
        gray: {
          50: "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: "#111827",
          950: "#030712",
        },
      },

      // Кастомные шрифты
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "ui-monospace", "monospace"],
      },

      // Кастомные размеры
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "1" }],
        "6xl": ["3.75rem", { lineHeight: "1" }],
        "7xl": ["4.5rem", { lineHeight: "1" }],
        "8xl": ["6rem", { lineHeight: "1" }],
        "9xl": ["8rem", { lineHeight: "1" }],
      },

      // Кастомные отступы (8pt scale)
      spacing: {
        4: "1rem", // 16px
        8: "2rem", // 32px
        16: "4rem", // 64px
        24: "6rem", // 96px
        32: "8rem", // 128px
        18: "4.5rem",
        88: "22rem",
        128: "32rem",
        144: "36rem",
      },

      // Кастомные радиусы
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },

      // Кастомные тени
      boxShadow: {
        glow: "0 0 20px rgba(59, 130, 246, 0.3)",
        "glow-lg": "0 0 30px rgba(59, 130, 246, 0.4)",
        "glow-green": "0 0 20px rgba(16, 185, 129, 0.3)",
        "glow-red": "0 0 20px rgba(239, 68, 68, 0.3)",
        "inner-lg": "inset 0 2px 4px 0 rgba(0, 0, 0, 0.1)",
      },

      // Кастомные градиенты
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-primary": "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
        "gradient-success": "linear-gradient(135deg, #10b981 0%, #047857 100%)",
        "gradient-danger": "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
      },

      // Кастомные анимации
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-in": "slideIn 0.3s ease-out",
        "bounce-in": "bounceIn 0.5s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 3s linear infinite",
        "ping-slow": "ping 3s cubic-bezier(0, 0, 0.2, 1) infinite",
      },

      // Кастомные keyframes
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        bounceIn: {
          "0%": { opacity: "0", transform: "scale(0.3)" },
          "50%": { opacity: "1", transform: "scale(1.05)" },
          "70%": { transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },

      // Кастомные breakpoints
      screens: {
        xs: "475px",
        "3xl": "1600px",
      },

      // Кастомные z-index
      zIndex: {
        60: "60",
        70: "70",
        80: "80",
        90: "90",
        100: "100",
      },

      // Кастомные максимальные ширины
      maxWidth: {
        "8xl": "88rem",
        "9xl": "96rem",
      },

      // Кастомные высоты
      height: {
        128: "32rem",
        144: "36rem",
      },

      // Кастомные минимальные высоты
      minHeight: {
        12: "3rem",
        16: "4rem",
        20: "5rem",
        24: "6rem",
        32: "8rem",
        40: "10rem",
        48: "12rem",
        56: "14rem",
        64: "16rem",
        80: "20rem",
        96: "24rem",
        128: "32rem",
      },

      // Кастомные backdrop blur
      backdropBlur: {
        xs: "2px",
      },

      // Кастомные transition timing
      transitionTimingFunction: {
        "bounce-in": "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
      },

      // Кастомные длительности переходов
      transitionDuration: {
        400: "400ms",
        600: "600ms",
        800: "800ms",
        900: "900ms",
      },
    },
  },
  plugins: [
    // Плагин для форм
    require("@tailwindcss/forms")({
      strategy: "class",
    }),

    // Плагин для типографики
    require("@tailwindcss/typography"),

    // Кастомный плагин для компонентов
    function ({ addComponents, theme }) {
      const components = {
        // Кнопки
        ".btn": {
          padding: `${theme("spacing.2")} ${theme("spacing.4")}`,
          borderRadius: theme("borderRadius.lg"),
          fontWeight: theme("fontWeight.medium"),
          fontSize: theme("fontSize.sm"),
          transition: "all 200ms ease-in-out",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: theme("spacing.2"),
          cursor: "pointer",
          "&:disabled": {
            opacity: "0.5",
            cursor: "not-allowed",
          },
        },
        ".btn-primary": {
          backgroundColor: theme("colors.primary.600"),
          color: theme("colors.white"),
          "&:hover:not(:disabled)": {
            backgroundColor: theme("colors.primary.700"),
          },
        },
        ".btn-secondary": {
          backgroundColor: theme("colors.gray.600"),
          color: theme("colors.white"),
          "&:hover:not(:disabled)": {
            backgroundColor: theme("colors.gray.500"),
          },
        },
        ".btn-success": {
          backgroundColor: theme("colors.success.600"),
          color: theme("colors.white"),
          "&:hover:not(:disabled)": {
            backgroundColor: theme("colors.success.700"),
          },
        },
        ".btn-danger": {
          backgroundColor: theme("colors.danger.600"),
          color: theme("colors.white"),
          "&:hover:not(:disabled)": {
            backgroundColor: theme("colors.danger.700"),
          },
        },

        // Поля ввода
        ".input": {
          backgroundColor: theme("colors.gray.700"),
          borderColor: theme("colors.gray.600"),
          color: theme("colors.white"),
          padding: `${theme("spacing.3")} ${theme("spacing.4")}`,
          borderRadius: theme("borderRadius.lg"),
          borderWidth: "1px",
          transition: "all 200ms ease-in-out",
          "&::placeholder": {
            color: theme("colors.gray.400"),
          },
          "&:focus": {
            outline: "none",
            borderColor: theme("colors.primary.500"),
            boxShadow: `0 0 0 2px ${theme("colors.primary.500")}20`,
          },
        },

        // Карточки
        ".card": {
          backgroundColor: theme("colors.gray.800"),
          borderColor: theme("colors.gray.700"),
          borderWidth: "1px",
          borderRadius: theme("borderRadius.xl"),
          padding: theme("spacing.6"),
          boxShadow: theme("boxShadow.lg"),
        },

        // Модальные окна
        ".modal": {
          position: "fixed",
          inset: "0",
          backgroundColor: `${theme("colors.black")}80`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: theme("zIndex.50"),
          padding: theme("spacing.4"),
        },

        // Статусы
        ".status-online": {
          color: theme("colors.success.400"),
        },
        ".status-offline": {
          color: theme("colors.danger.400"),
        },
        ".status-maintenance": {
          color: theme("colors.warning.400"),
        },

        // Загрузка
        ".loading": {
          opacity: "0.5",
          pointerEvents: "none",
        },

        // Scrollbar
        ".scrollbar-custom": {
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: theme("colors.gray.800"),
            borderRadius: theme("borderRadius.full"),
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: theme("colors.gray.600"),
            borderRadius: theme("borderRadius.full"),
            "&:hover": {
              backgroundColor: theme("colors.gray.500"),
            },
          },
        },
      };

      addComponents(components);
    },

    // Кастомный плагин для утилит
    function ({ addUtilities }) {
      const utilities = {
        ".text-gradient": {
          background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
          "-webkit-background-clip": "text",
          "-webkit-text-fill-color": "transparent",
          "background-clip": "text",
        },
        ".bg-grid": {
          backgroundImage: `url("data:image/svg+xml,%3csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='none' fill-rule='evenodd'%3e%3cg fill='%234b5563' fill-opacity='0.1'%3e%3ccircle cx='30' cy='30' r='2'/%3e%3c/g%3e%3c/g%3e%3c/svg%3e")`,
        },
        ".glass": {
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
          "-webkit-backdrop-filter": "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
        },
      };

      addUtilities(utilities);
    },
  ],
};
