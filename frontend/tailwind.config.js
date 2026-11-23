/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: '#f4f0e8',
          light: '#fffdf8',
          dark: '#ebe7df',
        },
        ink: {
          DEFAULT: '#171713',
          muted: '#6a675d',
          subtle: '#8a877e',
        },
        volt: {
          DEFAULT: '#cfff58',
          hover: '#b8ea40',
        },
        violet: {
          DEFAULT: '#5e48d7',
          hover: '#4e38c7',
        },
        coral: {
          DEFAULT: '#ef5b45',
          soft: '#ffd2c9',
          light: '#ffd7ce',
        },
        mint: {
          DEFAULT: '#d7f78d',
        },
        lavender: {
          DEFAULT: '#c9c0ff',
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'sans-serif'],
        serif: ['"DM Serif Display"', 'Georgia', 'serif'],
        mono: ['"Space Grotesk"', 'monospace']
      },
      boxShadow: {
        '2xs': '0 1px 2px 0 rgba(23, 23, 19, 0.05)',
        'brutal-sm': '2px 2px 0px 0px #171713',
        'brutal': '4px 4px 0px 0px #171713',
        'brutal-lg': '6px 6px 0px 0px #171713',
        'brutal-xl': '10px 10px 0px 0px #171713',
        'paper': '0 7px 25px rgba(33, 29, 22, 0.14)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(1deg)' },
          '50%': { transform: 'translateY(-7px) rotate(-1deg)' },
        },
        marquee: {
          to: { transform: 'translateX(-50%)' },
        },
        workspaceIn: {
          from: { opacity: '0', transform: 'translateY(25px) rotate(1.5deg)' },
          to: { opacity: '1', transform: 'translateY(0) rotate(0)' },
        }
      },
      animation: {
        float: 'float 3.5s ease-in-out infinite',
        marquee: 'marquee 23s linear infinite',
        workspace: 'workspaceIn 700ms cubic-bezier(.16, 1, .3, 1) both',
      }
    },
  },
  plugins: [],
}
