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
        'cupcake': {


          'primary': '#0C39CC',




          'primary-focus': '#0a2da5',




          'primary-content': '#ffffff',





          'secondary': '#015C47',




          'secondary-focus': '#003327',




          'secondary-content': '#ffffff',





          'accent': '#A60329',




          'accent-focus': '#7d021e',




          'accent-content': '#ffffff',





          'neutral': '#E6C24E',




          'neutral-focus': '#e1b828',




          'neutral-content': '#000000',





          'base-100': '#f7f8fd',




          'base-200': '#dde1f7',




          'base-300': '#c5cbef',




          'base-content': '#000000',





          'info': '#4D9DE0',




          'success': '#3BB273',




          'warning': '#E1BC29',




          'error': '#E15554',





          '--rounded-box': '1rem',




          '--rounded-btn': '2rem',




          '--rounded-badge': '1.9rem',





          '--animation-btn': '.25s',




          '--animation-input': '.2s',





          '--btn-text-case': 'uppercase',




          '--navbar-padding': '.5rem',




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
