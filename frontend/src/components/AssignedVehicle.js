import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CardMedia from '@mui/material/CardMedia';
import logo from '../Images/Car.png';

const AssignedVehicle = ({ vehicle, arrivalTime, origin, destination, startRide }) => {
  // Determine button state based on vehicle's arrival status
  const isCarArrived = vehicle.status === 'waiting';

  return (
    <Box className="assigned-vehicle-overlay">
      <Card elevation={0} sx={{ width: 400, display: 'flex', flexDirection: 'column', alignItems: 'left' }}>
        {/* CardMedia */}
        <Box sx={{ display: 'flex', alignItems: 'left' }}>
          <CardMedia
            component="img"
            sx={{ width: 150, height: 150, objectFit: 'cover', marginRight: 2, marginTop: 5 }}
            image={logo}
            alt="Assigned Vehicle"
          />
          <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, alignItems: 'left' }}>
            <CardContent>
              <Typography
                variant="h5" gutterBottom
                sx={{ fontWeight: 'bold', color: '#4A90E2', textAlign: 'left'}}
              >
                {vehicle.status === 'ride' ? 'Ride In Progress' : 'Assigned Vehicle'}
              </Typography>
              <Typography variant="body1" align='left' sx={{ mb: 1.5 }}>
                <strong>Vehicle ID:</strong> {vehicle._id}
              </Typography>
              <Typography variant="body1" align='left' sx={{ mb: 1.5 }}>
                <strong>Arrival Time:</strong> {arrivalTime || 'N/A'}
              </Typography>
              <Typography variant="body1" align='left' sx={{ mb: 1.5 }}>
                <strong>Origin:</strong> {origin}
              </Typography>
              <Typography variant="body1" align='left' sx={{ mb: 1.5 }}>
                <strong>Destination:</strong> {destination}
              </Typography>
            </CardContent>
          </Box>
        </Box>
        <CardActions>
          <Button
            onClick={startRide}
            variant="contained"
            size="small"
            disabled={!isCarArrived}
            sx={{
              backgroundColor: isCarArrived ? '#007BFF' : '#CCCCCC',
              color: isCarArrived ? '#FFFFFF' : '#666666',
              mt: 2,
              mx: 'auto'
            }}
          >
            I'm in the Car
          </Button>
        </CardActions>
      </Card>
    </Box>
  );
};

export default AssignedVehicle;
