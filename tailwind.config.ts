import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/contexts/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'bounce-in': 'bounceIn 0.6s ease-out',
        'theme-transition': 'themeTransition 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        themeTransition: {
          '0%': { opacity: '0.8' },
          '50%': { opacity: '0.9' },
          '100%': { opacity: '1' },
        },
      },
      backgroundImage: {
        'gradient-ocean': 'linear-gradient(135deg, #0891b2 0%, #0e7490 50%, #155e75 100%)',
        'gradient-sunset': 'linear-gradient(135deg, #ea580c 0%, #dc2626 50%, #be185d 100%)',
        'gradient-forest': 'linear-gradient(135deg, #16a34a 0%, #059669 50%, #0d9488 100%)',
        'gradient-cosmic': 'linear-gradient(135deg, #7c3aed 0%, #c026d3 50%, #3730a3 100%)',
      },
      colors: {
        theme: {
          background: 'var(--theme-background)',
          surface: 'var(--theme-surface)',
          primary: 'var(--theme-primary)',
          secondary: 'var(--theme-secondary)',
          accent: 'var(--theme-accent)',
          text: 'var(--theme-text)',
          textSecondary: 'var(--theme-text-secondary)',
          border: 'var(--theme-border)',
        }
      }
    },
  },
  plugins: [],
};

export default config;
