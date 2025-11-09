import { Box, Button, Typography } from '@mui/material'
import React from 'react'

const SupplierCard = ({
  name,
  index
}) => {
  return (
    <React.Fragment key={index}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '16px',
          minHeight: '96px',
          minWidth: '128px',
          backgroundColor: '#d9ebfc',
          borderRadius: '16px',
          marginRight: '16px'
        }}
      >
        <Typography
          sx={{
            fontSize: '21px',
            fontWeight: 'bold',
            fontFamily: 'Cabin',
          }}
        >
          {name}
        </Typography>
        <Box sx={{ height: '8px' }} />
        <Button
          size='large'
          variant='contained'
          disableElevation={true}
          sx={{ marginBottom: '0px', fontFamily: 'Cabin' }}
        >{`Send`}</Button>
      </Box>
    </React.Fragment>
  )
}

export default SupplierCard
