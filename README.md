# Banana roll call -cruzhacks25 - Jacky and Albert

## Setup
### frontend 
1. Retreive host url by either ipconfig/ifconfig or by running the backend code first(host url will pop up in the terminal)
2. Put host url into config.tsx
3. Make sure npm is installed
4. npm install
5. Run the command `cd slug_attendance`
6. To run the command `npx expo start` in the terminal

### backend
1. find requirements.txt folder in the backend folder
2. Make sure you have python installed 
3. pip install -r requirements.txt
4. To run the code: python app.py
5. "Instance" folder will show up, and that's where the database is
6. sqlite extension on VScode is recommended

### for mobile phone (iOS for now)
1. download the app "Expo Go" on the mobile phone
2. after runnning the command `npx expo start` (from step 6 in frontend section), a QR code will pop up in the terminal
3. open the camera app of your mobile phone and scan that QR code, which will lead you to Expo Go

## Overview
### Attendance
- This app tracks students' attendance by requiring students to type in a live code and tracks how far the student is from the classroom.
- If the student is too far away or enters the wrong code, his sign in would be considered invalid. 
- If the student is late to class (leniency can be adjusted by the teacher), they would be marked as late.
- If a student or a person that is not in the class tries to sign in, the app would reject its sign-in.
- Class data(location, time, and number of lecture) and student data(name, email, attendance, arrival times) are stored in a database.
- Students' attendance are viewable within the app in a table format and can also be downloaded as a CSV file.

### Assistants
- This app sends a reminder to students before class in case the student forgets.
- It also contains shortcuts that show you the time it takes to walk, drive, and bike to majority of the important lecture halls and buildings at UCSC

## Why we chose this project
We’ve often noticed students asking their friends for the attendance code without actually being present in class, or leaving right after receiving the code. With this app, we aim to discourage such behavior and promote a stronger sense of academic integrity. Additionally, the app is designed to support students with busy schedules by providing helpful reminders and tools to stay organized and engaged in their coursework.

## Components

### Frontend
- The frontend consists of Typescript, react, reactnative, and expo
- Retreives code and personal information from user and sends it to the backend for processing. 
- Integrated expo.location so that the student's geo-location is received for calculating the distance away from the classroom.
- Activetly listens to the backend port for reminders for upcoming classes.
- Contains dynamic backgrounds and affects.
- Compatible with iPhone and computers.
- A page of shortcuts dedicated to the most the most important buildings, and the frontend displays the amount of time it would take the user to travel to each location via different transportations retrieve from mapbox API.


### Backend
- The backend consists of python, sqlite, and flask.
- The sqlite database has a relational database design to optimize storage. It stores all valid student sign-ins and class sessions.
- Tables in the database include Check_in, user, student_roster, and class_session
- Students that the incorrect code or are too far away from the classroom would not be saved to the databse. 
- Students that are late are marked as late, but would be saved.
- Each lecture's and student's data can be filtered for different usage.
- New actual students can be added to the database via csv file.
- Data in the database can be converted into CSV or be viewed within the app.
- Flask was used to start a web server that listens for HTTP requests (like GET and POST), which allows the frontend to retrieve data and trigger backend functions.
- The next upcoming class would be saved and a time delta is added using apscheduler and datetime. It then pings the frontend to send a notifcation to the student to remind them to go to class.
- Time zones are set with pytz.
