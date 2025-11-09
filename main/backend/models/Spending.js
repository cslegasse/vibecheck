// models/Spending.js
import mongoose from 'mongoose'

const SpendingSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    supplierName: { type: String, required: true },
    description: { type: String },
    // Link to the main campaign
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
    },
    // The category this money was spent from
    categoryName: { type: String, required: true },
  },
  { timestamps: true }
)

export default mongoose.model('Spending', SpendingSchema)