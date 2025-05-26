# Code Quality & Linting Setup

This project includes a comprehensive code quality setup with ESLint, Prettier, and TypeScript checking to ensure consistent, high-quality code during local development.

## 🛠️ Tools Included

- **ESLint**: JavaScript/TypeScript linting with Next.js optimized rules
- **Prettier**: Code formatting for consistent style
- **TypeScript**: Static type checking
- **Import sorting**: Automatic import organization

## 📋 Available Commands

### Basic Linting

```bash
# Run ESLint on all files
npm run lint

# Run ESLint and automatically fix issues
npm run lint:fix

# Run ESLint with zero tolerance for warnings
npm run lint:strict
```

### Code Formatting

```bash
# Format all files with Prettier
npm run format

# Check if files are properly formatted (without changing them)
npm run format:check
```

### Type Checking

```bash
# Run TypeScript type checking
npm run type-check
```

### Comprehensive Checks

```bash
# Run all checks (TypeScript, ESLint strict, Prettier)
npm run check-all

# Fix all auto-fixable issues (format + lint fix)
npm run fix-all

# Generate a detailed quality report
npm run quality-report
```

## 📊 Quality Report

The `npm run quality-report` command generates a comprehensive report that includes:

- ✅ TypeScript type checking results
- ✅ ESLint code quality analysis
- ✅ Prettier formatting verification
- 📄 JSON report saved to `lint-report.json`
- 🎨 Colorized console output

Example output:

```
🔍 Running comprehensive code quality checks...

=== TypeScript Type Checking ===
📋 Checking TypeScript types
✅ Passed

=== ESLint Code Quality ===
📋 Running ESLint
✅ Passed

=== Prettier Code Formatting ===
📋 Checking code formatting
✅ Passed

=== Summary ===
🎉 All checks passed! (3/3)

📄 Detailed report saved to: lint-report.json
```

## 🔧 ESLint Rules

Our ESLint configuration includes:

### TypeScript Rules

- No unused variables (with underscore prefix exception)
- Warn on explicit `any` usage
- Prefer `const` over `let`

### React Rules

- Require keys in JSX lists
- No duplicate props
- No undefined variables in JSX

### General Rules

- Warn on console statements
- Error on debugger statements
- No duplicate imports
- Strict equality checking (`===`)
- Consistent brace style

### Import Rules

- Automatic import sorting by type
- Newlines between import groups

## 🎨 Prettier Configuration

Our Prettier setup enforces:

- Semicolons
- Single quotes
- 80 character line width
- 2-space indentation
- Trailing commas where valid

## 🔄 Editor Integration

### VS Code Setup

The project includes VS Code configuration for:

- Format on save
- Auto-fix ESLint issues on save
- Organize imports on save
- Proper file associations for Tailwind CSS

### Recommended Extensions

- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense

## 🚀 CI/CD Integration

GitHub Actions workflow automatically runs:

- TypeScript type checking
- ESLint strict mode
- Prettier format checking
- Quality report generation

## 🐛 Troubleshooting

### Common Issues

1. **ESLint errors in editor but not in terminal**

   - Restart VS Code
   - Check that ESLint extension is enabled

2. **Prettier not formatting on save**

   - Ensure Prettier is set as default formatter
   - Check VS Code settings for format on save

3. **Import order errors**

   - Run `npm run lint:fix` to auto-fix import ordering

4. **TypeScript errors**
   - Run `npm run type-check` for detailed error information
   - Ensure all dependencies are properly typed

### Manual Fixes

If automatic fixes don't resolve all issues:

```bash
# Fix formatting issues
npm run format

# Fix linting issues
npm run lint:fix

# Check what still needs manual attention
npm run quality-report
```

## 📝 Best Practices

1. **Before committing**: Run `npm run check-all`
2. **During development**: Use `npm run fix-all` to quickly resolve issues
3. **For detailed analysis**: Use `npm run quality-report`
4. **In CI/CD**: Use `npm run lint:strict` for zero-tolerance checking

## 🔄 Updating Rules

To modify linting rules:

1. Edit `eslint.config.mjs` for ESLint rules
2. Edit `.prettierrc.json` for Prettier formatting
3. Test changes with `npm run quality-report`
