import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';


const bull = (
    <Box
      component="span"
      sx={{ display: 'inline-block', mx: '2px', transform: 'scale(0.8)' }}
    >
      •
    </Box>
  );
  
  const RideRequestForm = ({ onSubmit }) => {
    const [pickupLocation, setPickupLocation] = useState('');
    const [dropoffLocation, setDropoffLocation] = useState('');
  
    const handleSubmit = (e) => {
      e.preventDefault();
      // Send ride request
      onSubmit({ pickupLocation, dropoffLocation });
      setPickupLocation('');
      setDropoffLocation('');
    };
  
    return (
      <Box sx={{ minWidth: 275, mt: 4 }}>
        {/* Add elevation to the Card */}
        <Card elevation={3}>
          <CardContent>
            <Typography gutterBottom sx={{ color: 'text.primary', fontSize: 18 }}>
              Ride Request Form
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: 12, mb: 1.5 }}>
              Fill in the details below
            </Typography>
            
            {/* Form fields */}
            <form onSubmit={handleSubmit}>
              <div>
                <Typography variant="body2" sx={{ mb: -1 }}>Pick-up Location</Typography>
                <input 
                  type="text" 
                  value={pickupLocation} 
                  onChange={(e) => setPickupLocation(e.target.value)} 
                  placeholder="Enter pick-up location" 
                />
              </div>
              <div>
                <Typography variant="body2" sx={{ mt: 2, mb: -1 }}>Drop-off Location</Typography>
                <input 
                  type="text" 
                  value={dropoffLocation} 
                  onChange={(e) => setDropoffLocation(e.target.value)} 
                  placeholder="Enter drop-off location" 
                />
                <p>

                </p>
              </div>
              <CardActions>
                <Button variant="contained" type="submit" size="small" sx={{ mt: 6, display: 'block', margin: '0 auto' }}>Submit Request</Button>
              </CardActions>
            </form>
          </CardContent>
        </Card>
      </Box>
    );
  };
  
  export default RideRequestForm;
  
  