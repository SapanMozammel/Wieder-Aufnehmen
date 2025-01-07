/** @type {import('tailwindcss').Config} */
module.exports = {
	mode: 'jit',
	darkMode: 'class',
	content: [
		'./src/pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/components/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/app/**/*.{js,ts,jsx,tsx,mdx}',
	],
	theme: {
		extend: {
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'gradient-conic':
					'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
			},
			borderWidth: {
				1: '0.0625rem',
				2: '0.125rem',
				3: '0.1875rem',
			},
			colors: {
				white: '#FFFFFF',
				black: '#0e0c15',
				light: '#ECF1F4',
				dark: '#0E0E2C',
				secondary: {
					100: '#E3ECF5',
					200: '#D9E5F1',
					300: '#BACFE6',
					400: '#94a3b8',
					500: '#5C637E',
					700: '#334155',
					800: '#212A3E',
					900: '#0f172a',
				},
				primary: '#4B4DED',
				success: '#41EAD4',
				warning: { DEFAULT: '#ff6f00', light: '#FFD057' },
				danger: '#E83423',
				info: '#2196F3',
			},
			fontFamily: {
				dm: ['var(--font-dm)'],
				eb: ['var(--font-eb)'],
				sigma: ['var(--font-sigma)'],
			},
			animation: {
				noise: 'noise 1s linear infinite',
			},
			keyframes: {
				noise: {
					'0%, 100%': { backgroundPosition: '0% 0%' },
					'50%': { backgroundPosition: '400% 400%' },
				},
			},
			dropShadow: {
				button: ['0  0.125rem 0.125rem rgba(0, 0, 0, 0.3)'],
			},
			zIndex: {
				1: '1',
				2: '2',
				3: '3',
				4: '4',
				5: '5',
			},
		},
	},
	// ...
	corePlugins: {
		container: false,
	},
	plugins: [
		function ({ addComponents }) {
			addComponents({
				'.container-fluid': {
					marginLeft: 'auto',
					marginRight: 'auto',
					maxWidth: '100%',
					paddingInlineStart: '1.5rem',
					paddingInlineEnd: '1.5rem',
					'@screen sm': {
						maxWidth: '80%',
						paddingInlineStart: '0',
						paddingInlineEnd: '0',
					},
				},
				'.section-separator': {
					position: 'absolute',
					top: '0',
					bottom: '0',
					left: '1rem',
					right: '1rem',
					zIndex: '-1',
					'@screen sm': {
						left: '7.5%',
						right: '7.5%',
					},
				},
			});
		},
	],
};
