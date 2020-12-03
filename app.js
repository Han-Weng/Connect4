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
 let names = [];
fs.readFile('data/data.json', 'utf8', function(err, contents) {
  if(err){
    console.log("Couldnt read names file");
    return;
  }
  for (var i = 0; i < data.length; i++){
    names.push(data[i].name)
  }
  console.log(names);
});
 var session = require("express-session")({
  secret: "my-secret",
  maxAge: 24 * 60 * 60 * 1000 
});

const { winnerAlgorithm, checkVertical, checkHorizontal, checkLeftDiagonal, checkRightDiagonal} =require('./js/connect4.js');
const {draw, input, chat}  = require("./js/game.js")
const {watchgame}  = require("./js/history.js");
const { doesNotThrow } = require('assert');

app.use(session ) 

io.use(function(socket, next) { 
  session(socket.request, socket.request.res || {}, next);
});  
// io.emit('observers', data={observers:"map"} );

io.on('connection', (socket) => {
  // either with send()
  io.emit('socketClientID', socket.request.session.name);
  socket.on('hello_from_client', function(data){
      console.log(data);
  });



  socket.on('game_send', (data) => {
    var numbersOnly = (data.input).match(/[0-6]/);
    var length = ((data.input).length);
    var player=0
    var playerColour=1
    var map = findGamid(data.id)
    //prevents additive moves from being made once users won
    if (map.winner!=""){
      console.log("winner", map.winner) 
         
      return 0; 
    } 
    console.log("ssssssssssssssssssssssssss");
    if ((map.connect4[0][data.input] != "white")||((numbersOnly == null)||(length >1)||((map.turn[player]!=socket.request.session.name )))){
      console.log("invalided try again")
      return 0; 
    } 
    for (var i = 5; i >= 0; i--) {
       if (map.connect4[i][data.input] == "white"){
        map.history[i][data.input] = map.record++;
        map.connect4[i][data.input] =  map.turn[playerColour]
        map.winner  = winnerAlgorithm(i,data.input,map.connect4)
        if (map.winner!=""){
          
          archive(data.id,map.red[0]);
          archive(data.id,map.yellow[0]);
          if(map.winner=="red"){
            doesExist(map.red[0]).wins++;
          }else{
            doesExist(map.yellow[0]).wins++;
          }
          console.log("emit");
         // io.emit('redirect','userPage.ejs')
         io.emit('game_get', data={chat:map.connect4, input:data.input, winner:map.winner, stop:0,id:map.id,  } );
        }     
        if (draw(map)=="draw"){   
           map.winner  = draw(map)      
        }
          if (map.turn == map.yellow){
           map.turn  = map.red
           }else{
            map.turn  = map.yellow
          } 
          io.emit('game_get', data={chat:map.connect4, input:data.input, winner:map.winner, stop:0,id:map.id,   } );
      return 0;
      }
    }
    });

  socket.on('chat message', (msg) => {

  var map = findGamid(msg.id)
  if (map.winner !=""){
    return 0;
  } 
  map.chat.push(socket.request.session.name)
  map.chat.push(msg.message)
  console.log('map: ' + map.chat);
  io.sockets.emit('users_count', data={chat:msg.message, name:socket.request.session.name } );
  }); 
 
  // var map = socket.request.session.name
//  map.observers.push(socket.request.session.name)
  //
  socket.on('disconnect', () => {
    console.log('user disconnected'+ socket.request.session.name);
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
app.post("/viewFriend", viewFriend);
//game
app.post("/quit", quit);

//game ejs the game logics
app.post("/input", input);
//app.post('/chat', chat)
//history 
app.post('/next', next);
app.post('/privacy', privacy);

app.get('/friendProfile', searchForUser);


//here are the links for where to go for each route
app.get('/login',  function(req,res){
if(req.method ==='GET'){
    res.render('login')
}});
app.get('/', function(req,res){
  res.render( "index");
});

app.get("/users/:uid", function(req, res, next){
  var views = [];
   console.log("Getting user with name: " + req.params.uid);
   var user_games =  doesExist(req.params.uid)
  for (var i; i <user_games.gameID.length; i++){
    var map = findGamid(user_games.gameID[i])
    if (map.status=="friends only"){
      if (isFriend(req.session.name,req.params.uid)!= false){
        views.push(map.id);
      }
    }else if (map.status=="public"){
      views.push(map.id);
    }else if ((map.status=="private")){
      if ((req.session.name == map.red[0])||(req.session.name == map.yellow[0])){
        views.push(map.id);
      }
    }  
  }
  res.render('viewUser', {data : doesExist(req.params.uid), views: views})

});
app.get("/game/:uid", function(req, res, next){
   console.log("Getting user with name: " + findGamid( JSON.stringify(req.params.uid)));
   console.log("Getting user with name: " + (req.params.uid));
   observers = findGamid((req.params.uid)).observers;
   var repeat = 0;
 
   for (var i=0; i<observers.length; i++){
     if (observers[i] == req.session.name){
      repeat = 1;
     }
   }
   if (repeat==0){
    observers.push(req.session.name)
   }
   req.session.map = req.params.uid;

         res.render('game', {
          data : findGamid(req.params.uid).connect4,
          chat : findGamid(req.params.uid).chat,
          id : findGamid(req.params.uid).id,
          winner : findGamid(req.params.uid).winner,
          observer : findGamid(req.params.uid).observers,

          game : findGamid(req.params.uid),
          turn : findGamid(req.params.uid).turn,
          yellowPlayer: findGamid(req.params.uid).yellow,
           redPlayer: findGamid(req.params.uid).red})
       return 0;
}) 
app.get("/watch/:uid", function(req, res, next){

     console.log("Getting user with name: " + (req.params.uid));
     res.render('history', {
      tape : findGamid(req.params.uid).tape,
      data : findGamid(req.params.uid).history,
      chat : findGamid(req.params.uid).chat,
      turn : findGamid(req.params.uid).turn,
      id : findGamid(req.params.uid).id,
      winner : findGamid(req.params.uid).winner,
      game : findGamid(req.params.uid),
      turn : findGamid(req.params.uid).turn,
      yellowPlayer: findGamid(req.params.uid).yellow,
      redPlayer: findGamid(req.params.uid).red})
   return 0;
  })
  app.get('/userPage', function(req,res){
    console.log("this is the issue "+(JSON.stringify(req.session)));
    friends = doesExist(req.session.name).friends
    name = doesExist(req.session.name)
    console.log("this is the name "+name);

    var status = []
    for (var i = 0; i < friends.length; i++) {
      if (doesExist(friends[i]).status == "online"){
        status.push("online");
      }else{
        status.push("offline");
      }
    }
    res.render("userPage", {data:doesExist(req.session.name), map:game, status: status, names:names});
   });
function privacy(req,res){
    console.log(req.body);
    var name = doesExist(req.body.name);
    if (name.public == "public"){
      name.public = "private";
    }else if (name.public == "private"){
      name.public = "public";
    }
    res.redirect(req.get('referer'));;
    return 0;
  }
function quit(req,res ){
 var data = req.body;
 
  var map = findGamid(req.body.id);

 selectRed = doesExist(map.red[0]);
 selectYellow = doesExist(map.yellow[0]);

  archive(data.id,selectYellow.name);
  archive(data.id,selectRed.name);
   if(map.turn[1]=="red"){
    selectRed.wins++;

    map.winner = selectRed.name;
  }else{
    selectYellow.wins++;
    map.winner = selectYellow.name;
  } 
  res.redirect("/userPage")


        }     
//logouts and reset the session or cookie
function logout(req,res){
  req.session.name = "";
  req.session.pw=  "";
  res.redirect("/login")

}
function matchGame(newUser){
  console.log("data,length"+  data.length)

	for(var i = 0; i < data.length; i++) {
		console.log( data[i].searchOpponent)
     if((newUser.toLowerCase() != data[i].name.toLowerCase())&&
     (doesExist(newUser).searchOpponent==data[i].searchOpponent)){
      console.log("newuser"+ data[i].name.toLowerCase())

			return data[i] ;
 		}
 }
 console.log("doesn't exist");
	return false;



}
//assign the user with a random other and create a new game with new id
function creategame(req,res){
  console.log(req.body)
  doesExist(req.body.name).searchOpponent = req.body.status;
  if (matchGame(req.body.name)==false){
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
//given the history of a game you click next or prev to see what was
//made at what position, if the user passes next too much
function next(req,res){
  var next =(req.body.next).substring(0, 4);
  var id =(req.body.next).substring(4);
  console.log("this data is ",id)
  console.log("this tape is ",findGamid(id).tape)

  console.log("this record is ",findGamid(id).record)

 
   if ((next == "next")&&(findGamid(id).tape !=findGamid(id).record )){
    findGamid(id).tape++
  }else if ((next == "prev")&&((findGamid(id).tape !=0))){
    console.log(req.body.next)
    findGamid(id).tape--
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
  console.log("this is the naaaaaaaaame "+name)
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
function viewFriend(req, res){
  let body = req.body;
   console.log("the user name is =================================="+body.user)
  data.forEach(d => { 
    console.log("body of dat"+doesExist(d.name).public);
  
    if(d.name.toLowerCase() == body.user.toLowerCase()){
      if((doesExist(d.name).public == "private")&&((isFriend(req.session.name, body.user)!=false)))  {
        res.redirect("/users/" + d.name);
      }else if(doesExist(d.name).public == "public")  {
        res.redirect("/users/" + d.name);
      }else{
        res.redirect(req.get('referer'));
      }
      return true;
       }
    });
  
   }
function searchForUser(req, res){
let body = req.body;
 console.log("the user name is =================================="+body.user)
data.forEach(d => { 
  console.log("body of dat"+doesExist(d.name).public);

	if(d.name.toLowerCase() == body.user.toLowerCase()){
    if((doesExist(d.name).public == "private")&&((isFriend(req.session.name, body.user)!=false)))  {
      res.redirect("/users/" + d.name);
    }else if(doesExist(d.name).public == "public")  {
      res.redirect("/users/" + d.name);
    }else{
      res.redirect(req.get('referer'));
    }
    return true;
     }
  });

 }
function isFriend(newUser, friend){
  console.log("yoffffffffffffffs" )

   user = doesExist(newUser);
	for(var i = 0; i < user.friends.length; i++) {
		//console.log(user.friends[i])
 		if (friend.toLowerCase() === user.friends[i].toLowerCase()){
      console.log("your friend is"+user.friends[i].toLowerCase())
			return data[i] ;
 		}
 }
 console.log("not friends ");
	return false;
}
function doesExist(newUser){
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
    newUser.public= "public";
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

 

 
