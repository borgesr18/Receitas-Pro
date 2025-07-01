/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#111827',
        card: '#1F2937',
        border: '#374151',
        text: '#F9FAFB',
        'text-secondary': '#9CA3AF',
        accent: '#FFFFFF',
        hover: '#4B5563'
      }
    },
  },
  plugins: [],
}
