import mongoose from 'mongoose'

const SupplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
  },
})

export default mongoose.model('Supplier', SupplierSchema)
