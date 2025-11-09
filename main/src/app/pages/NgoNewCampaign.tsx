import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { Box, Divider, Typography, CircularProgress } from '@mui/material';
import axios from 'axios'; // Import axios
import { useNavigate } from 'react-router-dom'; // Import useNavigate


interface AiPlan {
  campaignTitle: string;
  totalBudget: number;
  categories: { name: string; amount: number }[];
}
// -----------------------------

const NgoNewCampaign: React.FC = () => { // Added React.FC type
  
  // State for the user's text prompt
  const [prompt, setPrompt] = useState('');
  
  // State for the AI's response
  const [aiPlan, setAiPlan] = useState<AiPlan | null>(null); // Typed the state
  
  // State for loading indicators
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate(); // Hook to redirect the user

  /**
   * Step 1: Call the AI agent to get a plan.
   * This function is new.
   */
  const handleGetForecast = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAiPlan(null); // Clear any old plan
    try {
      // Calls your new backend AI route
      const { data } = await axios.post('/api/v1/ai/forecast', {
        userPrompt: prompt,
      });
      setAiPlan(data); // Save the AI's plan to state
    } catch (error: any) { // Added 'any' type
      console.error('Error fetching AI forecast:', error);
      alert('Failed to get AI plan. ' + (error.response?.data?.msg || error.message));
    }
    setIsLoading(false);
  };

  const handleCreateCampaign = async () => {
    if (!aiPlan) {
      alert("Please generate an AI plan first.");
      return;
    }

    setIsLoading(true);
    try {
      // Calls your new backend campaign route
      await axios.post('/api/v1/campaign', {
        title: aiPlan.campaignTitle,
        totalBudget: aiPlan.totalBudget,
        categories: aiPlan.categories,
        aiAnalysis: aiPlan,
      });
      
      alert('Campaign created successfully!');
      navigate('/ngo'); 
    } catch (error: any) {
      console.error('Error creating campaign:', error);
      alert('Failed to create campaign. ' + (error.response?.data?.msg || error.message));
    }
    setIsLoading(false);
  };

  return (
    <Box sx={{ backgroundColor: '#f4f4f4', minHeight: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4 }}>
      <Box sx={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', minWidth: '720px', width: '50%', boxShadow: 3 }}>

        <Typography sx={{ fontSize: '24px', fontWeight: 'bold', fontFamily: 'Cabin' }}>{`New Fundraising Campaign`}</Typography>

        <Box sx={{ height: '24px' }} />

        <Box component="form" onSubmit={handleGetForecast}>
          <TextField
            required
            type='text'
            fullWidth
            label="Campaign Cause"
            placeholder="e.g., 'Emergency food and shelter for Texas flood victims'"
            variant="outlined"
            name="cause"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            multiline
            rows={4}
            inputProps={{style: {fontFamily: 'Cabin'}}}
            InputLabelProps={{style: {fontFamily: 'Cabin'}}}
          />

          <Box sx={{ height: '16px' }} />

          <Button 
            size='large' 
            variant='contained' 
            disableElevation 
            sx={{ fontFamily: 'Cabin' }} 
            type="submit" // Triggers onSumbit
            disabled={isLoading || !prompt}
          >
            {isLoading && !aiPlan ? <CircularProgress size={24} sx={{color: 'white'}} /> : '1. Get AI Plan'}
          </Button>
        </Box>


        {aiPlan && (
          <Box sx={{ mt: 3, p: 2, backgroundColor: '#f9f9f9', borderRadius: 1, border: '1px solid #ddd' }}>
            <Typography variant="h5" gutterBottom sx={{ fontFamily: 'Cabin' }}>AI-Generated Plan ("The Contract")</Typography>
            <Divider sx={{ my: 1 }} />
            <Typography variant="h6" sx={{ fontFamily: 'Cabin' }}><strong>Title:</strong> {aiPlan.campaignTitle}</Typography>
            <Typography variant="h6" sx={{ fontFamily: 'Cabin' }}><strong>Total Budget:</strong> ${aiPlan.totalBudget.toLocaleString()}</Typography>
            
            <Typography variant="body1" sx={{ mt: 2, fontFamily: 'Cabin' }}><strong>Categories:</strong></Typography>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {aiPlan.categories.map((cat, index) => (
                <li key={index}>
                  <Typography sx={{ fontFamily: 'Cabin' }}>
                    <strong>{cat.name}:</strong> ${cat.amount.toLocaleString()}
                  </Typography>
                </li>
              ))}
            </ul>

            <Button 
              size='large'
              variant="contained" 
              color="success" 
              onClick={handleCreateCampaign} 
              disabled={isLoading}
              sx={{ mt: 2, fontFamily: 'Cabin' }}
            >
              {isLoading ? <CircularProgress size={24} sx={{color: 'white'}} /> : '2. Create Campaign'}
            </Button>
          </Box>
        )}

      </Box>
    </Box>
  );
};

export default NgoNewCampaign;