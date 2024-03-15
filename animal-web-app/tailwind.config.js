/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        'wireframe': {


          'primary': '#5A7684',




          'primary-focus': '#48606a',




          'primary-content': '#f5f3f5',





          'secondary': '#395B50',




          'secondary-focus': '#294139',




          'secondary-content': '#f5f3f5',





          'accent': '#9E0031',




          'accent-focus': '#730022',




          'accent-content': '#f5f3f5',





          'neutral': '#152555',




          'neutral-focus': '#0d1633',




          'neutral-content': '#f5f3f5',





          'base-100': '#f5f3f5',




          'base-200': '#e7e2e7',




          'base-300': '#d7d2d7',




          'base-content': '#221e22',





          'info': '#4688f7',




          'success': '#73cf5f',




          'warning': '#f6d244',




          'error': '#E54f40',





          '--rounded-box': '.0rem',




          '--rounded-btn': '.0rem',




          '--rounded-badge': '.0rem',





          '--animation-btn': '.25s',




          '--animation-input': '.2s',





          '--btn-text-case': 'uppercase',




          '--navbar-padding': '.0rem',




          '--border-btn': '1px',


        },
      },
    ],
    styled: true,
    base: true,
    utils: true,
    logs: true,
    rtl: false,
  },
}
