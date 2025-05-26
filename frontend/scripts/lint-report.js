#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Running comprehensive code quality checks...\n');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function runCommand(command, description) {
  console.log(colorize(`📋 ${description}`, 'blue'));
  try {
    const output = execSync(command, { encoding: 'utf8', cwd: process.cwd() });
    console.log(colorize('✅ Passed', 'green'));
    return { success: true, output };
  } catch (error) {
    console.log(colorize('❌ Failed', 'red'));
    return {
      success: false,
      error: error.stdout || error.stderr || error.message,
    };
  }
}

function generateReport() {
  const results = [];

  // TypeScript type checking
  console.log(colorize('\n=== TypeScript Type Checking ===', 'bold'));
  const typeCheck = runCommand('npx tsc --noEmit', 'Checking TypeScript types');
  results.push({ name: 'TypeScript', ...typeCheck });

  // ESLint checking
  console.log(colorize('\n=== ESLint Code Quality ===', 'bold'));
  const lintCheck = runCommand('npx next lint --format json', 'Running ESLint');
  results.push({ name: 'ESLint', ...lintCheck });

  // Prettier formatting check
  console.log(colorize('\n=== Prettier Code Formatting ===', 'bold'));
  const formatCheck = runCommand(
    'npx prettier --check .',
    'Checking code formatting'
  );
  results.push({ name: 'Prettier', ...formatCheck });

  // Generate summary
  console.log(colorize('\n=== Summary ===', 'bold'));
  const passed = results.filter(r => r.success).length;
  const total = results.length;

  if (passed === total) {
    console.log(
      colorize(`🎉 All checks passed! (${passed}/${total})`, 'green')
    );
  } else {
    console.log(
      colorize(
        `⚠️  ${total - passed} check(s) failed (${passed}/${total} passed)`,
        'yellow'
      )
    );

    // Show detailed errors
    results.forEach(result => {
      if (!result.success) {
        console.log(colorize(`\n❌ ${result.name} Issues:`, 'red'));
        console.log(result.error);
      }
    });
  }

  // Generate JSON report
  const reportPath = path.join(process.cwd(), 'lint-report.json');
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total,
      passed,
      failed: total - passed,
    },
    results,
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(colorize(`\n📄 Detailed report saved to: ${reportPath}`, 'cyan'));

  return passed === total;
}

// Run the report
const success = generateReport();
process.exit(success ? 0 : 1);
