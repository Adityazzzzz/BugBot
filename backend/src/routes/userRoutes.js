/**
 * userRoutes.js
 * Routes for listing mock test accounts for student/teacher switcher options.
 */
import express from 'express';
import prisma from '../config/db.js';

const router = express.Router();

// Retrieve all users (useful for selecting mock accounts on the UI)
router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch users: ' + error.message });
  }
});

export default router;
