/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui"),],
  daisyui: {
    themes: [
      {
        'cupcake': {


          'primary': '#004ba8',




          'primary-focus': '#00387d',




          'primary-content': '#ffffff',





          'secondary': '#473198',




          'secondary-focus': '#392778',




          'secondary-content': '#ffffff',





          'accent': '#eca400',




          'accent-focus': '#c18700',




          'accent-content': '#000000',





          'neutral': '#4c9ef0',




          'neutral-focus': '#2589ed',




          'neutral-content': '#ffffff',





          'base-100': '#ffffff',




          'base-200': '#f8f5f1',




          'base-300': '#f1ede2',




          'base-content': '#000000',





          'info': '#4D9DE0',




          'success': '#3BB273',




          'warning': '#E1BC29',




          'error': '#E15554',





          '--rounded-box': '1rem',




          '--rounded-btn': '1rem',




          '--rounded-badge': '1rem',





          '--animation-btn': '.25s',




          '--animation-input': '.2s',





          '--btn-text-case': 'uppercase',




          '--navbar-padding': '0.5rem',




          '--border-btn': '2px',


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
