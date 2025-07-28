#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Optimized Formatter Sync System
 * Reads from FORMATTER_CONFIG.md and generates config files with pnpm integration
 * Consolidates ESLint with Next.js built-in capabilities
 */

// Required dependencies for the formatting system
const requiredDeps = {
	prettier: ['prettier'],
	'prettier-plugin-tailwindcss': ['prettier-plugin-tailwindcss'],
	eslint: ['eslint'],
	'@typescript-eslint/parser': ['@typescript-eslint/parser'],
	'@typescript-eslint/eslint-plugin': ['@typescript-eslint/eslint-plugin'],
	'eslint-plugin-react': ['eslint-plugin-react'],
	'eslint-config-prettier': ['eslint-config-prettier'],
	'eslint-plugin-prettier': ['eslint-plugin-prettier'],
	'eslint-config-next': ['eslint-config-next'],
	typescript: ['typescript'],
	'@types/node': ['@types/node'],
	'@types/react': ['@types/react'],
	'@types/react-dom': ['@types/react-dom'],
};

// Enhanced dependency checking with optional deps
const checkDependencies = () => {
	if (!fs.existsSync('package.json')) {
		console.log('❌ package.json not found');
		return false;
	}

	try {
		const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
		const allDeps = {
			...(packageJson.dependencies || {}),
			...(packageJson.devDependencies || {}),
		};

		// Required dependencies
		const missingRequired = Object.entries(requiredDeps)
			.filter(([name, alternatives]) => !alternatives.some((dep) => allDeps[dep]))
			.map(([name]) => name);

		// Optional but recommended dependencies
		const optionalDeps = {
			typescript: ['typescript'],
			'@types/node': ['@types/node'],
			'@types/react': ['@types/react'],
			'@types/react-dom': ['@types/react-dom'],
		};

		const missingOptional = Object.entries(optionalDeps)
			.filter(([name, alternatives]) => !alternatives.some((dep) => allDeps[dep]))
			.map(([name]) => name);

		if (missingRequired.length > 0) {
			console.log('❌ Missing required dependencies:', missingRequired.join(', '));
			console.log('   Run: pnpm install to install missing packages');
			return false;
		}

		if (missingOptional.length > 0) {
			console.log('⚠️  Missing optional dependencies:', missingOptional.join(', '));
			console.log('   Consider: pnpm add -D', missingOptional.join(' '));
		}

		return true;
	} catch (error) {
		console.error('❌ Error reading package.json:', error.message);
		return false;
	}
};

// Validate safety settings
const validateSafety = (config) => {
	const safetyIssues = [];

	if (config.SAFE_MODE !== 'true') {
		safetyIssues.push('SAFE_MODE should be true');
	}
	if (config.NO_FILE_DELETION !== 'true') {
		safetyIssues.push('NO_FILE_DELETION should be true');
	}
	if (config.SRC_ONLY !== 'true') {
		safetyIssues.push('SRC_ONLY should be true');
	}

	if (safetyIssues.length > 0) {
		console.log('⚠️  Safety issues:', safetyIssues.join(', '));
		return false;
	}

	return true;
};

// Read config from FORMATTER_CONFIG.md with error handling
const readConfig = () => {
	try {
		if (!fs.existsSync('.formatter/FORMATTER_CONFIG.md')) {
			console.error('❌ .formatter/FORMATTER_CONFIG.md not found');
			process.exit(1);
		}

		const file = fs.readFileSync('.formatter/FORMATTER_CONFIG.md', 'utf8');
		const match = file.match(/```config\n([\s\S]*?)\n```/);

		if (!match) {
			console.error('❌ No config block found in FORMATTER_CONFIG.md');
			console.error('   Expected format: ```config\\n...\\n```');
			process.exit(1);
		}

		// Parse configuration from FORMATTER_CONFIG.md - no hardcoded defaults
		const config = {};
		const configLines = match[1].split('\n');

		configLines.forEach((line, index) => {
			line = line.trim();

			// Skip empty lines and comments
			if (!line || line.startsWith('#')) {
				return;
			}

			// Parse key=value pairs
			if (line.includes('=')) {
				const [key, ...valueParts] = line.split('=');
				const value = valueParts.join('=').trim(); // Handle values that contain '='
				const cleanKey = key.trim();

				if (cleanKey && value) {
					config[cleanKey] = value;
				} else {
					console.warn(`⚠️  Skipping invalid config line ${index + 1}: "${line}"`);
				}
			} else {
				console.warn(`⚠️  Skipping malformed config line ${index + 1}: "${line}"`);
			}
		});

		// Validate that we have at least some configuration
		if (Object.keys(config).length === 0) {
			console.error('❌ No valid configuration found in FORMATTER_CONFIG.md');
			process.exit(1);
		}

		console.log(`📖 Loaded ${Object.keys(config).length} configuration settings from FORMATTER_CONFIG.md`);
		return config;
	} catch (error) {
		console.error('❌ Error reading FORMATTER_CONFIG.md:', error.message);
		process.exit(1);
	}
};

// Improve file operations with error handling
const safeWriteFile = (filePath, content) => {
	try {
		const dir = path.dirname(filePath);
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
		}



		fs.writeFileSync(filePath, content);
		return true;
	} catch (error) {
		console.error(`❌ Failed to write ${filePath}:`, error.message);
		return false;
	}
};

// Generate Prettier config (compatible with wp-prettier)
const generatePrettierConfig = (config) => {
	// Helper function to get config value with fallback
	const getConfigValue = (key, fallback) => config[key] !== undefined ? config[key] : fallback;

	const useTabs = getConfigValue('INDENT_STYLE', 'space') === 'tab';
	const tabWidth = parseInt(getConfigValue('INDENT_SIZE', '2')) || 2;
	const printWidth = parseInt(getConfigValue('PRINT_WIDTH', '80')) || 80;
	const singleQuote = getConfigValue('USE_SINGLE_QUOTES', 'true') === 'true';
	const semi = getConfigValue('USE_SEMICOLONS', 'true') === 'true';
	const bracketSpacing = getConfigValue('BRACKET_SPACING', 'true') === 'true';
	const bracketSameLine = getConfigValue('BRACKET_SAME_LINE', 'false') === 'true';
	const jsxSingleQuote = getConfigValue('JSX_SINGLE_QUOTE', 'true') === 'true';
	const arrowParens = getConfigValue('ARROW_PARENS', 'avoid');
	const endOfLine = getConfigValue('END_OF_LINE', 'lf');
	const proseWrap = getConfigValue('PROSE_WRAP', 'preserve');
	const trailingComma = getConfigValue('TRAILING_COMMA', 'es5');

	const prettierConfigContent = `module.exports = {
	// Basic formatting
	semi: ${semi},
	singleQuote: ${singleQuote},
	trailingComma: '${trailingComma}',
	useTabs: ${useTabs},
	tabWidth: ${tabWidth},
	printWidth: ${printWidth},

	// Advanced formatting
	bracketSpacing: ${bracketSpacing},
	bracketSameLine: ${bracketSameLine},
	arrowParens: '${arrowParens}',
	endOfLine: '${endOfLine}',
	proseWrap: '${proseWrap}',

	// JSX formatting
	jsxSingleQuote: ${jsxSingleQuote},

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
				singleQuote: ${getConfigValue('CSS_SINGLE_QUOTES', 'true') === 'true'},
				useTabs: ${useTabs},
				tabWidth: ${tabWidth}
			}
		},
		{
			files: '*.{json,jsonc}',
			options: {
				trailingComma: '${getConfigValue('JSON_TRAILING_COMMA', 'none')}',
				useTabs: ${useTabs},
				tabWidth: ${tabWidth}
			}
		},
		{
			files: '*.{md,mdx}',
			options: {
				useTabs: false,
				tabWidth: 2,
				proseWrap: '${getConfigValue('MARKDOWN_PROSE_WRAP', 'always')}'
			}
		},
		{
			files: '*.{yml,yaml}',
			options: {
				useTabs: ${getConfigValue('YAML_INDENT_STYLE', 'space') === 'tab'},
				tabWidth: ${parseInt(getConfigValue('YAML_INDENT_SIZE', '2')) || 2}
			}
		},
	],
};`;

	return prettierConfigContent;
};

// Generate .prettierignore for src only
const generatePrettierIgnore = () => {
	return `# Generated from FORMATTER_CONFIG.md
# Only format files in src folder

# Ignore everything at root level
/*

# But include src folder
!/src/

# Standard ignores
node_modules/
vendor/
build/
dist/
*.min.js
*.min.css
wp-content/uploads/
wp-config.php
*.log
coverage/
.cache
.next
package-lock.json
yarn.lock
composer.lock
.DS_Store
Thumbs.db
*.tmp
*.temp`;
};

// Generate ESLint config (optimized for Next.js built-in ESLint)
const generateESLintConfig = (config) => {
	// Helper function to get config value with fallback
	const getConfigValue = (key, fallback) => config[key] !== undefined ? config[key] : fallback;

	const maxLineLength = parseInt(getConfigValue('MAX_LINE_LENGTH', '80')) || 80;
	const noConsole = getConfigValue('NO_CONSOLE', 'warn');
	const noDebugger = getConfigValue('NO_DEBUGGER', 'error');
	const preferConst = getConfigValue('PREFER_CONST', 'error');
	const noVar = getConfigValue('NO_VAR', 'error');
	const eqeqeq = getConfigValue('EQEQEQ', 'error');
	const reactHooksExhaustiveDeps = getConfigValue('REACT_HOOKS_EXHAUSTIVE_DEPS', 'warn');
	const reactJsxNoTargetBlank = getConfigValue('REACT_JSX_NO_TARGET_BLANK', 'error');

	return `module.exports = {
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
			semi: ${getConfigValue('USE_SEMICOLONS', 'true') === 'true'},
			singleQuote: ${getConfigValue('USE_SINGLE_QUOTES', 'true') === 'true'},
			trailingComma: '${getConfigValue('TRAILING_COMMA', 'es5')}',
			useTabs: ${getConfigValue('INDENT_STYLE', 'space') === 'tab'},
			tabWidth: ${parseInt(getConfigValue('INDENT_SIZE', '2')) || 2},
			printWidth: ${parseInt(getConfigValue('PRINT_WIDTH', '80')) || 80},

			// Advanced formatting
			bracketSpacing: ${getConfigValue('BRACKET_SPACING', 'true') === 'true'},
			bracketSameLine: ${getConfigValue('BRACKET_SAME_LINE', 'false') === 'true'},
			arrowParens: '${getConfigValue('ARROW_PARENS', 'avoid')}',
			endOfLine: '${getConfigValue('END_OF_LINE', 'lf')}',
			proseWrap: '${getConfigValue('PROSE_WRAP', 'preserve')}',

			// JSX formatting
			jsxSingleQuote: ${getConfigValue('JSX_SINGLE_QUOTE', 'true') === 'true'},
		}],

		// Code quality rules
		'max-len': ['error', {
			code: ${maxLineLength},
			ignoreUrls: true,
			ignoreStrings: true,
			ignoreTemplateLiterals: true,
			ignoreComments: true,
		}],
		'no-console': '${noConsole}',
		'no-debugger': '${noDebugger}',
		'prefer-const': '${preferConst}',
		'no-var': '${noVar}',
		'eqeqeq': ['${eqeqeq}', 'always'],
		'curly': ['error', 'all'],

		// React rules
		'react/jsx-uses-react': 'off',
		'react/react-in-jsx-scope': 'off',
		'react/prop-types': 'off', // TypeScript handles this
		'react/jsx-key': 'error',
		'react/jsx-no-duplicate-props': 'error',
		'react/jsx-no-undef': 'error',
		'react/jsx-no-target-blank': '${reactJsxNoTargetBlank}',
		'react/no-unused-state': 'warn',
		'react/self-closing-comp': 'error',

		// React Hooks rules
		'react-hooks/rules-of-hooks': 'error',
		'react-hooks/exhaustive-deps': '${reactHooksExhaustiveDeps}',

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
};`;
};

// Generate EditorConfig
const generateEditorConfig = (config) => {
	// Helper function to get config value with fallback
	const getConfigValue = (key, fallback) => config[key] !== undefined ? config[key] : fallback;

	const indentStyle = getConfigValue('INDENT_STYLE', 'space');
	const indentSize = getConfigValue('INDENT_SIZE', '2');
	const printWidth = getConfigValue('PRINT_WIDTH', '80');

	return `root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true

[*.{js,jsx,ts,tsx}]
indent_style = ${indentStyle}
indent_size = ${indentSize}
max_line_length = ${printWidth}

[*.{css,scss,less,json,jsonc}]
indent_style = ${indentStyle}
indent_size = ${indentSize}

[*.{yml,yaml,md,mdx}]
indent_style = space
indent_size = 2

[package.json]
indent_style = space
indent_size = 2`;
};

// Generate VS Code settings
const generateVSCodeSettings = (config) => {
	// Helper function to get config value with fallback
	const getConfigValue = (key, fallback) => config[key] !== undefined ? config[key] : fallback;

	const useTabs = getConfigValue('INDENT_STYLE', 'space') === 'tab';
	const tabWidth = parseInt(getConfigValue('INDENT_SIZE', '2')) || 2;
	const printWidth = parseInt(getConfigValue('PRINT_WIDTH', '80')) || 80;

	const formatOnSave = getConfigValue('FORMAT_ON_SAVE', 'false') === 'true';
	const formatOnPaste = getConfigValue('FORMAT_ON_PASTE', 'false') === 'true';
	const eslintAutoFix = getConfigValue('ESLINT_AUTO_FIX', 'true') === 'true';
	const insertFinalNewline = getConfigValue('INSERT_FINAL_NEWLINE', 'true') === 'true';
	const trimTrailingWhitespace = getConfigValue('TRIM_TRAILING_WHITESPACE', 'true') === 'true';
	const wordWrap = getConfigValue('WORD_WRAP', 'off');

	const settings = {
		// Workbench
		'workbench.activityBar.orientation': 'vertical',
		'workbench.editor.enablePreview': false,

		// Editor behavior
		'editor.insertSpaces': !useTabs,
		'editor.tabSize': tabWidth,
		'editor.detectIndentation': false,
		'editor.wordWrap': wordWrap,
		'editor.wordWrapColumn': printWidth,
		'editor.rulers': [printWidth],
		'editor.formatOnSave': formatOnSave,
		'editor.formatOnPaste': formatOnPaste,
		'editor.trimAutoWhitespace': true,
		'editor.renderWhitespace': 'boundary',
		'editor.minimap.maxColumn': printWidth,

		// Code actions
		'editor.codeActionsOnSave': {
			'source.fixAll.eslint': eslintAutoFix,
			'source.organizeImports': true,
		},

		// Files
		'files.eol': '\n',
		'files.insertFinalNewline': insertFinalNewline,
		'files.trimTrailingWhitespace': trimTrailingWhitespace,
		'files.trimFinalNewlines': true,
		'files.autoSave': 'onFocusChange',

		// Prettier
		'prettier.requireConfig': true,
		'prettier.configPath': '.formatter/.prettierrc.js',
		'prettier.useEditorConfig': false,

		// ESLint
		'eslint.enable': true,
		'eslint.run': 'onSave',
		'eslint.format.enable': true,

		// Language-specific formatters
		'[javascript]': { 'editor.defaultFormatter': 'esbenp.prettier-vscode' },
		'[javascriptreact]': { 'editor.defaultFormatter': 'esbenp.prettier-vscode' },
		'[typescript]': { 'editor.defaultFormatter': 'esbenp.prettier-vscode' },
		'[typescriptreact]': { 'editor.defaultFormatter': 'esbenp.prettier-vscode' },
		'[css]': { 'editor.defaultFormatter': 'esbenp.prettier-vscode' },
		'[scss]': { 'editor.defaultFormatter': 'esbenp.prettier-vscode' },
		'[json]': { 'editor.defaultFormatter': 'esbenp.prettier-vscode' },
		'[markdown]': { 'editor.defaultFormatter': 'esbenp.prettier-vscode' },
		'[yaml]': { 'editor.defaultFormatter': 'esbenp.prettier-vscode' },

		// Search exclusions
		'search.exclude': {
			'**/node_modules': true,
			'**/build': true,
			'**/dist': true,
			'**/*.min.js': true,
			'**/vendor': true,
			'**/wp-content/uploads': true,
		},

		// File associations
		'files.associations': {
			'*.jsx': 'javascriptreact',
			'*.tsx': 'typescriptreact',
		},

		// Git
		'git.enableSmartCommit': true,
		'git.confirmSync': false,

		// Emmet
		'emmet.includeLanguages': {
			javascript: 'javascriptreact',
			typescript: 'typescriptreact',
		},
	};

	return JSON.stringify(settings, null, '\t');
};

// Generate Cursor settings
const generateCursorSettings = (config) => {
	// Helper function to get config value with fallback
	const getConfigValue = (key, fallback) => config[key] !== undefined ? config[key] : fallback;

	const useTabs = getConfigValue('INDENT_STYLE', 'space') === 'tab';
	const tabWidth = parseInt(getConfigValue('INDENT_SIZE', '2')) || 2;
	const printWidth = parseInt(getConfigValue('PRINT_WIDTH', '80')) || 80;
	const formatOnSave = getConfigValue('FORMAT_ON_SAVE', 'false') === 'true';
	const formatOnPaste = getConfigValue('FORMAT_ON_PASTE', 'false') === 'true';
	const eslintAutoFix = getConfigValue('ESLINT_AUTO_FIX', 'true') === 'true';
	const wordWrap = getConfigValue('WORD_WRAP', 'off');

	const settings = {
		'editor.formatOnSave': formatOnSave,
		'editor.formatOnPaste': formatOnPaste,
		'editor.tabSize': tabWidth,
		'editor.insertSpaces': !useTabs,
		'editor.detectIndentation': false,
		'editor.wordWrap': wordWrap,
		'editor.wordWrapColumn': printWidth,
		'editor.rulers': [printWidth],
		'prettier.requireConfig': true,
		'prettier.configPath': '.formatter/.prettierrc.js',
		'eslint.enable': true,
		'eslint.format.enable': true,
		'editor.codeActionsOnSave': {
			'source.fixAll.eslint': eslintAutoFix,
			'source.organizeImports': true,
		},
		'[javascript]': { 'editor.defaultFormatter': 'esbenp.prettier-vscode' },
		'[javascriptreact]': { 'editor.defaultFormatter': 'esbenp.prettier-vscode' },
		'[typescript]': { 'editor.defaultFormatter': 'esbenp.prettier-vscode' },
		'[typescriptreact]': { 'editor.defaultFormatter': 'esbenp.prettier-vscode' },
		'[css]': { 'editor.defaultFormatter': 'esbenp.prettier-vscode' },
		'[scss]': { 'editor.defaultFormatter': 'esbenp.prettier-vscode' },
		'[json]': { 'editor.defaultFormatter': 'esbenp.prettier-vscode' },
		'[markdown]': { 'editor.defaultFormatter': 'esbenp.prettier-vscode' },
		'[yaml]': { 'editor.defaultFormatter': 'esbenp.prettier-vscode' },
	};

	return JSON.stringify(settings, null, '\t');
};

// Generate .gitattributes for consistent line endings
const generateGitAttributes = () => {
	return `# Generated from FORMATTER_CONFIG.md
# Ensure consistent line endings

# Text files
*.js text eol=lf
*.jsx text eol=lf
*.ts text eol=lf
*.tsx text eol=lf
*.css text eol=lf
*.scss text eol=lf
*.json text eol=lf
*.md text eol=lf
*.yml text eol=lf
*.yaml text eol=lf

# Binary files
*.png binary
*.jpg binary
*.jpeg binary
*.gif binary
*.ico binary
*.woff binary
*.woff2 binary
*.ttf binary
*.eot binary`;
};

// Main sync function
const sync = () => {
	console.log('🚀 Syncing from FORMATTER_CONFIG.md...');

	// Check dependencies first
	if (!checkDependencies()) {
		console.log('❌ Dependency check failed. Please install missing packages.');
		process.exit(1);
	}

	const config = readConfig();

	// Validate safety settings
	if (!validateSafety(config)) {
		console.log('❌ Safety validation failed. Please check FORMATTER_CONFIG.md');
		process.exit(1);
	}

	// Generate config files
	const prettierConfig = generatePrettierConfig(config);
	const eslintConfig = generateESLintConfig(config);
	const editorConfig = generateEditorConfig(config);
	const prettierIgnore = generatePrettierIgnore();
	const gitAttributes = generateGitAttributes();
	const vscodeSettings = generateVSCodeSettings(config);
	const cursorSettings = generateCursorSettings(config);

	// Write all files with error handling
	const files = [
		{ path: '.formatter/.prettierrc.js', content: prettierConfig },
		{ path: '.formatter/.eslintrc.js', content: eslintConfig },
		{ path: '.formatter/.editorconfig', content: editorConfig },
		{ path: '.formatter/.prettierignore', content: prettierIgnore },
		{ path: '.gitattributes', content: gitAttributes },
		{ path: '.vscode/settings.json', content: vscodeSettings },
		{ path: '.cursor/settings.json', content: cursorSettings },
	];

	let successCount = 0;
	files.forEach(({ path, content }) => {
		if (safeWriteFile(path, content)) {
			successCount++;
		}
	});

	if (successCount === files.length) {
		console.log(`📋 Settings: ${config.PRINT_WIDTH} width, ${config.INDENT_STYLE}(${config.INDENT_SIZE}), ${config.USE_SINGLE_QUOTES === 'true' ? 'single' : 'double'} quotes`);
		console.log('✅ Updated: .formatter/ configs (.eslintrc.js, .prettierrc.js), IDE settings');
		console.log('🎯 Target: src folder only');
		console.log('🛡️ File Safety: Enabled - No files will be deleted');
		console.log('💡 Commands: pnpm run format | pnpm run lint:fix | pnpm run format:all');
		console.log('📁 Architecture: Simplified single-location (.formatter/ only) with integrated validation');
	} else {
		console.log(`⚠️  Warning: ${files.length - successCount} files failed to write`);
		process.exit(1);
	}
};

if (require.main === module) sync();
module.exports = { sync };
