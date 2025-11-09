import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  authId: string; // Links to better-auth user.id
  uniqueTrackingId: string; // Unique ID for tracking across all systems
  email: string;
  name: string;
  userType: 'donor' | 'ngo';
  
  // Nessie API Data
  nessieCustomerId?: string;
  nessieAccountId?: string;
  nessieData?: {
    accountType: string;
    balance: number;
    rewards: number;
    lastUpdated: Date;
  };
  
  // Donation History (for donors)
  donations: {
    transactionId: string;
    campaignId: string;
    amount: number;
    category: string;
    timestamp: Date;
    nessieTransactionId?: string;
    fraudScore?: number;
    aiVerified: boolean;
  }[];
  
  // Statistics
  totalDonated?: number;
  donationCount?: number;
  averageFraudScore?: number;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastSyncedAt?: Date;
}

const UserSchema: Schema = new Schema({
  authId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  uniqueTrackingId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  userType: { 
    type: String, 
    enum: ['donor', 'ngo'], 
    required: true 
  },
  
  // Nessie API Data
  nessieCustomerId: String,
  nessieAccountId: String,
  nessieData: {
    accountType: String,
    balance: Number,
    rewards: Number,
    lastUpdated: Date
  },
  
  // Donation History
  donations: [{
    transactionId: String,
    campaignId: String,
    amount: Number,
    category: String,
    timestamp: Date,
    nessieTransactionId: String,
    fraudScore: Number,
    aiVerified: Boolean
  }],
  
  // Statistics
  totalDonated: { type: Number, default: 0 },
  donationCount: { type: Number, default: 0 },
  averageFraudScore: { type: Number, default: 100 },
  
  // Metadata
  lastSyncedAt: Date
}, {
  timestamps: true
});

// Indexes for performance
UserSchema.index({ userType: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ nessieCustomerId: 1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
