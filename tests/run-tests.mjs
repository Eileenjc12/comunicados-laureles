#!/usr/bin/env node
/**
 * Automated Test Runner for Urbanización Los Laureles Test Suite
 * Zero-dependency ES module test runner using native Node.js.
 *
 * Usage:
 *   node tests/run-tests.mjs
 *   node tests/run-tests.mjs --tier=1
 *   node tests/run-tests.mjs --filter=whatsapp
 *   node tests/run-tests.mjs --verbose
 */

import { runner } from './helpers/test-framework.mjs';

// Parse command line arguments
const args = process.argv.slice(2);
let tierFilter = null;
let nameFilter = null;
let verbose = false;

for (const arg of args) {
  if (arg.startsWith('--tier=')) {
    tierFilter = arg.split('=')[1].trim();
  } else if (arg.startsWith('--filter=')) {
    nameFilter = arg.split('=')[1].trim();
  } else if (arg === '--verbose' || arg === '-v') {
    verbose = true;
  }
}

// Dynamically load test suites based on requested tier
async function loadSuites() {
  if (!tierFilter || tierFilter === '1') {
    await import('./e2e/tier1-features.test.mjs');
  }
  if (!tierFilter || tierFilter === '2') {
    await import('./e2e/tier2-boundary.test.mjs');
  }
  if (!tierFilter || tierFilter === '3') {
    await import('./e2e/tier3-cross-feature.test.mjs');
  }
  if (!tierFilter || tierFilter === '4') {
    await import('./e2e/tier4-real-world.test.mjs');
  }
  if (!tierFilter || tierFilter === '5') {
    await import('./e2e/tier5-adversarial.test.mjs');
  }
}

async function main() {
  try {
    await loadSuites();
    const passed = await runner.run({
      filter: nameFilter,
      verbose
    });

    if (!passed) {
      process.exit(1);
    }
  } catch (err) {
    console.error('\x1b[31mFatal error while running test suite:\x1b[0m', err);
    process.exit(1);
  }
}

main();
