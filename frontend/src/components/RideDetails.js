// RideDetails.js
import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

const RideDetails = ({ origin, destination }) => {
  return (
    <Box className="ride-details-overlay">
          <Typography variant="h5" component="div" gutterBottom>
            Ride Details
          </Typography>
          <Typography variant="body2" sx={{ mb: 1.5 }}>
            <strong>Origin:</strong> {origin}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1.5 }}>
            <strong>Destination:</strong> {destination}
          </Typography>
    </Box>
  );
};

export default RideDetails;
