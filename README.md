# Connect4

I plan on making a connect multiplayer and plan on adding future games like poker and Chess, 
both with multiplayers as well

The goal of this project was be to create a web application that allows users to play the
game Connect4 with other users of the application. Users will be able to participate in
multiple games at once. They will be able to start a new game with a random other user
or start a new game with one of their friends. Users will also be able to observe their
friends’ games. The application will also track statistics of each user of the site.

The main server code for this project is Node.js. All client resources required by
the project must be served by the server. Project’s data is stored using
MongoDB or local files. Additional modules/frameworks are Sessions, Socket.io and 
Mongoose. 

The application provides a way for users to create new accounts by specifying a
username and password. Usernames are to be unique. A user is able to log in
and out of the system using their username and password. Within a single browser
instance, only a single user is be able to be logged in at one time (i.e., user A and
user B cannot log in to the system within the same browser window).
