import express from 'express';
import jwt from 'jsonwebtoken';
import Contest from '../models/Contest.js';
import Problem from '../models/Problem.js';
import Submission from '../models/Submission.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get all active/upcoming contests
// @route   GET /api/contests
// @access  Public
router.get('/', async (req, res) => {
    try {
        let userId = null;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            try {
                const token = req.headers.authorization.split(' ')[1];
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                userId = decoded.id;
            } catch (err) {
                // Ignore invalid tokens on a public route
                console.log("Invalid token " , err);
            }
        }

        const contests = await Contest.find()
            .populate('companyId', 'name')
            .populate('problems', 'title difficulty category')
            .sort({ startTime: 1 });

        const mappedContests = contests.map(c => {
            const contestObj = c.toObject();
            contestObj.isDisqualified = userId && c.disqualifiedParticipants
                ? c.disqualifiedParticipants.some(id => id.toString() === userId)
                : false;
            return contestObj;
        });

        res.status(200).json(mappedContests);
    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching contests' });
    }
});

// @desc    Get single contest by ID
// @route   GET /api/contests/:id
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const contest = await Contest.findById(req.params.id)
            .populate('companyId', 'name')
            .populate('problems', 'title difficulty category timeLimit');

        if (!contest) return res.status(404).json({ message: 'Contest not found' });
        res.status(200).json(contest);
    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching contest' });
    }
});

// @desc    Create a modern contest (Company Only)
// @route   POST /api/contests
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        if (req.user.preference !== 'company') {
            return res.status(403).json({ message: 'Only companies can create contests' });
        }

        const { title, description, problems, startTime, endTime, strictValidation } = req.body;

        // problems is now an array of complete Problem objects containing Title, Desc, TimeLimit, TestCases
        const createdProblemIds = [];
        for (const probData of problems) {
            const newProblem = new Problem({
                title: probData.title,
                description: probData.description,
                difficulty: probData.difficulty || 'Medium',
                category: probData.category || 'Contest Specific',
                testCases: probData.testCases,
                timeLimit: probData.timeLimit || 0,
                companyId: req.user._id,
                isMock: false
            });
            const savedProb = await newProblem.save();
            createdProblemIds.push(savedProb._id);
        }

        const contest = new Contest({
            title,
            description,
            companyId: req.user._id,
            problems: createdProblemIds,
            startTime,
            endTime,
            strictValidation
        });

        const createdContest = await contest.save();
        res.status(201).json(createdContest);
    } catch (error) {
        res.status(500).json({ message: 'Server Error creating contest', error: error.message });
    }
});

// @desc    Register for a contest
// @route   POST /api/contests/:id/register
// @access  Private
router.post('/:id/register', protect, async (req, res) => {
    try {
        const contest = await Contest.findById(req.params.id);
        if (!contest) return res.status(404).json({ message: 'Contest not found' });

        // Check if contest already ended
        if (new Date() > new Date(contest.endTime)) {
            return res.status(400).json({ message: 'Contest has already ended' });
        }

        // Check if user already registered
        if (contest.participants.includes(req.user._id)) {
            return res.status(400).json({ message: 'You are already registered for this contest' });
        }

        contest.participants.push(req.user._id);
        await contest.save();

        res.status(200).json({ message: 'Successfully registered for the contest!' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error during registration' });
    }
});

// @desc    Get user's progress in a contest (which problems are solved)
// @route   GET /api/contests/:id/progress
// @access  Private
router.get('/:id/progress', protect, async (req, res) => {
    try {
        const contest = await Contest.findById(req.params.id);
        if (!contest) return res.status(404).json({ message: 'Contest not found' });

        // Get all accepted submissions by this user for problems in this contest
        const acceptedSubs = await Submission.find({
            user: req.user._id,
            problem: { $in: contest.problems },
            status: 'Accepted'
        });

        // Build set of solved problem IDs
        const solvedProblemIds = [...new Set(acceptedSubs.map(s => s.problem.toString()))];

        // currentProblemIndex = how many sequential problems are solved from the start
        // e.g., if problems are [A, B, C, D] and user solved A and B, index = 2 (can access C)
        let currentProblemIndex = 0;
        for (let i = 0; i < contest.problems.length; i++) {
            if (solvedProblemIds.includes(contest.problems[i].toString())) {
                currentProblemIndex = i + 1;
            } else {
                break;
            }
        }

        // Check if user is disqualified
        const isDisqualified = contest.disqualifiedParticipants.includes(req.user._id);

        res.status(200).json({
            solvedProblemIds,
            currentProblemIndex,
            totalProblems: contest.problems.length,
            isDisqualified
        });
    } catch (error) {
        console.error('Progress fetch error:', error);
        res.status(500).json({ message: 'Server Error fetching progress' });
    }
});

// @desc    Disqualify a user from a contest (Anti-Cheat)
// @route   POST /api/contests/:id/disqualify
// @access  Private
router.post('/:id/disqualify', protect, async (req, res) => {
    try {
        const contest = await Contest.findById(req.params.id);
        if (!contest) return res.status(404).json({ message: 'Contest not found' });

        if (!contest.disqualifiedParticipants.includes(req.user._id)) {
            contest.disqualifiedParticipants.push(req.user._id);
            await contest.save();
        }

        res.status(200).json({ message: 'User disqualified successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error during disqualification' });
    }
});

export default router;
