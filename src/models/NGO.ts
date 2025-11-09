import mongoose, { Schema, Document } from 'mongoose';

export interface INGO extends Document {
  authId: string; // Links to better-auth user.id
  uniqueTrackingId: string; // Unique ID for tracking across all systems
  organizationName: string;
  email: string;
  
  // Organization Details
  description?: string;
  website?: string;
  verified: boolean;
  
  // Nessie API Data
  nessieCustomerId?: string;
  nessieAccountId?: string;
  nessieData?: {
    accountType: string;
    balance: number;
    totalReceived: number;
    lastUpdated: Date;
  };
  
  // Campaigns/Smart Contracts
  campaigns: {
    campaignId: string;
    name: string;
    description: string;
    targetAmount: number;
    raisedAmount: number;
    status: 'active' | 'completed' | 'cancelled';
    
    // Gemini AI Generated Data
    geminiInsights: {
      successProbability: number;
      estimatedDays: number;
      riskFactors: string[];
      recommendations: string[];
      generatedAt: Date;
    };
    
    // Budget Categories (Smart Contract)
    categories: {
      name: string;
      budget: number;
      spent: number;
      remaining: number;
    }[];
    
    // Withdrawals
    withdrawals: {
      withdrawalId: string;
      amount: number;
      category: string;
      description: string;
      timestamp: Date;
      nessieTransactionId?: string;
      fraudScore: number;
      aiVerified: boolean;
      geminiVerification?: {
        approved: boolean;
        reasoning: string;
        verifiedAt: Date;
      };
    }[];
    
    // Real-time metrics
    trustScore: number;
    complianceRate: number;
    averageFraudScore: number;
    
    createdAt: Date;
    updatedAt: Date;
  }[];
  
  // Overall Statistics
  totalCampaigns: number;
  totalRaised: number;
  totalWithdrawn: number;
  overallTrustScore: number;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastSyncedAt?: Date;
}

const NGOSchema: Schema = new Schema({
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
  organizationName: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  
  // Organization Details
  description: String,
  website: String,
  verified: { type: Boolean, default: false },
  
  // Nessie API Data
  nessieCustomerId: String,
  nessieAccountId: String,
  nessieData: {
    accountType: String,
    balance: Number,
    totalReceived: Number,
    lastUpdated: Date
  },
  
  // Campaigns
  campaigns: [{
    campaignId: String,
    name: String,
    description: String,
    targetAmount: Number,
    raisedAmount: { type: Number, default: 0 },
    status: { 
      type: String, 
      enum: ['active', 'completed', 'cancelled'],
      default: 'active'
    },
    
    // Gemini AI Insights
    geminiInsights: {
      successProbability: Number,
      estimatedDays: Number,
      riskFactors: [String],
      recommendations: [String],
      generatedAt: Date
    },
    
    // Smart Contract Categories
    categories: [{
      name: String,
      budget: Number,
      spent: { type: Number, default: 0 },
      remaining: Number
    }],
    
    // Withdrawals
    withdrawals: [{
      withdrawalId: String,
      amount: Number,
      category: String,
      description: String,
      timestamp: Date,
      nessieTransactionId: String,
      fraudScore: Number,
      aiVerified: Boolean,
      geminiVerification: {
        approved: Boolean,
        reasoning: String,
        verifiedAt: Date
      }
    }],
    
    // Metrics
    trustScore: { type: Number, default: 100 },
    complianceRate: { type: Number, default: 100 },
    averageFraudScore: { type: Number, default: 100 },
    
    createdAt: Date,
    updatedAt: Date
  }],
  
  // Statistics
  totalCampaigns: { type: Number, default: 0 },
  totalRaised: { type: Number, default: 0 },
  totalWithdrawn: { type: Number, default: 0 },
  overallTrustScore: { type: Number, default: 100 },
  
  // Metadata
  lastSyncedAt: Date
}, {
  timestamps: true
});

// Indexes for performance
NGOSchema.index({ organizationName: 1 });
NGOSchema.index({ verified: 1 });
NGOSchema.index({ nessieCustomerId: 1 });
NGOSchema.index({ 'campaigns.campaignId': 1 });

export default mongoose.models.NGO || mongoose.model<INGO>('NGO', NGOSchema);
