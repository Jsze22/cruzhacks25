# check_data.py
from app import app, db, User, CheckIn

with app.app_context():
    users = User.query.all()
    print("Users:", users)

    checkins = CheckIn.query.all()
    print("CheckIns:", checkins)
