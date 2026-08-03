import { runCode } from './sandboxRunner.js';

async function testJavaScript() {
  console.log("=== Testing JavaScript Sandbox ===");
  
  const testCases = [
    { input: "[2, 3]", expectedOutput: "5" },
    { input: "[-1, 10]", expectedOutput: "9" }
  ];

  // 1. Correct code
  console.log("\n1. Running correct JS code...");
  const correctCode = `
    function add(a, b) {
      console.log("Adding numbers", a, "and", b);
      return a + b;
    }
  `;
  const res1 = await runCode(correctCode, 'javascript', 'add', testCases);
  console.log("Results:", JSON.stringify(res1, null, 2));

  // 2. Syntax error code
  console.log("\n2. Running invalid JS syntax...");
  const badCode = `
    function add(a, b) {
      return a +
    }
  `;
  const res2 = await runCode(badCode, 'javascript', 'add', testCases);
  console.log("Results:", JSON.stringify(res2, null, 2));

  // 3. Infinite loop code
  console.log("\n3. Running infinite loop JS code...");
  const loopCode = `
    function add(a, b) {
      while(true) {}
      return a + b;
    }
  `;
  const res3 = await runCode(loopCode, 'javascript', 'add', testCases);
  console.log("Results:", JSON.stringify(res3, null, 2));

  // 4. Security violation code
  console.log("\n4. Running security violation JS code...");
  const hackCode = `
    function add(a, b) {
      const fs = require('fs');
      return a + b;
    }
  `;
  try {
    await runCode(hackCode, 'javascript', 'add', testCases);
    console.log("Fail: Security violation went undetected!");
  } catch (err) {
    console.log("Success: Security check blocked execution. Error:", err.message);
  }
}

async function testPython() {
  console.log("\n=== Testing Python Sandbox ===");
  
  const testCases = [
    { input: "[2, 3]", expectedOutput: "5" },
    { input: "[-1, 10]", expectedOutput: "9" }
  ];

  // 1. Correct code
  console.log("\n1. Running correct Python code...");
  const correctCode = `
def add(a, b):
    print(f"Adding {a} and {b}")
    return a + b
  `;
  const res1 = await runCode(correctCode, 'python', 'add', testCases);
  console.log("Results:", JSON.stringify(res1, null, 2));

  // 2. Syntax error code
  console.log("\n2. Running invalid Python syntax...");
  const badCode = `
def add(a, b):
    return a +
  `;
  const res2 = await runCode(badCode, 'python', 'add', testCases);
  console.log("Results:", JSON.stringify(res2, null, 2));

  // 3. Infinite loop code
  console.log("\n3. Running infinite loop Python code...");
  const loopCode = `
def add(a, b):
    while True:
        pass
    return a + b
  `;
  const res3 = await runCode(loopCode, 'python', 'add', testCases);
  console.log("Results:", JSON.stringify(res3, null, 2));

  // 4. Security violation code
  console.log("\n4. Running security violation Python code...");
  const hackCode = `
def add(a, b):
    import os
    return a + b
  `;
  try {
    await runCode(hackCode, 'python', 'add', testCases);
    console.log("Fail: Security violation went undetected!");
  } catch (err) {
    console.log("Success: Security check blocked execution. Error:", err.message);
  }
}

async function testEdgeCases() {
  console.log("\n=== Testing Sandbox Edge Cases ===");
  const testCases = [{ input: "[10, 0]", expectedOutput: "null" }];
  
  console.log("\n1. Division by zero check...");
  const divCode = `
    function divide(a, b) {
      if (b === 0) return null;
      return a / b;
    }
  `;
  const res = await runCode(divCode, 'javascript', 'divide', testCases);
  console.log("Results:", JSON.stringify(res, null, 2));
}

async function run() {
  try {
    await testJavaScript();
    await testPython();
    await testEdgeCases();
  } catch (e) {
    console.error("Test execution failed:", e);
  }
}

run();
