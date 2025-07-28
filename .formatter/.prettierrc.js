module.exports = {
	// Basic formatting
	semi: true,
	singleQuote: true,
	trailingComma: 'es5',
	useTabs: true,
	tabWidth: 4,
	printWidth: 220,

	// Advanced formatting
	bracketSpacing: true,
	bracketSameLine: false,
	arrowParens: 'always',
	endOfLine: 'lf',
	proseWrap: 'preserve',

	// JSX formatting
	jsxSingleQuote: true,

	// Plugins for modern development
	plugins: ['prettier-plugin-tailwindcss'],

	// File-specific overrides
	overrides: [
		{
			files: '*.{ts,tsx}',
			options: {
				parser: 'typescript',
			}
		},
		{
			files: '*.{css,scss,less}',
			options: {
				singleQuote: true,
				useTabs: true,
				tabWidth: 4
			}
		},
		{
			files: '*.{json,jsonc}',
			options: {
				trailingComma: 'none',
				useTabs: true,
				tabWidth: 4
			}
		},
		{
			files: '*.{md,mdx}',
			options: {
				useTabs: false,
				tabWidth: 2,
				proseWrap: 'always'
			}
		},
		{
			files: '*.{yml,yaml}',
			options: {
				useTabs: false,
				tabWidth: 2
			}
		},
	],
};