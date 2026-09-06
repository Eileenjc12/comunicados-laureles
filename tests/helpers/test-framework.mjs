/**
 * Zero-Dependency Test Framework for Urbanización Los Laureles
 * Provides describe, it, lifecycle hooks, and reporting for Node.js native ESM.
 */

import assert from 'node:assert/strict';

class TestRunner {
  constructor() {
    this.suites = [];
    this.currentSuite = null;
    this.stats = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      durationMs: 0
    };
  }

  describe(suiteName, fn) {
    const parentSuite = this.currentSuite;
    const suite = {
      name: suiteName,
      tests: [],
      beforeEachHooks: [],
      afterEachHooks: [],
      beforeAllHooks: [],
      afterAllHooks: [],
      parent: parentSuite
    };

    if (parentSuite) {
      parentSuite.suites = parentSuite.suites || [];
      parentSuite.suites.push(suite);
    } else {
      this.suites.push(suite);
    }

    this.currentSuite = suite;
    try {
      fn();
    } finally {
      this.currentSuite = parentSuite;
    }
  }

  it(testName, fn) {
    if (!this.currentSuite) {
      throw new Error(`Test "${testName}" must be inside a describe block.`);
    }
    this.currentSuite.tests.push({
      name: testName,
      fn,
      status: 'pending',
      error: null,
      durationMs: 0
    });
  }

  beforeEach(fn) {
    if (this.currentSuite) {
      this.currentSuite.beforeEachHooks.push(fn);
    }
  }

  afterEach(fn) {
    if (this.currentSuite) {
      this.currentSuite.afterEachHooks.push(fn);
    }
  }

  beforeAll(fn) {
    if (this.currentSuite) {
      this.currentSuite.beforeAllHooks.push(fn);
    }
  }

  afterAll(fn) {
    if (this.currentSuite) {
      this.currentSuite.afterAllHooks.push(fn);
    }
  }

  async run(options = {}) {
    const startTime = Date.now();
    const filter = options.filter ? new RegExp(options.filter, 'i') : null;

    console.log('\n======================================================');
    console.log('   URBANIZACIÓN LOS LAURELES — TEST RUNNER (E2E)');
    console.log('======================================================\n');

    for (const suite of this.suites) {
      await this._runSuite(suite, filter, options);
    }

    this.stats.durationMs = Date.now() - startTime;
    this._printSummary();

    return this.stats.failed === 0;
  }

  async _runSuite(suite, filter, options, indent = '  ') {
    console.log(`${indent}\x1b[1m\x1b[36m▼ ${suite.name}\x1b[0m`);

    for (const hook of suite.beforeAllHooks) {
      await hook();
    }

    for (const test of suite.tests) {
      if (filter && !filter.test(`${suite.name} ${test.name}`)) {
        this.stats.skipped++;
        continue;
      }

      this.stats.total++;
      const testStart = Date.now();

      // Collect all beforeEach hooks up the tree
      const beforeHooks = this._collectBeforeEachHooks(suite);
      const afterHooks = this._collectAfterEachHooks(suite);

      try {
        for (const bh of beforeHooks) {
          await bh();
        }

        await test.fn();
        test.durationMs = Date.now() - testStart;
        test.status = 'passed';
        this.stats.passed++;
        console.log(`${indent}  \x1b[32m✔\x1b[0m ${test.name} \x1b[90m(${test.durationMs}ms)\x1b[0m`);
      } catch (err) {
        test.durationMs = Date.now() - testStart;
        test.status = 'failed';
        test.error = err;
        this.stats.failed++;
        console.log(`${indent}  \x1b[31m✖ ${test.name}\x1b[0m \x1b[90m(${test.durationMs}ms)\x1b[0m`);
        console.log(`${indent}    \x1b[31m${err.message}\x1b[0m`);
        if (options.verbose && err.stack) {
          console.log(`\x1b[90m${err.stack.split('\n').slice(1, 4).join('\n')}\x1b[0m`);
        }
      } finally {
        for (const ah of afterHooks) {
          try {
            await ah();
          } catch (hookErr) {
            console.error(`Error in afterEach hook: ${hookErr.message}`);
          }
        }
      }
    }

    if (suite.suites) {
      for (const childSuite of suite.suites) {
        await this._runSuite(childSuite, filter, options, indent + '  ');
      }
    }

    for (const hook of suite.afterAllHooks) {
      await hook();
    }

    console.log('');
  }

  _collectBeforeEachHooks(suite) {
    const hooks = [];
    let cur = suite;
    while (cur) {
      if (cur.beforeEachHooks) {
        hooks.unshift(...cur.beforeEachHooks);
      }
      cur = cur.parent;
    }
    return hooks;
  }

  _collectAfterEachHooks(suite) {
    const hooks = [];
    let cur = suite;
    while (cur) {
      if (cur.afterEachHooks) {
        hooks.push(...cur.afterEachHooks);
      }
      cur = cur.parent;
    }
    return hooks;
  }

  _printSummary() {
    console.log('------------------------------------------------------');
    console.log(`TOTAL:   ${this.stats.total}`);
    console.log(`PASSED:  \x1b[32m${this.stats.passed}\x1b[0m`);
    if (this.stats.failed > 0) {
      console.log(`FAILED:  \x1b[31m${this.stats.failed}\x1b[0m`);
    } else {
      console.log(`FAILED:  0`);
    }
    if (this.stats.skipped > 0) {
      console.log(`SKIPPED: ${this.stats.skipped}`);
    }
    console.log(`TIME:    ${this.stats.durationMs} ms`);
    console.log('------------------------------------------------------');

    if (this.stats.failed === 0) {
      console.log('\x1b[32m✔ ALL SUITES PASSED SUCCESSFULLY!\x1b[0m\n');
    } else {
      console.log('\x1b[31m✖ TEST FAILURES ENCOUNTERED.\x1b[0m\n');
    }
  }
}

export const runner = new TestRunner();
export const describe = runner.describe.bind(runner);
export const it = runner.it.bind(runner);
export const beforeEach = runner.beforeEach.bind(runner);
export const afterEach = runner.afterEach.bind(runner);
export const beforeAll = runner.beforeAll.bind(runner);
export const afterAll = runner.afterAll.bind(runner);
export { assert };
