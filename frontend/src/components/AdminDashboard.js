import React, { useState, useEffect } from "react";
import MapComponentAdmin from './MapComponentAdmin';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import AdminHead from "./HeaderAdmin";

const AdminDashboard = () => {
  const [refreshRateInput, setRefreshRateInput] = useState("");
  const [refreshRate, setRefreshRate] = useState(5);
  const [cars, setCars] = useState([]);
  const [traffic, setTraffic] = useState([]);
  const [minLatLng, setMinLatLng] = useState("");
  const [maxLatLng, setMaxLatLng] = useState("");
  const [carId, setCarId] = useState("");
  const [locationX, setLocationX] = useState("");
  const [locationY, setLocationY] = useState("");
  const [carStatus, setCarStatus] = useState("");
  const [speed, setSpeed] = useState(1); // Default speed is 1
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch all cars periodically
  useEffect(() => {
    const fetchAllCarsAndTraffic = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/get-all-cars`, {
          method: 'GET',
        });
        const carData = await response.json();
        setCars(carData);

        const response2 = await fetch(`http://127.0.0.1:5000/get-all-traffic`, {
          method: 'GET',
        });
        const trafficData = await response2.json();
        setTraffic(trafficData);
      } catch (error) {
        console.error("Error fetching cars and traffic:", error);
        setStatusMessage("Failed to fetch cars and traffic.");
      }
    };

    const intervalId = setInterval(fetchAllCarsAndTraffic, refreshRate * 1000);
    fetchAllCarsAndTraffic();

    return () => clearInterval(intervalId);
  }, [refreshRate]);

  const updateCar = async () => {
    if (!carId || !locationX || !locationY || !carStatus) {
      setStatusMessage("Please fill in all car update fields.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/update-car?id=${carId}&location=${locationX},${locationY}&type=coords&status=${carStatus}`,
        { method: 'POST' }
      );
      console.log(await response.json());
      setStatusMessage("Car updated successfully.");
    } catch (error) {
      console.error("Error updating car:", error);
      setStatusMessage("Failed to update car.");
    }
    setLoading(false);
  };

  const freeCar = async (carId) => {
    setLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:5000/free-car?id=${carId}`, {
        method: 'POST',
      });
      console.log(await response.json());
      setStatusMessage("Car freed successfully.");
    } catch (error) {
      console.error("Error freeing car:", error);
      setStatusMessage("Failed to free car.");
    }
    setLoading(false);
  };

  const generateTraffic = async () => {
    if (!minLatLng || !maxLatLng) {
      setStatusMessage("Please enter both minimum and maximum coordinates.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/generate-traffic?minLatLng=${minLatLng.split(",").map(Number)}&maxLatLng=${maxLatLng.split(",").map(Number)}`,
        { method: 'POST' }
      );
      console.log(await response.json());
      setStatusMessage("Traffic generated successfully.");
    } catch (error) {
      console.error("Error generating traffic:", error);
      setStatusMessage("Failed to generate traffic.");
    }
    setLoading(false);
  };

  const removeTraffic = async () => {
    if (!minLatLng || !maxLatLng) {
      setStatusMessage("Please enter both minimum and maximum coordinates.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/remove-traffic?minLatLng=${minLatLng.split(",").map(Number)}&maxLatLng=${maxLatLng.split(",").map(Number)}`,
        { method: 'POST' }
      );
      console.log(await response.json());
      setStatusMessage("Traffic removed successfully.");
    } catch (error) {
      console.error("Error removing traffic:", error);
      setStatusMessage("Failed to remove traffic.");
    }
    setLoading(false);
  };

  const updateSpeed = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:5000/set-speed?speed=${speed}`, {
        method: 'POST',
      });
      console.log(await response.json());
      setStatusMessage(`Simulation speed updated to ${speed}.`);
    } catch (error) {
      console.error("Error setting speed:", error);
      setStatusMessage("Failed to set speed.");
    }
    setLoading(false);
  };

  const updateRefresh = () => {
    if (!refreshRateInput || isNaN(refreshRateInput) || refreshRateInput <= 0) {
      setStatusMessage("Please enter a valid positive refresh rate.");
      return;
    }
    setRefreshRate(refreshRateInput);
  };

  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: theme.palette.common.black,
      color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 14,
    },
  }));

  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
    '&:last-child td, &:last-child th': {
      border: 0,
    },
  }));

  const handleSpeedChange = (event, value) => {
    setSpeed(value);
  };

  return (
    <div className="app-container">
      <AdminHead />
      <div style={{ display: "flex", height: "100vh" }}>
        <div style={{ flex: 1, borderRight: "1px solid #ddd" }}>
          <MapComponentAdmin allCars={cars} allTraffic={traffic} />
        </div>
        <div style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
          {loading && <p>Loading...</p>}

          <div align="left">
          <Typography variant="h4">Cars List</Typography>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 700 }} aria-label="customized table">
              <TableHead>
                <TableRow>
                  <StyledTableCell>Car ID</StyledTableCell>
                  <StyledTableCell>Car Location</StyledTableCell>
                  <StyledTableCell>Car Status</StyledTableCell>
                  <StyledTableCell align="center">Action</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cars.map((car) => (
                  <StyledTableRow key={car._id}>
                    <StyledTableCell component="th" scope="row">
                      {car._id}
                    </StyledTableCell>
                    <StyledTableCell>
                      {car.currentLocation?.join(", ") || "Unknown"}
                    </StyledTableCell>
                    <StyledTableCell>{car.status}</StyledTableCell>
                    <StyledTableCell align="center">
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => freeCar(car._id)}
                        disabled={car.status === "free"}
                        sx={{
                          backgroundColor: car.status === "free" ? "#d3d3d3" : "primary.main",
                          color: car.status === "free" ? "#808080" : "white",
                          pointerEvents: car.status === "free" ? "none" : "auto",
                        }}
                      >
                        Free Up
                      </Button>
                    </StyledTableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>


          {/* Update Car */}
          <Card sx={{ marginTop: 3, padding: 3 }}>
            <CardContent>
              <Typography variant="h5" align="left">Update Car</Typography>
              <input
                type="text"
                placeholder="Car ID"
                value={carId}
                onChange={(e) => setCarId(e.target.value)}
                style={{ margin: "5px" }}
              />
              <input
                type="number"
                placeholder="Location X"
                value={locationX}
                onChange={(e) => setLocationX(e.target.value)}
                style={{ margin: "5px" }}
              />
              <input
                type="number"
                placeholder="Location Y"
                value={locationY}
                onChange={(e) => setLocationY(e.target.value)}
                style={{ margin: "5px" }}
              />
              <input
                type="text"
                placeholder="Status"
                value={carStatus}
                onChange={(e) => setCarStatus(e.target.value)}
                style={{ margin: "5px" }}
              />
            </CardContent>
            <CardActions style={{ justifyContent: 'center' }}>
              <Button variant="contained" color="primary" onClick={updateCar}>
                Update Car
              </Button>
            </CardActions>
          </Card>

          {/* Traffic Management */}
          <Card sx={{ marginTop: 3, padding: 3 }}>
            <CardContent>
              <Typography variant="h5" align="left">Traffic Management</Typography>
              <input
                type="text"
                placeholder="Min LatLng (e.g., 43.07,-89.4)"
                value={minLatLng}
                onChange={(e) => setMinLatLng(e.target.value)}
                style={{ margin: "5px" }}
              />
              <input
                type="text"
                placeholder="Max LatLng (e.g., 43.08,-89.39)"
                value={maxLatLng}
                onChange={(e) => setMaxLatLng(e.target.value)}
                style={{ margin: "5px" }}
              />
            </CardContent>
            <CardActions style={{ justifyContent: 'center' }}>
              <Button variant="contained" color="primary" onClick={generateTraffic}>
                Generate Traffic
              </Button>
              <Button variant="contained" color="secondary" onClick={removeTraffic}>
                Remove Traffic
              </Button>
            </CardActions>
          </Card>

          {/* Set Simulation Speed */}
          <Card sx={{ marginTop: 3, padding: 3 }}>
            <CardContent>
              <Typography variant="h5" align="left">Set Simulation Speed</Typography>
              <Slider
                value={speed}
                onChange={handleSpeedChange}
                aria-labelledby="simulation-speed-slider"
                step={1}
                marks={[
                  { value: 1, label: '1' },
                  { value: 3, label: '3' },
                  { value: 5, label: '5' },
                  { value: 7, label: '7' },
                  { value: 10, label: '10' },
                ]}
                min={1}
                max={10}
                valueLabelDisplay="on"
              />
            </CardContent>
            <CardActions style={{ justifyContent: 'center' }}>
              <Button variant="contained" color="primary" onClick={updateSpeed}>
                Set Speed
              </Button>
            </CardActions>
          </Card>

          {/* Set Refresh Rate */}
          <Card sx={{ marginTop: 3, padding: 3 }}>
            <CardContent>
              <Typography variant="h5" align="left">Set Refresh Rate</Typography>
              <input
                type="number"
                placeholder="Enter refresh rate"
                value={refreshRateInput}
                onChange={(e) => setRefreshRateInput(e.target.value)}
                style={{ margin: "5px" }}
              />
            </CardContent>
            <CardActions style={{ justifyContent: 'center' }}>
              <Button variant="contained" color="primary" onClick={updateRefresh}>
                Set Rate
              </Button>
            </CardActions>
          </Card>

          {statusMessage && <p>{statusMessage}</p>}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;