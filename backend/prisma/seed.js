import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with coding problems and default users...');

  // Create default Student and Teacher users for testing
  const student = await prisma.user.upsert({
    where: { username: 'Aditya Singh' },
    update: {},
    create: {
      username: 'Aditya Singh',
      role: 'STUDENT',
    },
  });

  const teacher = await prisma.user.upsert({
    where: { username: 'Dr. Kamal Das' },
    update: {},
    create: {
      username: 'Dr. Kamal Das',
      role: 'TEACHER',
    },
  });

  console.log(`Created users: student(${student.username}), teacher(${teacher.username})`);
  
  // Problem 1: Two Sum
  await prisma.problem.upsert({
    where: { id: 'problem-two-sum' },
    update: {},
    create: {
      id: 'problem-two-sum',
      title: 'Two Sum',
      difficulty: 'EASY',
      description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\n### Example 1:\n**Input:** nums = [2,7,11,15], target = 9  \n**Output:** [0,1]  \n**Explanation:** Because nums[0] + nums[1] == 9, we return [0, 1].',
      boilerplateJs: `function twoSum(nums, target) {
  // Write your code here
  
}`,
      boilerplatePy: `def twoSum(nums, target):
    # Write your code here
    pass`,
      testCases: JSON.stringify([
        { input: '[[2, 7, 11, 15], 9]', expectedOutput: '[0, 1]' },
        { input: '[[3, 2, 4], 6]', expectedOutput: '[1, 2]' },
        { input: '[[3, 3], 6]', expectedOutput: '[0, 1]' }
      ]),
    },
  });

  // Problem 2: Palindrome Number
  await prisma.problem.upsert({
    where: { id: 'problem-palindrome-number' },
    update: {},
    create: {
      id: 'problem-palindrome-number',
      title: 'Palindrome Number',
      difficulty: 'EASY',
      description: 'Given an integer `x`, return `true` if `x` is a palindrome, and `false` otherwise.\n\nAn integer is a palindrome when it reads the same backward as forward (e.g., 121 is a palindrome, while 123 is not).\n\n### Example 1:\n**Input:** x = 121  \n**Output:** true  \n**Explanation:** 121 reads as 121 from left to right and from right to left.',
      boilerplateJs: `function isPalindrome(x) {
  // Write your code here
  
}`,
      boilerplatePy: `def isPalindrome(x):
    # Write your code here
    pass`,
      testCases: JSON.stringify([
        { input: '[121]', expectedOutput: 'true' },
        { input: '[-121]', expectedOutput: 'false' },
        { input: '[10]', expectedOutput: 'false' }
      ]),
    },
  });

  // Problem 3: Reverse String
  await prisma.problem.upsert({
    where: { id: 'problem-reverse-string' },
    update: {},
    create: {
      id: 'problem-reverse-string',
      title: 'Reverse String',
      difficulty: 'EASY',
      description: 'Write a function that reverses a string. The input string is given as an array of characters `s`.\n\nYou must modify the input array in-place or return the reversed array of characters.\n\n### Example 1:\n**Input:** s = ["h","e","l","l","o"]  \n**Output:** ["o","l","l","e","h"]',
      boilerplateJs: `function reverseString(s) {
  // Write your code here
  
}`,
      boilerplatePy: `def reverseString(s):
    # Write your code here
    pass`,
      testCases: JSON.stringify([
        { input: '[["h","e","l","l","o"]]', expectedOutput: '["o","l","l","e","h"]' },
        { input: '[["H","a","n","n","a","h"]]', expectedOutput: '["h","a","n","n","a","H"]' }
      ]),
    },
  });

  console.log('Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
