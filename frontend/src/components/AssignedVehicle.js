import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CardMedia from '@mui/material/CardMedia';
import logo from '../Images/Car.png'; // Correct import for local image

// Mock vehicle data
const mockVehicle = {
  id: '12345',
  driverName: 'John Doe',
  eta: 10, // Estimated Time of Arrival in minutes
  image: logo // Use the imported image for the vehicle
};

const AssignedVehicle = () => {
  // Uncomment to simulate no vehicle assigned
  // const vehicle = null;

  // Uncomment to simulate vehicle assigned
  const vehicle = mockVehicle;

  if (!vehicle) {
    return (
      <Box sx={{ minWidth: 275, mt: 4 }}>
        <Card elevation={3}>
          <CardContent>
            <Typography variant="body2" sx={{ mt: 2 }}>
              No vehicle assigned yet.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ minWidth: 275, mt: 4 }}>
      <Card elevation={3}>
        {/* CardMedia to display the car image */}
        <CardMedia
          component="img"
          height="150"
          image={vehicle.image} // Use the imported vehicle image
          alt="Assigned Vehicle"
        />
        <CardContent>
          <Typography variant="h5" component="div" gutterBottom>
            Assigned Vehicle
          </Typography>
          <Typography variant="body2" sx={{ mb: 1.5 }}>
            <strong>Vehicle ID:</strong> {vehicle.id}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1.5 }}>
            <strong>Driver Name:</strong> {vehicle.driverName}
          </Typography>
          <Typography variant="body2">
            <strong>Estimated Time of Arrival:</strong> {vehicle.eta} mins
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AssignedVehicle;
