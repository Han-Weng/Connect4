var express = require('express');
var bodyParser = require('body-parser');
var ejs = require("ejs");
var urlencoderParser = bodyParser.urlencoded({ extended: false});

 var app = express();
 var http = require('http').createServer(app);
 var socket = require("socket.io");
 var io = require('socket.io')(http);
 var fs = require('fs');

 var rawdata = fs.readFileSync('./data/data.json');
 var rawgame = fs.readFileSync('./data/game.json');

 var data = JSON.parse(rawdata);
 var game = JSON.parse(rawgame);

 var session = require("express-session")({
  secret: "my-secret",
  maxAge: 24 * 60 * 60 * 1000 
});

const { winnerAlgorithm, checkVertical, checkHorizontal, checkLeftDiagonal, checkRightDiagonal} =require('./js/connect4.js');
const {draw, input, chat}  = require("./js/game.js")
const {watchgame}  = require("./js/history.js")

app.use(session )

io.use(function(socket, next) {
  session(socket.request, socket.request.res || {}, next);
});

io.on('connection', (socket) => {
  socket.on('game_send', (data) => {

    var numbersOnly = (data.input).match(/[0-6]/);
    var length = ((data.input).length);
    var player=0
    var playerColour=1
    var map = findGamid(data.id)
    
    //prevents additive moves from being made once users won
    if (map.winner!=""){
      return 0;
    }
    if ((map.connect4[0][data.input] != "white")||((numbersOnly == null)||(length >1)||((map.turn[player]!=socket.request.session.name )))){
      return 0;
    }
    for (var i = 5; i >= 0; i--) {
       if (map.connect4[i][data.input] == "white"){
        map.connect4[i][data.input] =  map.turn[playerColour]
        map.winner  = winnerAlgorithm(i,data.input,map.connect4)
        if (map.winner!=""){
          archive(data.id,map.red[0]);
          archive(data.id,map.yellow[0]);
          
          if(map.winner=="red"){
            doesExist(map.red[0]).win++;
          }else{
            doesExist(map.yellow[0]).win++;
          }

        }  
        if (draw(map)=="draw"){
           map.winner  = draw(map)      
        }
          if (map.turn == map.yellow){
           map.turn  = map.red
           }else{
            map.turn  = map.yellow
          }
          
          io.sockets.emit('game_get', data={chat:map.connect4, input:data.input, winner:map.winner  } );

      return 0;

      }
    }
    console.log('map: ' + data.input);
    console.log('map: ' + map.connect4);
    });

  socket.on('chat message', (msg) => {
  var map = findGamid(msg.id)
  map.chat.push(socket.request.session.name)
  map.chat.push(msg.message)
  console.log('map: ' + map.chat);
  io.sockets.emit('users_count', data={chat:msg.message, name:socket.request.session.name } );
  });
});
http.listen(8080, () => {
  console.log('listening on *:8080');
});

app.set('view engine', 'ejs');

app.use(express.static( './js'));
app.use(express.json())
app.use('/assets', express.static('assets'));
app.use(express.urlencoded({extended: true}));
// each of the post request have a function tied to their response, they handle
//post requests from each page
app.post('/login', loginUser)
app.post('/register', createUser)

//userPage post, this will be where the user page post is
app.post("/logout",logout);
app.post("/creategame",creategame);
app.post("/search", searchForUser);
app.post("/requestResponse", requestResponse);
app.post("/removeFriend",removeFriend);
 //these 2 are used in viewuser and userpage, playgame allows you to view or play game
 //watch game dirtects you to one of their pass games or current games to view pass results
app.post("/playgame",playgame);
app.post("/watchgame",watchgame);
//viewUser viewing other userse
app.post("/friendRequest", searchForUser);


//game ejs the game logics
app.post("/input", input);
//app.post('/chat', chat)
//history
app.post('/next', next);
app.get('/friendProfile', searchForUser);


//here are the links for where to go for each route
app.get('/login',  function(req,res){
if(req.method ==='GET'){
    res.render('login')
}});
app.get('/', function(req,res){
  res.render( "index");
});
app.get('/userPage', function(req,res){
  console.log("this is the issue "+(JSON.stringify(req.session)));
  console.log("this is the name "+(JSON.stringify(req.session.name)).toLowerCase());
  friends = doesExist(req.session.name).friends
  var status = []
  for (var i = 0; i < friends.length; i++) {
    if (doesExist(friends[i]).status == "online"){
      status.push("online");
    }else{
      status.push("offline");
    }

  }
  res.render("userPage", {data:doesExist(req.session.name), status: status});
});
app.get("/users/:uid", function(req, res, next){
   console.log("Getting user with name: " + req.params.uid);
   doesExist(req.params.uid)
   	res.render('viewUser', {data : doesExist(req.params.uid)})

})
app.get("/game/:uid", function(req, res, next){
   console.log("Getting user with name: " + findGamid( JSON.stringify(req.params.uid)));
   console.log("Getting user with name: " + (req.params.uid));
         res.render('game', {
          data : findGamid(req.params.uid).connect4,
          chat : findGamid(req.params.uid).chat,
          id : findGamid(req.params.uid).id,
          winner : findGamid(req.params.uid).winner,
          game : findGamid(req.params.uid),
          turn : findGamid(req.params.uid).turn,
          yellowPlayer: findGamid(req.params.uid).yellow,
           redPlayer: findGamid(req.params.uid).red})
       return 0;
})
app.get("/watch/:uid", function(req, res, next){

     console.log("Getting user with name: " + (req.params.uid));
     res.render('history', {
       record : findGamid(req.params.uid).record,
      data : findGamid(req.params.uid).history,
      chat : findGamid(req.params.uid).chat,
      id : findGamid(req.params.uid).id,
      winner : findGamid(req.params.uid).winner,
      game : findGamid(req.params.uid),
      turn : findGamid(req.params.uid).turn,
      yellowPlayer: findGamid(req.params.uid).yellow,
      redPlayer: findGamid(req.params.uid).red})
   return 0;
  })

//logouts and reset the session or cookie
function logout(req,res){
  req.session.name = "";
  req.session.pw=  "";
  res.redirect("/login")

}
//assign the user with a random other and create a new game with new id
function creategame(req,res){
  id = Math.floor(Math.random() * ( 101 ))
  var newGame =  req.body
  //to make sure the user isn't playing against themselves
  var opponment = data[Math.floor(Math.random() * data.length)];
  while (opponment.name == req.session.name){
    opponment = data[Math.floor(Math.random() * data.length)];
  }

  newGame.id = id
  newGame.red = [req.session.name, "red"]
  newGame.yellow = [opponment.name,"yellow"]
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
  newGame.history = [
 [ 0, 0, 0, 0, 0, 0, 0 ],
 [ 0, 0, 0, 0, 0, 0, 0 ],
 [ 0, 0, 0, 0, 0, 0, 0 ],
 [ 0, 0, 0, 0, 0, 0, 0 ],
 [ 0, 0, 0, 0, 0, 0, 0 ],
 [ 0, 0, 0, 0, 0, 0, 0 ] ]
  game.push(newGame)
  console.log(newGame)
  res.redirect("/game/" +newGame.id);

 return 0;

}
//given the history of a game you click next or prev to see what was
//made at what position, if the user passes next too much
function next(req,res){
  var next =(req.body.next).substring(0, 4);
  var id =(req.body.next).substring(4);
  console.log("this data is ",findGamid(id).record)


  if (next == "next"){
    findGamid(id).record++

  }else if (findGamid(id).record-1 ==-1){

      res.redirect(req.get('referer'));
      return 0;

  }else if (next == "prev"){
    console.log(req.body.next)
    findGamid(id).record--
  }
  res.redirect(req.get('referer'));;
}
//here if someone wants to watch a game they will be direct to a game with that
//specifc req id

//here the chat system, where the logged in user name and their comments get send
function playgame(req, res){
  console.log(req.body)
   for(var i = 0; i <  game.length; i++){
     if(parseInt(req.body.name) ==game[i].id ){
        console.log("this is the req.body.name ",  game[i])
       res.redirect("/game/" +game[i].id);
       return 0;
     }
  }
  console.log("data is ....", req.body)
}

function findGamid(name){
  for(var i = 0; i <  game.length; i++){
    if(game[i].id ==name ){
      return game[i];
    }
 }
 return 0;
}
function removeFriend(req, res){
  for(var i = 0; i < doesExist(req.session.name).friends.length; i++) {
  console.log(doesExist(req.session.name).friends[i])
     if ((req.body.name) == doesExist(req.session.name).friends[i]){
      doesExist(req.session.name).friends.splice(i,1);
      res.redirect(req.get('referer'));;
      return false;
    }
 }
}
function requestResponse(req, res){
  length = (JSON.stringify(req.body.name)).length
  response = JSON.stringify(req.body.name).substring(length-2,length-1)
  name = JSON.stringify(req.body.name).substring(1,length-2)
  console.log("this is the name "+name)
  console.log("this is the response "+response)

  for(var i = 0; i < doesExist(req.session.name).friend_request.length; i++) {
 	console.log(doesExist(req.session.name).friend_request[i])
  console.log(name)
    if ((name) == doesExist(req.session.name).friend_request[i]){
      console.log("bingbing")

      if (response == 'Y'){


          doesExist(req.session.name).friends.push(name);
          doesExist(name).friends.push(req.session.name);

          console.log(  doesExist(req.session.name).friends)

      }
      doesExist(req.session.name).friend_request.splice(i,1);

      res.redirect(req.get('referer'));;

      return false;
    }
 }
 res.redirect(req.get('referer'));;

}

function friendRequest(req, res){
let body = req.body;
let sender =  (body.name)
let receiver =  (req.session.name)

if (req.session.name == sender){
  res.redirect(req.get('referer'));;
  return false;
}

console.log("list friend is:"+ doesExist(receiver).friend_request.length)
  //check if the receiver has the person as a friend
  for(var i = 0; i < doesExist(receiver).friend_request.length; i++) {

    console.log("friend is:"+ doesExist(receiver).friend_request[i])
      if ((sender == doesExist(receiver).friend_request[i])){
        res.redirect(req.get('referer'));;
        return false;
      }
  }
  //check if the sender has the person as friend
  for(var i = 0; i < doesExist(sender).friend_request.length; i++) {
    if ((receiver== doesExist(sender).friend_request[i])){
      res.redirect(req.get('referer'));;
      return false;
    }
  }
 console.log("sended",sender);
doesExist(sender).friend_request.push(receiver);

console.log("doesExist(receiver).friend_request.push(sender); ",doesExist(sender).friend_request)

res.redirect(req.get('referer'));;
}
function searchForUser(req, res){
let body = req.body;
console.log("body of dat"+body.user);
data.forEach(d => {
  console.log("data os "+d.name);

	if ( d.name.toLowerCase() == body.user.toLowerCase()){
			console.log("found: " + d.name);
  res.redirect("/users/" + d.name);
//		res.render('viewUser', {data : d,})
		return true;
	}
});
}
function doesExist(newUser){
	for(var i = 0; i < data.length; i++) {
	//	console.log( data[i].name)
 		if (newUser.toLowerCase() === data[i].name.toLowerCase()){
			return data[i] ;
 		}
 }
	return false;
}
function loginUser(req,res){

	let newUser  =  req.body;
  if(!newUser.name || !newUser.pw){
    return null;
  }
//	console.log(newUser)
req.session.name=  newUser.name
req.session.pw=  newUser.pw
doesExist(req.session.name).status = "online"


console.log('username'+req.session.name)
console.log('password'+req.session.pw)
console.log('session '+req.body)

  if(  doesExist(newUser.name)){
		console.log('user does exist')
 
    if (newUser.pw != doesExist(newUser.name).pw){
      res.redirect(req.get('referer'));
      return null;
    }

    res.redirect("userPage");

 		return null;
	} 
  res.redirect("userPage");





 	}
  function createUser(req,res){

    let newUser  =  req.body;
    if(!newUser.name || !newUser.pw){
      return null;
    }

  //	console.log(newUser)
  req.session.name=  newUser.name
  req.session.pw=  newUser.pw
  doesExist(req.session.name).status = "online"
  
  
  console.log('username'+req.session.name)
  console.log('password'+req.session.pw)
  console.log('session '+req.body)
  
    if(  doesExist(newUser.name)){
      console.log('user does exist')
    //	console.log(doesExist(newUser))
      //res.render("userPage", {data: doesExist(newUser)});
      console.log('session does exist '+ (JSON.stringify(req.session)))
  
      res.redirect("userPage");
       return null;
    }else{
    console.log('user is working')
    newUser.gameID =[]
    newUser.status = "online"
    newUser.games_played = [];
    newUser.games_active = [];
    newUser.friends = [];
    newUser.friend_request = [];
    newUser.win = 0;
    newUser.total = 0;
    data.push(newUser)
  
     res.render("userPage", {data: newUser});
    }
  
}
function archive(mapId, playerName){
  map =doesExist(playerName);
  map.total++;
  for(var i = 0; i < map.gameID.length; i++) {
    if ((mapId== map.gameID[i])){
      map.gameID.splice(i, 1); 
      map.games_played.push(mapId);
      break;
    }
  }
}