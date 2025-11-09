import { Box, Button, Typography, CircularProgress } from '@mui/material';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

// --- TYPESCRIPT INTERFACES ---
interface Category {
  _id?: string;
  name: string;
  amount: number; // The *planned* amount
  raised: number;  // The *actual* amount raised
  spent: number;   // The *actual* amount spent
}

interface Campaign {
  _id: string;
  title: string;
  totalBudget: number;
  totalRaised: number;
  categories: Category[];
  aiAnalysis?: object; 
}
// -----------------------------

const Ngo: React.FC = () => { // Added React.FC type
  // Correctly type the state
  const [allCampaignsData, setAllCampaignsData] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCampaigns = async () => {
    setIsLoading(true);
    try {
      // ** NOTE: This route needs to be built in your server.js **
      // const { data } = await axios.get('/api/v1/campaign'); 
      // setAllCampaignsData(data.campaigns || []); 

      // --- Using Placeholder Data For Now ---
      const placeholderData: Campaign[] = [
        {
          _id: '1',
          title: 'Placeholder: Florida Relief',
          totalBudget: 500000,
          totalRaised: 120000,
          categories: [
            { name: 'Clean Water', amount: 150000, raised: 50000, spent: 10000 },
            { name: 'Shelter', amount: 350000, raised: 70000, spent: 0 },
          ],
        },
      ];
      setAllCampaignsData(placeholderData);
      // --- End Placeholder ---

    } catch (error) {
      console.error("Error fetching campaigns:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCampaigns(); 
  }, []); // Empty array is correct

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, maxWidth: '900px', margin: '0 auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">NGO Dashboard</Typography>
        {/* Fixed the link to point to the new route */}
        <Button component={Link} to="/ngo/new" variant="contained" color="primary">
          + Create New Campaign
        </Button>
      </Box>
      
      {allCampaignsData.length === 0 ? (
        <Typography>No campaigns found. Create one!</Typography>
      ) : (
        allCampaignsData.map((campaign) => (
          <Box key={campaign._id} sx={{ p: 3, backgroundColor: '#f9f9f9', borderRadius: 2, boxShadow: 1, mb: 3 }}>
            <Typography variant="h5">{campaign.title}</Typography>
            <Typography variant="body1" color="textSecondary">
              Goal: ${campaign.totalRaised.toLocaleString()} / ${campaign.totalBudget.toLocaleString()}
            </Typography>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6">Categories:</Typography>
              {campaign.categories.map((cat, index) => (
                <Box key={index} sx={{ ml: 2, my: 1, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                  <Typography><strong>{cat.name}</strong> (Plan: ${cat.amount.toLocaleString()})</Typography>
                  <Typography>Raised: ${cat.raised.toLocaleString()}</Typography>
                  <Typography>Spent: ${cat.spent.toLocaleString()}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        ))
      )}
    </Box>
  );
};

export default Ngo;