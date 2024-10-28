import math
import time

import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
import mapsServlet
import carsServlet

app = Flask(__name__)
CORS(app)


@app.route('/time')
def get_current_time():
    return {'time':time.time()}


@app.route('/travel-time', methods=['GET'])
def get_travel_time_endpoint():
    origin = request.args.get('origin')
    destination = request.args.get('destination')

    travelTime = mapsServlet.get_travel_time(origin, destination)

    if travelTime == "error":
        return jsonify({'error': 'Invalid data received from Google Maps API'}), 500
    else:
        return jsonify({'origin': origin, 'destination': destination, 'travel_time': travelTime})


@app.route('/route', methods=['GET'])
def get_route():
    origin = request.args.get('origin')
    destination = request.args.get('destination')

    # Check for undefined or missing parameters
    if not origin or not destination or destination == 'undefined' or origin == 'undefined':
        return jsonify({
            'error': 'Origin and destination are required',
            'received': {
                'origin': origin,
                'destination': destination
            }
        }), 400

    try:
        polyline = mapsServlet.get_route(origin, destination)

        if polyline == "error":
            return jsonify({
                'error': 'Invalid data received from Google Maps API'
            }), 500

        return jsonify({
            'status': 'success',
            'origin': origin,
            'destination': destination,
            'encodedPolyline': polyline
        })

    except Exception as e:
        print(f"Error in route endpoint: {str(e)}")
        return jsonify({
            'error': 'Server error',
            'details': str(e)
        }), 500



@app.route('/choose-car', methods=['GET'])
def choose_car():
    origin = request.args.get('origin')
    destination = request.args.get('destination')
    type = request.args.get('type')

    originX, originY = 0,0
    destinationX, destinationY = 0,0
    if not type or type=="address":
        originX, originY = mapsServlet.addressToCoordinates(origin)
        destinationX, destinationY = mapsServlet.addressToCoordinates(destination)
    else:
        originX = float(origin.split(",")[0])
        originY = float(origin.split(",")[1])
        destinationX = float(destination.split(",")[0])
        destinationY = float(destination.split(",")[1])

    free_cars = carsServlet.request_car()
    closestDistance = math.inf
    closestCarIndex = -1
    for i in range (len(free_cars)):
        car = free_cars[i]
        if car["currentLocation"]:
            carX = float(car["currentLocation"][0])
            carY = float(car["currentLocation"][1])
            distance = math.sqrt((originX-carX)**2 + (originY-carY)**2)
            if distance < closestDistance:
                closestDistance = distance
                closestCarIndex = i
    if closestCarIndex == -1:
        return jsonify("no available cars")
    carsServlet.update_car(free_cars[closestCarIndex]["_id"], destinationX, destinationY)      
    arrivalTime = mapsServlet.get_travel_time(str(free_cars[closestCarIndex]["currentLocation"]).replace(" ", "").replace("'","")[1:-1], origin)
    return jsonify({'car': free_cars[closestCarIndex], 'arrival-time': arrivalTime})

@app.route('/free-all-cars', methods=['GET'])
def freeAllCars():
    cars = carsServlet.get_all_cars()
    for car in cars:
        if car["inUse"] != "No":
            carsServlet.freeUp_Car(car["_id"])
    return jsonify("All cars freed")