// We add Modal and TextField for the DollarAmountModal component
import { Box, Typography, Button, CircularProgress, Chip, Modal, TextField } from '@mui/material';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
// We are REMOVING the broken import:
// import DollarAmountModal from '../components/DollarAmountModal'; 
// Instead, we will define the component inside this file.

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

// --- DollarAmountModal Component ---
// We've moved this component inside the file to fix the error
// and converted it to Typescript.

interface DollarAmountModalProps {
  open: boolean;
  handleClose: () => void;
  handleSubmit: (amount: number) => void;
}

const DollarAmountModal: React.FC<DollarAmountModalProps> = ({ open, handleClose, handleSubmit }) => {
  const [amount, setAmount] = useState<number | string>(''); // Use string for empty field

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(event.target.value);
  };

  const handleFormSubmit = () => {
    const numAmount = Number(amount);
    if (numAmount > 0) {
      handleSubmit(numAmount);
      setAmount(''); // Reset
      handleClose();
    } else {
      alert("Please enter a valid amount greater than 0.");
    }
  };

  // Style for the modal
  const modalStyle = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    borderRadius: 2,
    boxShadow: 24,
    p: 4,
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6" component="h2" sx={{ fontFamily: 'Cabin' }}>
          Enter Amount in USD
        </Typography>
        <TextField
          label="Amount"
          variant="outlined"
          type="number"
          value={amount}
          onChange={handleAmountChange}
          fullWidth
          sx={{ my: 2 }}
          InputProps={{ inputProps: { min: 1 } }} 
        />
        <Button variant="contained" color="primary" onClick={handleFormSubmit} sx={{ fontFamily: 'Cabin', fontSize: '16px' }}>
          Donate
        </Button>
      </Box>
    </Modal>
  );
};

// --- Main Donator Page Component ---

const Donator: React.FC = () => { 
  const [allCampaignsData, setAllCampaignsData] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);
  
  const [currentCampaign, setCurrentCampaign] = useState<Campaign | null>(null);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  
  const [aiExplanation, setAiExplanation] = useState('');
  const [explanationLoading, setExplanationLoading] = useState(false);

  const tags = [
    'Tsunami',
    'Flooding',
    'Food Aid',
    'Safe Water Supply',
    'Medicine',
  ];

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
            { _id: 'c1', name: 'Clean Water', amount: 150000, raised: 50000, spent: 10000 },
            { _id: 'c2', name: 'Shelter', amount: 350000, raised: 70000, spent: 0 },
          ],
        },
      ];
      setAllCampaignsData(placeholderData);
      // --- End Placeholder ---
    } catch (error) {
      console.warn("Could not fetch campaigns from backend. Using placeholder data.");
      // Set placeholder data on error as well
      const placeholderData: Campaign[] = [
        {
          _id: '1',
          title: 'Placeholder: Florida Relief',
          totalBudget: 500000,
          totalRaised: 120000,
          categories: [
            { _id: 'c1', name: 'Clean Water', amount: 150000, raised: 50000, spent: 10000 },
            { _id: 'c2', name: 'Shelter', amount: 350000, raised: 70000, spent: 0 },
          ],
        },
      ];
      setAllCampaignsData(placeholderData);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCampaigns();
  }, []); 

  const handleOpenDonateModal = (campaign: Campaign, category: Category) => {
    setCurrentCampaign(campaign);
    setCurrentCategory(category);
    setIsDonateModalOpen(true);
  };

  const handleCloseDonateModal = () => {
    setIsDonateModalOpen(false);
    setCurrentCampaign(null);
    setCurrentCategory(null);
  };

  const handleDonationSubmit = async (amount: number) => {
    if (!currentCampaign || !currentCategory) return;

    try {
      // This is a placeholder for your backend call
      // await axios.post('/api/v1/donation', {
      //   amount: Number(amount),
      //   campaignId: currentCampaign._id,
      //   categoryName: currentCategory.name,
      //   donorEmail: 'donator@example.com' 
      // });
      console.log('Simulating donation of', amount, 'to', currentCategory.name);
      
      alert('Donation successful! (This is a simulation, data will reset on refresh)');
      handleCloseDonateModal();
      
      // Simulate the update locally
      const updatedCampaigns = allCampaignsData.map(campaign => {
        if (campaign._id === currentCampaign._id) {
          const newTotalRaised = campaign.totalRaised + Number(amount);
          const newCategories = campaign.categories.map(cat => {
            if (cat.name === currentCategory.name) {
              return { ...cat, raised: cat.raised + Number(amount) };
            }
            return cat;
          });
          return { ...campaign, totalRaised: newTotalRaised, categories: newCategories };
        }
        return campaign;
      });
      setAllCampaignsData(updatedCampaigns);

    } catch (error: any) { 
      console.error("Error donating:", error);
      alert('Donation failed. ' + (error.response?.data?.msg || error.message));
    }
  };

  const handleGetExplanation = async (campaignId: string) => {
    setExplanationLoading(true);
    setAiExplanation('');
    try {

      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      const campaign = allCampaignsData.find(c => c._id === campaignId);
      setAiExplanation(`AI Summary for ${campaign?.title}: This campaign is ${Math.round((campaign?.totalRaised || 0) / (campaign?.totalBudget || 1) * 100)}% funded. Good progress is being made on the 'Clean Water' goal!`);
      // --- End Placeholder ---

    } catch (error: any) { 
      console.error("Error getting explanation:", error);
      setAiExplanation('Failed to load AI summary. Is your backend server running?');
    }
    setExplanationLoading(false);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: '900px', margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>Find a Campaign</Typography>
      
      {explanationLoading && <CircularProgress size={24} />}
      {aiExplanation && (
        <Box sx={{ p: 2, backgroundColor: '#e3f2fd', borderRadius: 1, mb: 3 }}>
          <Typography variant="h6">AI Summary:</Typography>
          <Typography sx={{ fontStyle: 'italic' }}>"{aiExplanation}"</Typography>
        </Box>
      )}

      {allCampaignsData.map((campaign) => (
        <Box key={campaign._id} sx={{ p: { xs: 2, md: 3 }, backgroundColor: '#ffffff', borderRadius: 2, boxShadow: 1, mb: 3 }}>
          
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' } }}>
            <Typography variant="h5">{campaign.title}</Typography>
            <Button size="small" variant="outlined" onClick={() => handleGetExplanation(campaign._id)} sx={{my: 1}}>
              Get AI Summary
            </Button>
          </Box>
          <Typography variant="body1" color="textSecondary" gutterBottom>
            Goal: ${campaign.totalRaised.toLocaleString()} / ${campaign.totalBudget.toLocaleString()}
          </Typography>
          
          <Box>
            {tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                variant='outlined'
                color='primary'
                size="small"
                sx={{ fontFamily: 'Cabin', mr: 1, mb: 1 }}
              />
            ))}
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant="h6">Donate to a Specific Goal:</Typography>
            {campaign.categories.map((cat, index) => (
              <Box 
                key={index} 
                sx={{ 
                  ml: { xs: 0, md: 2 }, 
                  my: 1, 
                  p: 2, 
                  border: '1px solid #ddd', 
                  borderRadius: 1, 
                  display: 'flex', 
                  flexDirection: { xs: 'column', md: 'row' }, 
                  justifyContent: 'space-between', 
                  alignItems: 'center' 
                }}
              >
                <Box sx={{ mb: { xs: 2, md: 0 } }}>
                  <Typography><strong>{cat.name}</strong></Typography>
                  <Typography color="textSecondary">
                    Raised: ${cat.raised.toLocaleString()} / ${cat.amount.toLocaleString()}
                  </Typography>
                </Box>
                <Button 
                  variant="contained" 
                  size="small" 
                  onClick={() => handleOpenDonateModal(campaign, cat)}
                  sx={{ width: { xs: '100%', md: 'auto' } }} 
                >
                  Donate
                </Button>
              </Box>
            ))}
          </Box>
        </Box>
      ))}

      <DollarAmountModal 
        open={isDonateModalOpen} 
        handleClose={handleCloseDonateModal} 
        handleSubmit={handleDonationSubmit} 
      />
    </Box>
  );
};

export default Donator;