module.exports = {
	env: { browser: true, es2022: true, node: true, jest: true },
	extends: [
		'next/core-web-vitals',
		'prettier',
	],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaFeatures: { jsx: true },
		ecmaVersion: 2022,
		sourceType: 'module',
		project: './tsconfig.json',
	},
	plugins: ['prettier'],
	settings: {
		react: { version: 'detect' },
		'import/resolver': {
			typescript: {
				alwaysTryTypes: true,
				project: './tsconfig.json',
			},
		},
	},
	rules: {
		// Prettier integration - use our custom config to ensure consistency
		'prettier/prettier': ['error', {
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
		}],

		// Code quality rules
		'max-len': ['error', {
			code: 220,
			ignoreUrls: true,
			ignoreStrings: true,
			ignoreTemplateLiterals: true,
			ignoreComments: true,
		}],
		'no-console': 'warn',
		'no-debugger': 'error',
		'prefer-const': 'error',
		'no-var': 'error',
		'eqeqeq': ['error', 'always'],
		'curly': ['error', 'all'],

		// React rules
		'react/jsx-uses-react': 'off',
		'react/react-in-jsx-scope': 'off',
		'react/prop-types': 'off', // TypeScript handles this
		'react/jsx-key': 'error',
		'react/jsx-no-duplicate-props': 'error',
		'react/jsx-no-undef': 'error',
		'react/jsx-no-target-blank': 'error',
		'react/no-unused-state': 'warn',
		'react/self-closing-comp': 'error',

		// React Hooks rules
		'react-hooks/rules-of-hooks': 'error',
		'react-hooks/exhaustive-deps': 'warn',

		// Import/Export rules
		'no-duplicate-imports': 'error',
		'import/no-unresolved': 'off', // Handled by TypeScript

		// Next.js specific rules
		'@next/next/no-html-link-for-pages': 'error',
		'@next/next/no-img-element': 'warn',

		// Best practices
		'no-eval': 'error',
		'no-implied-eval': 'error',
		'no-new-func': 'error',
		'no-script-url': 'error',
		'no-alert': 'warn',
		'object-shorthand': 'error',
		'prefer-template': 'error',
	},
	ignorePatterns: [
		'node_modules/',
		'.next/',
		'out/',
		'build/',
		'dist/',
		'*.min.js',
		'*.min.css',
		'coverage/',
		'.cache/',
		'public/',
	],
};