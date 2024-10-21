import requests
from flask import jsonify

# temoporal API key
API_KEY = "AIzaSyCzPvBLp1FInh8TivgxTr01GzsJO4S78VM"


def get_travel_time(origin, destination):
    if not origin or not destination:
        return jsonify({'error': 'Origin and destination are required'}), 400

    url = 'https://maps.googleapis.com/maps/api/distancematrix/json'

    params = {
        'origins': origin,
        'destinations': destination,
        'key': API_KEY,
        'mode': 'driving'
    }

    response = requests.get(url, params=params)

    if response.status_code != 200:
        return jsonify({'error': 'Failed to fetch data from Google Maps API'}), 500

    data = response.json()

    try:
        travel_time = data['rows'][0]['elements'][0]['duration']['text']
    except (KeyError, IndexError):
        return "error"

    return travel_time



def get_route(origin, destination):
    if not origin or not destination:
        return jsonify({'error': 'Origin and destination are required'}), 400

    url = 'https://routes.googleapis.com/directions/v2:computeRoutes'

    headers = {
        'Content-Type': 'application/json',
        'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline'
    }

    params = {
        'key': API_KEY
    }

    body = {
        "origin": {
            "location": {
                "latLng": {
                    "latitude": float(origin.split(",")[0]),
                    "longitude": float(origin.split(",")[1])
                }
            }
        },
        "destination": {
            "location": {
                "latLng": {
                    "latitude": float(destination.split(",")[0]),
                    "longitude": float(destination.split(",")[1])
                }
            }
        },
        "travelMode": "DRIVE",
        "routingPreference": "TRAFFIC_AWARE",
        "computeAlternativeRoutes": False
    }

    response = requests.post(url, json=body, headers=headers, params=params)

    if response.status_code != 200:
        return "error"

    data = response.json()

    try:
        polyline = data['routes'][0]['polyline']['encodedPolyline']
    except (KeyError, IndexError):
        return "error"

    return polyline



def addressToCoordinates(address):
    base_url = "https://maps.googleapis.com/maps/api/geocode/json"
    params = {
        "address": address,
        "key": API_KEY
    }
    response = requests.get(base_url, params=params)
    if response.status_code == 200:
        data = response.json()
        if data['status'] == 'OK':
            location = data['results'][0]['geometry']['location']
            return location['lat'], location['lng']
        else:
            print("Geocoding error:", data['status'])
    else:
        print("HTTP error:", response.status_code)
    return None, None