import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function importDataset() {
  const csvFilePath = path.join(process.cwd(), 'Leetcode.csv');
  
  if (!fs.existsSync(csvFilePath)) {
    console.error('Error: Leetcode.csv not found in backend directory!');
    process.exit(1);
  }

  console.log('Importing LeetCode dataset into database...');
  const records = [];

  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('data', (row) => {
      // Filter out invalid or empty rows
      if (row.Title && row.Difficulty) {
        records.push(row);
      }
    })
    .on('end', async () => {
      console.log(`Parsed ${records.length} records. Seeding top 50 problems...`);
      
      // Limit to top 50 algorithms/free problems to keep DB lightweight and fast
      const selected = records.slice(0, 50);

      for (const item of selected) {
        // Fallback formatting for boilerplate and test cases
        const problemId = `lc-${item.ID || Math.random().toString(36).substr(2, 9)}`;
        const title = item.Title.trim();
        const difficulty = (item.Difficulty || 'EASY').toUpperCase();
        
        let testCases = [];
        try {
          if (item['Example Test Cases']) {
            testCases = JSON.parse(item['Example Test Cases']);
          }
        } catch (e) {
          testCases = [{ input: 'Sample Input', expectedOutput: 'Sample Output' }];
        }

        const formattedTestCases = Array.isArray(testCases) && testCases.length > 0
          ? JSON.stringify(testCases)
          : JSON.stringify([{ input: '[1, 2, 3]', expectedOutput: '6' }]);

        await prisma.problem.upsert({
          where: { id: problemId },
          update: {},
          create: {
            id: problemId,
            title: title,
            difficulty: difficulty.includes('MEDIUM') ? 'MEDIUM' : difficulty.includes('HARD') ? 'HARD' : 'EASY',
            description: `**Topics:** ${item.Topics || 'Algorithms'}\n\n**Category:** ${item.Category || 'Algorithms'}\n\nLink to challenge: ${item.Link || '#'}`,
            boilerplateJs: `function solution(input) {\n  // Write your code here\n  return input;\n}`,
            boilerplatePy: `def solution(input):\n    # Write your code here\n    return input`,
            testCases: formattedTestCases
          }
        });
      }

      console.log('Successfully seeded database from Leetcode.csv!');
      await prisma.$disconnect();
    });
}

importDataset().catch((err) => {
  console.error('Failed to import dataset:', err);
  prisma.$disconnect();
});