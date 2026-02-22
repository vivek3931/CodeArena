import express from 'express';
import Groq from 'groq-sdk';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// System prompt for the AI Mock Interviewer
const getSystemPrompt = () => `You are a Senior Software Engineer at a top FAANG company conducting a technical mock interview.
Your goal is to assess the candidate's problem-solving skills, communication, and technical knowledge.

CRITICAL INSTRUCTIONS:
1. Be professional, slightly challenging, but encouraging.
2. Keep your responses VERY concise (2-3 sentences max) so they can be spoken quickly via Text-to-Speech.
3. If the candidate gives a good theoretical answer, suggest moving to a coding round by setting "isCodingRound" to true and providing a "dsaQuestion". Avoid repeating the same question.
4. Always respond with valid JSON matching this schema:
{
  "responseText": "Your spoken response to the candidate",
  "isCodingRound": boolean,
  "dsaQuestion": "The text of the DSA question if isCodingRound is true, otherwise null",
  "isInterviewOver": boolean // Set to true if you are concluding the interview
}`;

// @desc    Start Interview
// @route   POST /api/interview/start
// @access  Private
router.post('/start', protect, async (req, res) => {
    try {
        const { goal, experience } = req.body;

        let initialContext = `Candidate Context: They are aiming for "${goal}" and their current experience level is "${experience}". Start the interview by briefly greeting them, acknowledging their goal, and asking a warm-up technical question. Remember to output ONLY valid JSON.`;

        const messages = [
            { role: "system", content: getSystemPrompt() },
            { role: "user", content: initialContext }
        ];

        const chatCompletion = await groq.chat.completions.create({
            messages,
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 500,
            response_format: { type: "json_object" }
        });

        const responseObj = JSON.parse(chatCompletion.choices[0]?.message?.content || '{}');

        // Return the first AI response plus the initialized chat history
        messages.push({ role: "assistant", content: JSON.stringify(responseObj) });

        res.status(200).json({
            aiResponse: responseObj,
            chatHistory: messages
        });

    } catch (error) {
        console.error("Error starting interview:", error);
        res.status(500).json({ message: 'Failed to start interview.' });
    }
});

// @desc    Chat iteration
// @route   POST /api/interview/chat
// @access  Private
router.post('/chat', protect, async (req, res) => {
    try {
        const { chatHistory, userMessage } = req.body;

        if (!chatHistory || !Array.isArray(chatHistory)) {
            return res.status(400).json({ message: 'Invalid chat history' });
        }

        const messages = [...chatHistory, { role: "user", content: userMessage }];

        const chatCompletion = await groq.chat.completions.create({
            messages,
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 500,
            response_format: { type: "json_object" }
        });

        const responseObj = JSON.parse(chatCompletion.choices[0]?.message?.content || '{}');

        // Append the AI's response to the history
        messages.push({ role: "assistant", content: JSON.stringify(responseObj) });

        res.status(200).json({
            aiResponse: responseObj,
            chatHistory: messages
        });

    } catch (error) {
        console.error("Error during interview chat:", error);
        res.status(500).json({ message: 'Failed to process interview response.' });
    }
});

// @desc    Finalize Interview
// @route   POST /api/interview/finalize
// @access  Private
router.post('/finalize', protect, async (req, res) => {
    try {
        const { chatHistory, codeSubmission } = req.body;

        const finalizePrompt = `The interview is now over. Based on the entire transcript and the candidate's final code submission (if any), generate a comprehensive feedback report.
Code Submission: 
\n\n${codeSubmission || 'No code submitted.'}\n\n

CRITICAL INSTRUCTIONS:
1. Be constructive and detailed.
2. Output valid JSON matching this schema:
{
  "strengths": ["list of strengths"],
  "areasForImprovement": ["list of areas to improve"],
  "codeEvaluation": "Detailed evaluation of their code submission (time/space complexity, bugs, edge cases)",
  "overallScore": "Score out of 10"
}`;

        const messages = [
            ...chatHistory,
            { role: "user", content: finalizePrompt }
        ];

        const chatCompletion = await groq.chat.completions.create({
            messages,
            model: "llama-3.3-70b-versatile",
            temperature: 0.5,
            max_tokens: 1500,
            response_format: { type: "json_object" }
        });

        const feedbackObj = JSON.parse(chatCompletion.choices[0]?.message?.content || '{}');

        res.status(200).json(feedbackObj);

    } catch (error) {
        console.error("Error finalizing interview:", error);
        res.status(500).json({ message: 'Failed to generate interview feedback.' });
    }
});

export default router;
