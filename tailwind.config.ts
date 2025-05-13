import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes: {
        float1: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '25%': { transform: 'translate(-3px, -4px)' },
          '50%': { transform: 'translate(3px, 0)' },
          '75%': { transform: 'translate(-3px, 4px)' }
        },
        float2: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '25%': { transform: 'translate(4px, -3px)' },
          '50%': { transform: 'translate(-2px, 3px)' },
          '75%': { transform: 'translate(4px, 3px)' }
        },
        float3: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '25%': { transform: 'translate(-4px, 3px)' },
          '50%': { transform: 'translate(3px, -3px)' },
          '75%': { transform: 'translate(-2px, -4px)' }
        },
        wave: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        },
        'enhanced-breathe': {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.3' },
          '50%': { transform: 'scale(1.08)', opacity: '0.5' }
        },
        'sparkle-1': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)', opacity: '0.7' },
          '50%': { transform: 'translate(-2px, -2px) scale(1.2)', opacity: '0.9' }
        },
        'sparkle-2': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)', opacity: '0.6' },
          '50%': { transform: 'translate(2px, -3px) scale(1.3)', opacity: '0.8' }
        },
        'sparkle-3': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)', opacity: '0.8' },
          '50%': { transform: 'translate(-3px, 2px) scale(1.1)', opacity: '1' }
        },
        particle: {
          '0%': { transform: 'translate(-50%, -50%)', opacity: '1' },
          '100%': { transform: 'translate(calc(-50% + var(--x)), calc(-50% + var(--y)))', opacity: '0' }
        },
        'flash-bright': {
          '0%': { opacity: '0.8' },
          '100%': { opacity: '0' }
        },
        ripple: {
          '0%': { width: '0', height: '0', opacity: '0.5' },
          '100%': { width: '200%', height: '200%', opacity: '0' }
        },
        'power-up': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)' }
        },
        deflate: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)' }
        },
        'white-ripple': {
          '0%': { transform: 'scale(0.3)', opacity: '0.7' },
          '70%': { transform: 'scale(1.2)', opacity: '0.2' },
          '100%': { transform: 'scale(1.2)', opacity: '0' }
        }
      },
      animation: {
        float1: 'float1 3s ease-in-out infinite',
        float2: 'float2 4s ease-in-out infinite',
        float3: 'float3 3.5s ease-in-out infinite',
        wave: 'wave 3s linear infinite',
        'enhanced-breathe': 'enhanced-breathe 3s ease-in-out infinite',
        'sparkle-1': 'sparkle-1 3s ease-in-out infinite',
        'sparkle-2': 'sparkle-2 4s ease-in-out infinite',
        'sparkle-3': 'sparkle-3 3.5s ease-in-out infinite',
        particle: 'particle var(--duration) ease-out forwards',
        'flash-bright': 'flash-bright 0.5s ease-out forwards',
        ripple: 'ripple 0.6s ease-out forwards',
        'power-up': 'power-up 0.5s ease-out forwards',
        deflate: 'deflate 0.5s ease-out forwards',
        'white-ripple': 'white-ripple 1.2s cubic-bezier(0.4,0,0.2,1) infinite',
        'white-ripple-slow': 'white-ripple 2s cubic-bezier(0.4,0,0.2,1) infinite'
      }
    }
  },
  plugins: [],
};

export default config; 