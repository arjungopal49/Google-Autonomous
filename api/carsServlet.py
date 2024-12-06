import requests
from flask import jsonify


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
            # print(free_cars)
            return free_cars
        else:
            return jsonify({'error': 'Failed to fetch car data from Express server'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# abstract function for choose a car
# def choose_car(origin, destination):
#     try:
#         server_url = "http://localhost:4000/choose-car"

#         body = {
#             "orgin": origin,
#             "destination": destination,
#             "type": "address"
#         }

#         # Make the request to the Express server
#         response = requests.get(server_url)
#         # Check if the request was successful
#         if response.status_code == 200:
#             print("Choose Car Successfully")
#         else:
#             return jsonify({'error': 'Failed to choose a car'}), 500
#     except Exception as e:
#         return jsonify({'error': str(e)}), 500

def update_car(carId, x, y, status, locType):
    # Making a POST request to the /request-car endpoint of the server.mjs
    try:
        # Replace with the correct port if necessary
        server_url = "http://localhost:4000/update-car"

        body = {
            "carId": carId,
            "x": x,
            "y": y,
            "status": status,
            "locType": locType
        }

        # Make the request to the Express server
        response = requests.post(server_url, json=body)
        # Check if the request was successful
        if response.status_code == 200:
            print("Updates Successfully")
        else:
            return jsonify({'error': 'Failed to fetch car data from Express server'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

# This function calls the simulation server which then queries the database to return all 
# cars (both free and used)
# 
# this returns an array of free cars 
def get_all_cars():
    # Making a GET request to the /all-cars endpoint of the server.mjs
    try:
        # Replace with the correct port if necessary
        server_url = "http://localhost:4000/all-cars"

        # Make the request to the Express server
        response = requests.get(server_url)
        # Check if the request was successful
        if response.status_code == 200:
            cars = response.json()
            return cars
        else:
            return jsonify({'error': 'Failed to fetch car data from Express server'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
    

def freeUp_Car(carId):
    # making a POST request to the /free-car endpoint of the server.mjs
    try:
        # Replace with the correct port if necessary
        server_url = "http://localhost:4000/free-car"

        body = {
            "carId": carId
        }

        # Make the request to the Express server
        response = requests.post(server_url, json=body)
        # Check if the request was successful
        if response.status_code == 200:
            print("Car is now free")
        else:
            return jsonify({'error': 'Failed to fetch car data from Express server'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500


def generate_traffic(minLatLng, maxLatLng):
    # Making a GET request to the /generate-traffic endpoint of the server.mjs
    try:
        # Replace with the correct port if necessary
        server_url = "http://localhost:4000/generate-traffic"

        body = {
            "minLatLng": minLatLng,
            "maxLatLng": maxLatLng
        }

        # Make the request to the Express server
        response = requests.get(server_url, json=body)
        # Check if the request was successful
        if response.status_code == 200:
            print("Generates Traffic Successfully")
        else:
            return jsonify({'error': 'Failed to fetch car data from Express server'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

def remove_traffic(minLatLng, maxLatLng):
    # Making a GET request to the /remove-traffic endpoint of the server.mjs
    try:
        # Replace with the correct port if necessary
        server_url = "http://localhost:4000/remove-traffic"

        body = {
            "minLatLng": minLatLng,
            "maxLatLng": maxLatLng
        }

        # Make the request to the Express server
        response = requests.get(server_url, json=body)
        # Check if the request was successful
        if response.status_code == 200:
            print("Removes Traffic Successfully")
        else:
            return jsonify({'error': 'Failed to fetch car data from Express server'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

def set_speed(speed):
    # Making a POST request to the /set_speed endpoint of the server.mjs
    try:
        # Replace with the correct port if necessary
        server_url = "http://localhost:4000/set_speed"

        body = {
            "speed": speed
        }

        # Make the request to the Express server
        response = requests.post(server_url, json=body)
        # Check if the request was successful
        if response.status_code == 200:
            print("Speed Set Successfully")
        else:
            return jsonify({'error': 'Failed to fetch car data from Express server'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

def get_all_traffic():
    # Making a GET request to the /all-traffic endpoint of the server.mjs
    try:
        # Replace with the correct port if necessary
        server_url = "http://localhost:4000/all-traffic"

        # Make the request to the Express server
        response = requests.get(server_url)
        # Check if the request was successful
        if response.status_code == 200:
            traffic = response.json()
            return traffic
        else:
            return jsonify({'error': 'Failed to fetch traffic data from Express server'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500