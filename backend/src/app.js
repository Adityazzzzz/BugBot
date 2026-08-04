import express from 'express';
import cors from 'cors';
import problemRoutes from './routes/problemRoutes.js';
import submissionRoutes from './routes/submissionRoutes.js';
import doubtRoutes from './routes/doubtRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/problems',problemRoutes);
app.use('/api/submissions',submissionRoutes);
app.use('/api/doubts',doubtRoutes);
app.use('/api/users',userRoutes);

app.get('/',(req,res) => {
  res.json({message: 'LMS Grading and Doubt Resolution Portal API is running.'});
});

app.use((err,req,res,next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong on the server: ' + err.message });
});

export default app;
