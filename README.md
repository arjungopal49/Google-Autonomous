# Google-Autonomous

You will need to use 4 terminal windows. One for the frontend server, the backend server, the simulation server, and the server for moving the cars.

## 1. Start the React Frontend

On the first terminal, 
go to the "frontend" folder. Make sure "npm" and "react-scripts" are installed. Also, run "npm install" if new items have been added to packages.json.


Start the frontend:


$ npm start (or yarn start) within the frontend folder


This will take a few seconds and then a browser window will open with the example application from React loaded from http://localhost:3000.

## 2. Start the Flask Backend

When you have the frontend running, switch to your second terminal and go to the "api" directory
Perform the following commands to start the python virtual environment and install flask if you have not already:


$ python -m venv venv

$ venv\Scripts\activate

(venv) $ pip install flask python-dotenv

(venv) $ pip install flask requests

(venv) $ pip install flask-cors


Start the Flask backend at http://localhost:5000:

 
(venv) $ flask run


## 3. Start the Node Simulation Server

Switch to your third terminal and go to the "Simulation" directory.

Start the Simulation:


$ node Server.mjs


## 4. Start the Car Loop

Switch to your fourth terminal and go to the "Simulation" directory.

Start the car loop:


$ node moveCar.mjs
