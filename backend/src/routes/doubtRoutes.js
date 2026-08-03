import express from 'express';
import { 
  postStudentDoubt, 
  getProblemDoubts, 
  getPendingDrafts, 
  reviewDraftAnswer 
} from '../controllers/doubtController.js';

const router = express.Router();

router.post('/', postStudentDoubt);
router.get('/problem/:problemId', getProblemDoubts);
router.get('/pending', getPendingDrafts);
router.put('/review/:id', reviewDraftAnswer);

export default router;
