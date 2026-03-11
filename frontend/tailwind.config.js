export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#0b0f19",
          alt: "#111827",
        },
        primary: "#3b82f6",
        secondary: "#06b6d4",
        accent: "#22c55e",
        text: {
          primary: "#ffffff",
          secondary: "#9ca3af",
        },
      },
      backgroundImage: {
        'gradient-blue': 'linear-gradient(135deg, #3b82f6, #06b6d4)',
      },
      backdropBlur: {
        'glass': '14px',
      },
    },
  },
  plugins: [],
}
