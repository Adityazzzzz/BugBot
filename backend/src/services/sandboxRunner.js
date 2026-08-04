import vm from 'vm';
import { execFile } from 'child_process';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const JUDGE0_URL = process.env.JUDGE0_URL || 'https://judge0-ce.p.rapidapi.com/submissions';
const JUDGE0_KEY = process.env.JUDGE0_API_KEY;

const LANG_IDS = {
  javascript: 93,// Node.js 18.15.0
  python: 71,    // Python 3.8.1
  cpp: 54,       // GCC 9.2.0
};

function buildExecutionPayload(code,language,functionName,testCases){
  if(language === 'javascript'){
    return `
    ${code}

    const testCases = ${JSON.stringify(testCases)};
    const results = [];
    for(const tc of testCases){
      try{
        const args = JSON.parse(tc.input);
        const start = Date.now();
        const output = ${functionName}(...args);
        const end = Date.now();
        
        const passed = JSON.stringify(output) === JSON.stringify(JSON.parse(tc.expectedOutput));
        results.push({ passed,input: tc.input,expected: tc.expectedOutput,got: JSON.stringify(output),duration: end - start });
      } catch(e){
        results.push({ passed: false,input: tc.input,expected: tc.expectedOutput,got: null,error: e.message });
      }
    }
    console.log("RUNNER_OUTPUT_START");
    console.log(JSON.stringify(results));
    `;
      } else if(language === 'python'){
        return `
    import json
    import time
    import sys

    ${code}

    test_cases = json.loads('''${JSON.stringify(testCases)}''')
    results = []

    for tc in test_cases:
        try:
            args = json.loads(tc["input"])
            expected = json.loads(tc["expectedOutput"])
            
            start = time.time()
            output = ${functionName}(*args)
            end = time.time()
            
            passed = json.dumps(output) == json.dumps(expected)
            results.append({
                "passed": passed,
                "input": tc["input"],
                "expected": tc["expectedOutput"],
                "got": json.dumps(output),
                "duration": round((end - start) * 1000,2)
            })
        except Exception as e:
            results.append({
                "passed": False,
                "input": tc["input"],
                "expected": tc["expectedOutput"],
                "got": None,
                "error": str(e)
            })

    print("RUNNER_OUTPUT_START")
    print(json.dumps(results))
    `;
  }
}

async function runCloudJudge0(code,language,functionName,testCases){
  const sourceCode = buildExecutionPayload(code,language,functionName,testCases);
  
  const response = await fetch(`${JUDGE0_URL}?base64_encoded=false&wait=true`,{
    method: 'POST',
    headers:{
      'Content-Type': 'application/json',
      'X-RapidAPI-Key': JUDGE0_KEY,
      'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
    },
    body: JSON.stringify({
      language_id: LANG_IDS[language],
      source_code: sourceCode,
      cpu_time_limit: 2.0,
      memory_limit: 128000,
    })
  });

  if(!response.ok) throw new Error('Judge0 execution service unavailable.');
  
  const data = await response.json();
  
  if(data.status.id > 3){
    return testCases.map(tc =>({
      passed: false,
      input: tc.input,
      expected: tc.expectedOutput,
      got: null,
      error: data.compile_output || data.stderr || data.status.description
    }));
  }

  const stdout = data.stdout || '';
  if(stdout.includes('RUNNER_OUTPUT_START')){
    const jsonStr = stdout.split('RUNNER_OUTPUT_START')[1].trim();
    try{
      return JSON.parse(jsonStr);
    } 
    catch(e){
      throw new Error('Failed to parse structured output from container.');
    }
  }

  throw new Error('Container executed but returned malformed output.');
}

async function runLocalFallback(code,language,functionName,testCases){
  console.warn(`[Sandbox] Running local fallback for ${language}. Cloud execution bypassed.`);
  const results = [];
  
  if(language === 'javascript'){
    for(const tc of testCases){
      try{
        const args = JSON.parse(tc.input);
        const expected = JSON.parse(tc.expectedOutput);
        const sandbox ={ Math,Date,Array,Object,String,Number,Boolean,JSON };
        const context = vm.createContext(sandbox);
        
        vm.runInContext(code,context,{ timeout: 1000 });
        const fn = sandbox[functionName];
        
        if(typeof fn !== 'function') throw new Error(`Function '${functionName}' not defined.`);
        
        const start = performance.now();
        const runScript = new vm.Script(`${functionName}(...${JSON.stringify(args)})`);
        const output = runScript.runInContext(context,{ timeout: 2000 });
        const end = performance.now();

        const gotJSON = JSON.stringify(output);
        const expectedJSON = JSON.stringify(expected);
        results.push({ passed: gotJSON === expectedJSON,input: tc.input,expected: tc.expectedOutput,got: gotJSON,duration: end - start });
      } 
      catch(err){
        results.push({ passed: false,input: tc.input,expected: tc.expectedOutput,got: null,error: err.message });
      }
    }
    return results;
  } 
  
  const tempDir = path.join(process.cwd(),'temp_runner');
  if(!fs.existsSync(tempDir)) fs.mkdirSync(tempDir,{ recursive: true });
  
  const fileId = crypto.randomBytes(8).toString('hex');
  const tempFile = path.join(tempDir,`runner_${fileId}.py`);
  const runnerScript = buildExecutionPayload(code,language,functionName,testCases);
  
  fs.writeFileSync(tempFile,runnerScript,'utf8');

  return new Promise((resolve) =>{
    execFile('python',[tempFile],{ timeout: 2000 },(error,stdout,stderr) =>{
      try{ if(fs.existsSync(tempFile)) fs.unlinkSync(tempFile); } catch(e){}
      
      if(error || stderr){
        return resolve(testCases.map(tc =>({ passed: false,input: tc.input,expected: tc.expectedOutput,got: null,error: stderr || 'Execution Error' })));
      }
      
      try{
        const jsonStr = stdout.split('RUNNER_OUTPUT_START')[1].trim();
        resolve(JSON.parse(jsonStr));
      } 
      catch(e){
        resolve(testCases.map(tc =>({ passed: false,input: tc.input,expected: tc.expectedOutput,got: null,error: 'Failed to parse Python output' })));
      }
    });
  });
}


export async function runCode(code,language,functionName,testCases){
  if(JUDGE0_KEY){
    try{
      return await runCloudJudge0(code,language,functionName,testCases);
    } 
    catch(err){
      console.error(`[Sandbox API Error] ${err.message}. Triggering local fallback.`);
      return await runLocalFallback(code,language,functionName,testCases);
    }
  }
  else{
    return await runLocalFallback(code,language,functionName,testCases);
  }
}