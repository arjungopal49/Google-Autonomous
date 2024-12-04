import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import PhoneIcon from '@mui/icons-material/Phone';
import StopCircleIcon from '@mui/icons-material/PanTool';

const SafetyFeatures = ({handleStopRide}) => {
  return (
    <Box
      className="safety-features-card"  
      sx={{
        position: 'fixed',
        bottom: '14%',
        left: '4%',
        zIndex: 1000,
        width: 480,
        padding: 2,
      }}
    >
      <Card elevation={3} sx={{ borderRadius: 2, padding: 2, backgroundColor: '#FFFFFF' }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4A90E2', marginBottom: 2 }}>
            Safety Features
          </Typography>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 2,
            }}
          >
            <Button
              variant="contained"
              startIcon={<ReportProblemIcon />}
              sx={{
                backgroundColor: '#FCFCFC',
                color: '#4A90E2',
                width: '45%',
                textTransform: 'none',
              }}
            >
              Report Issues
            </Button>
            <Button
              variant="contained"
              startIcon={<PhoneIcon />}
              sx={{
                backgroundColor: '#FCFCFC',
                color: '#4A90E2',
                width: '50%',
                textTransform: 'none',
              }}
            >
              Emergency Contact
            </Button>
          </Box>
          <Button
            onClick={handleStopRide}
            variant="contained"
            startIcon={<StopCircleIcon />}
            sx={{
              backgroundColor: '#E53935',
              color: '#FFFFFF',
              textTransform: 'none',
              width: '100%',
            }}
          >
            Stop Vehicle
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SafetyFeatures;
