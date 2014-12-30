Todoist
=======
https://todoist2027.herokuapp.com/

Sample todo single page application using AngularJS, Express (Node), PostgreSQL. This app is heroku ready. 

###To install dependencies

$npm install

###Database Schema

create table todo(id serial, task text, done bool, enddatetime text, createdatetime text, finisheddatetime text);

###Environment variable

In ~/.bashrc <br/>
export DATABASE_URL = postgres://USERNAME:PASSWORD@localhost/todo
