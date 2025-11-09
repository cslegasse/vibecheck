import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Button, Container } from '@mui/material';
import { motion } from 'framer-motion';

// Animation variants for staggering children
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
} as const; // <-- FIX #1: Add 'as const' here

// Animation for individual items
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
    },
  },
} as const; // <-- FIX #2: Add 'as const' here

const Home: React.FC = () => {
  return (
    <Box
      component={motion.div}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      sx={{
        minHeight: 'calc(100vh - 65px)',
        display: 'flex',
        alignItems: 'center',
        py: 6,
      }}
    >
      <Container maxWidth="md" sx={{ textAlign: 'center' }}>
        
        {/* This structure (wrapping MUI in motion.div) is still correct! */}
        <motion.div variants={itemVariants}>
          <Typography
            variant="h2"
            component="h1" 
            sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}
          >
            ConTrust
          </Typography>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Typography
            variant="h5"
            component="p"
            sx={{ mb: 6, color: 'text.secondary', lineHeight: 1.6 }}
          >
            AI-Powered Transparency for Charitable Donations. Know exactly where
            your money goes and how it's spent.
          </Typography>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap' }}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                component={Link}
                to="/donator"
                variant="contained"
                color="secondary"
                size="large"
              >
                Donator
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                component={Link}
                to="/ngo"
                variant="outlined"
                color="primary"
                size="large"
              >
                NGO
              </Button>
            </motion.div>
          </Box>
        </motion.div>
        
      </Container>
    </Box>
  );
};

export default Home;