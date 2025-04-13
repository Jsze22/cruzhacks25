from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import pytz


db = SQLAlchemy()
pacific = pytz.timezone("US/Pacific")


class StudentRoster(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)

    def __repr__(self):
        return f"<StudentRoster {self.username}>"


class User(db.Model):
    id = db.Column(db.Integer, primary_key= True)
    username = db.Column(db.String(80), unique= True, nullable= False)
    email = db.Column(db.String(120), unique = True, nullable = False)
    checkins = db.relationship('CheckIn', backref = 'user', lazy = True)

    def __repr__(self):
        return f"<User {self.username}>"
    

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