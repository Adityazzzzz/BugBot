/**
 * sandboxRunner.js
 * Provides secure, timed execution sandboxes for JavaScript (in-VM scripting)
 * and Python (direct process execution). Enforces CPU/time constraints and static check filters.
 */
import vm from 'vm';
import { execFile } from 'child_process';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Static analysis rules to check for forbidden namespaces / modules
const FORBIDDEN_JS_KEYWORDS = ['process', 'require', 'child_process', 'fs', 'path', 'global', 'eval', 'Function'];
const FORBIDDEN_PY_KEYWORDS = [
  'import os', 'import sys', 'import subprocess', 'import shutil', 'import urllib', 'import requests', 'import socket',
  'from os', 'from sys', 'from subprocess', 'from shutil', 'eval(', 'exec(', 'open(', 'getattr(', 'globals(', 'locals('
];

/**
 * Sandboxed JavaScript runner using native VM module.
 */
export function runJavaScript(code, functionName, testCases) {
  // Static analysis guard
  for (const keyword of FORBIDDEN_JS_KEYWORDS) {
    if (code.includes(keyword)) {
      throw new Error(`Security Violation: Forbidden reference '${keyword}' detected in JavaScript code.`);
    }
  }

  const results = [];
  
  for (const tc of testCases) {
    let args, expected;
    try {
      args = JSON.parse(tc.input);
      expected = JSON.parse(tc.expectedOutput);
    } catch (e) {
      results.push({
        passed: false,
        input: tc.input,
        expected: tc.expectedOutput,
        got: null,
        error: `Invalid test case JSON format: ${e.message}`
      });
      continue;
    }

    const logs = [];
    const sandbox = {
      console: {
        log: (...msg) => logs.push(msg.map(m => typeof m === 'object' ? JSON.stringify(m) : String(m)).join(' ')),
        error: (...msg) => logs.push(msg.map(m => String(m)).join(' ')),
      },
      Math, Date, Array, Object, String, Number, Boolean, RegExp, JSON, Map, Set, Promise
    };

    try {
      // Create context and evaluate code
      const context = vm.createContext(sandbox);
      vm.runInContext(code, context, { timeout: 1000 });

      const fn = sandbox[functionName];
      if (typeof fn !== 'function') {
        results.push({
          passed: false,
          input: tc.input,
          expected: tc.expectedOutput,
          got: null,
          error: `Function '${functionName}' is not defined.`
        });
        continue;
      }

      const start = performance.now();
      // Run function execution under strict context timeout limit of 2000ms
      const runScript = new vm.Script(`${functionName}(...${JSON.stringify(args)})`);
      const output = runScript.runInContext(context, { timeout: 2000 });
      const end = performance.now();

      const duration = Math.round((end - start) * 100) / 100;
      const gotJSON = JSON.stringify(output);
      const expectedJSON = JSON.stringify(expected);
      const passed = gotJSON === expectedJSON;

      results.push({
        passed,
        input: tc.input,
        expected: tc.expectedOutput,
        got: gotJSON,
        duration,
        logs: logs.join('\n')
      });
    } catch (err) {
      results.push({
        passed: false,
        input: tc.input,
        expected: tc.expectedOutput,
        got: null,
        error: err.message,
        logs: logs.join('\n')
      });
    }
  }

  return results;
}

/**
 * Sandboxed Python runner spawning Python interpreter with execution limits.
 */
export async function runPython(code, functionName, testCases) {
  // Static analysis guard
  for (const keyword of FORBIDDEN_PY_KEYWORDS) {
    if (code.includes(keyword)) {
      throw new Error(`Security Violation: Forbidden reference '${keyword}' detected in Python code.`);
    }
  }

  const results = [];
  const tempDir = path.join(process.cwd(), 'temp_runner');
  
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  for (const tc of testCases) {
    const fileId = crypto.randomBytes(8).toString('hex');
    const tempFile = path.join(tempDir, `runner_${fileId}.py`);

    // Build the script wrapping student code and test execution
    const runnerScript = `
# Student Code
${code}

# Test Case Invocation
import json
import sys

try:
    args = json.loads(${JSON.stringify(tc.input)})
    result = ${functionName}(*args)
    print("RUNNER_OUTPUT:" + json.dumps(result))
except Exception as e:
    print("RUNNER_ERROR:" + str(e), file=sys.stderr)
    sys.exit(1)
`;

    fs.writeFileSync(tempFile, runnerScript, 'utf8');

    const result = await new Promise((resolve) => {
      const start = performance.now();
      // Run Python child process directly without spawning a shell, with 2000ms timeout
      execFile('python', [tempFile], { timeout: 2000 }, (error, stdout, stderr) => {
        const end = performance.now();
        const duration = Math.round((end - start) * 100) / 100;
        
        // Clean up temp file
        try {
          if (fs.existsSync(tempFile)) {
            fs.unlinkSync(tempFile);
          }
        } catch (e) {
          // ignore cleanup errors
        }

        if (error && error.killed) {
          return resolve({
            passed: false,
            input: tc.input,
            expected: tc.expectedOutput,
            got: null,
            error: 'Execution Timed Out (2000ms limit reached)'
          });
        }

        if (error) {
          return resolve({
            passed: false,
            input: tc.input,
            expected: tc.expectedOutput,
            got: null,
            error: stderr.trim() || error.message
          });
        }

        // Parse stdout
        const lines = stdout.split('\n');
        let gotJSON = null;
        let consoleLogs = [];

        for (const line of lines) {
          if (line.startsWith('RUNNER_OUTPUT:')) {
            gotJSON = line.substring('RUNNER_OUTPUT:'.length).trim();
          } else if (line.trim()) {
            consoleLogs.push(line.trim());
          }
        }

        try {
          const expectedJSON = JSON.stringify(JSON.parse(tc.expectedOutput));
          const parsedGot = gotJSON ? JSON.stringify(JSON.parse(gotJSON)) : null;
          const passed = gotJSON !== null && parsedGot === expectedJSON;

          resolve({
            passed,
            input: tc.input,
            expected: tc.expectedOutput,
            got: gotJSON,
            duration,
            logs: consoleLogs.join('\n')
          });
        } catch (e) {
          resolve({
            passed: false,
            input: tc.input,
            expected: tc.expectedOutput,
            got: gotJSON,
            error: `Failed to parse output JSON: ${e.message}`,
            logs: consoleLogs.join('\n')
          });
        }
      });
    });

    results.push(result);
  }

  return results;
}

/**
 * Universal runner that handles multiple languages.
 */
export async function runCode(code, language, functionName, testCases) {
  if (language === 'javascript') {
    return runJavaScript(code, functionName, testCases);
  } else if (language === 'python') {
    return await runPython(code, functionName, testCases);
  } else {
    throw new Error(`Unsupported programming language: ${language}`);
  }
}
