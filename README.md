# Banana roll call -cruzhacks25 - Jacky and Albert

## Overview
### Attendance
This app tracks students' attendance by requring students to type in a live code and tracks how far the student is from the classroom.
If the student is too far away or enters the wrong code, his sign in would be considered invalid. 
If the student is late to class (leniency can be adjusted by the teacher), they would be marked as late.
If a student or a person that is not in the class tries to sign in, the app would reject its sign-in.
Class data(location, time, and # of lecture) and student data(name, email, attendance, arrival times) are stored in a database.
Students' attendance are viewable within the app in a table format and can also be downloaded as a CSV file

### Assistants
This app sends a reminder to students before class in case the student forgets.
It also contains shortcuts that show you the time it takes to walk, drive, and bike to majority of the important lecture halls and buildings at UCSC

## Why we chose this project
We see a lot of times that students just simply ask their friends in the class for the code when they are physically not in the class themselves, and
also a lot of people that just get up and leave after getting the code for the attenance quiz. We hope that this app can be used to discourage such behavior
and encourage students to put some more effort and be more academic driven

## Components

### Frontend
The frontend consists of Typescript, react, reactnative, annd expo

### Backend
The backend consists of python, sqlite, and flask