/**
 * submissionRoutes.js
 * Routes for executing sample code runs, grading submissions, and querying history.
 */
import express from 'express';
import { 
  runSampleCode, 
  submitStudentCode, 
  getStudentSubmissions, 
  getAllSubmissions 
} from '../controllers/submissionController.js';

const router = express.Router();

router.post('/run', runSampleCode);
router.post('/submit', submitStudentCode);
router.get('/student/:studentId', getStudentSubmissions);
router.get('/', getAllSubmissions);

export default router;
