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
					DEFAULT: 'hsl(var(--secondary))',
					100: '#E3ECF5',
					200: '#D9E5F1',
					300: '#BACFE6',
					400: '#94a3b8',
					500: '#5C637E',
					600: '#3d444d',
					700: '#334155',
					800: '#212A3E',
					900: '#0f172a',
					foreground: 'hsl(var(--secondary-foreground))',
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					600: '#4B4DED',
					foreground: 'hsl(var(--primary-foreground))',
				},
				success: '#41EAD4',
				warning: {
					DEFAULT: '#ff6f00',
					light: '#FFD057',
				},
				danger: '#E83423',
				info: '#2196F3',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))',
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))',
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))',
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				chart: {
					1: 'hsl(var(--chart-1))',
					2: 'hsl(var(--chart-2))',
					3: 'hsl(var(--chart-3))',
					4: 'hsl(var(--chart-4))',
					5: 'hsl(var(--chart-5))',
				},
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
					'0%, 100%': {
						backgroundPosition: '0% 0%',
					},
					'50%': {
						backgroundPosition: '400% 400%',
					},
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
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 0.125rem)',
				sm: 'calc(var(--radius) - 0.25rem)',
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
				'.container': {
					marginLeft: 'auto',
					marginRight: 'auto',
					maxWidth: '100%',
					paddingInlineStart: '1.5rem',
					paddingInlineEnd: '1.5rem',
					'@screen md': {
						maxWidth: '80%',
						paddingInlineStart: '0',
						paddingInlineEnd: '0',
					},
				},
				'.container-fluid': {
					marginLeft: 'auto',
					marginRight: 'auto',
					maxWidth: '100%',
					paddingInlineStart: '1.5rem',
					paddingInlineEnd: '1.5rem',
					'@screen md': {
						paddingInlineStart: '2.25rem',
						paddingInlineEnd: '2.25rem',
					},
				},
				'.section-separator': {
					position: 'absolute',
					top: '0',
					bottom: '0',
					left: '0.75rem',
					right: '0.75rem',
					zIndex: '-1',
					'@screen md': {
						left: '2.25rem',
						right: '2.25rem',
					},
				},
			});
		},
		require('tailwindcss-animate'),
	],
};
