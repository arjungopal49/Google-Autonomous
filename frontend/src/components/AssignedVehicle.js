import React from 'react';
import Typography from '@mui/material/Typography';

const AssignedVehicle = ({ vehicle }) => {
  if (!vehicle) return <div><Typography variant="body2" sx={{ mt: 2, mb: -1 }}>No vehicle assigned yet.</Typography></div>;

  return (
    <div>
      <h2>Assigned Vehicle</h2>
      <p><strong>Vehicle ID:</strong> {vehicle.id}</p>
      <p><strong>Driver Name:</strong> {vehicle.driverName}</p>
      <p><strong>Estimated Time of Arrival:</strong> {vehicle.eta} mins</p>
    </div>
  );
};

export default AssignedVehicle;
