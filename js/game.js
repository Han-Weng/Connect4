var bodyParser = require('body-parser');
var fs = require('fs');

 var rawdata = fs.readFileSync('./data/data.json');
 var rawgame = fs.readFileSync('./data/game.json');

 var data = JSON.parse(rawdata);
 var game = JSON.parse(rawgame);


function chat(req,res){
   var map = games_active_array(req.body.enemy)
   map.chat.push(req.session.name)
   map.chat.push(req.body.chat)
  res.redirect(req.get('referer'));;
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
    draw 
}