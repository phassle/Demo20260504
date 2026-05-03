import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-dark': '#1a1f2e',
        'bg-panel': '#232a3a',
        'accent-teal': '#2ec4b6',
        'accent-gold': '#f0b429',
        'warning-orange': '#e07020',
        'pink': '#d64a6a',
        'green': '#5ab87a',
        'text-primary': '#ffffff',
        'text-secondary': '#8899aa',
        'blue-header': '#1a6fb5',
      },
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
