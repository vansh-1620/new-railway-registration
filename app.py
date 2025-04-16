import os
import json
import logging
from datetime import datetime
from flask import Flask, render_template, request, jsonify, redirect, url_for, flash

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Initialize Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "trainman-secret-key")

# Load mock data
def load_trains():
    with open('static/data/trains.json', 'r') as f:
        return json.load(f)

def load_stations():
    with open('static/data/stations.json', 'r') as f:
        return json.load(f)

@app.route('/')
def home():
    stations = load_stations()
    return render_template('index.html', stations=stations)

@app.route('/search', methods=['GET'])
def search():
    from_station = request.args.get('from')
    to_station = request.args.get('to')
    date = request.args.get('date')
    
    if not from_station or not to_station or not date:
        flash('Please fill all required fields')
        return redirect(url_for('home'))
    
    # Load and filter trains based on search criteria
    trains = load_trains()
    filtered_trains = []
    
    for train in trains:
        # Check if train route includes both from and to stations in correct order
        if from_station in train['route'] and to_station in train['route']:
            from_index = train['route'].index(from_station)
            to_index = train['route'].index(to_station)
            if from_index < to_index:
                # Calculate journey time based on departure and arrival
                filtered_trains.append(train)
    
    stations = load_stations()
    return render_template('train_list.html', 
                          trains=filtered_trains, 
                          from_station=from_station, 
                          to_station=to_station, 
                          date=date,
                          stations=stations)

@app.route('/train/<train_number>')
def train_details(train_number):
    trains = load_trains()
    stations = load_stations()
    
    # Find the specific train
    train = next((t for t in trains if t['number'] == train_number), None)
    
    if not train:
        flash('Train not found')
        return redirect(url_for('home'))
    
    # Get station names from codes
    station_names = {station['code']: station['name'] for station in stations}
    
    return render_template('train_details.html', 
                          train=train, 
                          station_names=station_names,
                          stations=stations)

@app.route('/pnr')
def pnr_status():
    stations = load_stations()
    return render_template('pnr_status.html', stations=stations)

@app.route('/check_pnr', methods=['POST'])
def check_pnr():
    pnr = request.form.get('pnr')
    
    if not pnr or len(pnr) != 10 or not pnr.isdigit():
        flash('Please enter a valid 10-digit PNR number')
        return redirect(url_for('pnr_status'))
    
    # Mock PNR data - in a real app, this would come from an API
    pnr_data = {
        'pnr': pnr,
        'train_number': '12345',
        'train_name': 'Sample Express',
        'from': 'NDLS',
        'to': 'MMCT',
        'date': '2023-11-15',
        'class': 'SL',
        'status': 'CNF/B3/34',
        'passengers': [
            {'no': 1, 'booking_status': 'CNF/B3/34', 'current_status': 'CNF/B3/34'},
            {'no': 2, 'booking_status': 'CNF/B3/35', 'current_status': 'CNF/B3/35'}
        ]
    }
    
    stations = load_stations()
    return render_template('pnr_status.html', pnr_data=pnr_data, stations=stations)

@app.route('/seat_availability')
def seat_availability():
    train_number = request.args.get('train')
    from_station = request.args.get('from')
    to_station = request.args.get('to')
    date = request.args.get('date')
    train_class = request.args.get('class', 'SL')
    
    trains = load_trains()
    stations = load_stations()
    
    # Find the specific train if train number is provided
    train = None
    if train_number:
        train = next((t for t in trains if t['number'] == train_number), None)
    
    return render_template('seat_availability.html', 
                          train=train,
                          from_station=from_station,
                          to_station=to_station,
                          date=date,
                          train_class=train_class,
                          stations=stations)

@app.route('/check_availability', methods=['POST'])
def check_availability():
    train_number = request.form.get('train_number')
    from_station = request.form.get('from_station')
    to_station = request.form.get('to_station')
    date = request.form.get('date')
    train_class = request.form.get('class')
    
    if not train_number or not from_station or not to_station or not date or not train_class:
        flash('Please fill all required fields')
        return redirect(url_for('seat_availability'))
    
    # Mock availability data - in a real app, this would come from an API
    availability = [
        {'date': date, 'status': 'AVAILABLE-86', 'fare': '₹565'},
        {'date': '2023-11-16', 'status': 'AVAILABLE-120', 'fare': '₹565'},
        {'date': '2023-11-17', 'status': 'AVAILABLE-45', 'fare': '₹565'},
        {'date': '2023-11-18', 'status': 'RAC-15', 'fare': '₹565'},
        {'date': '2023-11-19', 'status': 'WL-12', 'fare': '₹565'}
    ]
    
    trains = load_trains()
    stations = load_stations()
    
    # Find the specific train
    train = next((t for t in trains if t['number'] == train_number), None)
    
    return render_template('seat_availability.html', 
                          train=train,
                          from_station=from_station,
                          to_station=to_station,
                          date=date,
                          train_class=train_class,
                          availability=availability,
                          stations=stations)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
