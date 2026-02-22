import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import problemRoutes from './routes/problems.js';
import contestRoutes from './routes/contests.js';
import submissionRoutes from './routes/submissions.js';
import explainRoutes from './routes/explain.js';
import hintRoutes from './routes/hint.js';
import editorialRoutes from './routes/editorial.js';
import leaderboardRoutes from './routes/leaderboard.js';
import roadmapRoutes from './routes/roadmap.js';
import mockInterviewRoutes from './routes/mockInterview.js';

dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/contests', contestRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/explain', explainRoutes);
app.use('/api/hint', hintRoutes);
app.use('/api/editorial', editorialRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/interview', mockInterviewRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
