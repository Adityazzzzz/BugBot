import prisma from '../config/db.js';
import { checkPromptInjection, draftDoubtAnswer } from '../services/aiService.js';

/**
 * Student posts a new doubt to the board.
 * Triggers background AI drafting, which starts in PENDING state.
 */
export async function postStudentDoubt(req, res) {
  try {
    const { problemId, studentId, title, content } = req.body;

    if (!problemId || !studentId || !title || !content) {
      return res.status(400).json({ error: 'Missing required parameters: problemId, studentId, title, content' });
    }

    // 1. Guard against prompt injection in doubt text
    const textToCheck = `${title} \n ${content}`;
    const injectionCheck = await checkPromptInjection(textToCheck, 'doubt');
    if (injectionCheck.isInjected) {
      return res.status(400).json({
        error: 'Security Warning: Post blocked due to suspected prompt injection or instruction override.',
        reason: injectionCheck.reason
      });
    }

    const problem = await prisma.problem.findUnique({ where: { id: problemId } });
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    // 2. Create the Doubt thread
    const doubt = await prisma.doubt.create({
      data: {
        problemId,
        studentId,
        title,
        content,
      },
      include: {
        student: { select: { username: true } },
        problem: { select: { title: true } }
      }
    });

    // 3. AI drafts an answer based on problem context and student's latest submission
    let studentCode = '';
    let studentLanguage = '';
    
    const latestSubmission = await prisma.submission.findFirst({
      where: { problemId, studentId },
      orderBy: { createdAt: 'desc' }
    });

    if (latestSubmission) {
      studentCode = latestSubmission.code;
      studentLanguage = latestSubmission.language;
    }

    // Call AI to draft answer
    const aiDraftResult = await draftDoubtAnswer(
      problem.title,
      problem.description,
      studentCode,
      studentLanguage,
      title,
      content
    );

    // Save AI Draft answer with status PENDING (hidden from students)
    await prisma.doubtAnswer.create({
      data: {
        doubtId: doubt.id,
        content: aiDraftResult.draftAnswer,
        status: 'PENDING',
      }
    });

    return res.json(doubt);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to post doubt: ' + error.message });
  }
}

/**
 * Retrieve doubts and their APPROVED answers for a problem
 */
export async function getProblemDoubts(req, res) {
  try {
    const { problemId } = req.params;

    const doubts = await prisma.doubt.findMany({
      where: problemId === 'all' ? {} : { problemId },
      include: {
        student: { select: { username: true } },
        problem: { select: { title: true } },
        answers: {
          where: { status: 'APPROVED' },
          include: {
            reviewer: { select: { username: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json(doubts);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve doubts: ' + error.message });
  }
}

/**
 * Retrieve pending AI drafts (Teacher review queue)
 */
export async function getPendingDrafts(req, res) {
  try {
    const pendingAnswers = await prisma.doubtAnswer.findMany({
      where: { status: 'PENDING' },
      include: {
        doubt: {
          include: {
            student: { select: { username: true } },
            problem: { select: { title: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json(pendingAnswers);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve pending drafts: ' + error.message });
  }
}

/**
 * Review, edit, approve, or reject an AI-drafted answer (Teacher workflow)
 */
export async function reviewDraftAnswer(req, res) {
  try {
    const { id } = req.params; // doubtAnswer ID
    const { status, content, reviewerId, reviewNotes } = req.body;

    if (!id || !status || !reviewerId) {
      return res.status(400).json({ error: 'Missing parameters: status, reviewerId' });
    }

    if (status !== 'APPROVED' && status !== 'REJECTED') {
      return res.status(400).json({ error: 'Invalid review status. Must be APPROVED or REJECTED.' });
    }

    const reviewer = await prisma.user.findUnique({ where: { id: reviewerId } });
    if (!reviewer || reviewer.role !== 'TEACHER') {
      return res.status(403).json({ error: 'Unauthorized: Only teachers can review drafts.' });
    }

    const currentDraft = await prisma.doubtAnswer.findUnique({ where: { id } });
    if (!currentDraft) {
      return res.status(404).json({ error: 'Draft answer not found.' });
    }

    // Update the answer record in the database
    const updatedAnswer = await prisma.doubtAnswer.update({
      where: { id },
      data: {
        status,
        content: content || currentDraft.content, // use edited content if provided
        reviewerId,
        reviewNotes: reviewNotes || null
      }
    });

    return res.json({ message: `Answer status updated to ${status} successfully.`, answer: updatedAnswer });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to review draft: ' + error.message });
  }
}
