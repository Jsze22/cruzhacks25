from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import IntegrityError
import math
from datetime import datetime, timezone, timedelta
import pytz
from dotenv import load_dotenv
import os
from apscheduler.schedulers.background import BackgroundScheduler
import csv


scheduler = BackgroundScheduler()


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
CURRENT_TIME = None
CURRENT_SESSION_ID = None
TIME = None

class User(db.Model):
    id = db.Column(db.Integer, primary_key= True)
    username = db.Column(db.String(80), unique= True, nullable= False)
    email = db.Column(db.String(120), unique = True, nullable = False)
    checkins = db.relationship('CheckIn', backref = 'user', lazy = True)

    def __repr__(self):
        return f"<User {self.username}>"


pacific = pytz.timezone("US/Pacific")


class ClassSession(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(50), nullable=False)
    lat = db.Column(db.Float, nullable=False)
    lng = db.Column(db.Float, nullable=False)
    radius = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(pacific))
    # Optional: other fields (e.g., teacher id, duration, end time, etc.)
    checkins= db.relationship('CheckIn', backref='session', lazy = True)

    def __repr__(self):
        return f"<ClassSession {self.code} at {self.created_at}>"


class CheckIn(db.Model):
    row = db.Column (db.Integer, primary_key = True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable = False)
    session_id = db.Column(db.Integer,  db.ForeignKey('class_session.id'), nullable = False)
    lat = db.Column(db.Float, nullable = False)
    lng = db.Column(db.Float, nullable = False)
    timestamp = db.Column(db.DateTime, nullable = False, default= lambda: datetime.now(pacific))
    distance = db.Column(db.Float)
    arrival = db.Column(db.String, nullable = False)


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

# def do_ping():
#     print("class in 1 min")
# def ping_students():

#     TIME = datetime.now(pacific) + timedelta(seconds= 60)

#     reminder_time = TIME - timedelta(seconds = 30)
#     if reminder_time > datetime.now(pacific):
#         scheduler.add_job(do_ping, 'date', run_date=reminder_time)
#         print(f"Ping job scheduled for {reminder_time.isoformat()}")
#     else:
#         print("Warning Reminder time is in the past; ping is not scheduled")
    
#     return {"status": "Ping scheduled", "reminder_time": reminder_time.isoformat()}


@app.route('/api/late-report', methods=['GET'])
def generate_late_report():
    # Count late check-ins grouped by user
    late_counts = (
        db.session.query(User.username, db.func.count(CheckIn.row).label('late_count'))
        .join(CheckIn)
        .filter(CheckIn.arrival == 'late')
        .group_by(User.username)
        .having(db.func.count(CheckIn.row) > 0)
        .all()
    )

    if not late_counts:
        return jsonify({"status": "No late users found"})

    # Write to CSV
    filepath = 'late_report.csv'
    with open(filepath, mode='w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(['Username', 'Late Count'])
        for username, count in late_counts:
            writer.writerow([username, count])

    return jsonify({
        "status": "Report generated",
        "file": filepath,
        "late_users": [{"username": u, "late_count": c} for u, c in late_counts]
    })


REMINDER_TIME = None
SHOULD_PING = False

def do_ping():
    global SHOULD_PING
    SHOULD_PING = True
    print("🔔 Ping activated!")

@app.route('/api/ping-status')
def ping_status():
    global SHOULD_PING
    if SHOULD_PING:
        SHOULD_PING = False
        return jsonify({"shouldPing": True, "reminder_time": REMINDER_TIME.isoformat()})
    return jsonify({"shouldPing": False})

def ping_students_on_startup():
    global REMINDER_TIME
    # Simulate a class 1 min from now
    CLASS_TIME = datetime.now(pacific) + timedelta(seconds=60)
    REMINDER_TIME = CLASS_TIME - timedelta(seconds=30)

    if REMINDER_TIME > datetime.now(pacific):
        scheduler.add_job(do_ping, 'date', run_date=REMINDER_TIME)
        print(f"✅ Ping scheduled for {REMINDER_TIME.isoformat()}")
    else:
        print("⚠️ Reminder time is in the past; ping not scheduled")







@app.route('/api/session', methods = ['GET'])
def get_session():
    if not GEOfENCE or CURRENT_TIME is None:
        return jsonify({"status": "Error", "message": "No active session"}), 400
    
    return jsonify({
        "status": "success", 
        "classroom": GEOfENCE,
        "session_time" : CURRENT_TIME.isoformat()
    })

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



# @app.route('/api/config', methods=['GET'])
# def get_config():
#     # Automatically get the host and port from the incoming request.
#     # request.host gives you something like '10.0.0.19:5001' or '192.0.0.2:5001'
#     backend_url = f"http://{request.host}"
#     return jsonify({"BACKEND_URL": backend_url})




# @app.route('/api/geofence', methods=['GET'])
# def get_geofence():
#     return jsonify({"campus": {"lat": 40.7128, "lng": -74.0060, "radius": 1000}})

@app.route('/api/setsession', methods=['POST'])
def set_session():
    global CURRENT_CODE, GEOfENCE, CURRENT_TIME, CURRENT_SESSION_ID
    data = request.get_json()

    print (data)
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
    CURRENT_TIME = datetime.now(pacific)
    #push to session data base to log session
    new_session = ClassSession(code = code, lat= lat, lng = lng, radius = radius)
    db.session.add(new_session)
    db.session.commit()
    CURRENT_SESSION_ID = new_session.id

    print(f"Set current attendance code: {CURRENT_CODE}")
    print(GEOfENCE)
    return jsonify({"status": "Success", "message": "Attendance code set", "current_code": CURRENT_CODE, "classroom": GEOfENCE,"session_time" : CURRENT_TIME.isoformat(), "session_id": CURRENT_SESSION_ID})


@app.route('/api/attendance', methods=['POST'])
def check_in():

    student_time = datetime.now(pacific)


    if CURRENT_TIME is not None:
        if student_time - CURRENT_TIME > timedelta(seconds= 15):
            arrival_status = "late"
        else:
            arrival_status = "on time"


    
    
    data = request.get_json()
    print (data)

    entered_code = data.get("code")
    if not entered_code:
        return jsonify({"status": "Error", "message": "No attendance code provided"}), 400
    
    if CURRENT_CODE is None:
        return jsonify({"status": "Error", "message": "Attendance code not set by teacher"}), 400
    
    if entered_code != CURRENT_CODE:
        return jsonify({"status": "Invalid", "message": "Incorrect attendance code"}), 403

    # Process data (like user_id, current location, timestamp)
    user_location = data.get("classroom")

    if not user_location:
        return jsonify({"status": "Error", "message": "No location provided"}), 400
    
    user_lat = user_location.get("lat")
    user_lng = user_location.get("lng")

    # Make sure both latitude and longitude are provided
    if user_lat is None or user_lng is None:
        return jsonify({"status": "Error", "message": "Incomplete location data"}), 400
    
    name = data.get("name")
    email = data.get("email")
    email = email.strip().lower()
    if not name:
        return jsonify({"status": "Error", "message": "No name provided"}), 400
    
    if not email:
        return jsonify({"status": "Error", "message": "No email provided"}), 400
    
    user = User.query.filter_by(email = email).first()
    if not user:
        try:
            user = User( email = email, username = name)
            db.session.add(user)
            db.session.commit()
            print("new user")
        except IntegrityError:
            db.session.rollback()
            return jsonify({"status": "Error", "message" : "User already signed in "}), 400


    user_id = user.id

    if not CURRENT_SESSION_ID:
        return jsonify({"status": "Error", "message": "No session_id provided"}), 400

    
    
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
        check_in_record = CheckIn(user_id = user_id, session_id = CURRENT_SESSION_ID, lat=user_lat, lng=user_lng, timestamp=datetime.now(pacific), distance=distance, arrival = arrival_status)
        db.session.add(check_in_record)
        db.session.commit()


        return jsonify({
            "status": "Valid",
            "message": "Check-in successful. Your location is within range.",
            "distance": distance,
            "data": data,
            "arrival": arrival_status
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
        scheduler.start()
        ping_students_on_startup()
    app.run(debug=True, port= 5001, host='0.0.0.0')