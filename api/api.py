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
