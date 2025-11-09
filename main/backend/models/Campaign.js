import mongoose from 'mongoose'

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  raised: { type: Number, default: 0 },
  spent: { type: Number, default: 0 },
})

const CampaignSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    totalBudget: { type: Number, required: true },
    totalRaised: { type: Number, default: 0 },
    categories: [CategorySchema],
    aiAnalysis: { type: Object },
  },
  { timestamps: true }
)

export default mongoose.model('Campaign', CampaignSchema)