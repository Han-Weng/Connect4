var express = require('express');
var express = require('express');
var bodyParser = require('body-parser');
var ejs = require("ejs");
var urlencoderParser = bodyParser.urlencoded({ extended: false});
const { winnerAlgorithm} =require('./connect4.js');

 var app = express();
 var http = require('http').createServer(app);
 var fs = require('fs');
var app = express();
var fs = require('fs');

var rawdata = fs.readFileSync('./data/chess.json');
var http = require('http').createServer(app);

http.listen(3000, () => {
    console.log('listening on *:8080'); 
  });
  app.set('view engine', 'ejs');
 
var data = JSON.parse(rawdata);

function testing(){
    var canvas = document.getElementById("rr");
    var pieces = {
  }
    var board =  8;
    let size =  75;
    let diameter =  20;
    var ctx = canvas.getContext("2d");
    var x= -1;
    var y= -1;
    for(var i = 0; i <8; i++){
      for(var j = 0; j < 8; j++){
        ctx.lineWidth = 2;
        if (((1+i)+(j+1))%2 == 0){
        ctx.fillStyle = "black";
        }else{
        ctx.fillStyle = "white";
          }
      ctx.beginPath();
      ctx.fillRect( size+ i*size,size+ j*size, size,size);
      ctx.stroke();   
      }
    }
    ctx.fillStyle = "red";
    // ctx.fillText(data.white.pieces[0].name,
    // size+10+ pieces.white.pieces[0].x*size,
    // size/2+ pieces.white.pieces[0].y*size);
    canvas.onclick = function() {
    document.getElementById("observers").innerHTML = event.offsetX + "the off set stuff" +event.offsetY ;
    document.getElementById("winner").innerHTML = data.white.pieces[0]
  
    }
     
}