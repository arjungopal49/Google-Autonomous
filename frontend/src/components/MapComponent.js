import React, { useEffect } from 'react';

const MapComponent = ({ encodedPolyline, carLocation }) => {
  useEffect(() => {
    const initMap = () => {
      const center = { lat: 43.0765, lng: -89.405 };
      const map = new window.google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: center,
      });

      if (encodedPolyline) {
        const polylinePath = window.google.maps.geometry.encoding.decodePath(encodedPolyline);

        const polyline = new window.google.maps.Polyline({
          path: polylinePath,
          geodesic: true,
          strokeColor: "#FF0000",
          strokeOpacity: 1.0,
          strokeWeight: 4,
        });

        polyline.setMap(map);
      }

      // Add custom marker for car location if available
      if (carLocation) {
        const image = "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png";
        const carMarker = new window.google.maps.Marker({
          position: { lat: carLocation[0], lng: carLocation[1] },
          map: map,
          icon: image,
        });

        map.setCenter({ lat: carLocation[0], lng: carLocation[1] }); // Center map on car location
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
  }, [encodedPolyline, carLocation]); // Re-run effect if encodedPolyline or carLocation changes

  return <div id="map" style={{ width: '95vw', height: '90vh' }}></div>;
};

export default MapComponent;
