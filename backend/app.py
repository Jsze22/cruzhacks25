from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import math
from datetime import datetime, timezone
import pytz

app = Flask(__name__)
CORS(app)

# Configure SQLite database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///attendance.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Global variable to store the active attendance code
# In a production application, you'd want to store this in a database with expiration, etc.
CURRENT_CODE = None
GEOfENCE = {}

class User(db.Model):
    id = db.Column(db.Integer, primary_key= True)
    username = db.Column(db.String(80), unique= True, nullable= False)
    checkins = db.relationship('CheckIn', backref = 'user', lazy = True)

    def __repr__(self):
        return f"<User {self.username}>"


pacific = pytz.timezone("US/Pacific")

class CheckIn(db.Model):
    id = db.Column (db.Integer, primary_key = True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable = False)
    lat = db.Column(db.Float, nullable = False)
    lng = db.Column(db.Float, nullable = False)
    timestamp = db.Column(db.DateTime, nullable = False, default= lambda: datetime.now(pacific))
    distance = db.Column(db.Float)


    def __repr__(self):
        return f"<Checkin user:{self.user_id} at {self.timestamp}>"

# GEOfENCE = {
#     "lat": 40.7128,
#     "lng": -74.0060,
#     "radius": 1000  # in meters
# }

# GEOfENCE = {
#     "lat": 100.7128,
#     "lng": -740.0060,
#     "radius": 1000  # in meters
# }

def calc(lat1, lon1, lat2, lon2):
    """
    Calculate the great-circle distance between two points on the earth (specified in decimal degrees).
    Returns the distance in meters.
    """
    #convert decimal degrees to radians
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])

    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    distance = 6371000 * c  # Radius of Earth in meters (6,371 km)
    return distance



# @app.route('/api/geofence', methods=['GET'])
# def get_geofence():
#     return jsonify({"campus": {"lat": 40.7128, "lng": -74.0060, "radius": 1000}})

@app.route('/api/setsession', methods=['POST'])
def set_session():
    global CURRENT_CODE, GEOfENCE
    data = request.get_json()
    code = data.get("code")
    classroom = data.get("classroom")

    if not code or not classroom:
        return jsonify({"status": "Error", "message": "Both code and classroom data must be provided"}), 400


    # Extract classroom details
    lat = classroom.get("lat")
    lng = classroom.get("lng")
    radius = classroom.get("radius")

    if lat is None or lng is None or radius is None:
        return jsonify({"status": "Error", "message": "Incomplete classroom information"}), 400


    CURRENT_CODE = code
    GEOfENCE = {
        "lat": lat,
        "lng": lng,
        "radius": radius,
    }
    print(f"Set current attendance code: {CURRENT_CODE}")
    print(GEOfENCE)
    return jsonify({"status": "Success", "message": "Attendance code set", "current_code": CURRENT_CODE, "classroom": GEOfENCE,})


@app.route('/api/attendance', methods=['POST'])
def check_in():
    data = request.get_json()

    entered_code = data.get("code")
    if not entered_code:
        return jsonify({"status": "Error", "message": "No attendance code provided"}), 400
    
    if CURRENT_CODE is None:
        return jsonify({"status": "Error", "message": "Attendance code not set by teacher"}), 400
    
    if entered_code != CURRENT_CODE:
        return jsonify({"status": "Invalid", "message": "Incorrect attendance code"}), 403

    # Process data (like user_id, current location, timestamp)
    user_location = data.get("location")

    if not user_location:
        return jsonify({"status": "Error", "message": "No location provided"}), 400
    
    user_lat = user_location.get("lat")
    user_lng = user_location.get("lng")

    # Make sure both latitude and longitude are provided
    if user_lat is None or user_lng is None:
        return jsonify({"status": "Error", "message": "Incomplete location data"}), 400
    
    user_id = data.get("user_id")
    if not user_id:
        return jsonify({"status": "Error", "message": "No user_id provided"}), 400
    
    campus_lat = GEOfENCE["lat"]
    campus_lng = GEOfENCE["lng"]
    radius = GEOfENCE["radius"]


    distance = calc(user_lat, user_lng, campus_lat, campus_lng)

    print(f"User location: ({user_lat}, {user_lng})")
    print(f"Campus location: ({campus_lat}, {campus_lng})")
    print(f"Distance: {distance} meters")


    if distance <= radius:
        # the location is within the acceptable range.
        #log the valid check-in into a database
        check_in_record = CheckIn(user_id=user_id, lat=user_lat, lng=user_lng, timestamp=datetime.utcnow(), distance=distance)
        db.session.add(check_in_record)
        db.session.commit()
        return jsonify({
            "status": "Valid",
            "message": "Check-in successful. Your location is within range.",
            "distance": distance,
            "data": data
        })
    else:
        # the location is too far
        return jsonify({
            "status": "Invalid",
            "message": f"Check-in failed. You are too far away (distance: {distance:.2f} meters).",
            "distance": distance
        }), 403


    





if __name__ == '__main__':
    with app.app_context():
        db.create_all()  #creates all defined tables if they don't exist
    app.run(debug=True, port= 5001, host='0.0.0.0')