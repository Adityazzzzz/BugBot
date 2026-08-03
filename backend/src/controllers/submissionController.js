/**
 * submissionController.js
 * Controller handling sandboxed compilation runs, grading submissions, and AI reviews.
 */
import prisma from '../config/db.js';
import { runCode } from '../services/sandboxRunner.js';
import { checkPromptInjection, generateCodeFeedback } from '../services/aiService.js';

/**
 * Run student code against sample cases (does not save to DB)
 */
export async function runSampleCode(req, res) {
  try {
    const { problemId, code, language } = req.body;

    if (!problemId || !code || !language) {
      return res.status(400).json({ error: 'Missing required parameters: problemId, code, language' });
    }

    const problem = await prisma.problem.findUnique({ where: { id: problemId } });
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    const testCases = JSON.parse(problem.testCases);
    // For local running, run only the first test case as a sample
    const sampleCases = testCases.slice(0, 1);
    
    // Determine entry point function name depending on problem
    let functionName = 'solution';
    if (problemId === 'problem-two-sum') functionName = 'twoSum';
    else if (problemId === 'problem-palindrome-number') functionName = 'isPalindrome';
    else if (problemId === 'problem-reverse-string') functionName = 'reverseString';

    const results = await runCode(code, language, functionName, sampleCases);
    return res.json({ results });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to execute code: ' + error.message });
  }
}

/**
 * Submit student code, grade all cases, get AI review, and store submission
 */
export async function submitStudentCode(req, res) {
  try {
    const { problemId, studentId, code, language } = req.body;

    if (!problemId || !studentId || !code || !language) {
      return res.status(400).json({ error: 'Missing required parameters: problemId, studentId, code, language' });
    }

    // 1. Guard against prompt injection attacks
    const injectionCheck = await checkPromptInjection(code, 'code');
    if (injectionCheck.isInjected) {
      return res.status(400).json({
        error: 'Security Warning: Submission blocked due to suspected prompt injection or instruction override.',
        reason: injectionCheck.reason
      });
    }

    const problem = await prisma.problem.findUnique({ where: { id: problemId } });
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    const student = await prisma.user.findUnique({ where: { id: studentId } });
    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    const testCases = JSON.parse(problem.testCases);
    
    // Determine entry point function name
    let functionName = 'solution';
    if (problemId === 'problem-two-sum') functionName = 'twoSum';
    else if (problemId === 'problem-palindrome-number') functionName = 'isPalindrome';
    else if (problemId === 'problem-reverse-string') functionName = 'reverseString';

    // 2. Execute code in sandbox against all test cases
    const results = await runCode(code, language, functionName, testCases);

    // 3. Compute grading score
    const totalCases = results.length;
    const passedCases = results.filter(r => r.passed).length;
    const score = totalCases > 0 ? (passedCases / totalCases) * 100 : 0;
    const status = score === 100 ? 'COMPLETED' : 'FAILED';

    // 4. Generate AI feedback on code quality
    const aiFeedbackResult = await generateCodeFeedback(
      problem.title,
      problem.description,
      code,
      language,
      results
    );

    // 5. Store the submission in the DB
    const submission = await prisma.submission.create({
      data: {
        problemId,
        studentId,
        code,
        language,
        status,
        score,
        results: JSON.stringify(results),
        aiFeedback: JSON.stringify(aiFeedbackResult),
      },
      include: {
        problem: {
          select: { title: true }
        }
      }
    });

    return res.json(submission);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to process submission: ' + error.message });
  }
}

/**
 * Retrieve submission history for a student
 */
export async function getStudentSubmissions(req, res) {
  try {
    const { studentId } = req.params;
    const submissions = await prisma.submission.findMany({
      where: { studentId },
      include: {
        problem: {
          select: { title: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return res.json(submissions);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve history: ' + error.message });
  }
}

/**
 * Retrieve all submissions (Teacher only)
 */
export async function getAllSubmissions(req, res) {
  try {
    const submissions = await prisma.submission.findMany({
      include: {
        problem: {
          select: { title: true }
        },
        student: {
          select: { username: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return res.json(submissions);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve all submissions: ' + error.message });
  }
}
