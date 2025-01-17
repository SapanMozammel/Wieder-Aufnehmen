/** @type {import('tailwindcss').Config} */
module.exports = {
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
				white: '#ffffff',
				black: '#0e0e2c',
				light: '#ecf1f4',
				dark: '#212A3E',
				teil: '#0E3854',
				secondary: '#5C637E',
				primary: '#4B4DED',
				success: '#41EAD4',
				warning: '#FF9446',
				danger: '#FC573B',
				info: '#2196F3',
			},
			container: {
				center: true,
			},
			fontFamily: {
				dm: ['var(--font-dm)'],
				eb: ['var(--font-eb)'],
				sigma: ['var(--font-sigma)'],
			},
		},
	},
	plugins: [],
};
