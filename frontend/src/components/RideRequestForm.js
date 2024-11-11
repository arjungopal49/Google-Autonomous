// RideRequestForm.js
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

const RideRequestForm = ({ onSubmit }) => {
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Ensure the locations are sent as latitude,longitude
    onSubmit({
      origin: pickupLocation,  // Example format: "37.7749,-122.4194"
      destination: dropoffLocation // Example format: "37.8716,-122.2727"
    });
    setPickupLocation('');
    setDropoffLocation('');
  };

  return (
    <Box sx={{ minWidth: 275, mt: 4 }}>
          <Typography gutterBottom sx={{ color: 'text.primary', fontSize: 18 }}>
            Request a Ride
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: 12, mb: 1.5 }}>
            Fill in the details below
          </Typography>

          {/* Form for entering locations */}
          <form onSubmit={handleSubmit}>
            <div>
              <Typography variant="body2" sx={{ mb: 0 }}>Pick-up Location</Typography>
              <input 
                type="text" 
                value={pickupLocation} 
                onChange={(e) => setPickupLocation(e.target.value)} 
                placeholder="Enter pick-up location" 
              />
            </div>
            <div>
              <Typography variant="body2" sx={{ mt: 2, mb: 0 }}>Drop-off Location</Typography>
              <input 
                type="text" 
                value={dropoffLocation} 
                onChange={(e) => setDropoffLocation(e.target.value)} 
                placeholder="Enter drop-off location" 
              />
            </div>
            <CardActions>
              <Button variant="contained" type="submit" size="small" sx={{ mt: 6, display: 'block', margin: '0 auto' }}>Submit Request</Button>
            </CardActions>
          </form>
    </Box>
  );
};

export default RideRequestForm;
