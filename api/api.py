import time
from flask import Flask, request, jsonify
import requests
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# temoporal API key
API_KEY = "AIzaSyCzPvBLp1FInh8TivgxTr01GzsJO4S78VM"

@app.route('/time')
def get_current_time():
    return {'time': time.time()}

@app.route('/travel-time', methods=['GET'])
def get_travel_time():
    origin = request.args.get('origin')
    destination = request.args.get('destination')

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
        return jsonify({'error': 'Invalid data received from Google Maps API'}), 500

    return jsonify({'origin': origin, 'destination': destination, 'travel_time': travel_time})

@app.route('/route', methods=['GET'])
def get_route():
    origin = request.args.get('origin')
    destination = request.args.get('destination')

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
        return jsonify({'error': 'Failed to fetch data from Google Routes API'}), 500

    data = response.json()

    try:
        polyline = data['routes'][0]['polyline']['encodedPolyline']
    except (KeyError, IndexError):
        return jsonify({'error': 'Invalid data received from Google Routes API'}), 500

    return jsonify({
        'origin': origin,
        'destination': destination,
        'encodedPolyline': polyline
    })

@app.route('/request-car', methods=['GET'])
def request_car():
    # Making a GET request to the /request-car endpoint of the server.mjs
    try:
        # Replace with the correct port if necessary
        server_url = "http://localhost:3000/request-car"

        # Make the request to the Express server
        response = requests.get(server_url)

        # Check if the request was successful
        if response.status_code == 200:
            free_cars = response.json()
            return jsonify(free_cars)
        else:
            return jsonify({'error': 'Failed to fetch car data from Express server'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500
