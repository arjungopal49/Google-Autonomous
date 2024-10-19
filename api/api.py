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
    return {'time':time.time()}

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
    
# This function calls the simulation server which then queries the database to return all of the 
# available (free) cars 
#
# this returns an array of free cars 
def request_car():
    # Making a GET request to the /request-car endpoint of the server.mjs
    try:
        # Replace with the correct port if necessary
        server_url = "http://localhost:4000/request-car"

        # Make the request to the Express server
        response = requests.get(server_url)
        # Check if the request was successful
        if response.status_code == 200:
            free_cars = response.json()
            print(free_cars)
            return free_cars
        else:
            return jsonify({'error': 'Failed to fetch car data from Express server'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def update_car(carId, destinationX, destinationY):
    # Making a POST request to the /request-car endpoint of the server.mjs
    try:
        # Replace with the correct port if necessary
        server_url = "http://localhost:4000/update-car"

        # Create the data payload
        body = {
            'carId': carId,
            'destinationX': destinationX,
            'destinationY': destinationY
        }

        # Send the request to the Express server with the JSON body
        response = requests.post(server_url, json=body)  # Sending the JSON payload
        # Check if the request was successful
        if response.status_code == 200:
            print("good!")
        else:
            return jsonify({'error': 'Failed to fetch car data from Express server'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
update_car('6706fa8bb25d3310bd0e84a7', 1, 2)
# This is example output of what free cars array could be, in this case there are three free cars
# [
#   {
#     _id: new ObjectId('6706fa8bb25d3310bd0e84a7'),
#     currentLocation: [ 10, 30 ],
#     Destination: [ 5280, 90 ],
#     inUse: 'No'
#   },
#   {
#     _id: new ObjectId('6706fc51b25d3310bd0e84a9'),
#     currentLocation: [ 10, 20 ],
#     Destination: [ 5280, 90 ],
#     inUse: 'No'
#   },
#   {
#     _id: new ObjectId('6706fd51b25d3310bd0e84aa'),
#     currenLocation: [ 20, 10 ],
#     Destination: [ 5, 300 ],
#     inUse: 'No'
#   }
# ]