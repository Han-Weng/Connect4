

var http = require('http');
var url = require('url');
var fs = require('fs');
var ejs = require('ejs');
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);

const express = require('express');
const app = express();
const path = require('path');
const router = express.Router();

app.use(express.staticProvider(__dirname + '/public'));

app.get('/', function(req, res) {
    res.render('index.html');
});

app.listen(8080, '127.0.0.1')
