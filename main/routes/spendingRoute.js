// routes/spendingRoute.js
import express from 'express'
const router = express.Router()

import Campaign from '../models/Campaign.js'
import Spending from '../models/Spending.js'

// POST /api/v1/spending
// Records a new spending event AND updates the campaign
router.post('/', async (req, res) => {
  const { amount, campaignId, categoryName, supplierName, description } = req.body

  // 1. Create the individual spending record
  const spending = await Spending.create({
    amount,
    campaign: campaignId,
    categoryName,
    supplierName,
    description,
  })

  // 2. Update the main campaign "contract"
  const campaign = await Campaign.findOneAndUpdate(
    {
      _id: campaignId,
      'categories.name': categoryName,
    },
    {
      $inc: {
        'categories.$.spent': amount, // Increment the 'spent' field
      },
    },
    { new: true }
  )

  res.status(201).json({ spending, campaign })
})

export default router