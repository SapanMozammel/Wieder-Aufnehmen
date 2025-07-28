# 🎛️ Formatter Configuration Examples

Ready-to-use configuration examples for different development needs. Copy any config block and paste it into `FORMATTER_CONFIG.md`, then run `pnpm run sync`.

---

## 📋 **Standard (Recommended)**

```config
# Basic Formatting
PRINT_WIDTH=100
INDENT_STYLE=space
INDENT_SIZE=2
USE_SINGLE_QUOTES=true
USE_SEMICOLONS=true
TRAILING_COMMA=es5

# Advanced Formatting
BRACKET_SPACING=true
ARROW_PARENS=avoid
END_OF_LINE=lf
BRACKET_SAME_LINE=false
PROSE_WRAP=preserve

# File-Specific Settings
CSS_SINGLE_QUOTES=true
JSON_TRAILING_COMMA=none
MARKDOWN_PROSE_WRAP=always
YAML_INDENT_STYLE=space
YAML_INDENT_SIZE=2

# TypeScript Settings
TS_STRICT_MODE=true
TS_NO_UNUSED_LOCALS=error
TS_NO_UNUSED_PARAMETERS=error
TS_EXPLICIT_FUNCTION_RETURN_TYPE=off
TS_NO_EXPLICIT_ANY=warn
TS_PREFER_NULLISH_COALESCING=error
TS_PREFER_OPTIONAL_CHAIN=error

# Code Quality
MAX_LINE_LENGTH=100
NO_CONSOLE=warn
NO_DEBUGGER=error
NO_UNUSED_VARS=error
PREFER_CONST=error
NO_VAR=error
EQEQEQ=error

# Next.js/React Specific
NEXT_CORE_WEB_VITALS=true
REACT_HOOKS_EXHAUSTIVE_DEPS=warn
REACT_JSX_NO_TARGET_BLANK=error
JSX_SINGLE_QUOTE=true
JSX_BRACKET_SAME_LINE=false

# Editor Behavior
FORMAT_ON_SAVE=true
FORMAT_ON_PASTE=true
ESLINT_AUTO_FIX=true
INSERT_FINAL_NEWLINE=true
TRIM_TRAILING_WHITESPACE=true

# File Safety (DO NOT CHANGE)
SAFE_MODE=true
PRESERVE_FILES=true
NO_FILE_DELETION=true
SRC_ONLY=true
```

**Best for**: Most Next.js projects, balanced rules, team development

---

## 📋 **Strict (Enterprise)**

```config
# Basic Formatting
PRINT_WIDTH=120
INDENT_STYLE=space
INDENT_SIZE=2
USE_SINGLE_QUOTES=false
USE_SEMICOLONS=true
TRAILING_COMMA=all

# Advanced Formatting
BRACKET_SPACING=true
ARROW_PARENS=always
END_OF_LINE=lf
BRACKET_SAME_LINE=false
PROSE_WRAP=preserve

# File-Specific Settings
CSS_SINGLE_QUOTES=false
JSON_TRAILING_COMMA=none
MARKDOWN_PROSE_WRAP=preserve
YAML_INDENT_STYLE=space
YAML_INDENT_SIZE=2

# TypeScript Settings
TS_STRICT_MODE=true
TS_NO_UNUSED_LOCALS=error
TS_NO_UNUSED_PARAMETERS=error
TS_EXPLICIT_FUNCTION_RETURN_TYPE=error
TS_NO_EXPLICIT_ANY=error
TS_PREFER_NULLISH_COALESCING=error
TS_PREFER_OPTIONAL_CHAIN=error

# Code Quality
MAX_LINE_LENGTH=120
NO_CONSOLE=error
NO_DEBUGGER=error
NO_UNUSED_VARS=error
PREFER_CONST=error
NO_VAR=error
EQEQEQ=error

# Next.js/React Specific
NEXT_CORE_WEB_VITALS=true
REACT_HOOKS_EXHAUSTIVE_DEPS=error
REACT_JSX_NO_TARGET_BLANK=error
JSX_SINGLE_QUOTE=false
JSX_BRACKET_SAME_LINE=false

# Editor Behavior
FORMAT_ON_SAVE=false
FORMAT_ON_PASTE=false
ESLINT_AUTO_FIX=false
INSERT_FINAL_NEWLINE=true
TRIM_TRAILING_WHITESPACE=true

# File Safety (DO NOT CHANGE)
SAFE_MODE=true
PRESERVE_FILES=true
NO_FILE_DELETION=true
SRC_ONLY=true
```

**Best for**: Large teams, enterprise applications, strict code quality

---

## 📋 **Relaxed (Development)**

```config
# Basic Formatting
PRINT_WIDTH=100
INDENT_STYLE=space
INDENT_SIZE=2
USE_SINGLE_QUOTES=true
USE_SEMICOLONS=false
TRAILING_COMMA=es5

# Advanced Formatting
BRACKET_SPACING=true
ARROW_PARENS=avoid
END_OF_LINE=lf
BRACKET_SAME_LINE=true
PROSE_WRAP=preserve

# File-Specific Settings
CSS_SINGLE_QUOTES=true
JSON_TRAILING_COMMA=none
MARKDOWN_PROSE_WRAP=preserve
YAML_INDENT_STYLE=space
YAML_INDENT_SIZE=2

# TypeScript Settings
TS_STRICT_MODE=false
TS_NO_UNUSED_LOCALS=warn
TS_NO_UNUSED_PARAMETERS=off
TS_EXPLICIT_FUNCTION_RETURN_TYPE=off
TS_NO_EXPLICIT_ANY=off
TS_PREFER_NULLISH_COALESCING=warn
TS_PREFER_OPTIONAL_CHAIN=warn

# Code Quality
MAX_LINE_LENGTH=100
NO_CONSOLE=off
NO_DEBUGGER=warn
NO_UNUSED_VARS=warn
PREFER_CONST=warn
NO_VAR=warn
EQEQEQ=warn

# Next.js/React Specific
NEXT_CORE_WEB_VITALS=true
REACT_HOOKS_EXHAUSTIVE_DEPS=warn
REACT_JSX_NO_TARGET_BLANK=warn
JSX_SINGLE_QUOTE=true
JSX_BRACKET_SAME_LINE=true

# Editor Behavior
FORMAT_ON_SAVE=true
FORMAT_ON_PASTE=true
ESLINT_AUTO_FIX=true
INSERT_FINAL_NEWLINE=true
TRIM_TRAILING_WHITESPACE=true

# File Safety (DO NOT CHANGE)
SAFE_MODE=true
PRESERVE_FILES=true
NO_FILE_DELETION=true
SRC_ONLY=true
```

**Best for**: Prototyping, personal projects, learning, flexible development

---

## 🚀 **Usage**

1. Copy any config block above
2. Paste into `.formatter/FORMATTER_CONFIG.md`
3. Run `pnpm run sync`
4. Done!
