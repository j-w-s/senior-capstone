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
        'rev': {


          'primary': '#354460',




          'primary-focus': '#263144',




          'primary-content': '#ffffff',





          'secondary': '#006a4e',




          'secondary-focus': '#00402f',




          'secondary-content': '#ffffff',





          'accent': '#009583',




          'accent-focus': '#00554a',




          'accent-content': '#ffffff',





          'neutral': '#4a4a4a',




          'neutral-focus': '#353535',




          'neutral-content': '#ffffff',





          'base-100': '#f1efef',




          'base-200': '#dfdfdf',




          'base-300': '#e3e3e3',




          'base-content': '#000000',





          'info': '#1c92f2',




          'success': '#009485',




          'warning': '#ff9900',




          'error': '#ff5724',





          '--rounded-box': '1rem',




          '--rounded-btn': '.5rem',




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
