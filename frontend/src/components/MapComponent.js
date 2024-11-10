import React, { useEffect } from 'react';

const MapComponent = () => {
  useEffect(() => {
    // Initialize map function
    const initMap = () => {
      const center = { lat: 43.0765, lng: -89.405 };

      // Example encoded polyline string
      const encodedPolyline = '_p~iF~ps|U_ulLnnqC_mqNvxq`@';

      // Decode the encoded polyline to get the path
      const polylinePath = window.google.maps.geometry.encoding.decodePath(encodedPolyline);

      // Create the map
      const map = new window.google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: center,
      });

      // Create the polyline
      const polyline = new window.google.maps.Polyline({
        path: polylinePath,
        geodesic: true,
        strokeColor: "#FF0000",
        strokeOpacity: 1.0,
        strokeWeight: 4,
      });

      // Set the polyline on the map
      polyline.setMap(map);
    };

    // Load the Google Maps script and initialize the map
    const loadScript = () => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCDNOcShPLnjKVBPl5CGFWoGV6IzW3QDy8&libraries=geometry`;
      script.async = true;
      script.onload = initMap;
      document.head.appendChild(script);
    };

    // Call the function to load the script
    loadScript();
  }, []);

  return <div id="map" style={{ width: '100vw', height: '90vh' }}></div>;
};

export default MapComponent;
