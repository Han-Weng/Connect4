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
function findGamid(name){
  //find a specific game
  for(var i = 0; i <  game.length; i++){
    if(game[i].id ==name ){
      return game[i];
    }
 }
 return 0;
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
  console.log("oooiii"+mapId);

  var   index = map.gameID.indexOf(mapId);
  console.log("ssssssssss"+index);
  for (var i=0; i<map.gameID.length; i++){
    if(map.gameID[i]==mapId){
        console.log(map.gameID[i]+" map.gameID")
        map.gameID.splice(i, 1);
        map.games_played.push(mapId); 
        return 0;
    }
  }
return 0;
 
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
 
function creategame(req,res){
  // if the 2 playters are found then create a new game and id
  console.log(req.body)
  doesExist(req.body.name).searchOpponent = req.body.status;
  if (matchGame(req.body.name)==false){
    console.log("huggghhhh")
    res.redirect(req.get('referer'));;

    return 0;
  }

  id = Math.floor(Math.random() * ( 101 ))
  var newGame =  {}
  //to make sure the user isn't playing against themselves
  var opponent = matchGame(req.body.name);
  newGame.winner = "";

  newGame.status = req.body.status;
  newGame.observers =  []

  newGame.id = id
  doesExist(req.session.name).gameID.push(id)
  doesExist(opponent.name).gameID.push(id)

  newGame.red = [req.session.name, "red"]
  newGame.yellow = [opponent.name,"yellow"]
  newGame.turn =  [req.session.name, "red"]
  newGame.chat = []
  newGame.connect4 =   [
   [ "white", "white", "white", "white", "white", "white", "white" ],
   [ "white", "white", "white", "white", "white", "white", "white" ],
   [ "white", "white", "white", "white", "white", "white", "white" ],
   [ "white", "white", "white", "white", "white", "white", "white" ],
   [ "white", "white", "white", "white", "white", "white", "white" ],
   [ "white", "white", "white", "white", "white", "white", "white" ] ]
  newGame.record = 0
  newGame.tape = 0

  newGame.history = [
 [ 0, 0, 0, 0, 0, 0, 0 ],
 [ 0, 0, 0, 0, 0, 0, 0 ],
 [ 0, 0, 0, 0, 0, 0, 0 ],
 [ 0, 0, 0, 0, 0, 0, 0 ],
 [ 0, 0, 0, 0, 0, 0, 0 ],
 [ 0, 0, 0, 0, 0, 0, 0 ] ]
  game.push(newGame)
 // console.log(newGame)
  res.redirect("/game/" +newGame.id);
 return 0;
}

function chat(req,res){
  var map = findGamid(req.body.enemy)
  map.chat.push(req.session.name)
  map.chat.push(req.body.chat)
 res.redirect(req.get('referer'));;
}
function input(req, res){
  var numbersOnly = (req.body.input).match(/[0-6]/);
  var length = ((req.body.input).length);
  var player=0
  var playerColour=1
  var map = findGamid(req.body.id) 
  if ((map.connect4[0][req.body.input] != "white")||((numbersOnly == null)||(length >1)||((map.turn[0]!=req.session.name)))){
 
    res.redirect(req.get('referer'));;
    return 0;
  }
  for (var i = 5; i >= 0; i--) {
 	  if (map.connect4[i][req.body.input] == "white"){
			map.connect4[i][req.body.input] =  map.turn[playerColour]
			map.history[i][req.body.input] =  map.record++;

      console.log("so whats going on this time ", winnerAlgorithm(i,req.body.input,map.connect4))

       map.winner  = winnerAlgorithm(i,req.body.input,map.connect4)
       if (map.winner!=""){
        map.tape = map.record;
        archive(req.body.id,map.red[0]);
        archive(req.body.id,map.yellow[0]);
        if(map.winner=="red"){
          map.winner=map.red
          doesExist(map.red[0]).wins++;
        }else{
          map.winner=map.yellow
          doesExist(map.yellow[0]).wins++;
        }
        console.log("emit");
       //sends the data to the page  
    
      }   
      if (draw(map)=="draw"){
         map.winner  = draw(map)
        res.redirect(req.get('referer'));
        return 0;
      }
        if (map.turn == map.yellow){
         map.turn  = map.red
         }else{
          map.turn  = map.yellow
        }
      res.redirect(req.get('referer'));;
			return 0
		}
	}
  res.redirect(req.get('referer'));;
  return 0

}
function quit(req,res ){
  // to quit the game, didnt implement it so the opponent would also be ejected from the game
 var data = req.body;
 
  var map = findGamid(req.body.id);

 selectRed = doesExist(map.red[0]);
 selectYellow = doesExist(map.yellow[0]);

  archive(data.id,selectYellow.name);
  archive(data.id,selectRed.name);
   if(map.turn[1]=="red"){
    selectRed.wins++;

    map.winner = selectRed.name +"opponent forfeitted";
  }else{
    selectYellow.wins++;
    map.winner = selectYellow.name+"opponent forfeitted";
  } 
  res.redirect("/userPage")


        }     

module.exports ={
    draw,archive,creategame,chat,input,quit
}