import React, { useEffect, useRef } from 'react';
import carGreen from '../Images/carGreen.png';
import carRed from '../Images/carRed.png';

const MapComponentAdmin = ({ encodedPolyline, carLocation, carDest, allCars, allTraffic }) => {
  const mapRef = useRef(null);  // Store map instance
  const polylineRef = useRef(null); // Store polyline instance
  const markersRef = useRef([]); // Store markers
  const trafficBoxesRef = useRef([]); // store traffic boxes

  useEffect(() => {
    const initMap = () => {
      const center = { lat: 43.0765, lng: -89.405 };
      mapRef.current = new window.google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: center,
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

      // Optionally, center the map around the first car (if available)
      if (allCars.length > 0) {
        mapRef.current.setCenter({
          lat: allCars[0].currentLocation[0],
          lng: allCars[0].currentLocation[1],
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
  }, [allCars, allTraffic]); // Update markers whenever allCars changes

  return <div id="map" style={{ width: '50vw', height: '90vh' }}></div>;
};

export default MapComponentAdmin;
