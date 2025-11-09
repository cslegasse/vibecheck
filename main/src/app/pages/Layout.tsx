import React from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Container,
  Box,
  Typography,
  Button,
} from '@mui/material';
import { HandHeartIcon } from '../../components/Icons'; // Assuming this is a custom SVG component
import { motion } from 'framer-motion';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();

  return (
    // Use Box instead of div for MUI consistency
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="sticky"
        elevation={0} // Modern flat look
        sx={{ borderBottom: '1px solid #ddd' }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              style={{ cursor: 'pointer' }}
            >
              <Box
                onClick={() => navigate('/')}
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <HandHeartIcon className="h-8 w-8 text-blue-600" /> 
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  RichImpact.ai
                </Typography>
              </Box>
            </motion.div>

            {/* Spacer */}
            <Box sx={{ flexGrow: 1 }} />

            {/* Nav Links */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                component={RouterLink}
                to="/donator"
                color="primary"
                variant="outlined"
              >
                Donate
              </Button>
              <Button
                component={RouterLink}
                to="/ngo"
                color="primary"
                variant="contained"
              >
                For NGOs
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Page content will render here */}
      <main>{children}</main>
    </Box>
  );
};

export default Layout;