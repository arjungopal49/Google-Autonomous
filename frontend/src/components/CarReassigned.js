import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import WarningIcon from '@mui/icons-material/Warning';

const CarReassigned = () => {
  return (
    <Box
      className="popup-overlay"
      sx={{
        position: 'fixed',
        top: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        pointerEvents: 'none', // Ensures it doesn’t block interaction with the map
      }}
    >
      <Card
        elevation={3}
        sx={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          borderRadius: 2,
          padding: 2,
          width: 'fit-content',
          maxWidth: '90%',
        }}
      >
        <IconButton
          sx={{
            color: '#E53935',
            fontSize: '32px',
            marginRight: 2,
          }}
        >
          <WarningIcon fontSize="large" />
        </IconButton>
        <CardContent sx={{ padding: 0 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 'bold',
              color: '#4A90E2',
              marginBottom: 1,
            }}
          >
            Car Reassigned
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: '#000000',
            }}
          >
            Due to traffic, you have been assigned a new car.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CarReassigned;
