# Google-Autonomous

You will need to use two terminal windows. One for the frontend server, and another for the backend. On the first terminal, 
go to the "frontend" folder. Make sure "npm" and "react-scripts" are installed.


Start the frontend:


$ npm start (or yarn start)


This will take a few seconds and then a browser window will open with the example application from React loaded from http://localhost:3000.

When you have the frontend running, switch to your second terminal and go to the "api" directory
Perform the following commands to start the python virtual environment and install flask if you have not already:


$ python -m venv venv

$ venv\Scripts\activate

(venv) $ pip install flask python-dotenv

(venv) $ pip install flask-cors

(venv) $ pip install flask requests

(venv) $ pip install flask-cors


Start the Flask backend at http://localhost:5000:

 
$ flask run


Now both the frontend and backend are running. The frontend will redirect any requests it does not recognize to the backend. 
