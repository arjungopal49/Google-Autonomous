import React, { useState, useEffect } from 'react';
import logo from './g-a.png';
import './App.css';
import TravelTime from './components/TravelTime';

function App() {
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    fetch('http://localhost:5000/time')
      .then(res => res.json())
      .then(data => {
        setCurrentTime(data.time);
      });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          The inital frontend page for google-autonomous
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <p>The current time is {currentTime}.</p>
        <TravelTime/>
      </header>
    </div>
  );
}

export default App;
