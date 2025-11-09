// routes/aiRoute.js
import express from 'express'
const router = express.Router()
import { GoogleGenerativeAI } from '@google/generative-ai'
import Campaign from '../models/Campaign.js'

// Initialize the model
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

// POST /api/v1/ai/forecast
// The AI assistant generates a "contract" (plan)
router.post('/forecast', async (req, res) => {
  const { userPrompt } = req.body

  const prompt = `
    You are an AI assistant for a charity platform called RichImpact.ai.
    A user wants to create a new fundraiser.
    User's goal: "${userPrompt}"
    
    Your task:
    1. Analyze this goal.
    2. Create a campaignTitle.
    3. Predict a totalBudget (integer).
    4. Create a 'categories' array, where each object has a 'name' (string) and 'amount' (integer). The category amounts must sum up to the totalBudget.
    
    Return this as a single, minified JSON object with no markdown.
    Example: {"campaignTitle":"Relief Fund","totalBudget":100000,"categories":[{"name":"Water","amount":50000},{"name":"Food","amount":50000}]}
  `

  const result = await model.generateContent(prompt)
  const text = result.response.text()
  const aiPlan = JSON.parse(text) // This is the "contract"

  res.status(200).json(aiPlan)
})

// GET /api/v1/ai/explain/:id
// The AI assistant explains the status of a campaign
router.get('/explain/:id', async (req, res) => {
  // 1. Fetch the campaign "contract" from our DB
  const campaign = await Campaign.findById(req.params.id)
  if (!campaign) {
    throw new Error('Campaign not found')
  }

  // 2. Create a prompt for the AI
  const prompt = `
    You are an AI assistant for a charity platform.
    A donor wants a simple, friendly summary of this campaign's status.
    Here is the data: ${JSON.stringify(campaign)}

    Task: Write a 2-3 sentence summary. Explain the main goal,
    how much was raised vs. the total budget, and mention
    one or two categories where money has been spent.
  `

  const result = await model.generateContent(prompt)
  const explanation = result.response.text()

  res.status(200).json({ explanation })
})

export default router