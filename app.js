var express = require('express');
var bodyParser = require('body-parser');
var ejs = require("ejs");
var urlencoderParser = bodyParser.urlencoded({ extended: false});
 var app = express();
 var http = require('http').createServer(app);
 var socket = require("socket.io");
 var io = require('socket.io')(http);

 var fs = require('fs');
 var rawdata = fs.readFileSync('data.json');
 var data = JSON.parse(rawdata);
 var rawgame = fs.readFileSync('game.json');
 var game = JSON.parse(rawgame);

 var session = require("express-session")({
  secret: "my-secret",
  maxAge: 24 * 60 * 60 * 1000 
});

 
app.use(session )

io.use(function(socket, next) {
  session(socket.request, socket.request.res || {}, next);
});

io.on('connection', (socket) => {
  socket.on('game_send', (msg) => {
    var map = games_active_array(msg.id)
    map.connect4.push("red")
    console.log('map: ' + map.connect4);
    io.sockets.emit('game_get', data={chat:msg.connect4, name:socket.request.session.name } );
    });
  socket.on('chat message', (msg) => {
  var map = games_active_array(msg.id)
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
app.post('/login', createUser)

//userPage post, this will be where the user page post is
app.post("/logout",logout);
app.post("/logout",creategame);
app.post("/search", searchForUser);
app.post("/requestResponse", requestResponse);
app.post("/removeFriend",removeFriend);
 //these 2 are used in viewuser and userpage, playgame allows you to view or play game
 //watch game dirtects you to one of their pass games or current games to view pass results
app.post("/playgame",playgame);
app.post("/watchgame",watchgame);
//viewUser viewing other userse
app.post("/friendRequest", friendRequest);
//game ejs the game logics
app.post("/input", input);
//app.post('/chat', chat)
//history
app.post('/next', next)

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
   console.log("Getting user with name: " + games_active_array( JSON.stringify(req.params.uid)));
   console.log("Getting user with name: " + (req.params.uid));
         res.render('game', {
          data : games_active_array(req.params.uid).connect4,
          chat : games_active_array(req.params.uid).chat,
          id : games_active_array(req.params.uid).id,
          winner : games_active_array(req.params.uid).winner,
          game : games_active_array(req.params.uid),
          turn : games_active_array(req.params.uid).turn,
          yellowPlayer: games_active_array(req.params.uid).yellow,
           redPlayer: games_active_array(req.params.uid).red})
       return 0;
})
app.get("/watch/:uid", function(req, res, next){

     console.log("Getting user with name: " + (req.params.uid));
     res.render('history', {
       record : games_active_array(req.params.uid).record,
      data : games_active_array(req.params.uid).history,
      chat : games_active_array(req.params.uid).chat,
      id : games_active_array(req.params.uid).id,
      winner : games_active_array(req.params.uid).winner,
      game : games_active_array(req.params.uid),
      turn : games_active_array(req.params.uid).turn,
      yellowPlayer: games_active_array(req.params.uid).yellow,
      redPlayer: games_active_array(req.params.uid).red})
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
  console.log("this data is ",games_active_array(id).record)


  if (next == "next"){
    games_active_array(id).record++

  }else if (games_active_array(id).record-1 ==-1){

      res.redirect(req.get('referer'));
      return 0;

  }else if (next == "prev"){
    console.log(req.body.next)
    games_active_array(id).record--
  }
  res.redirect(req.get('referer'));;
}
//here if someone wants to watch a game they will be direct to a game with that
//specifc req id
function watchgame(req, res){
  console.log(req.body)
   for(var i = 0; i <  game.length; i++){
     if(parseInt(req.body.name) ==game[i].id ){
       res.redirect("/watch/" +game[i].id);
       return 0;
     }
  }
  console.log("data is ....", req.body)
}
//here the chat system, where the logged in user name and their comments get send
function chat(req,res){
   var map = games_active_array(req.body.enemy)
   map.chat.push(req.session.name)
   map.chat.push(req.body.chat)
  res.redirect(req.get('referer'));;
}
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
function input(req, res){
  var numbersOnly = (req.body.input).match(/[0-6]/);
  var length = ((req.body.input).length);
  var player=0
  var playerColour=1
  var map = games_active_array(req.body.array)

  if ((map.connect4[0][req.body.input] != "white")||((numbersOnly == null)||(length >1)||((map.turn[player]!=req.session.name)))){
    res.redirect(req.get('referer'));;
    return 0;
  }
  for (var i = 5; i >= 0; i--) {
 	  if (map.connect4[i][req.body.input] == "white"){
			map.connect4[i][req.body.input] =  map.turn[playerColour]

      console.log("so whats going on this time ", winnerAlgorithm(i,req.body.input,map.connect4))

       map.winner  = winnerAlgorithm(i,req.body.input,map.connect4)

      if (draw(map)=="draw"){
         map.winner  = draw(map)
        res.redirect(req.get('referer'));;
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

}
function draw(map){
  for (var i = 6; i >= 0; i--) {
    if (map.connect4[0][i] != "white"){
      return "not draw";
    }
  }
  return "  draw";
}
function games_active_array(name){
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
        console.log(  doesExist(req.session.name).friends)
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


for(var i = 0; i < doesExist(receiver).friend_request.length; i++) {
//	console.log( data[i].name)
  if ((sender) == doesExist(receiver).friend_request[i]){
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
function checkHorizontal(row,col,gameBoard){
   let colour = ['red','yellow']
   let index =0;
   let points = 0;
   while (index <2){
   for (var i = col-3; i <= col+3 ; i++) {
     if ((i >=0 && i < 8)){
       if ((gameBoard[row][i]==colour[index])&&(gameBoard[row][i+1]==colour[index])&&(gameBoard[row][i+2]==colour[index])&&(gameBoard[row][i+3]==colour[index])){
           return colour[index]
       }
   }
 }
   index++;
 }
 return "";
 }
function checkVertical(row,col,gameBoard){
   let colour = ['red','yellow']
   let index =0;
   let points = 0;
   while (index <2){
   for (var i = row-3; i <= row+3 ; i++) {
     if ((i >=0 && i +3< 6)){
       if ((gameBoard[i][col]==colour[index])&&(gameBoard[i+1][col]==colour[index])&&(gameBoard[i+2][col]==colour[index])&&(gameBoard[i+3][col]==colour[index])){

         return colour[index]
       }
   }
   }
   index++;

 }
   return "";
 }
function checkLeftDiagonal(row,col,gameBoard){
   let colour = ['red','yellow']
   let index =0;
   let points = 0;
   let i = row-3;
   let j=col-3;
   // console.log("row"+row)
   // console.log("col"+col)

   while (index <2){
   i = row-3;
   j=col-3;
   while ((i+3 < 8)&&(j+3 < 7)) {
      // console.log(i)
      // console.log(j)

     if ((i  >=0 && i+3 < 6)&&(j  >=0 && j+3 < 7)){
       if ((gameBoard[i][j]==colour[index])&&(gameBoard[i+1][j+1]==colour[index])&&(gameBoard[i+2][j+2]==colour[index])&&(gameBoard[i+3][j+3]==colour[index])){
         return colour[index]
       }
   }
   i++
   j++
 }
 index++;
 }
 return "";
 }
function checkRightDiagonal(row,col,gameBoard){
   let colour = ['red','yellow']
   let index =0;
   let points = 0;
   let i = row;
   let j=col;
   while (index <2){
       i = row+3;
       j=col-3;
   while ((i  >= 0)&&(j+3 < 7)) {
     if ((i-3  >=0 && i  < 6)&&(j  >=0 && j+3 < 7)){
       if ((gameBoard[i][j]==colour[index])&&(gameBoard[i-1][j+1]==colour[index])&&(gameBoard[i-2][j+2]==colour[index])&&(gameBoard[i-3][j+3]==colour[index])){
         return colour[index]
       }
 }
     i--
     j++
 }
   index++;
 }
 return "";
 }
function winnerAlgorithm(row,col,gameBoard){

 	var checkDirection = [checkHorizontal(row,col,gameBoard), checkVertical(row,col,gameBoard),
                       checkLeftDiagonal(row,col,gameBoard), checkRightDiagonal(row,col,gameBoard)]
   for (var i = 0; i < checkDirection.length ; i++) {
      if (checkDirection[i]!=""){
       return checkDirection[i];
     }
   }
   return checkDirection[i];
 }
