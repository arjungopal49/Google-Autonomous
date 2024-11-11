import time

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
    type = request.args.get('type')

    print(type)
    # Check for undefined or missing parameters
    if not origin or not destination or destination == 'undefined' or origin == 'undefined':
        return jsonify({
            'error': 'Origin and destination are required',
            'received': {
                'origin': origin,
                'destination': destination
            }
        }), 400

    if not type or type=="address":
        origin = ",".join(map(str, mapsServlet.addressToCoordinates(origin)))
        destination = ",".join(map(str, mapsServlet.addressToCoordinates(destination)))
        

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

# params:
# origin - current location/pick up location for the user
# destination - destination location for the user
# type - address or coordinate
#
# return:
# car - the car object which is chosen for the user
# arrival-time - the estimated arrival time for the car to arrive at the pickup location
# route - the polyline route from the car to the pickup location
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
    if len(free_cars) == 0:
        return jsonify("no available cars")

    carLocations = []
    for car in free_cars:
        carX = float(car["currentLocation"][0])
        carY = float(car["currentLocation"][1])
        carLocations.append([carX, carY])
    pickupLocation = [originX, originY]
    results = mapsServlet.getRouteMatrix(carLocations, pickupLocation)
    closestCarIndex = min(results, key=lambda x: int(x['duration'].strip('s')))['carIndex']

    carsServlet.update_car(free_cars[closestCarIndex]["_id"], destinationX, destinationY)

    arrivalTime = mapsServlet.get_travel_time(str(free_cars[closestCarIndex]["currentLocation"]).replace(" ", "").replace("'","")[1:-1], origin)
    polyline = mapsServlet.get_route(str(free_cars[closestCarIndex]["currentLocation"]).replace(" ", "").replace("'","")[1:-1], origin)

    return jsonify({'car': free_cars[closestCarIndex], 'arrival-time': arrivalTime, 'route': polyline})


@app.route('/free-all-cars', methods=['POST'])
def freeAllCars():
    cars = carsServlet.get_all_cars()
    for car in cars:
        if car["inUse"] != "No":
            carsServlet.freeUp_Car(car["_id"])
    return jsonify("All cars freed")


@app.route('/get-all-cars', methods=['GET'])
def getAllCars():
    cars = carsServlet.get_all_cars()
    return jsonify(cars)


@app.route('/get-car', methods=['GET'])
def getCar():
    carId = request.args.get('id')
    cars = carsServlet.get_all_cars()
    
    car = next((car for car in cars if car['_id'] == carId), None)
    if car:
        return jsonify(car), 200
    else:
        return jsonify({"error": "Car not found"}), 404
    
