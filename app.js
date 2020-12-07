var express = require('express');
var bodyParser = require('body-parser');
var ejs = require("ejs");
var urlencoderParser = bodyParser.urlencoded({ extended: false});
var meme = require("./js/meme.js");
const { winnerAlgorithm} =require('./js/connect4.js');

 var app = express();
 var http = require('http').createServer(app);
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
//some files exported so I wouldn't have too many lines of code but in the end, i just wrote more 
//and didn't plan everything out 
const {    draw ,archive  }  = require("./js/game.js")

const {watchgame,next}  = require("./js/history.js");
const { doesNotThrow } = require('assert');
http.listen(3000, () => {
  console.log('listening on *:8080'); 
}); 
app.use(session ) 
const io = require('socket.io')(http );
var view = [];
io.use(function(socket, next) { 
  session(socket.request, socket.request.res || {}, next);
});  
// io.emit('observers', data={observers:"map"} );

io.on('connection', socket => {
  console.log('connect=====');
  if (!view.includes(socket.request.session.name)){
    view.push(socket.request.session.name)
  }
    socket.emit('hello', view );
  
  socket.on('disconnect', () => {
    const index = view.indexOf(socket.request.session.name);
    if (index > -1) {
      view.splice(index, 1);
    }
    console.log('user disconnected'+ socket.request.session.name);
  });
 
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
app.post('/input', input)
app.post('/chat', chat)

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
friendRequest
app.post("/friendRequest", friendRequest);

//game ejs the game logics
//app.post("/input", input);
//app.post('/chat', chat)
//history 
app.post('/next', next);
app.post('/privacy', privacy);
 
app.get('/friendProfile', searchForUser);


//here are the links for where to go for each route
app.get('/login',  async function(req,res){
  //const {load }  = require("./js/game.js")
  var meme = require("./js/meme.js");

  var send = await meme.load() 

if(req.method ==='GET'){ 
  console.log(send )

    res.render('login', {meme:send })
}});
app.get('/', function(req,res){
  res.render( "index");
});
app.get('/404', function(req,res){
  res.render( "404");
});
app.get("/game/", function(req, res, next){
//print the list of available games to view
  var viewGame = [];
  var type = "game"
  console.log("view game is "+viewGame);
  console.log("view game is "+game.length);

  for (var i=0; i<game.length; i++){
    var string = "";

    if (game[i].status == "public"){
      string = "game/"+game[i].id
      viewGame.push(string)

    } else if((game[i].status == "friends-only")&&((isFriend(game[i].yellow[0], req.session.name)==true)||(isFriend(game[i].red[0], req.session.name)==true))){
      string = "game/"+game[i].id
      viewGame.push(string)
    }else if((game[i].yellow[0] ==req.session.name)||(game[i].red[0] ==req.session.name)){
      string = "game/"+game[i].id
      viewGame.push(string)
    }
  }
  console.log("view game is "+viewGame);

        res.render('search', {
         data :  viewGame, type:type} )
      return 0;
}) 
app.get("/users/", function(req, res, next){
  //print the list of available users to see
  var type = "users"
  var viewUsers = [];
  var string = "";
  for (var i=0; i<data.length; i++){
    if (data[i].public == "public"){
      string = "users/"+data[i].name
      viewUsers.push(string)
    } else if((data[i].public == "private")&&(isFriend( data[i].name, req.session.name)==true)){
      string = "users/"+data[i].name
      viewUsers.push(string)
    }
  }
  console.log(viewUsers);
        res.render('search', {
         data :  viewUsers, type:type})
      return 0;
})  
app.get("/users/:uid", function(req, res, next){
  //return a player id
  if (doesExist(req.params.uid)==false){
    res.redirect("/404");
    return 0;
  } 
  var user_games =  doesExist(req.params.uid)

  var views = [];
   console.log("Getting user with name: " + req.params.uid);
   //return the active games in the user page that are allowed
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
  var game = findGamid(req.params.uid);
//return the game id of a particular game
  if (findGamid(req.params.uid)==false){
     res.redirect("/404");
    return 0;
  } 
   observers = findGamid((req.params.uid)).observers;
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

app.get("/games/", function(req, res, next){
  //same thing as /game, I realized i had to do /games so i rewrote everything
  var game = req.params.uid;
  var views = [];
  var type = "game"
  //the if statements account for cases depending on what the query strings request
   if  ((req.query.name != undefined)&&(req.query.active == undefined)){
    views = findUserGames(req.query.name);
  }else if ((req.query.name == undefined)&&(req.query.active != undefined)){
    if ((req.query.active =="true")||(req.query.active =="false")){
    views = findDoneGames(req.query.active);
    console.log("Gettin g user with name: " +views);
  }
  }else if ((req.query.name == undefined)&&(req.query.active == undefined)){
    views = allGames()
  }else if ((req.query.name != undefined)&&(req.query.active != undefined)){
    views = userAndDone(req.query.name ,req.query.active );
  }
console.log(req.query.detail+"req.query.detail")
var players = [];
var winners = []
//this is for the summary if the players want to see the replay of the game as well
  if (req.query.detail=="full"){
   var type = "game/";
    for (var i=0; i <views.length; i++){
      views[i] = views[i].replace("game/","watch/")
      console.log(views)
  }
}else {
    for (var i=0; i <views.length; i++){
      if  (findGamid(views[i].substring(5)).winner ==""){
        winners.push("Undecided")
      }else{
       var map = (findGamid(views[i].substring(5)) )
        var string  = map.winner + JSON.stringify(map.record )
        winners.push(string )
      }
      console.log(views[i].substring(5))
      string = findGamid(views[i].substring(5)).red + " "+ findGamid(views[i].substring(5)).yellow
      players.push(string);
  }
}
  res.render('search', { data :  views, type:type,winners:winners, players:players})
 return 0;
})
function userAndDone(name,done){
  // search for a user and return what that games that guy played depending on the done var status
  var view  = [];
  console.log(name)
  console.log(game.length)
  var string = ""
  type = "game"
  for (var i=0; i <game.length; i++){
    var map = findGamid(game[i].id)
    if ((map.red[0]==name)||(map.yellow[0]==name)){
      if ((map.winner!="")&&( done == "true")){
        string = "game/"+game[i].id
        view.push(string);
      }
       else if ((map.winner=="")&&( done == "false")){
        string = "game/"+game[i].id
        view.push(string);
      }
    }  
  }

  return view;

}
function findUserGames(name){
  //if done var isnt specified
  var view  = [];
  console.log(name)
  console.log(game.length)
  var string = ""
  type = "game"
  for (var i=0; i <game.length; i++){
    var map = findGamid(game[i].id)
    if (map.red[0]==name){
      string = "game/"+game[i].id
      view.push(string);
    }else if ((map.yellow[0]==name)){
      string = "game/"+game[i].id
      view.push(string);
    }  
  }
  return view;

}
function findDoneGames(done){
  //if the users var isnt in the query string and only done var is declared
  var view  = [];
  var string = ""
  type = "game"
  for (var i=0; i <game.length; i++){
    var map = findGamid(game[i].id)
    if ((map.winner!="")&&( done == "true")){
      string = "game/"+game[i].id
      view.push(string);
    } else if((map.winner=="")&&( done == "false")){
      string = "game/"+game[i].id
      view.push(string);
    } 
  }
  return view;
}
function allGames( ){
  //find all the games
  var viewGame = [];
  console.log("Getting user with name: " +game.length);
  var string = "";
  for (var i=0; i<game.length; i++){
    console.log("Getting user with name: " +game[i].id);
    string = "game/"+game[i].id
    viewGame.push(string)
  }
  return viewGame;

}
app.get("/watch/:uid", function(req, res, next){
  //if you wanna view how the play game is played out 
  if (findGamid(req.params.uid)==false){
    res.redirect("/404");
   return 0;
 } 
//  if (findGamid(req.params.uid).winner==""){
//   res.redirect("/404");
//  return 0;
// } 
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
    //user page and displaying friends that are online or offline
    console.log("this is the issue "+(JSON.stringify(req.session)));
    friends = doesExist(req.session.name).friends
    name = doesExist(req.session.name)
    console.log("this is the name "+name);
    console.log("this is the name "+data);

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
     //if you wanna switch the privacy mode
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
//logouts and reset the session or cookie
function logout(req,res){
  doesExist(req.session.name).status = "offline"
  req.session.name = "";
  req.session.pw=  "";
  res.redirect("/login")
}
function matchGame(newUser){
  //match user with a specific game type with new users 
  console.log("data,length"+  data.length)

	for(var i = 0; i < data.length; i++) {
		console.log( data[i].searchOpponent)
     if((newUser.toLowerCase() != data[i].name.toLowerCase())&&
     (doesExist(newUser).searchOpponent==data[i].searchOpponent)){
      console.log("newuser"+ data[i].name.toLowerCase())
      doesExist(newUser).searchOpponent="";
      data[i].searchOpponent=""
			return data[i] ;
 		}
 }
 console.log("doesn't exist");
	return false;



}
//assign the user with a random other and create a new game with new id
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

function playgame(req, res){
  //here if someone wants to watch a game they will be direct to a game with that
//specifc req id

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
  //find a specific game
  for(var i = 0; i <  game.length; i++){
    if(game[i].id ==name ){
      return game[i];
    }
 }
 return 0;
}
function removeFriend(req, res){
  //to remove friends, a TA checkin 3 said there was a error bug but i was unable to find the said bug
  for(var i = 0; i < doesExist(req.session.name).friends.length; i++) {
  console.log(doesExist(req.session.name).friends[i])
      if ((req.body.name) == doesExist(req.session.name).friends[i]){
      doesExist(req.session.name).friends.splice(i,1);
     }
     for(var i = 0; i < doesExist(req.body.name).friends.length; i++) {

     if ((req.session.name) == doesExist(req.body.name).friends[i]){
      doesExist(req.body.name).friends.splice(i,1);
     }
    }
      res.redirect(req.get('referer'));;
      return false;
    
 }
}
function requestResponse(req, res){
  //what to do with someone's request for a friend request
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
  //send the friend request 
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
  //viewing a freidn page
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
  //the search bar for a user name idk why i didnt combine this with viewFriend function as well
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
  //check if 2 guys are friends
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
function loginUser(req,res){
//log the user in 
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
//for the regist form tag
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
        //if there is a winner or a draw the 
        map.tape = map.record;
        archive(data.id,map.red[0]);
        archive(data.id,map.yellow[0]);
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
function chat(req,res){
  var map = findGamid(req.body.enemy)
  map.chat.push(req.session.name)
  map.chat.push(req.body.chat)
 res.redirect(req.get('referer'));;
}
// function archive(mapId, playerName){
//   //what to do name a player has done a game, idk why i named the player as map
//   map =doesExist(playerName);
//   map.total++;
//   console.log("oooiii"+playerName);
//   console.log("oooiii"+map);
//   for(var i = 0; i < map.gameID.length; i++) {
//     if ((mapId== map.gameID[i])){
//       map.gameID.splice(i, 1);  
//       map.games_played.push(mapId);
//       break; 
//     } 
//   } 
// }

 


