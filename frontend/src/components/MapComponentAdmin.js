import React, { useEffect, useRef, useState } from 'react';
import carGreen from '../Images/carGreen.png';
import carRed from '../Images/carRed.png';

const MapComponentAdmin = ({ encodedPolyline, carLocation, carDest, allCars, allTraffic }) => {
  const mapRef = useRef(null);  // Store map instance
  const polylineRef = useRef(null); // Store polyline instance
  const markersRef = useRef([]); // Store markers
  const trafficBoxesRef = useRef([]); // Store traffic boxes
  const [popupVisible, setPopupVisible] = useState(false);

  useEffect(() => {
    const initMap = () => {
      const center = { lat: 43.0765, lng: -89.405 };
      mapRef.current = new window.google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: center,
      });

      // Add click listener to the map
      mapRef.current.addListener('click', (event) => {
        const { latLng } = event;
        const coordinates = `${latLng.lat()}, ${latLng.lng()}`; // Raw coordinates
        console.log(`Clicked coordinates: ${coordinates}`);
        
        // Copy raw coordinates to clipboard
        navigator.clipboard.writeText(coordinates)
          .then(() => {
            console.log('Coordinates copied to clipboard');
            setPopupVisible(true); // Show popup
            setTimeout(() => setPopupVisible(false), 2000); // Hide after 2 seconds
          })
          .catch(err => {
            console.error('Failed to copy coordinates to clipboard', err);
          });
      });
    };

    const loadScript = () => {
      if (!window.google) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCDNOcShPLnjKVBPl5CGFWoGV6IzW3QDy8&libraries=geometry`;
        script.async = true;
        script.onload = initMap;
        document.head.appendChild(script);
      } else {
        initMap();
      }
    };

    loadScript();
  }, []);

  useEffect(() => {
    if (mapRef.current && !encodedPolyline) {
      if (polylineRef.current) {
        polylineRef.current.setMap(null); 
      }
    }
    if (mapRef.current && encodedPolyline) {
      if (polylineRef.current) {
        polylineRef.current.setMap(null); 
      }
      const polylinePath = window.google.maps.geometry.encoding.decodePath(encodedPolyline);
      polylineRef.current = new window.google.maps.Polyline({
        path: polylinePath,
        geodesic: true,
        strokeColor: "#4285F4",
        strokeOpacity: 1.0,
        strokeWeight: 6,
      });
      polylineRef.current.setMap(mapRef.current);
    }
  }, [encodedPolyline]); // Update polyline only when encodedPolyline changes

  useEffect(() => {
    if (mapRef.current) {
      // Clear existing markers
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];

      // Clear existing traffic boxes
      trafficBoxesRef.current?.forEach(box => box.setMap(null));
      trafficBoxesRef.current = [];

      // Show all cars
      if (allCars) {
        allCars.forEach(car => {
          const carMarker = new window.google.maps.Marker({
            position: { lat: car.currentLocation[0], lng: car.currentLocation[1] },
            map: mapRef.current,
            icon: {
              url: car.status === 'free' ? carGreen : carRed,
              scaledSize: new window.google.maps.Size(60, 50),
            },
          });
          markersRef.current.push(carMarker);
        });
      }

      // Show all traffic boxes
      if (allTraffic) {
        allTraffic.forEach(traffic => {
          const [minLat, minLng] = traffic.minLatLng.split(',').map(coord => parseFloat(coord.trim()));
          const [maxLat, maxLng] = traffic.maxLatLng.split(',').map(coord => parseFloat(coord.trim()));
          const trafficBox = new window.google.maps.Rectangle({
            bounds: {
              north: maxLat,
              south: minLat,
              east: maxLng,
              west: minLng,
            },
            map: mapRef.current,
            fillColor: 'rgba(255, 0, 0, 0.4)',
            strokeColor: 'red',
            strokeOpacity: 0.8,
            strokeWeight: 2,
          });
          trafficBoxesRef.current.push(trafficBox);
        });
      }
    }
  }, [allCars, allTraffic]); // Update markers and traffic boxes when props change

  return (
    <div style={{ position: 'relative' }}>
      <div id="map" style={{ width: '50vw', height: '90vh' }}></div>
      {popupVisible && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'black',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '5px',
          fontSize: '14px',
          zIndex: 1000,
        }}>
          Coordinates copied to clipboard!
        </div>
      )}
    </div>
  );
};

export default MapComponentAdmin;
