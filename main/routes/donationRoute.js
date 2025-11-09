// routes/donationRoute.js
import express from 'express'
const router = express.Router()

import Campaign from '../models/Campaign.js'
import Donation from '../models/Donation.js'

// POST /api/v1/donation
// Records a new donation AND updates the campaign
router.post('/', async (req, res) => {
  const { amount, campaignId, categoryName, donorEmail } = req.body

  // 1. Create the individual donation record
  const donation = await Donation.create({
    amount,
    donorEmail,
    campaign: campaignId,
    categoryName,
  })

  // 2. Update the main campaign "contract"
  const campaign = await Campaign.findOneAndUpdate(
    {
      _id: campaignId,
      'categories.name': categoryName, // Find the campaign AND the matching category
    },
    {
      $inc: {
        totalRaised: amount, // Increment total raised
        'categories.$.raised': amount, // Increment the 'raised' field in the matched category
      },
    },
    { new: true } // Return the updated document
  )

  res.status(201).json({ donation, campaign })
})

export default router