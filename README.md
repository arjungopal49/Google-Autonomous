# Google-Autonomous

You will need to use two terminal windows. One for the frontend server, and another for the backend. On the first terminal, start the frontend:

$ yarn start 

This will take a few seconds and then a browser window will open with the example application from React loaded from http://localhost:3000:

When you have the frontend running, switch to your second terminal and start the Flask backend at http://localhost:5000:

$ yarn start-api

Now both the frontend and backend are running.The frontend will redirect any requests it does not recognize to the backend. 
