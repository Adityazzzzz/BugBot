import prisma from '../config/db.js';

export async function getAllProblems(req, res) {
  try {
    const problems = await prisma.problem.findMany({
      select: {
        id: true,
        title: true,
        difficulty: true,
        description: true,
        createdAt: true,
      },
    });
    return res.json(problems);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve problems: ' + error.message });
  }
}

export async function getProblemById(req, res) {
  try {
    const { id } = req.params;
    const problem = await prisma.problem.findUnique({
      where: { id },
    });

    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    return res.json(problem);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve problem: ' + error.message });
  }
}
