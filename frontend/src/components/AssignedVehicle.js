// AssignedVehicle.js
import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CardMedia from '@mui/material/CardMedia';
import logo from '../Images/Car.png'; 

const AssignedVehicle = ({ vehicle, arrivalTime }) => {
  return (
    <Box className="assigned-vehicle-overlay">
      <Card elevation={0}>
        <CardMedia
          component="img"
          height="150"
          image={logo} // Use the imported vehicle image
          alt="Assigned Vehicle"
        />
        <CardContent>
          <Typography variant="h5" component="div" gutterBottom>
            Assigned Vehicle
          </Typography>
          <Typography variant="body2" sx={{ mb: 1.5 }}>
            <strong>Vehicle ID:</strong> {vehicle._id}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1.5 }}>
            <strong>Arrival Time:</strong> {arrivalTime ? `${arrivalTime} ` : 'N/A'}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1.5 }}>
            <strong>Current Location:</strong> {vehicle.currentLocation.join(', ')}
          </Typography>
        </CardContent>
        <CardActions>
          <Button variant="contained" type="submit" size="small" sx={{ mt: 6, display: 'block', margin: '0 auto' }}>Track Vehicle</Button>
        </CardActions>
      </Card>
    </Box>
  );
};

export default AssignedVehicle;
