import express from 'express'
const router = express.Router()

import Campaign from '../models/Campaign.js'


router.post('/', async (req, res) => {
  const { title, totalBudget, categories, aiAnalysis } = req.body
  const campaign = await Campaign.create({
    title,
    totalBudget,
    categories,
    aiAnalysis,
  })
  res.status(201).json(campaign)
})


router.get('/:id', async (req, res) => {
  const campaign = await Campaign.findById(req.params.id)
  if (!campaign) {
    throw new Error('Campaign not found')
  }
  res.status(200).json(campaign)
})

export default router