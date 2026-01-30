# Biome Migration Summary

## Changes Made

### 1. Removed ESLint and Prettier
- Deleted `.eslintrc.json`
- Removed packages from `devDependencies`:
  - `eslint`
  - `eslint-config-next`
  - `prettier`
  - `prettier-plugin-tailwindcss`

### 2. Installed Biome
- Added `@biomejs/biome@^1.9.4` to `devDependencies`

### 3. Created Configuration Files

**`biome.json`** - Main configuration:
- VCS integration (Git)
- Formatter with tab indentation, 100 char line width
- Linter with recommended rules + customizations:
  - Unused variables/imports as warnings (not errors)
  - Allows `console.log` in Convex files
  - Allows default exports in Next.js pages/layouts
  - Disables `noDefaultExport` for config files
  - Accessibility rules enabled
  - Performance and security rules enabled
- Import organization enabled
- CSS formatting enabled
- **Note**: `tailwindDirectives` CSS parser option is only available in Biome v2.x

**`.vscode/settings.json`** - VS Code integration:
- Biome as default formatter for all file types
- Format on save enabled
- Import organization on save

**`.vscode/extensions.json`** - Recommended extensions:
- Biome extension
- Tailwind CSS extension
- EditorConfig extension

### 4. Updated Package Scripts
```json
{
  "lint": "biome check .",
  "lint:fix": "biome check --write .",
  "format": "biome format --write .",
  "format:check": "biome format ."
}
```

### 5. Formatted All Files
- Ran `pnpm exec biome format --write .`
- All 141 files formatted successfully

## Available Commands

- `pnpm lint` - Check all files (lint + format)
- `pnpm lint:fix` - Fix all auto-fixable issues
- `pnpm format` - Format all files
- `pnpm format:check` - Check formatting without writing

## VS Code Integration

1. Install the Biome extension
2. Format on save is enabled by default
3. Uses Biome for all file types (JS, TS, JSX, TSX, JSON, CSS)

## Tailwind CSS Support

**Note**: Full Tailwind directive support (like `@apply`, `@tailwind`, etc.) is available in Biome v2.x. The current v1.9.4 can format CSS files but may show warnings for Tailwind-specific syntax. This is a known limitation that will be resolved when upgrading to Biome v2.x.

To suppress these warnings temporarily:
- Add `// biome-ignore lint/correctness/noUnknownAtRules: Tailwind directive` before CSS rules
- Or upgrade to Biome v2.x when stable (currently in beta)

## Migration Complete

All ESLint and Prettier configuration has been replaced with Biome. The project now uses a single tool for linting, formatting, and import organization.
