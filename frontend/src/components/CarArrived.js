// CarArrived.js
import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';

const CarArrived = ({ startRide }) => {
  return (
    <Box className="assigned-vehicle-overlay">
      <Card elevation={0}>
        <CardContent>
          <Typography variant="h5" component="div" gutterBottom>
            Update
          </Typography>
          <Typography variant="body2" sx={{ mb: 1.5 }}>
            <strong>Your car has arrived!</strong>
          </Typography>
        </CardContent>
        <CardActions>
          <Button 
            onClick={startRide} 
            variant="contained" type="submit" size="small" sx={{ mt: 6, display: 'block', margin: '0 auto' }}>I'm in the Car</Button>
        </CardActions>
      </Card>
    </Box>
  );
};

export default CarArrived;
