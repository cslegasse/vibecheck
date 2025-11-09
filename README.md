# Contrust Platform Guide

## 🛡️ Overview

**Contrust** is an AI-powered transparent donation platform that creates smart contracts between donors and organizations. It ensures complete transparency, fraud detection, and real-time progress tracking using advanced AI and live data from the Nessie API.

---

## 🎯 Core Features

### 1. **Smart Contract System**
- Organizations specify fundraising goals and spending categories
- Smart contracts enforce category-based spending limits
- AI verifies every withdrawal matches its intended purpose
- Real-time compliance monitoring

### 2. **AI-Powered Fraud Detection**
- **Gemini AI Integration**: Smart explanations and fraud analysis
- **Trust Scoring**: Every donation receives a fraud risk score (0-100%)
- **Real-time Verification**: AI checks patterns and anomalies
- **Nessie API Logging**: Customer transactions tracked for transparency

### 3. **Live Progress Tracking**
- Real-time donation updates every 5 seconds
- Category-level spending breakdowns
- Compliance rate monitoring
- Active alert system for suspicious activity

### 4. **Visible AI Agent**
- Floating AI assistant on every page
- Context-aware responses about donations, fraud, and progress
- Powered by Gemini AI with fallback responses
- Interactive chat interface with insights dashboard

---

## 🚀 Getting Started

### Prerequisites
```bash
Node.js 18+ or Bun
Nessie API key (from api.nessieisreal.com)
Gemini API key (from Google AI Studio)
```

### Installation
```bash
# Install dependencies
npm install
# or
bun install

# Set up environment variables
cp .env.local.example .env.local
# Add your API keys to .env.local

# Run development server
npm run dev
# or
bun dev
```

### Environment Variables
```env
# Required
NESSIE_API_KEY=your_nessie_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here

# Optional
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## 📊 Smart Contract Workflow

### For Organizations (NGOs)

1. **Create Campaign**
   - Navigate to `/ngo/new`
   - Specify fundraising goal
   - Define spending categories with allocations
   - AI validates and creates smart contract

2. **Manage Funds**
   - View real-time donations by category
   - Request withdrawals with reason
   - AI verifies spending aligns with category
   - Track compliance and fraud scores

3. **Monitor Progress**
   - View live metrics dashboard
   - AI-powered analytics and insights
   - Transparency ratings and verification status
   - Real-time alert notifications

### For Donors

1. **Select Campaign**
   - Browse active campaigns
   - View category allocations and progress
   - Check fraud scores and compliance ratings

2. **Make Donation**
   - Choose donation amount
   - Select specific category (smart contract enforced)
   - AI fraud check performed instantly
   - Receive verification score

3. **Track Impact**
   - Real-time spending updates
   - Category-level transparency
   - AI-verified transaction history
   - Live activity feed

---

## 🤖 AI Agent Features

### How to Use
1. Click the floating brain icon (bottom-right)
2. Ask questions about:
   - Fraud detection methods
   - Smart contract rules
   - Donation tracking
   - Spending compliance
   - Progress updates

### Context-Aware Responses
- **Donation Context**: Provides fraud scores and category info
- **Campaign Context**: Offers spending insights and compliance data
- **General Context**: Explains platform features

### Powered by Gemini AI
```javascript
// Example AI query
const response = await fetch('/api/explain', {
  method: 'POST',
  body: JSON.stringify({
    query: "How does fraud detection work?",
    context: "donation",
    data: { amount: 500, category: "Medical Supplies" }
  })
});
```

---

## 🔍 Real-Time Data & Fraud Detection

### Fraud Scoring Algorithm
```
1. Transaction Pattern Analysis
   - Amount vs. average donations
   - Frequency of donations
   - Category selection patterns

2. Donor Verification
   - Nessie API customer validation
   - Transaction history check
   - Behavioral analysis

3. Risk Assessment
   - Score: 0-100% (higher = safer)
   - Threshold: 70% for automatic approval
   - Alerts triggered for scores < 70%
```

### Real-Time Metrics
- **Total Donations**: Updated every 5 seconds
- **Average Trust Score**: Rolling calculation
- **Compliance Rate**: Category spending vs. allocation
- **Active Alerts**: Suspicious activity count

---

## 🏦 Nessie API Integration

### Customer Logging
Every donation is logged with:
- Customer ID from Nessie API
- Account information
- Transaction timestamp
- Amount and category
- Verification status

### API Endpoints Used
```
POST /accounts/{id}/purchases - Record donations
GET /accounts/{id} - Verify customer
GET /transactions - Fetch transaction history
POST /customers - Create customer records
```

### Example Usage
```javascript
// Record donation via Nessie API
const response = await fetch('/api/nessie/donate', {
  method: 'POST',
  body: JSON.stringify({
    accountId: 'nessie_account_id',
    amount: 100,
    category: 'Medical Supplies',
    campaignId: 1
  })
});
```

---

## 📈 Smart Contract Categories

### Category Management
- Each campaign defines spending categories
- Allocations set at campaign creation
- Real-time tracking of raised vs. spent
- Compliance enforcement via AI

### Example Structure
```json
{
  "categories": [
    {
      "name": "Medical Supplies",
      "allocatedAmount": "40000",
      "raisedAmount": "25000",
      "spentAmount": "15000",
      "isCompliant": true,
      "fraudScore": 95,
      "transactions": 45
    }
  ]
}
```

### Withdrawal Verification
1. Check category has sufficient funds
2. AI verifies reason matches category
3. Calculate compliance impact
4. Process if verification score > 60%
5. Log with AI verification score

---

## 🎨 Design System

### Color Palette
- **Primary**: Emerald (trust, growth)
- **Secondary**: Teal (transparency, clarity)
- **Success**: Green (verified, compliant)
- **Warning**: Orange (review required)
- **Accent**: Cyan (information)

### Key Components
- **AIAgent**: Floating assistant with chat interface
- **Progress Bars**: Gradient emerald-to-teal
- **Cards**: Glass morphism with hover effects
- **Badges**: Gradient backgrounds for status
- **Animations**: Framer Motion for smooth transitions

---

## 🔐 Security Features

### AI Verification
- ✅ Fraud pattern detection
- ✅ Spending reason analysis
- ✅ Real-time compliance checking
- ✅ NGO credential verification

### Transaction Logging
- ✅ Immutable audit trail
- ✅ Timestamp tracking
- ✅ AI verification scores
- ✅ Nessie API integration

### Smart Contract Enforcement
- ✅ Category spending limits
- ✅ Automatic compliance checks
- ✅ Budget utilization tracking
- ✅ Transparent fund allocation

---

## 📱 User Interface

### Homepage (`/`)
- Platform overview with trust messaging
- Key features: Smart contracts, AI verification, real-time tracking
- Call-to-action buttons for donors and organizations

### Donor Dashboard (`/donor`)
- Live campaign metrics dashboard
- Category selection with fraud scores
- Real-time donation form with AI verification
- Campaign overview with transparency metrics
- Live activity feed

### Organization Dashboard (`/ngo`)
- Campaign management interface
- Smart contract category tracking
- AI analytics and insights
- Progress monitoring with compliance rates
- Budget utilization breakdowns

---

## 🌐 API Routes

### Smart Contract APIs
```
POST /api/blockchain/campaign - Create campaign
GET  /api/blockchain/campaign - Get campaign details
GET  /api/blockchain/verify   - Verify compliance
```

### Donation APIs
```
POST /api/donations/record - Record donation with fraud check
POST /api/nessie/donate    - Process via Nessie API
GET  /api/transactions/history - Get transaction history
```

### AI APIs
```
POST /api/explain - Get AI explanations (Gemini)
POST /api/ai/insights - Get AI insights and fraud scores
POST /api/ai/fraud-check - Perform fraud detection
```

### Company Data APIs
```
GET /api/company/verify - Get NGO verification data
POST /api/withdrawals/process - Process withdrawal with AI
```

---

## 🧪 Testing

### Test Donation Flow
1. Go to `/donor`
2. Enter amount: $100
3. Select category: "Medical Supplies"
4. Click "Donate Securely"
5. Check toast for verification score
6. View real-time metrics update

### Test AI Agent
1. Click floating brain icon
2. Ask: "How does fraud detection work?"
3. View AI-generated response
4. Check insights dashboard

### Test Smart Contract
1. Create campaign at `/ngo/new`
2. Record donations in different categories
3. Attempt withdrawal with valid reason
4. Verify AI compliance check
5. Monitor real-time updates

---

## 🚀 Deployment

### Production Checklist
- [ ] Add production Nessie API key
- [ ] Add production Gemini API key
- [ ] Configure database for persistence
- [ ] Set up monitoring and alerts
- [ ] Enable rate limiting
- [ ] Configure CORS policies
- [ ] Set up analytics tracking

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Add environment variables
vercel env add NESSIE_API_KEY
vercel env add GEMINI_API_KEY
```

---

## 📚 Technical Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **UI Components**: Shadcn/UI + Radix UI
- **AI**: Google Gemini Pro
- **Payment API**: Nessie (Capital One)
- **Icons**: Lucide React
- **Deployment** Vercel, .tech (Domain)

---

## 🤝 Contributing

### Code Structure
```
src/
├── app/                    # Next.js pages and API routes
│   ├── api/               # Backend APIs
│   │   ├── ai/           # AI-related endpoints
│   │   ├── blockchain/   # Smart contract APIs
│   │   ├── donations/    # Donation processing
│   │   ├── nessie/       # Nessie API integration
│   │   └── explain/      # Gemini AI explanations
│   ├── donor/            # Donor dashboard
│   ├── ngo/              # Organization dashboard
│   └── page.tsx          # Homepage
├── components/            # Reusable components
│   ├── ui/               # Shadcn UI components
│   └── ai-agent.tsx      # AI assistant
└── lib/                  # Utility functions
    └── smart-contract-client.ts  # Smart contract logic
```

---

## 🆘 Troubleshooting
### AI Agent Not Responding
- Check `GEMINI_API_KEY` in `.env.local`
- Verify API key has billing enabled
- Check browser console for errors
- Fallback responses will work without API key

### Nessie API Errors
- Verify `NESSIE_API_KEY` is correct
- Check Nessie API status at api.nessieisreal.com
- Review request/response in Network tab
- Ensure account IDs are valid

### Real-Time Updates Not Working
- Check browser console for errors
- Verify `useEffect` interval is running
- Ensure state updates are triggering re-renders
- Check API endpoints are responding

---

## 📞 Support

For questions or issues:
- Review this documentation
- Ask the AI Agent on the platform
- Check API documentation
- Review code comments

---

## 🎉 Success Metrics

Your Contrust platform tracks:
- ✅ Total donations processed
- ✅ Average fraud trust score
- ✅ Smart contract compliance rate
- ✅ Active fraud alerts
- ✅ Category spending accuracy
- ✅ Real-time verification count

---

**Built with trust, powered by AI, secured by smart contracts.**

*Contrust -  Transparency Meets Technology* 🛡️
