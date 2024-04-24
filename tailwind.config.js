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
				white: '#FFFFFF',
				black: '#0E0E2C',
				light: '#ECF1F4',
				dark: '#212A3E',
				secondary: '#5C637E',
				primary: '#4B4DED',
				success: '#41EAD4',
				warning: '#FBBC05',
				danger: '#E83423',
				info: '#2196F3',
			},
			fontFamily: {
				dm: ['var(--font-dm)'],
				eb: ['var(--font-eb)'],
				sigma: ['var(--font-sigma)'],
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
				'.container': {
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
			});
		},
	],
};
