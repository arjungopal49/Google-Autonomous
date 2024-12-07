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

# choose car helper function
def get_closest_car(origin, destination, type):
    originX, originY = 0, 0
    destinationX, destinationY = 0, 0
    if not type or type == "address":
        originX, originY = mapsServlet.addressToCoordinates(origin)
        destinationX, destinationY = mapsServlet.addressToCoordinates(destination)
    else:
        originX = float(origin.split(",")[0])
        originY = float(origin.split(",")[1])
        destinationX = float(destination.split(",")[0])
        destinationY = float(destination.split(",")[1])

    free_cars = carsServlet.request_car()
    if len(free_cars) == 0:
        return None, "no available cars"
    
    selected_cars = [car for car in free_cars if not car["isInTraffic"]]
    if len(selected_cars) == 0:
        selected_cars = free_cars

    carLocations = []
    for car in selected_cars:
        carX = float(car["currentLocation"][0])
        carY = float(car["currentLocation"][1])
        carLocations.append([carX, carY])
    pickupLocation = [originX, originY]
    results = mapsServlet.getRouteMatrix(carLocations, pickupLocation)
    closestCarIndex = min(results, key=lambda x: int(x['duration'].strip('s')))['carIndex']

    carsServlet.update_car(selected_cars[closestCarIndex]["_id"], originX, originY, "toUser", "destination")

    arrivalTime = mapsServlet.get_travel_time(
        str(selected_cars[closestCarIndex]["currentLocation"]).replace(" ", "").replace("'", "")[1:-1], origin)
    polyline = mapsServlet.get_route(
        str(selected_cars[closestCarIndex]["currentLocation"]).replace(" ", "").replace("'", "")[1:-1], origin)
    
    selected_cars[closestCarIndex]["status"] = "toUser"
    return {'car': selected_cars[closestCarIndex], 'arrival-time': arrivalTime, 'route': polyline}, None

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
    dType = request.args.get('type')
    response, error = get_closest_car(origin, destination, dType)
    carsServlet.set_in_traffic_status()
    if error:
        return jsonify(error)
    return jsonify(response)

@app.route('/free-all-cars', methods=['POST'])
def freeAllCars():
    cars = carsServlet.get_all_cars()
    for car in cars:
        if car["status"] != "free":
            carsServlet.freeUp_Car(car["_id"])
    return jsonify("All cars freed")


@app.route('/free-car', methods=['POST'])
def freeCar():
    carId = request.args.get('id')
    carsServlet.freeUp_Car(carId)
    return jsonify("Car freed")


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

# params:
# id - id of the car currently travelling
#
# return:
# car - the car object, including it's current location
# remaining-time - the estimated travel time remaining from the car's current location to the destination
# remaining-route - the route polyline from the car's current location to the destination
@app.route('/track-progress', methods=['GET'])
def trackProgress():
    carId = request.args.get('id')

    cars = carsServlet.get_all_cars()
    car = next((car for car in cars if car['_id'] == carId), None)
    if not car:
        return jsonify({"error": "Car not found"}), 404
    
    # if the car is in traffic, choose another car
    if car["isInTraffic"] and car["status"] == "toUser":
        carsServlet.freeUp_Car(car["_id"])
        carsServlet.set_in_traffic_status()
        origin = ','.join(map(str, car["Destination"]))
        dType = "coordinates"
        response, error = get_closest_car(origin, origin, dType)
        if error:
            return jsonify({"error": error})
        return jsonify({'alert': "reassign", 'car': response['car'], 'remaining-time': response['arrival-time'], 'remaining-route': response['route']})

    carCurrLoc = str(car["currentLocation"]).replace(" ", "").replace("'","")[1:-1]
    carDest = str(car["Destination"]).replace(" ", "").replace("'","")[1:-1]
    if car["status"] == "waiting" or car["status"] == "free":
        return jsonify({'car': car, 'remaining-time': "0", 'remaining-route': ""})
    remainingTime = mapsServlet.get_travel_time(carCurrLoc, carDest)
    return jsonify({'alert': "none", 'car': car, 'remaining-time': remainingTime, 'remaining-route': car["polyline"]})


@app.route('/start-ride', methods=['POST'])
def startRide():
    carId = request.args.get('id')
    destination = request.args.get('destination')
    type = request.args.get('type')

    destinationX, destinationY = 0,0
    if not type or type=="address":
        destinationX, destinationY = mapsServlet.addressToCoordinates(destination)
    else:
        destinationX = float(destination.split(",")[0])
        destinationY = float(destination.split(",")[1])

    carsServlet.update_car(carId, destinationX, destinationY, "ride", "destination")
    return jsonify("ride started")


@app.route('/update-car', methods=['POST'])
def updateCar():
    carId = request.args.get('id')
    location = request.args.get('location')
    type = request.args.get('type')
    status = request.args.get('status')
    locationX, locationY = 0,0
    print(location)

    if not type or type=="address":
        locationX, locationY = mapsServlet.addressToCoordinates(location)
    else:
        locationX = float(location.split(",")[0])
        locationY = float(location.split(",")[1])

    carsServlet.update_car(carId, locationX, locationY, status, "current")
    return jsonify("car updated")


@app.route('/generate-traffic', methods=['POST'])
def generateTraffic():
    minLatLng = request.args.get('minLatLng')
    maxLatLng = request.args.get('maxLatLng')
    carsServlet.generate_traffic(minLatLng, maxLatLng)
    return jsonify("traffic generated")

@app.route('/remove-traffic', methods=['POST'])
def removeTraffic():
    minLatLng = request.args.get('minLatLng')
    maxLatLng = request.args.get('maxLatLng')
    carsServlet.remove_traffic(minLatLng, maxLatLng)
    return jsonify("traffic removed")


@app.route('/get-all-traffic', methods=['GET'])
def getAllTraffic():
    traffic = carsServlet.get_all_traffic()
    return jsonify(traffic)


@app.route('/set-speed', methods=['POST'])
def setSpeed():
    speed = request.args.get('speed')
    carsServlet.set_speed(speed)
    return jsonify("speed set")