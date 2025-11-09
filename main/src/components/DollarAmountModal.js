import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  TextField,
  Modal,
  Backdrop,
  Fade,
} from '@mui/material';

const DollarAmountModal = ({ open, handleClose, handleSubmit }) => {
  const [amount, setAmount] = useState(0);

  const handleAmountChange = (event) => {
    setAmount(event.target.value);
  };

  const handleFormSubmit = () => {
    handleSubmit(amount);
    handleClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={{ display: 'flex', flexDirection: 'column', width: '480px', backgroundColor: '#ffffff', borderRadius: '8px', padding: '16px', position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
        <Typography sx={{ fontFamily: 'Cabin', fontSize: '18px' }}>Enter Amount in USD</Typography>
        <Box sx={{ height: '16px' }} />
        <TextField
          label="Amount"
          variant="outlined"
          type="number"
          value={amount}
          onChange={handleAmountChange}
        />
        <Box sx={{ height: '16px' }} />
        <Button variant="contained" color="primary" onClick={handleFormSubmit} sx={{ fontFamily: 'Cabin', fontSize: '16px' }}>
          Donate
        </Button>
      </Box>
    </Modal>
  );
};

export default DollarAmountModal;
