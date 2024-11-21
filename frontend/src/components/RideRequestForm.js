// RideRequestForm.js
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';

const RideRequestForm = ({ onSubmit }) => {
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      origin: pickupLocation,
      destination: dropoffLocation,
    });
    setPickupLocation('');
    setDropoffLocation('');
  };

  return (
      <Card
        sx={{
          width: '350px',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Typography
          variant="h5"
          sx={{ fontWeight: 'bold', color: '#4A90E2', textAlign: 'left', backgroundColor: '#fffff', padding: '0px', borderRadius: '8px 8px 0 0' }}
        >
          Request a Ride
        </Typography>
        <Typography
          variant="body2"
          sx={{ marginTop: '10px', textAlign: 'left', color: '#555' }}
        >
          Enter your pickup and drop-off locations
        </Typography>
        <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
          <TextField
            label="Pickup Location"
            variant="outlined"
            fullWidth
            value={pickupLocation}
            onChange={(e) => setPickupLocation(e.target.value)}
            placeholder="Enter pickup location"
            sx={{ marginBottom: '20px' }}
          />
          <TextField
            label="Destination"
            variant="outlined"
            fullWidth
            value={dropoffLocation}
            onChange={(e) => setDropoffLocation(e.target.value)}
            placeholder="Enter drop-off location"
            sx={{ marginBottom: '20px' }}
          />
          <Button
            variant="contained"
            type="submit"
            fullWidth
            sx={{
              backgroundColor: '#4A90E2',
              color: '#fff',
              textTransform: 'none',
              fontWeight: 'bold',
              borderRadius: '8px',
              '&:hover': {
                backgroundColor: '#357ABD',
              },
            }}
          >
            Book Ride
          </Button>
        </form>
      </Card>
  );
};

export default RideRequestForm;
