import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import RoomIcon from '@mui/icons-material/Room'; // Location pin icon

const Popup = () => {
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
          <RoomIcon fontSize="large" />
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
            Your Vehicle has arrived!
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: '#000000',
            }}
          >
            Once you enter the vehicle, press the button on the left side.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Popup;
