Han Weng

Views folder, app.js and businesslogic.js are the stuff you should look at

1. What project you are working on

I am working on the Connect4 project

2.The name of both partners, if applicable
N/A
just Han Weng

3.Instructions that specify how to setup,run, and test your server
terminal stuff to add and then run

npm install ejs
npm install body-parser
npm install express
node App

4.A description of the files the TA should look at to evaluate your business logic code

just look at the businesslogic.js file to evaluate my business logic code, most of the
functions have been commented

5.A description of anything the TA should look at to evaluate any of the additional expectations
that you have addressed in the submissions

in userPage.ejs you will see a search, and that search bar will allow you to search up
a existing user like Jonathon, existing users like Joseph and Jotaro. Its also key sensitive
so use captials as well. If a user doesnt exist then it wouldn't work

in login.ejs you can try registering for a account, if the account doesnt exist then
the server will render a /userPage with all the data filled out and if it does, you will be
directed to the existing accountv page

in my  app.js, it supports CSS and EJS template engines, serving static data to fill things like
in /userPage or /viewUser
