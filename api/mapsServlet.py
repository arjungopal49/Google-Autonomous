import requests
from flask import jsonify
from config import API_KEY

# temoporal API key
if not API_KEY:
    raise ValueError("API_KEY not found in config.py.")

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
    if not origin or not destination or origin == 'undefined' or destination == 'undefined':
        return "error"

    try:
        # Parse the coordinates
        origin_lat, origin_lng = map(float, origin.split(','))
        dest_lat, dest_lng = map(float, destination.split(','))

        url = 'https://routes.googleapis.com/directions/v2:computeRoutes'

        headers = {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': API_KEY,
            'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline'
        }

        body = {
            "origin": {
                "location": {
                    "latLng": {
                        "latitude": origin_lat,
                        "longitude": origin_lng
                    }
                }
            },
            "destination": {
                "location": {
                    "latLng": {
                        "latitude": dest_lat,
                        "longitude": dest_lng
                    }
                }
            },
            "travelMode": "DRIVE",
            "routingPreference": "TRAFFIC_AWARE",
            "computeAlternativeRoutes": False
        }

        response = requests.post(url, json=body, headers=headers)

        if response.status_code != 200:
            return "error"

        data = response.json()
        return data['routes'][0]['polyline']['encodedPolyline']

    except Exception as e:
        print(f"Error in get_route: {str(e)}")
        return "error"


def getRouteMatrix(carLocations, pickupLocation):
    url = "https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix"
    headers = {
        "Content-Type": "application/json",
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask': 'originIndex,destinationIndex,duration,distanceMeters,status,condition'
    }

    body = {
        "origins": [{"waypoint": {"location": {"latLng": {"latitude": loc[0], "longitude": loc[1]}}}} for loc in carLocations],
        "destinations": [{"waypoint": {"location": {"latLng": {"latitude": pickupLocation[0], "longitude": pickupLocation[1]}}}}],
        "travelMode": "DRIVE"
    }

    try:
        response = requests.post(url, headers=headers, json=body)
        response.raise_for_status()
        data = response.json()
    except requests.exceptions.RequestException as e:
        print(f"An error occurred while fetching the route matrix: {e}")
        return None
    
    results = []
    for element in data:
        index = element['originIndex']
        duration = element['duration']
        distance = element['distanceMeters']
        results.append({
            'carIndex': index,
            'origin': carLocations[index],
            'pickup_location': pickupLocation,
            'duration': duration,
            'distance': distance
        })

    return results


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
