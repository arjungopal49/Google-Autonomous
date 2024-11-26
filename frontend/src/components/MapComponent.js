import React, { useEffect, useRef } from 'react';
import carGreen from '../Images/carGreen.png';
import carRed from '../Images/carRed.png';

const MapComponent = ({ encodedPolyline, carLocation, carDest, allCars }) => {
  const mapRef = useRef(null); // Store map instance
  const polylineRef = useRef(null); // Store polyline instance
  const markersRef = useRef([]); // Store markers

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
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];

      if (carLocation && carDest) {
        const image = {
          url: "https://cdn.prod.website-files.com/62c5e0898dea0b799c5f2210/62e8212acc540f291431bad2_location-icon.png",
          scaledSize: new window.google.maps.Size(32, 32),
        };
        const destinationMarker = new window.google.maps.Marker({
          position: { lat: carDest[0], lng: carDest[1] },
          map: mapRef.current,
          icon: image,
        });
        const carMarker = new window.google.maps.Marker({
          position: { lat: carLocation[0], lng: carLocation[1] },
          map: mapRef.current,
          icon: {
            url: carRed,
            scaledSize: new window.google.maps.Size(60, 50)
          }
        });
        markersRef.current.push(destinationMarker);
        markersRef.current.push(carMarker);
        mapRef.current.setCenter({ lat: carLocation[0], lng: carLocation[1] }); // Center map on car location
      } else if (allCars) {
        allCars
          .filter(car => car.status === 'free') // Only include cars that are free
          .forEach(car => {
            const carMarker = new window.google.maps.Marker({
              position: { lat: car.currentLocation[0], lng: car.currentLocation[1] },
              map: mapRef.current,
              icon: {
                url: carGreen,
                scaledSize: new window.google.maps.Size(60, 50)
              }
            });
            markersRef.current.push(carMarker);
          });
      }
    }
  }, [carLocation, allCars]); // Update markers when carLocation or allCars changes

  return <div id="map" style={{ width: '95vw', height: '90vh' }}></div>;
};

export default MapComponent;
