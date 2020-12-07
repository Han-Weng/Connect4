var bodyParser = require('body-parser');
var fs = require('fs');
const { winnerAlgorithm} =require('./connect4.js');

 var rawdata = fs.readFileSync('./data/data.json');
 var rawgame = fs.readFileSync('./data/game.json');

 var data = JSON.parse(rawdata);
 var game = JSON.parse(rawgame);

 function doesExist(newUser){
  //find a specific user
  console.log("data,length"+  data.length)

	for(var i = 0; i < data.length; i++) {
		console.log( data[i].name)
 		if (newUser.toLowerCase() === data[i].name.toLowerCase()){
      console.log("newuser"+ data[i].name.toLowerCase())

			return data[i] ;
 		}
 }
 console.log("doesn't exist");
	return false;
}
 
function draw(map){
  for (var i = 6; i >= 0; i--) {
    if (map.connect4[0][i] != "white"){
      return "not draw";
    }
  }
  return "  draw";
}
function archive(mapId, playerName){
  //what to do name a player has done a game, idk why i named the player as map
  map =doesExist(playerName);
  map.total++;
  console.log("oooiii"+playerName);
  console.log("oooiii"+map);
  for(var i = 0; i < map.gameID.length; i++) {
    if ((mapId== map.gameID[i])){
      map.gameID.splice(i, 1);  
      map.games_played.push(mapId);
      break; 
    } 
  } 
}

function findGamid(name){
  //find a specific game
  for(var i = 0; i <  game.length; i++){
    if(game[i].id ==name ){
      return game[i];
    }
 }
 return 0;
}
 

module.exports ={
    draw,archive 
}