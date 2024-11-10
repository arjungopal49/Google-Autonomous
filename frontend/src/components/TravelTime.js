import React, { useState } from 'react';

function TravelTime() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [travelTime, setTravelTime] = useState('');
  const [error, setError] = useState(null);

  const getTravelTime = async () => {
    try {
      // Make a GET request to the Flask backend
      const response = await fetch(
        `http://127.0.0.1:5000/travel-time?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`
      );

      // Check if the response is okay
      if (!response.ok) {
        throw new Error('Failed to fetch travel time');
      }

      const data = await response.json();

      // Update the travel time in the state
      setTravelTime(data.travel_time);
      setError(null);
    } catch (err) {
      setError(err.message);
      setTravelTime('');
    }
  };

  return (
    <div>
      <h1>Travel Time Calculator</h1>
      <div>
        <label>
          Origin:
          <input
            type="text"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            placeholder="Enter origin"
          />
        </label>
      </div>
      <div>
        <label>
          Destination:
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Enter destination"
          />
        </label>
      </div>
      <button onClick={getTravelTime}>Get Travel Time</button>

      {travelTime && <h2>Travel Time: {travelTime}</h2>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default TravelTime;
