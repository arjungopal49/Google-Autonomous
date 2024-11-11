import React, { useEffect } from 'react';

const MapComponent = ({ encodedPolyline }) => {
  useEffect(() => {
    const initMap = () => {
      const center = { lat: 43.0765, lng: -89.405 };
      const map = new window.google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: center,
      });

      if (encodedPolyline) {
        // Decode the encoded polyline to get the path
        const polylinePath = window.google.maps.geometry.encoding.decodePath(encodedPolyline);

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
      }
    };

    const loadScript = () => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCDNOcShPLnjKVBPl5CGFWoGV6IzW3QDy8&libraries=geometry`;
      script.async = true;
      script.onload = initMap;
      document.head.appendChild(script);
    };

    loadScript();
  }, [encodedPolyline]);

  return <div id="map" style={{ width: '100vw', height: '90vh' }}></div>;
};

export default MapComponent;
