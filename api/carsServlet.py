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



def update_car(carId, destinationX, destinationY):
    # Making a POST request to the /request-car endpoint of the server.mjs
    try:
        # Replace with the correct port if necessary
        server_url = "http://localhost:4000/update-car"

        body = {
            "carId": carId,
            "destinationX": destinationX,
            "destinationY": destinationY
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