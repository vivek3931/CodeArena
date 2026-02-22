import express from 'express';
import Problem from '../models/Problem.js';
import Submission from '../models/Submission.js';
import User from '../models/User.js';
import Contest from '../models/Contest.js';
import Groq from 'groq-sdk';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Initialize Groq client
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ----------------------------------------------------------------------
// Load Balancer / Concurrency Queue for AI Compiler
// ----------------------------------------------------------------------
// Prevent Groq API Rate Limiting by forcing submissions into an async queue.
// If 50 students submit code at once, they will only be sent to Groq
// 'concurrency' number of times concurrently. The rest wait harmlessly.
class AsyncQueue {
    constructor(concurrency = 3) {
        this.concurrency = concurrency;
        this.running = 0;
        this.queue = [];
    }

    add(taskFunction) {
        return new Promise((resolve, reject) => {
            this.queue.push({ taskFunction, resolve, reject });
            this.next();
        });
    }

    async next() {
        if (this.running >= this.concurrency || this.queue.length === 0) return;

        this.running++;
        const { taskFunction, resolve, reject } = this.queue.shift();

        try {
            const result = await taskFunction();
            resolve(result);
        } catch (error) {
            reject(error);
        } finally {
            this.running--;
            this.next(); // Trigger the next queued item recursively
        }
    }
}

// We globally allow 3 Groq evaluations to run in parallel.
const evaluationQueue = new AsyncQueue(3);

// ══════════════════════════════════════════════════════
//  Badge Definitions & Award Logic (Server-Side Only)
// ══════════════════════════════════════════════════════
const BADGE_DEFINITIONS = [
    { id: 'first_blood', name: 'First Blood', icon: '🩸', img: '/badges/first_blood.png', description: 'Solved your very first problem', condition: async (userId) => { const count = await Submission.countDocuments({ user: userId, status: 'Accepted' }); return count >= 1; } },
    { id: 'easy_5', name: 'Warm Up', icon: '🔥', img: '/badges/warm_up.png', description: 'Solved 5 Easy problems', condition: async (userId) => { const subs = await Submission.find({ user: userId, status: 'Accepted' }).populate('problem', 'difficulty'); const unique = new Set(); subs.forEach(s => { if (s.problem?.difficulty === 'Easy') unique.add(s.problem._id.toString()); }); return unique.size >= 5; } },
    { id: 'medium_5', name: 'Rising Star', icon: '⭐', img: '/badges/rising_star.png', description: 'Solved 5 Medium problems', condition: async (userId) => { const subs = await Submission.find({ user: userId, status: 'Accepted' }).populate('problem', 'difficulty'); const unique = new Set(); subs.forEach(s => { if (s.problem?.difficulty === 'Medium') unique.add(s.problem._id.toString()); }); return unique.size >= 5; } },
    { id: 'hard_3', name: 'Hard Crusher', icon: '💎', img: '/badges/hard_crusher.png', description: 'Solved 3 Hard problems', condition: async (userId) => { const subs = await Submission.find({ user: userId, status: 'Accepted' }).populate('problem', 'difficulty'); const unique = new Set(); subs.forEach(s => { if (s.problem?.difficulty === 'Hard') unique.add(s.problem._id.toString()); }); return unique.size >= 3; } },
    { id: 'ten_solved', name: 'Dedicated', icon: '🎯', img: '/badges/dedicated.png', description: 'Solved 10 unique problems', condition: async (userId) => { const subs = await Submission.find({ user: userId, status: 'Accepted' }); const unique = new Set(subs.map(s => s.problem.toString())); return unique.size >= 10; } },
    { id: 'twenty_five_solved', name: 'Warrior', icon: '⚔️', img: '/badges/warrior.png', description: 'Solved 25 unique problems', condition: async (userId) => { const subs = await Submission.find({ user: userId, status: 'Accepted' }); const unique = new Set(subs.map(s => s.problem.toString())); return unique.size >= 25; } },
    { id: 'fifty_solved', name: 'Veteran', icon: '🏅', img: '/badges/veteran.png', description: 'Solved 50 unique problems', condition: async (userId) => { const subs = await Submission.find({ user: userId, status: 'Accepted' }); const unique = new Set(subs.map(s => s.problem.toString())); return unique.size >= 50; } },
    { id: 'century', name: 'Centurion', icon: '💯', img: '/badges/centurion.png', description: 'Solved 100 unique problems', condition: async (userId) => { const subs = await Submission.find({ user: userId, status: 'Accepted' }); const unique = new Set(subs.map(s => s.problem.toString())); return unique.size >= 100; } },
    { id: 'points_1000', name: 'Point Collector', icon: '🪙', img: '/badges/point_collector.png', description: 'Accumulated 1,000 rating points', condition: async (userId) => { const user = await User.findById(userId); return user.rating >= 1000; } },
    { id: 'points_5000', name: 'Elite Coder', icon: '👑', img: '/badges/elite_coder.png', description: 'Accumulated 5,000 rating points', condition: async (userId) => { const user = await User.findById(userId); return user.rating >= 5000; } },
    { id: 'points_10000', name: 'Grandmaster', icon: '🏆', img: '/badges/grandmaster.png', description: 'Accumulated 10,000 rating points', condition: async (userId) => { const user = await User.findById(userId); return user.rating >= 10000; } },
    { id: 'hard_10', name: 'Beast Mode', icon: '🐉', img: '/badges/beast_mode.png', description: 'Solved 10 Hard problems', condition: async (userId) => { const subs = await Submission.find({ user: userId, status: 'Accepted' }).populate('problem', 'difficulty'); const unique = new Set(); subs.forEach(s => { if (s.problem?.difficulty === 'Hard') unique.add(s.problem._id.toString()); }); return unique.size >= 10; } },
];

async function checkAndAwardBadges(userId) {
    const user = await User.findById(userId);
    const existingBadgeIds = new Set(user.badges.map(b => b.id));
    const newBadges = [];

    for (const badge of BADGE_DEFINITIONS) {
        if (existingBadgeIds.has(badge.id)) continue;
        const earned = await badge.condition(userId);
        if (earned) {
            const awarded = { id: badge.id, name: badge.name, icon: badge.icon, img: badge.img, description: badge.description, earnedAt: new Date() };
            newBadges.push(awarded);
        }
    }

    if (newBadges.length > 0) {
        await User.findByIdAndUpdate(userId, { $push: { badges: { $each: newBadges } } });
    }

    return newBadges;
}

// @desc    Evaluate code submission using Groq AI and track in DB
// @route   POST /api/submissions/:problemId
// @access  Private
router.post('/:problemId', protect, async (req, res) => {
    try {
        const { problemId } = req.params;
        const { code } = req.body;

        if (!code) {
            return res.status(400).json({ status: 'Error', message: 'Code is required.' });
        }

        if (!process.env.GROQ_API_KEY) {
            return res.status(500).json({ status: 'Error', message: 'Groq API Key is missing on the server.' });
        }

        // Fetch the problem
        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ status: 'Error', message: 'Problem not found.' });
        }

        // Prepare test cases string
        const testCasesString = problem.testCases.map((tc, idx) =>
            `Test Case ${idx + 1}:\nInput: ${tc.input}\nExpected Output: ${tc.expectedOutput}\n`
        ).join('\n');

        // Formulate prompt
        const prompt = `You are an expert programming judge. You are evaluating a user's code submission for a coding problem.
        
Problem Title: ${problem.title}
Problem Description: ${problem.description}

Test Cases to pass:
${testCasesString}

User's Code:
\`\`\`
${code}
\`\`\`

Analyze the code and evaluate if its logic effectively solves the problem and passes all test cases (both explicitly listed and general edge cases). You do not need to execute the code, just perform a deep static analysis of the logic. The user can write in any language, infer the language automatically.

Respond strictly with a JSON object in the following format. DO NOT wrap the JSON in markdown blocks (e.g., no \`\`\`json). Just the raw JSON string:
{
  "status": "Accepted" | "Wrong Answer" | "Compile Error",
  "language": "The inferred programming language, e.g., Python 3, C++ 17, Java, JavaScript",
  "message": "A brief explanation of why it failed or a congratulatory message if it passed."
}
`;

        // Process AI Evaluation through our Concurrency Queue to prevent 429 Rate Limits
        const chatCompletion = await evaluationQueue.add(async () => {
            return await groq.chat.completions.create({
                messages: [
                    {
                        role: 'system',
                        content: 'You are a strict but helpful AI coding judge that only outputs raw JSON.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    }
                ],
                model: 'llama-3.3-70b-versatile',
                temperature: 0.1,
                max_completion_tokens: 500,
                response_format: { type: 'json_object' }
            });
        });

        const aiResponse = chatCompletion.choices[0]?.message?.content;

        try {
            const parsedResponse = JSON.parse(aiResponse);

            // ── Points Calculation ──
            const POINTS_MAP = { 'Easy': 250, 'Medium': 400, 'Hard': 650 };
            let earnedPoints = 0;

            if (parsedResponse.status === 'Accepted') {
                // Only award points if user hasn't already solved this problem
                const alreadySolved = await Submission.findOne({
                    user: req.user._id,
                    problem: problemId,
                    status: 'Accepted'
                });

                if (!alreadySolved) {
                    earnedPoints = POINTS_MAP[problem.difficulty] || 0;
                    // Atomically update user's global rating
                    if (earnedPoints > 0) {
                        await User.findByIdAndUpdate(req.user._id, {
                            $inc: { rating: earnedPoints }
                        });
                    }
                }
            }

            // Save the submission record to the database
            const submission = new Submission({
                user: req.user._id,
                problem: problemId,
                code: code,
                language: parsedResponse.language || 'Auto-Inferred',
                status: parsedResponse.status,
                message: parsedResponse.message,
                points: earnedPoints
            });
            await submission.save();

            // ── Badge Checking (server-side only) ──
            let newBadges = [];
            if (parsedResponse.status === 'Accepted' && earnedPoints > 0) {
                newBadges = await checkAndAwardBadges(req.user._id);
            }

            // ── Contest Tracking (if applicable) ──
            const { contestId } = req.query;
            let nextProblemId = null;
            let isLastProblem = false;
            let contestTotalPoints = 0;

            if (contestId && parsedResponse.status === 'Accepted') {
                const contest = await Contest.findById(contestId);
                if (contest && contest.problems) {
                    const probIndex = contest.problems.findIndex(p => p.toString() === problemId);
                    if (probIndex !== -1) {
                        if (probIndex < contest.problems.length - 1) {
                            nextProblemId = contest.problems[probIndex + 1];
                        } else {
                            isLastProblem = true;
                        }
                    }

                    // Calculate total points earned in this contest by the user
                    const allAcceptedInContest = await Submission.find({
                        user: req.user._id,
                        problem: { $in: contest.problems },
                        status: 'Accepted'
                    });

                    // Sum up max points for each unique problem solved (using set to avoid duplicate points)
                    const uniqueSolvedIds = new Set(allAcceptedInContest.map(s => s.problem.toString()));
                    contestTotalPoints = 0;
                    contest.problems.forEach(pId => {
                        if (uniqueSolvedIds.has(pId.toString())) {
                            const p = allAcceptedInContest.find(s => s.problem.toString() === pId.toString());
                            contestTotalPoints += p.points || 0;
                        }
                    });
                }
            }

            return res.status(200).json({
                ...parsedResponse,
                points: earnedPoints,
                newBadges,
                nextProblemId,
                isLastProblem,
                contestTotalPoints
            });
        } catch (parseError) {
            console.error("Failed to parse AI response:", aiResponse);
            return res.status(500).json({ status: 'Error', message: 'Failed to evaluate code properly.' });
        }

    } catch (error) {
        console.error("Submission Error:", error);
        res.status(500).json({ status: 'Error', message: 'Server Error during evaluation.', error: error.message });
    }
});

export default router;
