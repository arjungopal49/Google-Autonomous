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

    polyline = mapsServlet.get_route(origin, destination)

    if polyline == "error":
        return jsonify({'error': 'Invalid data received from Google Maps API'}), 500
    else:
        return jsonify({'origin': origin, 'destination': destination, 'encodedPolyline': polyline})


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
    print(arrivalTime)
    return jsonify({'car': free_cars[closestCarIndex], 'arrival-time': arrivalTime})


# dummy function to test the freeUpCar endpoint
# def freeUp_Car(carId):
#     # making a POST request to the /free-car endpoint of the server.mjs
#     try:
#         # Replace with the correct port if necessary
#         server_url = "http://localhost:4000/free-car"
#
#         body = {
#             "carId": carId
#         }
#
#         # Make the request to the Express server
#         response = requests.post(server_url, json=body)
#         # Check if the request was successful
#         if response.status_code == 200:
#             print("Car is now free")
#         else:
#             return jsonify({'error': 'Failed to fetch car data from Express server'}), 500
#     except Exception as e:
#         return jsonify({'error': str(e)}), 500
#
#
# freeUp_Car("6716a232c74b623f03d4b134")